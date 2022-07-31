// src/ducks/middleware/feature/headerView.middleware.j;
//
/**
 * @module middleware/feature/etl.middleware
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
 */
import {
  ETL_VIEW, // feature
  COMPUTE_ETL_VIEW, // command
  setEtlView, // document
  MAKE_DERIVED_FIELD, // command
  addDerivedField as addDerivedFieldAction, // document
  REMOVE_ETL_FIELD, // command
  RENAME_ETL_FIELD, // command
  setEtlViewErrors, // document
  resetEtlViewErrors, // document
  deleteDerivedField, // document
} from '../../actions/etlView.actions';
import { setHeaderViews } from '../../actions/headerView.actions';
import { setLoader } from '../../actions/ui.actions';
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
} from '../../rootSelectors';
import { renameEtlField } from '../../../lib/filesToEtlUnits/rename-etl-field';
import {
  removeNonDerivedEtlField, // triggers async pivot
} from '../../../lib/filesToEtlUnits/remove-etl-field';
import { InvalidStateError } from '../../../lib/LuciErrors';
import { tagWarehouseState } from '../../actions/workbench.actions';
import { isHostedWarehouseStateStale } from '../../workbench.reducer';

// import { colors } from '../../../constants/variables';

// -----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_MIDDLEWARE === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

/**
 * Receives commands from the ui. Compute in situ. Dispatches/documents results
 * to redux.
 *
 * @middleware
 */
const middleware =
  ({ getState, dispatch }) =>
  (next) =>
  (action) => {
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
      // -------------------------------------------------------------------------
      case COMPUTE_ETL_VIEW: {
        //
        // side effect: () -> hvs in state -> etlView
        //
        const state = getState();

        next(setLoader({ toggle: true, feature: ETL_VIEW }));

        const {
          startTime,
          headerViews = getHeaderViews(state),
          etlFieldChanges = getEtlFieldChanges(state),
        } = action;
        dispatch([setEtlViewAsync(headerViews, etlFieldChanges, startTime)]);
        break;
      }

      case MAKE_DERIVED_FIELD: {
        const state = getState();
        const startTime = action?.meta?.startTime || new Date();
        dispatch([
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
      case REMOVE_ETL_FIELD: {
        // ⬜ try/catch when trying to remove the last etlUnit

        const state = getState();
        if (isEtlFieldDerived(state, action.fieldName)) {
          next([
            deleteDerivedField(action.fieldName),
            tagWarehouseState('STALE'),
          ]);
        } else {
          const removeCfg = {
            /* eslint-disable no-shadow */
            hvsSelector: getHeaderViews,
            etlFieldChangesSelector: getEtlFieldChanges,
            etlUnitsSelector: (state) => getEtlObject(state).etlUnits,
            DEBUG,
            /* eslint-enable no-shadow */
          };

          const { headerViews } = removeNonDerivedEtlField(removeCfg)({
            fieldName: action.fieldName,
            // purpose: action.purpose,
            state,
          });

          dispatch([
            setHeaderViews(headerViews),
            setEtlViewAsync(headerViews, getEtlFieldChanges(state), new Date()),
          ]);
        }
        break;
      }

      case RENAME_ETL_FIELD: {
        const { oldValue, newValue, etlFieldNameAndPurposeValues } = action;
        const state = getState();

        const renameCfg = {
          hvsSelector: getHeaderViews,
          etlFieldChangesSelector: getEtlFieldChanges,
          etlFieldNameAndPurposeValues, // feeds the validation heuristic
          DEBUG,
        };

        next(resetEtlViewErrors());

        try {
          const { headerViews, etlFieldChanges } = renameEtlField(renameCfg)({
            oldValue,
            newValue,
            state,
          });

          // when to call pivot(hvs) && applyFieldChanges(computedValue)
          if (typeof headerViews !== 'undefined') {
            dispatch([
              setHeaderViews(headerViews),
              setEtlViewAsync(
                headerViews,
                etlFieldChanges || getEtlFieldChanges(state),
                new Date(),
              ),
              tagWarehouseState('STALE'),
            ]);
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
              setEtlView(eo, ec),
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
          if (e instanceof InvalidStateError) {
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
 * 🔖 This action gets augmented by async.middleware
 *
 */
function setEtlViewAsync(headerViews, etlFieldChanges, startTime) {
  return {
    type: 'GO LUCI',
    meta: { feature: ETL_VIEW },
    payload: (dispatch) => {
      /* compute the value from state */
      const computedEtlObject = pivot(headerViews);

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

      dispatch([
        setEtlView(
          final.etlObject,
          final.etlFieldChanges,
          `${endTime - startTime} ms`,
        ),
        setLoader({ toggle: false, feature: ETL_VIEW }),
      ]);
    },
  };
}

export default middleware;
