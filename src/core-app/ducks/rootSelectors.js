/**
 * @module ducks/rootSelectors
 *
 * @description
 *
 * Hosts the selectors that operate on the store state.
 *
 * Exports the selectors used by mapStateToProps, i.e., functions that
 * receive the complete state store as input.
 * (in contrast to the selectors defined in each of the specific
 * state fragment reducers)
 *
 * There are two scopes for referencing the root selectors:
 *
 * * State fragment ~ branch ~ app feature
 *   * used to avoid name clashes
 *
 * * Global
 *   * reserved for high-level unique qualities about the app
 *
 */
import { createSelector } from 'reselect';
import * as fromProjectMeta from './project-meta.reducer';
import * as fromFileView from './fileView.reducer';
import * as fromHeaderView from './headerView.reducer';
import * as fromEtlView from './etlView.reducer';
import * as fromWorkbench from './workbench.reducer';
import * as fromStepper from './stepper.reducer';
import * as fromPendingRequests from './pendingRequests.reducer';
import * as fromUi from './ui.reducer';
import * as fromModal from './modal.reducer';

/**
 * Selectors
 *
 * Defines how to access the the reducer fragment.
 * Delegates how to access fragments therein to the
 * fragment-specific reducer.
 *
 */

/* eslint-disable no-shadow */
// -----------------------------------------------------------------------------
/**
 *   $_projectMeta
 *
 *   state -> state.$_projectMeta
 */
export const getProjectId = (state) =>
  fromProjectMeta.getProjectId(state.$_projectMeta);

export const getLoadingProjectStatus = (state) =>
  fromProjectMeta.getLoadingProjectStatus(state.$_projectMeta);

export const getInitializingActions = (state) =>
  fromProjectMeta.getInitializingActions(state.$_projectMeta);

// -----------------------------------------------------------------------------
/**  fileView
 *   process scope: fileSystem -> selected files
 *
 *   state -> state.fileView
 */

// utilized by useFormMachine
export const getFilesSlice = (state) => state.fileView;
export const getPath = (state) => fromFileView.getPathQuery(state.fileView);
export const getParentPathQuery = (state) =>
  fromFileView.getParentPathQuery(state.fileView);
export const getFiles = (state) => fromFileView.getFiles(state.fileView);
export const getRequestHistory = (state) =>
  fromFileView.getRequestHistory(state.fileView);
export const selectFiles = (state, filterText) =>
  fromFileView.selectFilesF(state.fileView, filterText);
export const getReaddirErrors = (state) =>
  fromFileView.getReaddirErrors(state.fileView);
export const getFilesViewStatus = (state) =>
  fromFileView.getFilesViewStatus(state.fileView);
export const peekRequestHistory = (state, emptyValue) =>
  fromFileView.peekRequestHistory(state.fileView, emptyValue);

export const peekParentRequestHistory = (state, emptyValue) =>
  fromFileView.peekParentRequestHistory(state.fileView, emptyValue);
export const hasRequestHistory = (state) =>
  fromFileView.hasRequestHistory(state.fileView);

export const getDriveTokenId = (state) => fromFileView.getDriveTokenId(state.fileView);

export const { STATUS } = fromFileView;
//------------------------------------------------------------------------------
/**  headerView
 *   process scope: selected files -> etl
 *
 *   state -> state.headerView
 */

export const getSelected = (state) => fromHeaderView.getSelected(state.headerView);

export const getCountSelectedFiles = (state) => getSelected(state).length;

export const isFileSelected = (state, filename) =>
  fromHeaderView.isFileSelected(state.headerView, filename);

export const getHvSequence = (state, filename) =>
  getSelected(state).findIndex((filename_) => filename_ === filename);

/**
 * 0.5.0
 * @return {String} mvalueMode enum
 */
export const selectMvalueMode = (state, filename) =>
  fromHeaderView.selectMvalueMode(state.headerView, filename);

/**
 * 0.3.11
 */
export const selectSymbolMapHeaderView = (state, filename, headerIdx) => {
  return fromHeaderView.selectSymbolMap(state.headerView, filename, headerIdx);
};
/**
 * 0.3.11
 * Returns a wideToLongField located in the wideToLongFields configuration.
 * 1 of 3 similar selectors for FILE, ETL and WIDE field configuration.
 * (FIELD_TYPES)
 *
 * @function
 * @param {Object} state
 * @param {string} filename
 * @param {string} fieldAlias
 * @return {Object} field
 */
