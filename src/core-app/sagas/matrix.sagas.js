// src/sagas/matrix.sagas.js

/**
 * @module sagas/matrix.sagas
 *
 * Services
 *
 * 👉 matrix: use the apiFetch to initialize polling (pull data from warehouse)
 * 👉 build the spec using the graphql server (multiple calls)
 *
 */
import {
  all,
  call,
  put,
  getContext,
  select,
  takeLatest,
} from 'redux-saga/effects';
import {
  MATRIX,
  FETCH_MATRIX,
  FETCH_MATRIX_CACHE,
  setMatrixCache,
} from '../ducks/actions/matrix.actions';
import { setNotification } from '../ducks/actions/notifications.actions';

// -----------------------------------------------------------------------------
// 📡
// direct calls to fetch (see api MATRIX)
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

import { SagasError, InvalidStateError } from '../lib/LuciErrors';
import { range } from '../utils/common';
import { colors } from '../constants/variables';

//------------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_MIDDLEWARE === 'true';
const COLOR = colors.light.blue;
//------------------------------------------------------------------------------
/* eslint-disable no-console */

const MAX_TRIES = 20;

// ⬜ is it project_id or projectId???
const fetchRequestFieldNames =
  (projectId) =>
  (...args) =>
    fetchFieldNamesInner(projectId, ...args);

// ⬜ is it project_id or projectId???
const fetchMatrixSpec =
  (projectId) =>
  (...args) =>
    fetchMatrixSpecInner(projectId, ...args);

if (DEBUG) {
  console.info(`%c👉 matrix.sagas`, COLOR);
}
// get a request from a single node
function* _queueMatrixCache({ payload }) {
  try {
    yield put(
      setNotification({
        message: 'Background: Cache request in process',
        feature: MATRIX,
      }),
    );
    const flatTree = yield select((state) => state.workbench.tree);
    const { projectId } = yield select((state) => state.$_projectMeta);
    const { id, displayType } = payload;

    // requestFromNode depends on id and displayType hosted in payload
    const { fields: request } = requestFromNode(flatTree, { id, displayType });

    // ⌛ request for gql obs service
    const requestFragments = yield fetchFragmentedRequest(
      request,
      fetchRequestFieldNames(projectId),
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
    throw new SagasError(e);
  }
}

/**
 * Pull the configuration made using the workbench to generate the request.
 * Requires using graphql to complete the build. Forward the request to the
 * spec to the tnc-py backend: the data (warehouse -> matrix).
 *
 * ⬜ review how throw/catch error
 *
 */
function* _queueMatrixRequest() {
  try {
    yield put(
      setUiLoadingState({
        toggle: true,
        feature: MATRIX,
        message: 'Queued the matrix request',
      }),
    );
    //
    const projectId = yield getContext('projectId');
    const request = yield buildMatrixSpec();
    // NEW - engage the polling api
    // 📬 send to polling-api.sagas (requires event { meta, request })
    yield put(
      apiFetch(
        {
          // ::event
          meta: { uiKey: 'matrix', feature: MATRIX },
          request: {
            project_id: projectId,
            spec: request,
            maxTries: MAX_TRIES,
          },
        }, // map + translation
      ),
    );
  } catch (e) {
    console.error(e);
    throw new SagasError('Something went wrong with the matrix request');
  }
}

/*-----------------------------------------------------------------------------*/
// Local functions
/*-----------------------------------------------------------------------------*/
/**
 * @function
 * @return {MatrixRequestSpec}
 */
function* buildMatrixSpec() {
  try {
    //
    // 👉 Pull the tree from state
    //
    const flatTree = yield select((state) => state.workbench.tree);
    const projectId = yield getContext('projectId');
    //
    // 👉 transform: tree -> request for gql obs service
    //
    const { fields: request, derivedFields } = yield requestFromTree(flatTree);

    //
    if (DEBUG) {
      yield console.debug(
        `%c1️⃣ Request from workbench: Tree -> Request`,
        COLOR,
      );
      yield console.dir(request);
      yield console.dir(derivedFields);
    }

    // ⌛ request for gql obs service
    // ⬜ This final processing could be done by tnc-py
    let requestFragments = yield fetchFragmentedRequest(
      request,
      fetchMatrixSpec(projectId),
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
      yield console.debug(
        `%c2️⃣ requestFragments: Fragments from graphql`,
        COLOR,
      );
      yield console.dir(requestFragments);
    }
    //
    // 🔖 Derived fields are separate from obs/mms that hosts single-source of truth
    //    Thus, append derived fields.
    //
    const finalRequest = yield withDerivedFields(
      requestFragments,
      derivedFields,
    );

    if (DEBUG) {
      yield console.debug(`%c3️⃣ finalSpec: ...with derived fields`, COLOR);
      yield console.dir(finalRequest);
    }

    return finalRequest;
  } catch (e) {
    throw new SagasError(e);
  }
}

/**
 * Utility
 * Request -> Expressions
 *
 * @function
 * @param {Object} request subReq and meaReqs keys
 * @return {Object} gql expressions
 */
function* fetchFragmentedRequest(request, apiFn) {
  try {
    //
    // For each etlUnit::measurement generate an mms/obs request
    // Note: the request format = subRed, meaReqs
    //
    // input: optional subReq, meaReqs[]
    // output: [{subExp, meaExpressions}]
    //
    const requestFragments = yield all([
      call(apiFn, {
        subReq: request?.subReq ?? { subjectType: null, qualityMix: [] },
        meaReqs: [request.meaReqs[0]],
      }),
      // append to the array of effects
      ...(range(1, request.meaReqs.length).map((idx) => {
        // do not use fork in order to maintain sequence
        return call(fetchMatrixSpec, { meaReqs: [request.meaReqs[idx]] });
      }) || []),
    ]);

    return requestFragments;
  } catch (e) {
    throw new SagasError(e);
  }
}

// -----------------------------------------------------------------------------
// **NOTE** anything exported from this file will be executed by src/initSagas
// -----------------------------------------------------------------------------
// Watcher
// Use the output of the workbench (config) to warehouse -> matrix
export function* watchForMatrixRequest() {
  UT.log(
    yield takeLatest(FETCH_MATRIX, _queueMatrixRequest),
    `taking ${FETCH_MATRIX}`,
  );
}
export function* watchForMatrixCache() {
  UT.log(
    yield takeLatest(FETCH_MATRIX_CACHE, _queueMatrixCache),
    `taking ${FETCH_MATRIX_CACHE}`,
  );
}
