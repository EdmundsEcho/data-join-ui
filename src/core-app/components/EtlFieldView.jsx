// src/components/EtlFieldView.jsx

/**
 *
 * @description
 *
 * Core-App page
 *
 * 👉 EtlFieldView
 *
 * 🚧 WIP This view provide the backtracking capacity to edit a file source.
 * ✅ LeftPane: User selects what etlField to view
 * ✅ LeftPane: User can delete a field
 * ✅ RightPane: User can change etlField props
 * ✅ RightPane: User can change the name of an etlField
 *
 * 🔖 The sources prop is a *view*, a subset of what the prop hosts on the
 *    etlField object. As such, use the "lean" selector to update what is required.
 *
 * @module src/components/EtlFieldView.jsx
 *
 */
import React, { useMemo, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

import clsx from 'clsx';

import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import MeasurementIcon from '@mui/icons-material/InsertChart';
import QualityIcon from '@mui/icons-material/PersonPinCircle';
import SubjectIcon from '@mui/icons-material/AccountCircle';

import SplitPane from 'react-split-pane';

import ErrorBoundary from './shared/ErrorBoundary';
import ErrorCard from './shared/ErrorCard';
import EtlFieldDetailView from './EtlFieldDetailView';
import EtlFieldGroupByFileDialog from './EtlGroupByFileDialog';
import EtlUnitMeas from './EtlUnitMeas';
import TextInput from './shared/TextInput';
import TableCellTrash from './shared/TableCellTrash';
import LoadingSplash from './shared/LoadingSplash';

// ☎️
import {
  computeEtlView,
  makeDerivedField,
  removeEtlField,
  renameEtlField,
  updateEtlField,
} from '../ducks/actions/etlView.actions';

// 📖 Left pane data (which also feeds the right pane)
import {
  isUiLoading,
  getFieldsKeyedOnPurpose,
  // getSubEtlField,
  // getQualEtlFields,
  // getMeaRelatedEtlFields,
  getMeaEtlUnits,
  getEtlUnits,
  getEtlViewErrors,
  getCountSelectedFiles,
  listOfFieldNameAndPurposeValues,
} from '../ducks/rootSelectors';
// lib
import { getNextDisplayField } from '../lib/filesToEtlUnits/transforms/etl-unit-helpers';
import {
  isEtlFieldDerived as isDerived,
  mkViewFields,
} from '../lib/filesToEtlUnits/headerview-helpers';
import { PURPOSE_TYPES } from '../lib/sum-types';

import usePersistedState from '../hooks/use-persisted-state';

// 🚧 WIP
// remove field confirmation
import WithModal, { useModal } from './use-modal';
import ConfirmModal from './shared/ConfirmModal';
import { fieldConfirmDelete } from '../constants/strings';

import { colors, useTraceUpdate } from '../constants/variables';

//-----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_REDUCERS === 'true';
const COLOR = colors.blue;
//-----------------------------------------------------------------------------
/* eslint-disable no-console */

// SplitPane className

const style = {
  position: 'relative',
};
const leftPaneStyle = {
  overflow: 'auto',
};
const rightPaneStyle = {
  overflow: 'auto',
};

/**
 * EtlFieldView
 * Display and enable user input to the etl-field level configuration.
 *
 * State sequence
 * 1. step-bar sets ui state to loading
 * 2. this component renders when both withData and !isUiLoading
 * 3. middleware processes
 *
 * FYI: layers of computation:
 * 1. from hvs
 * 2. from pivot(hvs)
 *
 * 📖 etlView (the pivotted data)
 *
 * @component
 *
 * @category Components
 *
 * ⬜ Refactor/adjust the WithModal to something like withModal hook or HOC.
 *
 */

function EtlFieldView() {
  // the ui state depends on changes to hvs (headerViews)
  // isLoading flag: middleware knows when hvs has changed and
  // sets ui to loading accordingly.
  const { isLoading } = useSelector(isUiLoading);
  // view version of the data
  const fileCount = useSelector(getCountSelectedFiles);
  const fieldsKeyedOnPurpose = useSelector(
    (state) => getFieldsKeyedOnPurpose(state, true), // useLean sources
  );

  // 💢 coordinate display with data
  // compute (fetch) the data
  // refresh every time isLoading changes (flag for hvs changes)
  const dispatch = useDispatch();
  useEffect(() => dispatch(computeEtlView()), [isLoading, dispatch]);

  // const isValidData = Object.keys(fieldsKeyedOnPurpose).length > 0;

  if (isLoading) {
    return (
      <LoadingSplash
        title='Building the stack'
        message={`Processing ${fileCount} files`}
      />
    );
  }
  return (
    <WithModal ModalComponent={ConfirmModal}>
      <Top data={fieldsKeyedOnPurpose} />
    </WithModal>
  );
}

// constants for Top
const dummySeedData = {
  purpose: PURPOSE_TYPES.QUALITY,
  etlUnit: null, // etlUnit name
};
//-----------------------------------------------------------------------------
// renders Main
// reactive: data
function Top({ data: fieldsKeyedOnPurpose }) {
  //-----------------------------------------------------------------------------
  const stateId = 'etlFieldView';
  const dispatch = useDispatch();

  const [subEtlField] = fieldsKeyedOnPurpose.subject;
  const qualEtlFields = fieldsKeyedOnPurpose.quality;
  const meaRelatedEtlFields = useMemo(
    () => [
      ...fieldsKeyedOnPurpose.mvalue,
      ...fieldsKeyedOnPurpose.mcomp,
      ...fieldsKeyedOnPurpose.mspan,
    ],
    [
      fieldsKeyedOnPurpose.mvalue,
      fieldsKeyedOnPurpose.mcomp,
      fieldsKeyedOnPurpose.mspan,
    ],
  );
  // 🔖
  // Use this to asses potential for nulls in other fields
  // i.e., when subject.sources.length === other.length, other does not have
  // any null values created when "extended" because no extension takes
  // place.
  const subjectSourceCount = subEtlField?.sources?.length ?? 0;
  /*
  const subEtlField = useSelector(getSubEtlField, shallowEqual);
  const qualEtlFields = useSelector(getQualEtlFields, shallowEqual);
  const meaRelatedEtlFields = useSelector(getMeaRelatedEtlFields, shallowEqual);
  */
  const etlUnits = useSelector(getEtlUnits, shallowEqual);
  const meaEtlUnits = useSelector(getMeaEtlUnits, shallowEqual);
  const listNameAndPurpose = useSelector(listOfFieldNameAndPurposeValues);
  const etlViewErrors = useSelector(getEtlViewErrors);
  const hasEtlViewErrors =
    typeof etlViewErrors !== 'undefined' && etlViewErrors.length > 0;

  // Left hand side view
  // Create smaller/fixed versions of the data (align with components)
  const subEtlFieldView = mkViewFields(['name'], [subEtlField]);
  const qualEtlFieldsView = mkViewFields(['name', 'map-files'], qualEtlFields);
  const meaRelatedEtlFieldsView = mkViewFields(
    ['name', 'purpose', 'time', 'map-files'],
    meaRelatedEtlFields, // : [field]
  );

  const listOfFieldNames = listNameAndPurpose.map((entry) => entry[0]);

  // ---------------------------------------------------------------------------
  // Feature:
  // Determine the field to display in the detail view
  // 1. First time visit -> subject
  // 2. Newly added derived field -> new field
  // 3. Newly deleted derived field -> previous field
  // 4. Renamed etlField -> renamed etlField
  // 5. Otherwise deleted selected field -> subject (e.g., backtrack)
  // list of fields
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // state gymnastics for adding/removing new field
  // a dialog rendered here, updates "this/self", so requires this state
  const [openNewFieldDialog, setOpenNewFieldDialog] = useState(() => false);
  const [removingFieldName, setRemovingFieldName] = useState(() => undefined);
  const [addedDerivedFieldName, setAddedDerivedFieldName] = useState(
    () => undefined,
  );

  // ---------------------------------------------------------------------------
  // new etl field related
  // ---------------------------------------------------------------------------
  const enableAddNewField = useCallback(
    (etlUnitName) => {
      const sources =
        typeof etlUnitName === 'undefined'
          ? subEtlField.sources
          : meaRelatedEtlFields.find((field) => field.name === etlUnitName)
              .sources;

      return sources.length > 1;
    },
    [meaRelatedEtlFields, subEtlField.sources],
  );

  const [newFieldSeedData, setNewFieldSeedData] = useState(() => dummySeedData);
  const resetFieldSeedData = useCallback(
    () => setNewFieldSeedData(dummySeedData),
    [],
  );

  // ---------------------------------------------------------------------------
  // ui active field selection with initial value set to the subject field
  const [selectedFieldName, setSelectedFieldName] = usePersistedState(
    `${stateId}|selectedFieldName`,
    subEtlField.name,
  );
  // cache in the event the user old -> new fieldName
  // 🔖  newFieldName: [oldName, newName]
  const [nextDetailViewArray, setNextDetailViewArray] = usePersistedState(
    `${stateId}|newFieldNameArray`,
    undefined,
  );

  //
  // used by both right and left sides
  //
  // Sync access to which field to put in the detail view
  // This field changes based on user-input && "next best" when deletes
  // a field.
  const getSelectedFieldName = useCallback(
    (/* selectedFieldName, listOfFieldNames */) => {
      switch (true) {
        // first choice:
        // next detail view set when adding or removing a field
        // ...with a fallback when in error state.
        case typeof nextDetailViewArray !== 'undefined': {
          const newName = hasEtlViewErrors
            ? nextDetailViewArray[0] // fallback, revert to the oldName
            : nextDetailViewArray[1]; // proceed with the newName
          setSelectedFieldName(newName); // async
          setNextDetailViewArray(undefined);
          return newName;
        }

        // next best: the latest user-selected field
        case listOfFieldNames.includes(selectedFieldName):
          return selectedFieldName;

        // failsafe: subject field
        default:
          return subEtlField.name;
      }
    },
    [
      hasEtlViewErrors,
      listOfFieldNames,
      nextDetailViewArray,
      selectedFieldName,
      setNextDetailViewArray,
      setSelectedFieldName,
      subEtlField.name,
    ],
  );

  // retrieve the field itself from the index of EtlFields
  // 📖 this is my local state
  //
  // 🦀 This returns undefined when deleting a field
  //
  const selectFieldData = useCallback(
    (fieldName) => {
      const firstTry = [
        subEtlField,
        ...qualEtlFields,
        ...meaRelatedEtlFields,
      ].find((field) => field.name === fieldName);
      // hack
      return typeof firstTry !== 'undefined' ? firstTry : subEtlField;
    },
    [meaRelatedEtlFields, qualEtlFields, subEtlField],
  );

  //-----------------------------------------------------------------------------
  // 🗑️  Remove field
  //
  // 🔖 Removing a field tricky but required for component to update "self"
  //    👉 The timing/sequence of the dispatch matters;
  //       the opposite timing is used for adding a field.
  //    👉 User-confirmation is required prior to removing a field
  //
  // Removing a field has two phases
  //
  // 1️⃣  user hits delete(fieldName)
  // a. set the next field to display (move the active field off "to be deleted")
  // b. update local state to record which field to delete
  // 🚫 cannot dispatch delete now, as it is the current field
  //
  // -> re-render
  //
  // 2️⃣  useEffects...
  // a. display the next field recorded earlier (setCurrentField)
  // b. dispatch the action to remove the field marked for deletion
  //
  // ✅ use a promise to manage the confirmation dialog
  //
  //-----------------------------------------------------------------------------
  const confirmP = useModal();
  const handleEtlFieldDeletion = useCallback(
    (fieldName) => {
      // modal options
      confirmP({
        message: fieldConfirmDelete(fieldName),
        stateId: `${fieldName}|ConfirmModal`,
      })
        // 1️⃣  Removing a field
        // move/shift the cursor away from deleted, to the previous field
        .then(() => {
          setNextDetailViewArray([
            fieldName, // maybe remove
            getNextDisplayField(fieldName, listOfFieldNames, etlUnits),
          ]);
          // put into memory for Phase 2
          // when we dispatch the action to change the state
          setRemovingFieldName(fieldName);
        })
        .catch(() => {
          if (DEBUG) {
            console.log(`%cCancelled: ${fieldName}`, COLOR);
          }
        });
    },
    [confirmP, etlUnits, listOfFieldNames, setNextDetailViewArray],
  );

  // 💫 ...once the selected field has been moved off of the
  //    removed field slot, dispatch the removal of the field.
  //    🦀 react 18: calls twice; the second time, may fail only
  //       when the field is a derived etlField (group-by-file)
  useEffect(() => {
    // 2️⃣  Remove the previously marked field
    if (removingFieldName) {
      const { purpose } = selectFieldData(removingFieldName);
      // dispatch (which triggers a re-render)
      // 🔖 for removing a new field,
      //    remove the field *after* we moved the detail view cursor
      dispatch(removeEtlField(removingFieldName, purpose));
      // clear the state trigger
      setRemovingFieldName(undefined);
    }
  }, [dispatch, removingFieldName, selectFieldData]);

  // ✅ Adding a new derived field - requires useEffect
  const handleNewFieldSave = useCallback(
    (validSeedData, files) => {
      dispatch(
        makeDerivedField({ validSeedData, files }, { startTime: new Date() }),
      );
      // set the selected field *once dispatch has taken effect*
      setAddedDerivedFieldName(validSeedData.name);
      resetFieldSeedData();
      setOpenNewFieldDialog(false);
    },
    [dispatch, resetFieldSeedData],
  );

  // 💫 ...once the new field is added, now set it as
  //    the selected field.
  useEffect(() => {
    if (addedDerivedFieldName) {
      // set state to display the new field
      // 🔖 for adding a new field, setSelected *after* it has been added
      setSelectedFieldName(addedDerivedFieldName);
      // clear the state trigger
      setAddedDerivedFieldName(undefined);
    }
  }, [addedDerivedFieldName, setSelectedFieldName]);

  // ✅
  const handleEtlFieldCancel = useCallback(() => {
    resetFieldSeedData();
    setOpenNewFieldDialog(false);
  }, [resetFieldSeedData]);

  // ✅ Open dialog to express component state
  // (changing the child/dialog's props)
  const onOpenNewCompDialog = useCallback((mvalue) => {
    setNewFieldSeedData({
      purpose: PURPOSE_TYPES.MCOMP,
      etlUnit: mvalue, // etlUnit name
    });
    setOpenNewFieldDialog(true);
  }, []);

  // ✅ Open dialog to express component state
  // (changing the child/dialog's props)
  const onOpenNewQualDialog = useCallback(() => {
    setNewFieldSeedData({
      purpose: PURPOSE_TYPES.QUALITY,
      etlUnit: null,
    });
    setOpenNewFieldDialog(true);
  }, []);

  // ✅ Left side user selection
  const handleSelectField = useCallback(
    (fieldName) => {
      setSelectedFieldName(fieldName);
    },
    [setSelectedFieldName],
  );

  // ✅ Save right side user input
  const handleSaveChange = useCallback(
    (fieldName, key, value) => {
      dispatch(updateEtlField(fieldName, key, value));
    },
    [dispatch],
  );

  // ✅ Save right side user input
  const handleRenameField = useCallback(
    (oldName, newName) => {
      setNextDetailViewArray([oldName, newName]);
      dispatch(renameEtlField(oldName, newName, listNameAndPurpose));
    },
    [dispatch, listNameAndPurpose, setNextDetailViewArray],
  );

  // 💰 nrows (records) === nlevels of a subject source
  // in the group-by-file context, the number of records = count in levels
  // [value, count]
  // 👎 This is a poorly located derived field selector
  // files for the derived-field dialog
  const mkFilesLookup = useCallback(
    (etlUnitName) => {
      const sources = !etlUnitName
        ? subEtlField.sources
        : meaRelatedEtlFields.find((field) => field.name === etlUnitName)
            .sources;

      /*
      console.log(`%ccomponent sources:`, colors.red);
      console.dir(sources);
      console.dir(subEtlField.sources);
      */

      return sources.reduce((filenamesAndCount, source) => {
        /* eslint-disable-next-line no-param-reassign */
        filenamesAndCount[source.filename] = source.nrows;
        return filenamesAndCount;
      }, {});
    },
    [meaRelatedEtlFields, subEtlField.sources],
  );

  return (
    <Main
      leftPane={
        <LeftPane
          key={`${stateId}|LeftPane`}
          stateId={`${stateId}|LeftPane`}
          subEtlFieldView={subEtlFieldView} // 📖 data
          qualEtlFieldsView={qualEtlFieldsView} // 📖 data
          meaRelatedEtlFieldsView={meaRelatedEtlFieldsView} // 📖 data
          getSelectedFieldName={getSelectedFieldName}
          setSelectedFieldName={setSelectedFieldName}
          handleSelectField={handleSelectField}
          handleDelete={handleEtlFieldDeletion}
          onOpenNewQualDialog={onOpenNewQualDialog}
          onOpenNewCompDialog={onOpenNewCompDialog}
          enableAddNewField={enableAddNewField}
          meaEtlUnits={meaEtlUnits} // version of the EtlUnits component
        />
      }
      rightPane={
        <RightPane
          key={`${stateId}|RightPane`}
          stateId={`${stateId}|RightPane`}
          selectFieldData={selectFieldData}
          getSelectedFieldName={getSelectedFieldName}
          handleEtlFieldDeletion={handleEtlFieldDeletion}
          handleSaveChange={handleSaveChange}
          handleRenameField={handleRenameField}
          subjectSourceCount={subjectSourceCount}
          etlViewErrors={etlViewErrors}
        />
      }
      newFieldDialog={
        <EtlFieldGroupByFileDialog
          key={`${stateId}|newFieldDialog|${newFieldSeedData?.purpose}`}
          stateId={`${stateId}|newFieldDialog`}
          open={openNewFieldDialog}
          files={mkFilesLookup(newFieldSeedData?.etlUnit)}
          seedValues={newFieldSeedData}
          onSave={handleNewFieldSave}
          onCancel={handleEtlFieldCancel}
          error={(newName) => listOfFieldNames.includes(newName)}
        />
      }
    />
  );
}

// 🔧
EtlFieldView.whyDidYouRender = true;

EtlFieldView.propTypes = {};
Top.propTypes = EtlFieldView.propTypes;

//-----------------------------------------------------------------------------
function Main(props) {
  //-----------------------------------------------------------------------------
  const { leftPane, rightPane, newFieldDialog } = props;

  useTraceUpdate(props);

  if (process.env.REACT_APP_DEBUG_RENDER === 'true') {
    console.debug(`%crendering EtlFieldView`, colors.green);
  }

  return (
    <>
      {/* ROOT VIEW */}
      <SplitPane
        className={clsx('Luci-SplitPane', 'EtlFieldView')}
        style={style}
        pane1Style={leftPaneStyle}
        pane2Style={rightPaneStyle}
        minSize={270}
        defaultSize={500}>
        {leftPane}
        {rightPane}
      </SplitPane>
      {newFieldDialog}
    </>
  );
}

Main.propTypes = {
  leftPane: PropTypes.node.isRequired,
  rightPane: PropTypes.node.isRequired,
  newFieldDialog: PropTypes.node.isRequired,
};

// 🔧
Main.whyDidYouRender = true;
Main.displayName = 'Main';

function LeftPane({
  // stateId,
  subEtlFieldView,
  qualEtlFieldsView,
  meaRelatedEtlFieldsView,
  getSelectedFieldName,
  setSelectedFieldName,
  handleSelectField,
  handleDelete, // delete etlField
  onOpenNewQualDialog,
  onOpenNewCompDialog,
  enableAddNewField,
  meaEtlUnits,
}) {
  const [selectedFieldName, _setSelectedFieldName] = useState(() => 'not-me');

  useEffect(
    () => _setSelectedFieldName(getSelectedFieldName()),
    [getSelectedFieldName, _setSelectedFieldName],
  );

  return (
    <Container className={clsx('leftPane')}>
      <EtlUnit
        purpose={PURPOSE_TYPES.SUBJECT}
        etlFields={subEtlFieldView} // 📖 data
        selectedFieldName={selectedFieldName}
        handleSelectField={handleSelectField}
        cardHeader={<SubjectHeader />}
      />
      <EtlUnit
        purpose={PURPOSE_TYPES.QUALITY}
        etlFields={qualEtlFieldsView} // 📖 data
        selectedFieldName={selectedFieldName}
        onOpenNewQualDialog={onOpenNewQualDialog}
        handleSelectField={handleSelectField}
        handleDelete={handleDelete}
        cardHeader={
          <QualityHeader
            enableAddNewField={enableAddNewField()} // now vs mea version
            onOpenNewQualDialog={onOpenNewQualDialog}
          />
        }
      />
      <EtlUnit
        purpose={PURPOSE_TYPES.MVALUE}
        selectedFieldName={selectedFieldName}
        handleSelectField={handleSelectField}
        cardHeader={<MeasurementHeader />}>
        <EtlUnitMeas
          meaEtlUnits={meaEtlUnits} // 📖
          meaRelatedEtlFields={meaRelatedEtlFieldsView} // 📖
          selectedFieldName={selectedFieldName}
          onRowSelect={setSelectedFieldName}
          onOpenNewCompDialog={onOpenNewCompDialog}
          enableAddNewField={enableAddNewField} // ⚠️  func: wait mvalueName
          tableCellTrash={tableCellTrashFn(handleDelete)}
        />
      </EtlUnit>
    </Container>
  );
}
LeftPane.displayName = 'LeftPane';
LeftPane.propTypes = {
  // stateId: PropTypes.string.isRequired,
  subEtlFieldView: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  qualEtlFieldsView: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  meaRelatedEtlFieldsView: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  getSelectedFieldName: PropTypes.func.isRequired,
  setSelectedFieldName: PropTypes.func.isRequired,
  handleSelectField: PropTypes.func.isRequired,
  handleDelete: PropTypes.func,
  onOpenNewQualDialog: PropTypes.func.isRequired,
  onOpenNewCompDialog: PropTypes.func.isRequired,
  enableAddNewField: PropTypes.func.isRequired,
  meaEtlUnits: PropTypes.shape({}).isRequired,
};
LeftPane.defaultProps = {
  handleDelete: undefined,
};
// 🔧
LeftPane.whyDidYouRender = true;

function tableCellTrashFn(handleDelete) {
  return function TableCellTrashWrapper(fieldName, purpose) {
    return (
      <TableCellTrash
        className='measurement'
        fieldName={fieldName}
        purpose={purpose}
        handleDelete={handleDelete}
      />
    );
  };
}
function RightPane({
  stateId,
  selectFieldData,
  getSelectedFieldName,
  // handleEtlFieldDeletion,
  handleSaveChange,
  handleRenameField,
  subjectSourceCount,
  etlViewErrors,
}) {
  const [field, setField] = useState(() => ({
    name: undefined,
    data: undefined,
  }));
  useEffect(
    () =>
      setField({
        name: getSelectedFieldName(),
        data: selectFieldData(getSelectedFieldName()),
      }),
    [getSelectedFieldName, selectFieldData],
  );

  return (
    <Container>
      {typeof field?.name === 'undefined' ||
      typeof field?.data === 'undefined' ? (
        <Container>
          <Typography type='p'>
            Select a field to complete the configuration.
          </Typography>
        </Container>
      ) : (
        <DetailView
          key={`${stateId}|DetailView`}
          stateId={`${stateId}|DetailView`}
          field={field?.data}
          handleSaveChange={handleSaveChange}
          handleRenameField={handleRenameField}
          etlViewErrors={etlViewErrors}
          subjectSourceCount={subjectSourceCount}
        />
      )}
    </Container>
  );
}
RightPane.displayName = 'RightPane';
RightPane.propTypes = {
  stateId: PropTypes.string.isRequired,
  selectFieldData: PropTypes.func.isRequired,
  getSelectedFieldName: PropTypes.func.isRequired,
  handleSaveChange: PropTypes.func.isRequired,
  handleRenameField: PropTypes.func.isRequired,
  // handleEtlFieldDeletion: PropTypes.func,
  etlViewErrors: PropTypes.arrayOf(PropTypes.shape({})),
  subjectSourceCount: PropTypes.number.isRequired,
};
RightPane.defaultProps = {
  // handleEtlFieldDeletion: undefined,
  etlViewErrors: [],
};
// 🔧
RightPane.whyDidYouRender = true;

/**
 * right side
 */
function DetailView(props) {
  const {
    stateId,
    field,
    // handleEtlFieldDeletion,
    handleSaveChange,
    handleRenameField,
    subjectSourceCount,
    etlViewErrors,
  } = props;

  const hasEtlViewErrors =
    typeof etlViewErrors !== 'undefined' && etlViewErrors.length > 0;

  const mayHaveNullValues = field.sources.length < subjectSourceCount;

  return (
    <Card className={clsx('Luci-EtlFieldView', 'detailView')}>
      <CardHeader
        className={clsx('rightPaneHeader')}
        title={
          <FormControl variant='standard'>
            <InputLabel>Field Name</InputLabel>
            <TextInput
              className={clsx('Luci-EtlFieldView title-input')}
              key={`${stateId}|fieldName-${field.name}`}
              stateId={`${stateId}|fieldName-${field.name}`}
              value={`${field.name}`}
              variant='filled'
              id='name'
              name='name'
              size='medium'
              color='primary'
              saveChange={(e) => handleRenameField(field.name, e.target.value)} // oldName, newName
              error={hasEtlViewErrors}
              required
            />
          </FormControl>
        }
      />
      <CardContent className={clsx('rightPaneContent')}>
        <p />
        <EtlFieldDetailView
          key={`${stateId}|etlFieldDelegateForm`} // 👍 static key value
          stateId={`${stateId}|etlFieldDelegateForm-${field.name}`}
          caller='etl-field'
          field={field} // 📖
          hasNullValues={mayHaveNullValues}
          saveChange={(e) =>
            handleSaveChange(field.name, e.target.name, e.target.value)
          }
        />
      </CardContent>
      {!hasEtlViewErrors ? null : (
        <CardContent>
          <ErrorCard
            key='EtlView|ErrorCard'
            stateId='EtlView|ErrorCard'
            errors={etlViewErrors}
            viewDetail
            // onHide={() => setShowErrors(false)}
          />
        </CardContent>
      )}
    </Card>
  );
}
DetailView.displayName = 'DetailView';
DetailView.propTypes = {
  stateId: PropTypes.string.isRequired,
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
    sources: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  }).isRequired,
  handleSaveChange: PropTypes.func.isRequired,
  handleRenameField: PropTypes.func,
  etlViewErrors: PropTypes.arrayOf(PropTypes.shape({})),
  subjectSourceCount: PropTypes.number.isRequired,
};
DetailView.defaultProps = {
  handleRenameField: () => {},
  etlViewErrors: undefined,
};

