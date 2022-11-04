// src/ducks/middleware/feature/headerView.middleware.js

/**
 *
 * UI features hosted here:
 *
 * 1. ui rename etl field cmd
 *    -> lib/validation: is it a valid change
 *    -> compute update/document headerViews (hvs) and etlFieldChanges
 *
 * 2. how get the comleted etlObject -> obsEtl to configure obs/mms?
 *    -> event: TRIGGER_ETL_START
 *
 * @module middleware/feature/etl.middleware
 *
 */
import {
  ETL_VIEW, // feature
  COMPUTE_ETL_VIEW, // command
  setEtlView as setEtlViewAction, // document
  MAKE_DERIVED_FIELD, // command
  addDerivedField as addDerivedFieldAction, // document
  REMOVE_ETL_FIELD, // command
  RENAME_ETL_FIELD, // command
  setEtlViewErrors, // document
  resetEtlViewErrors, // document
  deleteDerivedField,
  UPDATE_ETL_FIELD, // document
} from '../../actions/etlView.actions';
import { setHeaderViews as setHeaderViewsAction } from '../../actions/headerView.actions';
import { setUiLoadingState } from '../../actions/ui.actions';
import { setNotification } from '../../actions/notifications.actions';
import {
  addDerivedField,
  etlFromPivot,
} from '../../../lib/filesToEtlUnits/etl-from-pivot';
import { mkDerivedEtlField } from '../../../lib/filesToEtlUnits/create-etl-field';

// 📖 Computes the etlView state
import { pivot } from '../../../lib/filesToEtlUnits/pivot';

import {
  getEtlObject,
  getHeaderViews,
  getEtlFieldChanges,
  isEtlFieldDerived,
  etlFieldExists,
} from '../../rootSelectors';
import { renameEtlField } from '../../../lib/filesToEtlUnits/rename-etl-field';
import {
  removeNonDerivedEtlField, // triggers async pivot
} from '../../../lib/filesToEtlUnits/remove-etl-field';
import { ActionError } from '../../../lib/LuciErrors';
import { InvalidStateInput } from '../../../lib/LuciFixableErrors';
import { tagWarehouseState } from '../../actions/workbench.actions';

// -----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_MIDDLEWARE === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

/**
 * Receives commands from the ui. Compute in situ. Dispatches/documents results
 * to redux.
 */
