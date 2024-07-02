// src/sagas/matrix.sagas.js

/**
 * @module sagas/matrix.sagas
 *
 * Services
 *
 * 👉 matrix: use the apiFetch to initialize polling (pull data from warehouse)
 * 👉 build the spec using the graphql server (multiple calls)
 *
 * ⚠️  The process for building the matrix request spec before retrieving the
 *    data, is a unusual process.  For instance, includes a series of automated
 *    graphql request.
 *
 */
import { all, call, put, select, takeLatest } from 'redux-saga/effects';
import {
  MATRIX,
  FETCH_MATRIX,
  FETCH_MATRIX_CACHE,
  setMatrixCache,
} from '../ducks/actions/matrix.actions';
import { setNotification } from '../ducks/actions/notifications.actions';
import { getProjectId, isHostedMatrixStale } from '../ducks/rootSelectors';
import { initAbortController } from '../../hooks/use-abort-controller';
// -----------------------------------------------------------------------------
// 📡 direct calls to fetch (see api MATRIX)
//
import {
  fetchMatrixSpec as fetchMatrixSpecInner, // generates the matrix request
  fetchRequestFieldNames as fetchFieldNamesInner, // preview field names
} from '../services/api';
// indirect - fetch by way of api polling-machine
import { apiFetch } from '../ducks/actions/api.actions';
// -----------------------------------------------------------------------------
import { setUiLoadingState } from '../ducks/actions/ui.actions';
import * as UT from './sagas.helpers';

import {
  requestFromTree,
  requestFromNode,
  withDerivedFields,
  dedupMeaExpressions,
} from '../lib/obsEtlToMatrix/matrix-request';
import {
  SagasError,
  InvalidStateError,
  GqlError,
  ApiCallError,
} from '../lib/LuciErrors';
import { range } from '../utils/common';
import { colors } from '../constants/variables';

//------------------------------------------------------------------------------
const DEBUG =
  process.env.REACT_APP_DEBUG_MIDDLEWARE === 'true' ||
  process.env.REACT_APP_DEBUG_MATRIX === 'true';
const COLOR = colors.light.blue;
//------------------------------------------------------------------------------
/* eslint-disable no-console */

const MAX_TRIES = process.env.REACT_APP_MATRIX_MAX_TRIES || 30;

const fetchRequestFieldNames = (projectId, request, signal) =>
  fetchFieldNamesInner({ projectId, request, signal });

const fetchMatrixSpec = (projectId, request, signal) =>
  fetchMatrixSpecInner({ projectId, request, signal });

if (DEBUG) {
  console.info(`%c👉 matrix.sagas`, COLOR);
}
// get a request from a single node
function* _queueMatrixCache({ payload }) {
  const abortController = initAbortController();
  try {
    yield put(
      setNotification({
        message: 'Background: Cache request in process',
        feature: MATRIX,
      }),
    );
    const flatTree = yield select((state) => state.workbench.tree);
    const { id, displayType } = payload;

    // requestFromNode depends on id and displayType hosted in payload
    const { fields: request } = requestFromNode(flatTree, { id, displayType });

    // ⌛ request for gql obs service
    const requestFragments = yield fetchFragmentedRequest(
      request,
      fetchRequestFieldNames, // apiFn
      abortController,
      'fetchRequestFieldNames',
    );

    //
    // [[fieldNames]]
    // Sequence matters for the external array
    //
    const fieldNames = yield requestFragments.map(({ data }) => {
      return data.meaExpressions.map(({ filter }) => {
        return filter.fieldName.value;
      });
    });

    yield put(
      setMatrixCache({
        payload: fieldNames,
        meta: payload,
      }),
    );
  } catch (e) {
    if (e instanceof GqlError) throw e;
    throw new SagasError('Queue matrix cache request failed', e);
  }
}

/**
 *
 * Pull the configuration made using the workbench to generate the request.
 * Requires using graphql to complete the build. Forward the request to the
 * spec to the tnc-py backend: the data (warehouse -> matrix).
 *
 * ⬜ review how throw/catch error
 *
 */
function* _queueMatrixRequest(action) {
  //
  const abortController = action?.abortController ?? initAbortController();
  const requestedProject = action?.projectId;

  try {
    // guard - run when hostedMatrixState = 'STALE'
    const isStale = yield select(isHostedMatrixStale);
    //
    if (isStale) {
      yield put(
        setUiLoadingState({
          toggle: true,
          feature: MATRIX,
          message: 'Queued the matrix request',
        }),
      );

      // 1. build the request using a series of automated graphql calls
      const request = yield buildMatrixSpec(abortController);

      // 2. engage the tnc-py polling api with the now completed request
      const projectInRedux = yield select(getProjectId);
      if (projectInRedux !== requestedProject) {
        throw new InvalidStateError(
          `Matrix request failed: invalid project state ${JSON.stringify(
            action,
            null,
            2,
          )}`,
          new Error().stack,
        );
      }
      try {
        //
        yield put(
          apiFetch(
            {
              // ::event (see middleware CANCEL to aligh uiKey)
              meta: { uiKey: action.payload, feature: MATRIX },
              request: {
                project_id: requestedProject,
                spec: request,
                maxTries: MAX_TRIES,
                signal: abortController.signal,
              },
            }, // map + translation
          ),
        );
      } catch (e) {
        throw new ApiCallError(`Queuing the matrix request failed`, e);
      }
    }
  } catch (e) {
    abortController.abort();
    if (e instanceof InvalidStateError) throw e;
    if (e instanceof ApiCallError) throw e;
    if (e instanceof GqlError) throw e;
    if (e instanceof SagasError) throw e;
    throw new SagasError(
      `Unknown error with the matrix request: -${requestedProject.slice(-4)}`,
      e,
    );
  }
}