export const selectSymbolMapWideConfig = (state, filename, fieldAlias) => {
  return fromHeaderView.selectWideToLongFields(state.headerView, filename).fields[
    fieldAlias
  ]['map-symbols'];
};

/**
 *
 * Returns the active headerViews within the hvs collection
 * ⬜ Note: pre v3 hosted both active: true/false.
 *
 *   👉 Active/enabled is all that is ever displayed
 *
 * @function
 * @param {Object} state
 * @param {Object} state.headerView
 * @param {Object} state.headerView.headerViews
 * @return {Object}
 */
export function getHeaderViews(state) {
  return fromHeaderView.getHeaderViews(state.headerView);
}
/**
 * @function
 * @return {Array.<HeaderView>}
 */
export function getHeaderViewsA(state) {
  return Object.values(fromHeaderView.getHeaderViews(state.headerView));
}
/*
 {
  return Object.values(state.headerView.headerViews)
    .filter((hv) => hv.enabled)
    .reduce((activeHvs, hv) => {
      activeHvs[hv.filename] = hv;
      return activeHvs;
    }, {});
} */

export const reportHvsFixesP = ({ state, timeout, DEBUG }) =>
  fromHeaderView.reportHvsFixesP({
    headerViews: getHeaderViewsA(state),
    timeout,
    DEBUG,
  });

export const getHasSelectedFiles = (state) =>
  fromHeaderView.getHasSelectedFiles(state.headerView);

export const getFileInspectionErrors = (state) =>
  fromHeaderView.getFileInspectionErrors(state.headerView);

// note plural headerViews
/**
 * Selector
 * Optional sourceType.
 * @function
 * @param {Object} state
 * @param {?string} sourceType see SOURCE_TYPES
 * @return {Object} headerViewFixes
 */
export const getHeaderViewsFixes = (state, sourceType) =>
  fromHeaderView.getHeaderViewsFixes(state.headerView, sourceType);

// note plural headerViews
/**
 * @function
 * @return {Boolean}
 */
export const getHasHeaderViewsFixes = (state, sourceType = undefined) =>
  fromHeaderView.getHasHeaderViewsFixes(state.headerView, sourceType);

// file-specific fixes
/**
 * @function
 * @param {State} state
 * @param {Filename} filename
 * @param {SourceType} sourceType
 * @return {Array<LuciError>}
 */
export const selectHeaderViewFixes = (state, filename, sourceType) =>
  fromHeaderView.selectHeaderViewFixes(state.headerView, filename, sourceType);

export const selectHasHeaderViewFixes = (state, filename, sourceType) =>
  fromHeaderView.selectHasHeaderViewFixes(state.headerView, sourceType, filename);

export const getActiveFieldCount = (state, filename) =>
  fromHeaderView.getActiveFieldCount(state.headerView, filename);

/**
 * @function
 * Selector
 * @param {object} state The store-state
 * @param {string} filename
 * @param {number} fieldIdx
 * @return {field}
 */
export const selectFieldInHeader = createSelector(
  (state) => state.headerView,
  (_, filename, fieldIdx) => [filename, fieldIdx],
  (fragment, [filename, fieldIdx]) =>
    fromHeaderView.selectFieldInHeader(fragment, filename, fieldIdx),
);

export const selectHeaderView = (state, filename) =>
  fromHeaderView.selectHeaderView(state.headerView, filename);

export const selectHeader = (state, filename) =>
  fromHeaderView.selectHeader(state.headerView, filename);

export const getHasImpliedMvalue = (state, filename) =>
  fromHeaderView.getHasImpliedMvalue(state.headerView, filename);

export const selectHeaderExFields = createSelector(
  (state) => state.headerView,
  (_, filename) => filename,
  (fragment, filename) => fromHeaderView.selectHeaderExFields(fragment, filename),
);

export const selectHeaderViewLean = (state, filename) =>
  fromHeaderView.selectHeaderViewLean(state.headerView, filename);

// returns the configuration object
export const selectWideToLongFields = createSelector(
  (state) => state.headerView,
  (_, filename) => filename,
  (fragment, filename) => fromHeaderView.selectWideToLongFields(fragment, filename),
);

export const selectWideToLongField = createSelector(
  (state) => state.headerView,
  (_, filename, fieldName) => [filename, fieldName],
  (fragment, [filename, fieldName]) =>
    fromHeaderView.selectWideToLongField(fragment, filename, fieldName),
);