function EtlUnit({
  purpose,
  etlFields,
  selectedFieldName,
  handleSelectField,
  handleDelete,
  cardHeader,
  children = undefined,
}) {
  return (
    <ErrorBoundary
      message={`Something went wrong with EtlUnit with purpose: ${purpose}`}>
      <Card className={clsx('Luci-EtlFieldView', 'root')}>
        {cardHeader}
        <CardContent>
          {typeof children !== 'undefined' ? (
            children
          ) : (
            <Table className={clsx('Luci-Table', 'etlFields')}>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Grid container className='headerWrapper'>
                      <Grid item xs={12}>
                        <Typography noWrap>Field Name</Typography>
                      </Grid>
                    </Grid>
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>

              <TableBody>
                {etlFields?.length > 0 &&
                  etlFields.map((field) => (
                    <TableRow
                      key={field.name}
                      className={clsx(
                        'Luci-Table-Row',
                        field.name === selectedFieldName
                          ? 'selected'
                          : 'active',
                      )}
                      hover
                      onClick={() => handleSelectField(field.name)}>
                      <TableCell>
                        <Typography variant='body1' noWrap>
                          {field.name}
                          {isDerived(field) && <span> (derived)</span>}
                        </Typography>
                      </TableCell>

                      <TableCellTrash
                        className='quality'
                        handleDelete={handleDelete}
                        fieldName={field.name}
                        purpose={purpose}
                      />
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
}
EtlUnit.displayName = 'EtlUnit';
EtlUnit.propTypes = {
  purpose: PropTypes.oneOf(Object.values(PURPOSE_TYPES)).isRequired,
  etlFields: PropTypes.arrayOf(PropTypes.shape({})),
  selectedFieldName: PropTypes.string.isRequired,
  handleSelectField: PropTypes.func.isRequired,
  handleDelete: PropTypes.func,
  cardHeader: PropTypes.node.isRequired,
  children: PropTypes.node,
};
EtlUnit.defaultProps = {
  etlFields: [], // while loading
  handleDelete: () => {},
  children: undefined,
};

function SubjectHeader() {
  return (
    <CardHeader
      title={
        <>
          <SubjectIcon
            className={clsx('Luci-Icon', 'subject')}
            color='secondary'
          />
          <span>Subject</span>
        </>
      }
    />
  );
}
SubjectHeader.propTypes = {};

function QualityHeader({ enableAddNewField, onOpenNewQualDialog }) {
  return (
    <CardHeader
      title={
        <>
          <QualityIcon
            className={clsx('Luci-Icon', 'quality')}
            color='secondary'
          />
          <span>Qualities</span>
          {enableAddNewField ? (
            <IconButton
              className={clsx('Luci-Icon', 'addQualImpliedFieldButton')}
              size='small'
              onClick={onOpenNewQualDialog}>
              <AddIcon />
            </IconButton>
          ) : null}
        </>
      }
    />
  );
}
QualityHeader.propTypes = {
  enableAddNewField: PropTypes.bool.isRequired,
  onOpenNewQualDialog: PropTypes.func.isRequired,
};

function MeasurementHeader() {
  return (
    <CardHeader
      title={
        <>
          <MeasurementIcon
            className={clsx('Luci-Icon', 'measurement')}
            color='secondary'
          />
          <span>Measurements</span>
        </>
      }
    />
  );
}
MeasurementHeader.propTypes = {};

export default EtlFieldView;
