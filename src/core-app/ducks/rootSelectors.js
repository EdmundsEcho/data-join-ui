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

export const getDriveTokenId = (state) =>
  fromFileView.getDriveTokenId(state.fileView);

export const { STATUS } = fromFileView;
//------------------------------------------------------------------------------
/**  headerView
 *   process scope: selected files -> etl
 *
 *   state -> state.headerView
 */

export const getSelected = (state) =>
  fromHeaderView.getSelected(state.headerView);

export const getCountSelectedFiles = (state) => getSelected(state).length;

export const isFileSelected = (state, path) =>
  fromHeaderView.isFileSelected(state.headerView, path);

export const getHvSequence = (state, filename) =>
  getSelected(state).findIndex((filename_) => filename_ === filename);

export const getSelectionModelFile = (state, filename, headerIdx) =>
  fromHeaderView.getSelectionModelFile(state.headerView, filename, headerIdx);

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
  fromHeaderView.selectHasHeaderViewFixes(
    state.headerView,
    sourceType,
    filename,
  );

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
export const selectFieldInHeader = (state, filename, fieldIdx) =>
  fromHeaderView.selectFieldInHeader(state.headerView, filename, fieldIdx);

export const selectHeaderView = (state, filename) =>
  fromHeaderView.selectHeaderView(state.headerView, filename);

export const selectHeader = (state, filename) =>
  fromHeaderView.selectHeader(state.headerView, filename);

export const getHasImpliedMvalue = (state, filename) =>
  fromHeaderView.getHasImpliedMvalue(state.headerView, filename);

export const selectHeaderExFields = (state, filename) =>
  fromHeaderView.selectHeaderExFields(state.headerView, filename);

export const selectHeaderViewLean = (state, filename) =>
  fromHeaderView.selectHeaderViewLean(state.headerView, filename);

export const selectWideToLongFields = (state, filename) =>
  fromHeaderView.selectWideToLongFields(state.headerView, filename);

export const selectHasWideToLongFields = (state, filename) =>
  fromHeaderView.selectHasWideToLongFields(state.headerView, filename);

export const selectImpliedMvalue = (state, filename) =>
  fromHeaderView.selectImpliedMvalue(state.headerView, filename);

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

/**
 * Predicate to confirm presence of etlField
 * @function
 * @return {bool}
 */
export const etlFieldExists = (state, fieldName) =>
  fromEtlView.etlFieldExists(state.etlView, fieldName);

export const getSelectionModelEtl = (state, fieldName) =>
  fromEtlView.getSelectionModelEtl(state.etlView, fieldName);

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
export const getEtlUnitTimeProp = (state, etlUnitName /* displayName */) =>
  fromEtlView.getEtlUnitTimeProp(state.etlView, etlUnitName);

export const getEtlFieldCount = (state) =>
  fromEtlView.getEtlFieldCount(state.etlView);
export const getFieldsKeyedOnPurpose = (state, useLean = false) =>
  fromEtlView.getFieldsKeyedOnPurpose(state.etlView, useLean);

export const getEtlUnits = (state) => fromEtlView.getEtlUnits(state.etlView);
export const selectEtlUnitsWithFieldName = (state) =>
  fromEtlView.selectEtlUnitsWithFieldName(state.etlView);

export const getEtlFieldChanges = (state) =>
  fromEtlView.getEtlFieldChanges(state.etlView);

export const isEtlFieldDerived = (state, fieldName) =>
  fromEtlView.isEtlFieldDerived(state.etlView, fieldName);

export const selectEtlFieldChanges = (state, fieldName) =>
  fromEtlView.selectEtlFieldChanges(state.etlView, fieldName);

export const selectEtlField = (state, fieldName) =>
  fromEtlView.selectEtlField(state.etlView, fieldName);

export const selectEtlUnit = (state, qualOrMeaName) =>
  fromEtlView.selectEtlUnit(state.etlView, qualOrMeaName);

export const getIsEtlProcessing = (state) =>
  fromEtlView.getIsEtlProcessing(state.etlView);

/**
 * state => [[name, purpose]]
 */
export const listOfFieldNameAndPurposeValues = (state, purpose) =>
  fromEtlView.listOfFieldNameAndPurposeValues(state.etlView, purpose);

/* derived etlView fields */
export const getEtlFieldViewData = (state) =>
  fromEtlView.getEtlFieldViewData(state.etlView);

// EtlField/Unit subsets
export const getSubEtlField = (state) =>
  fromEtlView.getSubEtlField(state.etlView);

export const getQualEtlFields = (state) =>
  fromEtlView.getQualEtlFields(state.etlView);

export const getMeaRelatedEtlFields = (state) =>
  fromEtlView.getMeaRelatedEtlFields(state.etlView);

export const getMeaEtlUnits = (state) =>
  fromEtlView.getMeaEtlUnits(state.etlView);

// Errors (user to fix)
export const getEtlViewErrors = (state) =>
  fromEtlView.getEtlViewErrors(state.etlView);