export const selectHasWideToLongFields = (state, filename) =>
  fromHeaderView.selectHasWideToLongFields(state.headerView, filename);

export const selectImpliedMvalue = createSelector(
  (state) => state.headerView,
  (_, filename) => filename,
  (fragment, filename) => fromHeaderView.selectImpliedMvalue(fragment, filename),
);

export const selectHasImpliedMvalue = (state, filename) =>
  fromHeaderView.selectHasImpliedMvalue(state.headerView, filename);

// 🚫 Likely deprecate given the new levels ~ selectionModel and separate api.
export const scrubHeaderViews = (state) =>
  fromHeaderView.scrubHeaderViews(state.headerView);

//------------------------------------------------------------------------------
/*
 *  etlView
 *  scope: headerViews -> obsEtl
 */
export const getEtlObject = (state) => fromEtlView.getEtlObject(state.etlView);
export const getEtlFields = (state) => fromEtlView.getEtlFields(state.etlView);

export const getEtlUnits = createSelector(
  (state) => state.etlView,
  (fragment) => fromEtlView.getEtlUnits(fragment),
);

/**
 * Predicate to confirm presence of etlField
 * @function
 * @return {bool}
 */
export const etlFieldExists = (state, fieldName) =>
  fromEtlView.etlFieldExists(state.etlView, fieldName);

/**
 * Predicate that return true when the data is derived
 * - sources are type WIDE, or IMPLIED
 * - has a group-by-file prop
 * @function
 * @param {Object} state
 * @param {string} fieldName
 * @return {bool}
 */
export const isEtlFieldDerived = (state, fieldName) =>
  fromEtlView.isEtlFieldDerived(state.etlView, fieldName);

export const isEtlFieldGroupByFile = (state, fieldName) =>
  fromEtlView.isEtlFieldGroupByFile(state.etlView, fieldName);

/**
 * Returns the props required to display a date using the span values.
 * Object with keys: time and formatOut.
 *
 * ⚠️  EtlUnit name uses the user versions of the name (displayName);
 *
 * @function
 * @param {Object} state
 * @param {string} etlUnitName (codomain)
 * @return {Object}
 */
export const getEtlUnitTimeProp = createSelector(
  (state) => state.etlView,
  (_, etlUnitName) => etlUnitName, // display name
  (fragment, etlUnitName) => fromEtlView.getEtlUnitTimeProp(fragment, etlUnitName),
);

export const getEtlFieldCount = (state) => fromEtlView.getEtlFieldCount(state.etlView);

export const getFieldsKeyedOnPurpose = createSelector(
  (state) => state.etlView,
  (fragment) => fromEtlView.getFieldsKeyedOnPurpose(fragment),
);

export const selectEtlUnitsWithFieldName = createSelector(
  (state) => state.etlView,
  (fragment) => fromEtlView.selectEtlUnitsWithFieldName(fragment),
);

export const getEtlFieldChanges = createSelector(
  (state) => state.etlView,
  (fragment) => fromEtlView.getEtlFieldChanges(fragment),
);

export const selectEtlFieldChanges = createSelector(
  (state) => state.etlView,
  (_, fieldName) => fieldName,
  (fragment, fieldName) => fromEtlView.selectEtlFieldChanges(fragment, fieldName),
);

export const selectEtlField = createSelector(
  (state) => state.etlView,
  (_, fieldName) => fieldName,
  (fragment, fieldName) => fromEtlView.selectEtlField(fragment, fieldName),
);

export const selectEtlUnit = createSelector(
  (state) => state.etlView,
  (_, qualOrMeaName) => qualOrMeaName,
  (fragment, qualOrMeaName) => fromEtlView.selectEtlUnit(fragment, qualOrMeaName),
);

export const getIsEtlProcessing = (state) =>
  fromEtlView.getIsEtlProcessing(state.etlView);

/**
 * state => [[name, purpose]]
 */
export const listOfFieldNameAndPurposeValues = createSelector(
  (state) => state.etlView,
  (_, purpose) => purpose,
  (fragment, purpose) => fromEtlView.listOfFieldNameAndPurposeValues(fragment, purpose),
);

/* derived etlView fields */
export const getEtlFieldViewData = createSelector(
  (state) => state.etlView,
  (fragment) => fromEtlView.getEtlFieldViewData(fragment),
);