const middleware =
  ({ getState }) =>
  (next) =>
  async (action) => {
    //
    if (DEBUG) {
      console.info('👉 loaded etlView.middleware');
    }

    // dispatch the current action in action.type with the closure that is
    // about to be returned.
    next(action);

    switch (action.type) {
      // -------------------------------------------------------------------------
      // Fire-up the lib
      // command -> compute in situ -> map document actions
      // 📖 Information used to update:
      //
      //       action ?? state
      //
      //
      // 🔖 Did not combine pivot with etlFromPivot because it's possible
      //    to have to recompute the etlView state *without* having changed
      //    the headerViews (hvs).
      //
      //    👉 pivot(hvs) -> computed etlView
      //
      //    👉 etlFromPivot(computed etlView) -> etlView
      //
      // ⬜ Backtracking
      //    1. When does the warehouse need to be fully recomputed?
      //    -> when state = stale structure
      //    2. When does the warehouse only need to change the labels?
      //    -> when state = stale labels
      //    3. When does the warehouse not need to be recomputed?
      //    -> when state = current
      //      4. Where should the state be hosted?
      //      -> workbench
      //
      // 🦀  State mutation error when derived
      // -------------------------------------------------------------------------
      case COMPUTE_ETL_VIEW: {
        //
        // side effect: () -> hvs in state -> etlView
        //
        const { startTime } = action;
        next(
          setUiLoadingState({
            toggle: true,
            feature: ETL_VIEW,
            message: `Computing eltView`,
          }),
        );
        // -------------------
        //
        const state = getState();
        const headerViews = getHeaderViews(state);
        const etlFieldChanges = getEtlFieldChanges(state);
        // compute the value from state
        const computedEtlObject = await pivot(headerViews);

        // + user input and other
        const final = await etlFromPivot()
          .init(computedEtlObject, etlFieldChanges)
          .removeStalePropChanges()
          .removeStaleDerivedFields()
          .addDerivedFields()
          .applySourceSequences() // ⚠️  sequence matters (before applyFieldProps)
          .applyFieldProps()
          .setGlobalSpanRef()
          .return();

        const endTime = new Date();

        next([
          setHeaderViewsAction(headerViews),
          setEtlViewAction(
            final.etlObject,
            final.etlFieldChanges,
            `${endTime - startTime} ms`,
          ),
          setUiLoadingState({
            toggle: false,
            feature: ETL_VIEW,
            message: 'Done computing etlView',
          }),
        ]);

        break;
      }

      case UPDATE_ETL_FIELD: {
        if (['format', 'sources', 'codomain-reducer'].includes(action.key)) {
          next(tagWarehouseState('STALE'));
        }
        break;
      }

      /* ✅ All good (no state mutation issues) */
      case MAKE_DERIVED_FIELD: {
        const state = getState();
        const startTime = action?.meta?.startTime || new Date();
        next([
          setNotification({
            message: `${ETL_VIEW}.middleware: path to documenting (next: normalizer, reducer)`,
            feature: ETL_VIEW,
          }),
          tagWarehouseState('STALE'),
          // field ~ raw input for the field
          // reciever for the normalizing middleware
          // (payload, meta: {normalizer, startTime})
          // 🛈  value to this indirection
          addDerivedFieldAction({
            payload: action.payload,
            normalizer: ({ validSeedData, files }) =>
              addDerivedField(mkDerivedEtlField(validSeedData, files), {
                etlFieldChanges: getEtlFieldChanges(state),
                etlObject: getEtlObject(state),
              }),
            startTime,
          }),
        ]);

        break;
      }

      // pattern: map command -> document
      // action.fieldName
      // ⬜ try/catch when trying to remove the last etlUnit
      case REMOVE_ETL_FIELD: {
        if (!action?.fieldName) {
          throw new ActionError(`Remove etl field: missing fieldName`);
        }

        let state = getState();
        if (!etlFieldExists(state, action.fieldName)) {
          /* nothing to do */
          return;
        }

        if (isEtlFieldDerived(state, action.fieldName)) {
          next([
            deleteDerivedField(action.fieldName), // document
            tagWarehouseState('STALE'), // document
          ]);
        } else {
          next(
            setUiLoadingState({
              toggle: true,
              feature: ETL_VIEW,
              message: 'Updating etlView - removing field',
            }),
            tagWarehouseState('STALE'),
          );

          const removeCfg = {
            /* eslint-disable no-shadow */
            hvsSelector: getHeaderViews,
            etlFieldChangesSelector: getEtlFieldChanges,
            etlUnitsSelector: (s) => getEtlObject(s).etlUnits,
            DEBUG,
            /* eslint-enable no-shadow */
          };

          // atomic state mutation
          state = getState();
          const { headerViews } = removeNonDerivedEtlField(removeCfg)({
            fieldName: action.fieldName,
            state,
          });
          await setEtlViewAsync(next, state, {
            headerViews,
            startTime: new Date(),
          });
        }
        break;
      }

      // 🦀 fails to associate etlFieldChanges to newly named field
      case RENAME_ETL_FIELD: {
        const { oldValue, newValue, etlFieldNameAndPurposeValues } = action;

        next(resetEtlViewErrors());

        const renameCfg = {
          hvsSelector: getHeaderViews,
          etlFieldChangesSelector: getEtlFieldChanges,
          etlFieldNameAndPurposeValues, // feeds the validation heuristic
          DEBUG,
        };

        try {
          const state = getState();
          const { headerViews, etlFieldChanges } = renameEtlField(renameCfg)({
            oldValue,
            newValue,
            state,
          });

          // when to call pivot(hvs) && applyFieldChanges(computedValue)
          if (typeof headerViews !== 'undefined') {
            next([
              setUiLoadingState({
                toggle: true,
                feature: ETL_VIEW,
                message: 'Updating etlField: field name',
              }),
              tagWarehouseState('STALE'),
            ]);

            await setEtlViewAsync(next, state, {
              headerViews,
              startTime: new Date(),
            });
          }

          // ...vs just call applyFieldChanges(etlObject)
          else if (typeof etlFieldChanges !== 'undefined') {
            const { etlObject: eo, etlFieldChanges: ec } = etlFromPivot()
              .init(getEtlObject(state), etlFieldChanges)
              .resetEtlObject(oldValue)
              .addDerivedFields()
              .applyFieldProps()
              .setGlobalSpanRef()
              .return();

            next([
              setNotification({
                message: `Changed etlFieldChanges`,
                feature: ETL_VIEW,
              }),
              setEtlViewAction(eo, ec),
              tagWarehouseState('STALE'),
            ]);
          } else {
            next(
              setNotification({
                message: `A etl field renaming request was ignored: ${newValue}`,
                feature: ETL_VIEW,
              }),
            );
          }
        } catch (e) {
          if (e instanceof InvalidStateInput) {
            next(setEtlViewErrors(e.fix));
          } else {
            throw e;
          }
        }
        break;
      }
      default:
        break;
    }
  };

/**
 *
 * 🔖 This action gets processed by async.middleware
 *
 * 🔑 The headerViews state sometimes gets updated before this action
 *    completes.  However, what we can't do, is use the "current" state
 *    to compute the pivot value.
 *
 */