/*-----------------------------------------------------------------------------*/
// Local functions
/*-----------------------------------------------------------------------------*/
/**
 * Makes a series of api calls using the graphql service to build the request.
 * @function
 * @return {MatrixRequestSpec}
 */
function* buildMatrixSpec(abortController) {
  try {
    //
    // 👉 Pull the tree from state
    //
    const flatTree = yield select((state) => state.workbench.tree);
    //
    // 👉 transform: tree -> request for gql obs service
    //
    const { fields: request, derivedFields } = yield requestFromTree(flatTree);

    //
    if (DEBUG) {
      yield console.debug(`%c1️⃣ Request from workbench: Tree -> Request`, COLOR);
      yield console.dir(request);
      yield console.dir(derivedFields);
    }

    // ⌛ request for gql obs service
    // ⬜ This final processing could be done by tnc-py
    let requestFragments = yield fetchFragmentedRequest(
      request,
      fetchMatrixSpec, // apiFn
      abortController,
      'fetchMatrixSpec',
    );

    // 🦀 Check if the field count is correct
    /* eslint-disable no-shadow, no-param-reassign */
    const { meaExpressions, fieldCount } = yield requestFragments.reduce(
      ({ meaExpressions, fieldCount }, { data }) => {
        return {
          meaExpressions: [...meaExpressions, ...data.meaExpressions],
          fieldCount: fieldCount + data.fieldCount,
        };
      },
      { meaExpressions: [], fieldCount: 0 },
    );

    // ⬜ Make sure a null subExpression is valid
    requestFragments = {
      fieldCount,
      subExpression: requestFragments[0].data?.subExpression ?? null,
      meaExpressions: dedupMeaExpressions(
        meaExpressions,
        (exp) => exp.filter.fieldName.value,
      ),
    };
    if (DEBUG) {
      yield console.debug(`%c2️⃣ requestFragments: Fragments from graphql`, COLOR);
      yield console.dir(requestFragments);
    }
    //
    // 🔖 Derived fields are separate from obs/mms that hosts single-source of truth
    //    Thus, append derived fields.
    //
    const finalRequest = yield withDerivedFields(requestFragments, derivedFields);

    if (DEBUG) {
      yield console.debug(`%c3️⃣ finalSpec: ...with derived fields`, COLOR);
      yield console.dir(finalRequest);
    }

    return finalRequest;
  } catch (e) {
    abortController.abort();
    if (e instanceof GqlError) throw e;
    throw new SagasError(`Matrix failed to build the request`, e);
  }
}

/**
 * Utility
 * Request -> Expressions
 *
 * Encapsulate use of projectId here.
 *
 * @function
 * @param {Object} request subReq and meaReqs keys
 * @return {Object} gql expressions
 */
function* fetchFragmentedRequest(request, apiFn, abortController, apiFnName) {
  try {
    //
    const projectId = yield select(getProjectId);
    //
    // For each etlUnit::measurement generate an mms/obs request
    // Note: the request format = subRed, meaReqs
    //
    // input: optional subReq, meaReqs[]
    // output: [{subExp, meaExpressions}]
    //
    // A. The first iteration consumes **both** subReq and the first
    // of the meaReqs.
    const req = {
      subReq: request?.subReq ?? { subjectType: null, qualityMix: [] },
      meaReqs: [request.meaReqs[0]],
    };
    const args = [projectId, req, abortController.signal];

    // B. In the event there are more than one meaReqs, now process 2,3 etc..
    // So, the meaReqsIter length = 0 when there is only one request.
    const meaReqsIter = range(1, request.meaReqs.length);
    const requestFragments = yield all([
      call(apiFn, ...args),
      // append the array of meaReqs
      ...(meaReqsIter.map((idx) => {
        // do not use fork in order to maintain sequence
        const req = { meaReqs: [request.meaReqs[idx]] };
        const args = [projectId, req, abortController.signal];
        return call(apiFn, ...args); // only ever used with fetchSpec
      }) || []),
    ]);

    return requestFragments;
  } catch (e) {
    abortController.abort();
    throw new GqlError(`fetchFragment call to ${apiFnName} failed: ${e?.message}`, e);
  }
}

// -----------------------------------------------------------------------------
// **NOTE** anything exported from this file will be executed by src/initSagas
// -----------------------------------------------------------------------------
// Watcher
// Use the output of the workbench (config) to warehouse -> matrix
export function* watchForMatrixRequest() {
  UT.log(yield takeLatest(FETCH_MATRIX, _queueMatrixRequest), `taking ${FETCH_MATRIX}`);
}
export function* watchForMatrixCache() {
  UT.log(
    yield takeLatest(FETCH_MATRIX_CACHE, _queueMatrixCache),
    `taking ${FETCH_MATRIX_CACHE}`,
  );
}