// EtlField/Unit subsets
export const getSubEtlField = createSelector(
  (state) => state.etlView,
  (fragment) => fromEtlView.getSubEtlField(fragment),
);

export const getQualEtlFields = createSelector(
  (state) => state.etlView,
  (fragment) => fromEtlView.getQualEtlFields(fragment),
);

export const getMeaRelatedEtlFields = createSelector(
  (state) => state.etlView,
  (fragment) => fromEtlView.getMeaRelatedEtlFields(fragment),
);

export const getMeaEtlUnits = createSelector(
  (state) => state.etlView,
  (fragment) => fromEtlView.getMeaEtlUnits(fragment),
);

// Errors (user to fix)
export const getEtlViewErrors = createSelector(
  (state) => state.etlView,
  (fragment) => fromEtlView.getEtlViewErrors(fragment),
);

export const getHasEtlViewErrors = (state) =>
  fromEtlView.getHasEtlViewErrors(state.etlView);

// 0.3.11
export const selectSymbolMapEtlView = createSelector(
  (state) => state.etlView,
  (fragment) => fromEtlView.selectSymbolMap(fragment),
);

//------------------------------------------------------------------------------
/**
 * workbench
 * scope: obsEtl -> request/matrix
 */

const getWorkbench = (state) => state.workbench;

export const getSearchedField = createSelector([getWorkbench], (fragment) =>
  fromWorkbench.getSelectedEtlUnits(fragment),
);

export const isHostedWarehouseStale = (state) =>
  fromWorkbench.isHostedWarehouseStale(state.workbench);

export const isHostedMatrixStale = (state) =>
  fromWorkbench.isHostedMatrixStale(state.workbench);

export const isAppDataCompleted = (state) =>
  fromWorkbench.isAppDataCompleted(state.workbench);

export const getMatrix = (state) => fromWorkbench.getMatrix(state.workbench);

export const getRequest = (state) => fromWorkbench.getRequest(state.workbench);

export const getTree = (state) => fromWorkbench.getTree(state.workbench);

// deprecate?
export const getPalette = (state) => fromWorkbench.getPalette(state.workbench);

export const selectPaletteGroup = createSelector(
  (state) => state.workbench,
  (fragment) => fromWorkbench.selectPaletteGroup(fragment),
);

/**
 * Predicate - computed tree
 * @function
 * @return {bool}
 */
export const isWorkbenchInitialized = (state) =>
  fromWorkbench.isWorkbenchInitialized(state.workbench);

export const isCanvasDirty = (state) => fromWorkbench.isCanvasDirty(state.workbench);

export const runRequestSpecValidations = (state) =>
  fromWorkbench.runRequestSpecValidations(state.workbench);

// deprecate
export const selectNodeMeta = (state, id) =>
  fromWorkbench.selectNodeMeta(state.workbench, id);

export const selectMaybeNodeSeed = createSelector(
  (state) => state.workbench,
  (_, id) => id,
  (fragment, id) => fromWorkbench.selectMaybeNodeSeed(fragment, id),
);

export const selectMaybeNodeState = createSelector(
  (state) => state.workbench,
  (_, id) => id,
  (fragment, id) => fromWorkbench.selectMaybeNodeState(fragment, id),
);
export const selectNodeState = selectMaybeNodeState;

export const selectMaybeDerivedFieldConfig = createSelector(
  (state) => state.workbench,
  (_, id) => id,
  (fragment, id) => fromWorkbench.selectMaybeDerivedFieldConfig(fragment, id),
);

// id is the node id, identifier to identify the component therein.
export const selectEtlUnitDisplayConfig = createSelector(
  (state) => state.workbench,
  (_, id, identifier, isMeaFlag, nodeTag) => [id, identifier, isMeaFlag, nodeTag],
  (fragment, [id, identifier, isMeaFlag, nodeTag]) =>
    fromWorkbench.selectEtlUnitDisplayConfig(
      fragment,
      id,
      identifier,
      isMeaFlag,
      nodeTag,
    ),
);

/**
 * Seed required to display EtlUnit
 */
export const getNodeDataSeed = createSelector(
  (state) => state.workbench,
  (_, id) => id,
  (fragment, id) => fromWorkbench.getNodeDataSeed(fragment, id),
);

export const getIsCompReducedMap = (state, nodeId, identifier = undefined) =>
  fromWorkbench.getIsCompReducedMap(state.workbench, nodeId, identifier);