async function setEtlViewAsync(dispatch, state, changes) {
  // optional data
  const {
    startTime,
    headerViews = getHeaderViews(state),
    etlFieldChanges = getEtlFieldChanges(state),
  } = changes;

  // compute the value from state
  const computedEtlObject = await pivot(headerViews);

  // + user input and other
  const final = await etlFromPivot()
    .init(computedEtlObject, etlFieldChanges)
    .removeStalePropChanges()
    .removeStaleDerivedFields()
    .addDerivedFields()
    .applySourceSequences() // ⚠️  sequence matters (before applyFieldProps)
    .applyFieldProps()
    .setGlobalSpanRef()
    .return();

  const endTime = new Date();

  // 🔖 do not use an array of dispatches
  dispatch(setHeaderViewsAction(headerViews));
  dispatch(
    setEtlViewAction(
      final.etlObject,
      final.etlFieldChanges,
      `${endTime - startTime} ms`,
    ),
  );
  dispatch(
    setUiLoadingState({
      toggle: false,
      feature: ETL_VIEW,
      message: 'Done etlView async',
    }),
  );
}
export default middleware;

/*
function setEtlViewAsyncOld(data) {
  return {
    type: 'GO LUCI ASYNC',
    meta: `${ETL_VIEW} ASYNC`,
    payload: (dispatch, getState) => {
      // latest state
      const state = getState();
      // optional data
      const {
        startTime,
        headerViews = getHeaderViews(state),
        etlFieldChanges = getEtlFieldChanges(state),
      } = data;

      // compute the value from state
      const computedEtlObject = pivot(headerViews);

      // + user input and other
      const final = etlFromPivot()
        .init(computedEtlObject, etlFieldChanges)
        .removeStalePropChanges()
        .removeStaleDerivedFields()
        .addDerivedFields()
        .applySourceSequences() // ⚠️  sequence matters (before applyFieldProps)
        .applyFieldProps()
        .setGlobalSpanRef()
        .return();

      const endTime = new Date();

      // 🔖 do not use an array of dispatches
      setHeaderViews(headerViews);
      dispatch(
        setEtlViewAction(
          final.etlObject,
          final.etlFieldChanges,
          `${endTime - startTime} ms`,
        ),
      );
      dispatch(setUiLoadingState({ toggle: false, feature: ETL_VIEW }));
    },
  };
} */
/*
const temp = {
  __derivedFields: {
    product: {
      idx: 5,
      name: 'product',
      enabled: true,
      purpose: 'mcomp',
      levels: [
        ['A', 45949],
        ['C', 50764],
      ],
      'map-symbols': {
        arrows: {},
      },
      'etl-unit': 'Rx',
      format: null,
      'null-value-expansion': null,
      'map-files': {
        arrows: {
          '/shared/datafiles/8108ac51-8d8f-497a-91d3-6fef941655ed/dropbox/1db117/lE0WdposqDkAAAAAABpp3w/productComp_Units_mini.csv':
            'A',
          '/shared/datafiles/8108ac51-8d8f-497a-91d3-6fef941655ed/dropbox/1db117/lE0WdposqDkAAAAAABppzw/productA_Units.csv':
            'C',
        },
      },
      sources: [
        {
          enabled: true,
          'map-implied': {
            domain: 'NPI Number',
            codomain: 'A',
          },
          'header-idx': null,
          'field-alias': 'product',
          'source-type': 'IMPLIED',
          purpose: 'mcomp',
          'null-value': null,
          format: null,
          'map-symbols': {
            arrows: {},
          },
          levels: [['A', 45949]],
          nlevels: 1,
          filename:
            '/shared/datafiles/8108ac51-8d8f-497a-91d3-6fef941655ed/dropbox/1db117/lE0WdposqDkAAAAAABpp3w/productComp_Units_mini.csv',
          'map-weights': {
            arrows: {
              A: 1,
            },
          },
        },
        {
          enabled: true,
          'map-implied': {
            domain: 'NPI Number',
            codomain: 'C',
          },
          'header-idx': null,
          'field-alias': 'product',
          'source-type': 'IMPLIED',
          purpose: 'mcomp',
          'null-value': null,
          format: null,
          'map-symbols': {
            arrows: {},
          },
          levels: [['C', 50764]],
          nlevels: 1,
          filename:
            '/shared/datafiles/8108ac51-8d8f-497a-91d3-6fef941655ed/dropbox/1db117/lE0WdposqDkAAAAAABppzw/productA_Units.csv',
          'map-weights': {
            arrows: {
              C: 1,
            },
          },
        },
      ],
      'map-weights': {
        arrows: {
          A: 1,
          C: 1,
        },
      },
    },
  },
};
*/