export const getHasEtlViewErrors = (state) =>
  fromEtlView.getHasEtlViewErrors(state.etlView);

//------------------------------------------------------------------------------
/**
 * workbench
 * scope: obsEtl -> request/matrix
 */

export const getSelectedEtlUnits = (state) =>
  fromWorkbench.getSelectedEtlUnits(state.workbench);

export const isHostedWarehouseStale = (state) =>
  fromWorkbench.isHostedWarehouseStale(state.workbench);

export const isHostedMatrixStale = (state) =>
  fromWorkbench.isHostedMatrixStale(state.workbench);

export const isAppDataCompleted = (state) =>
  fromWorkbench.isAppDataCompleted(state.workbench);

export const getMatrix = (state) => fromWorkbench.getMatrix(state.workbench);

export const getRequest = (state) => fromWorkbench.getRequest(state.workbench);

export const getTree = (state) => fromWorkbench.getTree(state.workbench);

export const getPalette = (state) => fromWorkbench.getPalette(state.workbench);

export const selectPaletteGroup = (state) =>
  fromWorkbench.selectPaletteGroup(state.workbench);

/**
 * Predicate - computed tree
 * @function
 * @return {bool}
 */
export const isWorkbenchInitialized = (state) =>
  fromWorkbench.isWorkbenchInitialized(state.workbench);

export const isCanvasDirty = (state) =>
  fromWorkbench.isCanvasDirty(state.workbench);

export const runRequestSpecValidations = (state) =>
  fromWorkbench.runRequestSpecValidations(state.workbench);

/**
 * Seed for graphql levels
 * @function
 */
export const selectSeedForValues = (state, id, identifier) =>
  fromWorkbench.selectSeedForValues(state.workbench, id, identifier);

export const selectMaybeNodeSeed = (state, id) =>
  fromWorkbench.selectMaybeNodeSeed(state.workbench, id);

export const selectNodeMeta = (state, id) =>
  fromWorkbench.selectNodeMeta(state.workbench, id);

export const selectMaybeNodeState = (state, id) =>
  fromWorkbench.selectMaybeNodeState(state.workbench, id);

// deprecate alias
export const selectNodeState = (state, id) => selectMaybeNodeState(state, id);

export const selectMaybeDerivedFieldConfig = (state, id) =>
  fromWorkbench.selectMaybeDerivedFieldConfig(state.workbench, id);

export const selectEtlUnitDisplayConfig = (state, nodeId, identifyer, mea) =>
  fromWorkbench.selectEtlUnitDisplayConfig(
    state.workbench,
    nodeId,
    identifyer,
    mea,
  );
/**
 * Seed required to display EtlUnit
 */
export const getNodeDataSeed = (state, nodeId) =>
  fromWorkbench.getNodeDataSeed(state.workbench, nodeId);

export const getIsCompReducedMap = (state, nodeId, identifier = undefined) =>
  fromWorkbench.getIsCompReducedMap(state.workbench, nodeId, identifier);

export const getIsNoValuesSelected = (state, nodeId, identifier = undefined) =>
  fromWorkbench.getNoValuesSelected(state.workbench, nodeId, identifier);

export const getIsTimeSingleton = (state, nodeId) =>
  fromWorkbench.getIsTimeSingleton(state.workbench, nodeId);

export const selectNodeWithoutLevels = (state, id) =>
  fromWorkbench.selectNodeWithoutLevels(state.workbench, id);

export const getSelectionModel = (state, nodeId, identifyer) =>
  fromWorkbench.getSelectionModel(state.workbench, nodeId, identifyer);

/**
 * Returns the span values with the etlUnit name
 * Object with three keys: value, etlUnitName and display name for the unit.
 *
 * @function
 * @param {Object} state
 * @param {number} nodeId
 * @return {Object}
 */
export const getSpanLevelsFromNode = (state, nodeId) =>
  fromWorkbench.getSpanLevelsFromNode(state.workbench, nodeId);

export const selectSpanValueFromNode = (
  state,
  nodeId,
  identifyer,
  spanValueIdx,
) =>
  fromWorkbench.selectSpanValueFromNode(
    state.workbench,
    nodeId,
    identifyer,
    spanValueIdx,
  );

export const getAmIDropDisabled = (state, id) =>
  fromWorkbench.getAmIDropDisabled(state.workbench, id);

export const getDraggedId = (state) =>
  fromWorkbench.getDraggedId(state.workbench);

export const getDraggedNode = (state) =>
  fromWorkbench.getDraggedNode(state.workbench);

export const getCanvasLists = (state) =>
  fromWorkbench.getCanvasLists(state.workbench);

export const resetCanvas = (state) =>
  fromWorkbench.resetCanvas(state.workbench);
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
export const isUiLoading = (state) => fromUi.isUiLoading(state.ui);

//------------------------------------------------------------------------------
/**
 * modal scope: app (see Root modalRoot DOM node)
 */
export const getModalState = (state) => fromModal.getModalState(state.modal);

// END