export const getIsNoValuesSelected = (state, nodeId, identifier = undefined) =>
  fromWorkbench.getNoValuesSelected(state.workbench, nodeId, identifier);

export const getIsTimeSingleton = (state, nodeId) =>
  fromWorkbench.getIsTimeSingleton(state.workbench, nodeId);

export const getMaybeSelectionModel = createSelector(
  (state) => state.workbench,
  (_, id) => id,
  (fragment, id) => fromWorkbench.getMaybeSelectionModel(fragment, id),
);

/**
 * Returns the span values with the etlUnit name
 * Object with three keys: value, etlUnitName and display name for the unit.
 *
 * @function
 * @param {Object} state
 * @param {number} nodeId
 * @return {Object}
 */
export const getSpanLevelsFromNode = createSelector(
  (state) => state.workbench,
  (_, id) => id,
  (fragment, id) => fromWorkbench.getSpanLevelsFromNode(fragment, id),
);

export const selectSpanValueFromNode = createSelector(
  (state) => state.workbench,
  (_, id, identifyer, spanValueIdx) => [id, identifyer, spanValueIdx],
  (fragment, [id, identifyer, spanValueIdx]) =>
    fromWorkbench.selectSpanValueFromNode(fragment, id, identifyer, spanValueIdx),
);

export const getAmIDropDisabled = (state, id) =>
  fromWorkbench.getAmIDropDisabled(state.workbench, id);

export const getDraggedId = (state) => fromWorkbench.getDraggedId(state.workbench);

// deprecate
export const getDraggedNode = (state) => fromWorkbench.getDraggedNode(state.workbench);

export const getCanvasLists = createSelector(
  (state) => state.workbench,
  (fragment) => fromWorkbench.getCanvasLists(fragment),
);

export const resetCanvas = (state) => fromWorkbench.resetCanvas(state.workbench);
//------------------------------------------------------------------------------
/**
 * pendingRequests
 * meta, shared resource
 */
export const getPendingRequests = (state) =>
  fromPendingRequests.getPendingRequests(state.pendingRequests);

export const getNumberOfPendingRequests = (state) =>
  fromPendingRequests.getNumberOfPendingRequests(state.pendingRequests);

/**
 * feature: INSPECTION | EXTRACTION | WORKBENCH | MATRIX
 *
 * @function
 * @param {object} state
 * @param {str} feature
 * @returns {bool}
 */
export const getHasPendingRequests = (state, feature) =>
  fromPendingRequests
    .getFeaturesWithPendingDataRequests(state.fromPendingRequests)
    .includes(feature);

/**
 * @returns {Array}
 */
export const getFeaturesWithPendingDataRequests = (state) =>
  fromPendingRequests.getFeaturesWithPendingDataRequests(state.pendingRequests);

/**
 *
 * State selector that returns a specific pendingRequest :: query.
 *
 * ⬜ Enumerate the job types from the api
 *
 * @function
 * @param {Object} state
 * @param {string} requestType (api: inspection, extraction)
 * @param {string} uiKey ui-centric identifyer
 * @return {(Object|Null)} query
 */
export const selectPendingRequestWithUiKey = (state, requestType, uiKey) =>
  fromPendingRequests.selectPendingRequestWithUiKey(
    state.pendingRequests,
    requestType,
    uiKey,
  );
/**
 *
 * State selector that return the filename/path of the jobId
 *
 * ⬜ Enumerate the job types from the api
 *
 * @function
 * @param {Object} stateFragment
 * @param {string} requestType (api: inspection, extraction)
 * @param {string} jobId api-centric identifyer
 * @return {(Object|Null)} query
 */
export const selectPendingRequestWithJobId = (state, requestType, jobId) =>
  fromPendingRequests.selectPendingRequestWithJobId(
    state.pendingRequests,
    requestType,
    jobId,
  );

/**
 * Stepper
 */
export const isStepperHidden = (state) => fromStepper.isHidden(state.stepper);
export const getBookmark = (state) => fromStepper.getBookmark(state.stepper);

/**
 * UI-loading
 * Returns { isLoading, message }
 * @function
 * @return {Object}
 */
const getUiState = (state) => state.ui;
export const isUiLoading = createSelector([getUiState], (stateFragment) =>
  fromUi.isUiLoading(stateFragment),
);

//------------------------------------------------------------------------------
/**
 * modal scope: app (see Root modalRoot DOM node)
 */
export const getModalState = (state) => fromModal.getModalState(state.modal);

// END
