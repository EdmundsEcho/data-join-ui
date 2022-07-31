// src/components/WideToLongCard

/**
 * @module components/WideToLongCard
 *
 * @description
 * This is a scrappy component to handle wide-to-long transformations. This
 * component handles changes to fields in specific handler functions which
 * update parts of the state they are concerned with. Each one of these handler
 * functions ultimately calls buildFactors() once they've written their state.
 * buildFactors() does a number of things including rebuilding the state.errors
 * array based on input collected by handlers, running the
 * wideToLongFieldsConfig operation using props.headerView.
 *
 * Update July 19, 2020:
 * How record without calling the validation with each key change?
 * Options:
 *
 * 1. uncontrolled with initial value set by redux?
 *    * onBlur - write to redux
 *
 * 2. controlled using useState
 *    * onChange - change state
 *    * onBlur - write to redux
 *
 * 3. third party: react-hook-form
 *
 *
 * @todo factor out the transforms into the
 * lib/fileToEtl/transforms/wide-to-long-fields
 *
 * ⬆ HeaderView
 * 📖 filename -> headerView (requires fields)
 * ⬇ custom render
 *
 */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import { useSelector, shallowEqual, useDispatch } from 'react-redux';

import makeStyles from '@mui/styles/makeStyles';

import AddIcon from '@mui/icons-material/AddCircleOutline';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import RemoveIcon from '@mui/icons-material/RemoveCircleOutline';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid'; // make sure is last

import FieldDetailView from './FieldDetailView';

import SummaryDetailRow from './shared/SummaryDetailRow';
import PurposeButtons from './shared/PurposeButtons';
import HeadingBox from './shared/HeadingBox';
import ErrorBoundary from './shared/ErrorBoundary';
import ErrorCard from './shared/ErrorCard';
import TextField from './shared/TextField';
import RegexMenu from './Menus/RegexMenu';

// 📖 data
import {
  selectHeaderViewFixes,
  selectWideToLongFields,
} from '../ducks/rootSelectors';
import { dummyField } from '../lib/filesToEtlUnits/transforms/headerview-field';
import { SOURCE_TYPES, FIELD_TYPES } from '../lib/sum-types';

// ☎️  callbacks
import { updateWideToLongFields } from '../ducks/actions/headerView.actions';

import { debug, useTraceUpdate } from '../constants/variables';

//------------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_RENDER_HIGH === 'true';
//------------------------------------------------------------------------------
/* eslint-disable no-console */

// fix JSX {{
const stylePaddingZero = { padding: '0px' };
const styleIconButton = {
  padding: '0px',
  paddingRight: '3px',
  marginTop: '-4px',
};
/**
 * @component
 *
 */
const WideToLongCard = (props) => {
  const { filename, stateId } = props;

  useTraceUpdate(props);

  if (process.env.REACT_APP_DEBUG_RENDER === 'true') {
    console.debug(`%crendering WideToLongCard`, debug.color.green);
  }
  if (DEBUG) {
    console.dir(props);
  }

  // 📖 data
  // see mkWideToLong called when scan hv for min def
  // ⬜ Combine useSelector with how to augment the data for the ui
  const wideToLongFields = useSelector(
    (state) => selectWideToLongFields(state, filename),
    shallowEqual,
  );
  // NEXT: This is not getting the latest state!
  const fixes = useSelector(
    (state) => selectHeaderViewFixes(state, filename, SOURCE_TYPES.WIDE),
    shallowEqual,
  );

  const selectFactorValue = useCallback(
    (factorName, fieldAlias) => {
      return (
        wideToLongFields.fields?.[factorName]?.['map-fieldnames']?.arrows[
          fieldAlias
        ] ?? ''
      );
    },
    [wideToLongFields],
  );

  const { config, fields = {} } = wideToLongFields;

  const { factors = [], mvalue: measurementName = '' } = config;

  // [aliasName, headerIdx]
  // for every factor, used for field name -> value set by the user
  const fieldAliasIdxsMap = Object.entries(config['alias-idx-map']);

  // data read interface
  // provides a default value when needed
  const getWideFieldFromId = useCallback(
    (factorId) => {
      return (
        fields[factors.find((factor) => factor.id === factorId).name] ||
        dummyField
      );
    },
    [factors, fields],
  );

  // getValue={getWideFieldValue(factorId)}
  const getWideFieldValue = (factorId) => (valueName) => {
    return getWideFieldFromId(factorId)[valueName];
  };

  // ☎️
  const dispatch = useDispatch();

  /* The unified dispatch function */
  const onChange = (payload) => {
    if (DEBUG) {
      console.debug(`onChange payload`);
      console.dir(payload);
    }
    dispatch(updateWideToLongFields(payload)); // action creator
  };

  /* wtlf.config.factor */
  const addFactor = () => onChange({ filename, command: 'ADD_FACTOR' });

  const removeFactor = (factorId) =>
    onChange({ filename, command: 'REMOVE_FACTOR', factorId });

  /* wtlf.config.factor */
  const updateFactorProp = (factorId, key, value) => {
    onChange({ filename, factorId, key, value });
  };

  /* wtlf.config.name */
  const updateMeasurementName = (mvalue) =>
    onChange({ filename, key: `config.mvalue`, value: mvalue });

  /* wtlf.fields[..]['map-fieldnames'].arrows[value.key] = value.value */
  /* wtlf.fields[factorName]['map-fieldnames'].arrows where value: regex */
  const updateArrows = ({ factorId, key, value }) =>
    onChange({ filename, factorId, key, value });

  /* wtlf.fields[factorName] prop */
  const changeWideFieldValue = (factorId) => {
    const fieldId = getWideFieldFromId(factorId)['field-alias'];
    return (e) =>
      onChange({
        filename,
        fieldId,
        key: e.target.name,
        value: e.target.value,
      });
  };

  return (
    <HeadingBox
      key={`${stateId}|wide-to-long-card`}
      stateId={`${stateId}|wide-to-long-card`}
      heading='Wide File Configuration'
      expanded
      canCollapse
      marginTop='20px' // this feels like a hack
      marginBottom='0px'
    >
      <ErrorBoundary message='wideToLongFields: Something went wrong'>
        <Collapse in>
          <Grid container spacing={5}>
            {/* New Measurement read-write name */}
            <Grid item xs={12}>
              <TextField
                key={`${stateId}-newMeasurement`}
                stateId={`${stateId}-newMeasurement`}
                name='newMeasurement'
                label='New Measurement'
                value={measurementName}
                saveChange={(e) => updateMeasurementName(e.target.value)}
              />
              <p />
            </Grid>

            <Grid item xs={12}>
              <AddFactorTable
                addFactor={addFactor}
                changeWideFieldValue={changeWideFieldValue}
                factors={factors}
                filename={filename}
                getWideFieldValue={getWideFieldValue}
                removeFactor={removeFactor}
                stateId={stateId}
                updateFactorProp={updateFactorProp}
              />
            </Grid>

            <Grid item xs={12}>
              <SetFactorValueTable
                factors={factors}
                updateArrows={updateArrows}
                fieldAliasIdxsMap={fieldAliasIdxsMap}
                selectFactorValue={selectFactorValue}
              />
            </Grid>

            <Grid item xs={12}>
              {/* ✅ Error display */}
              <Collapse in={fixes?.length > 0 ?? false}>
                <ErrorCard
                  errors={fixes}
                  viewDetail
                  stateId={`${stateId}|wtlc-errors`}
                />
              </Collapse>
            </Grid>
          </Grid>
        </Collapse>
      </ErrorBoundary>
    </HeadingBox>
  );
};
WideToLongCard.propTypes = {
  filename: PropTypes.string.isRequired,
  stateId: PropTypes.string.isRequired,
};

function AddFactorTable(props) {
  const {
    addFactor,
    changeWideFieldValue,
    factors,
    getWideFieldValue,
    removeFactor,
    stateId,
    updateFactorProp,
  } = props;
  return (
    <Table className={clsx('Luci-Table', 'factorNames')}>
      {/* Heading Factor Name | Purpose | + Factors */}
      <TableHead>
        <TableRow
          className={clsx('Luci-FileField-Row', 'header', 'factorNames')}
        >
          <TableCell>Factor Name</TableCell>
          <TableCell align='center'>Purpose</TableCell>

          {/* Add Factor button in header */}
          <TableCell align='center'>
            <IconButton
              tabIndex={-1}
              style={styleIconButton}
              onClick={() => addFactor()}
              size='large'
            >
              <AddIcon />
            </IconButton>
            Factors
          </TableCell>
          {/* detail view toggle placeholder */}
          <TableCell />
        </TableRow>
      </TableHead>

      {/* Inputs: Factor Name | Purpose | - Factors */}
      <TableBody>
        {factors.map((factor, count) => (
          /* detailed view  -- compatible with file-header-fields */
          <SummaryDetailRow
            key={`${stateId}|factor-${factor.id}`}
            className={clsx(
              'Luci-FileField-Row',
              'Luci-Wide-Factors',
              'header',
            )}
            stateId={`${stateId}|factor-${factor.id}`}
            isDisabled={false}
            isExpandable={
              factor.name.trim() !== '' && factor.purpose === 'mspan'
            }
            viewDetail={false}
            togglerCellPosition='last' // 'first' | 'last'
            fieldType={FIELD_TYPES.WIDE}
            DetailViewComponent={
              /* Detail view */
              <FieldDetailView
                key={`${stateId}|wtlf-detailView`}
                stateId={`${stateId}|wtlf-detailView`}
                fieldType={FIELD_TYPES.WIDE}
                getValue={getWideFieldValue(factor.id)}
                saveChange={changeWideFieldValue(factor.id)}
                hasNullValues={false}
              />
            }
          >
            {/* Summary view */}
            {/* Input Factor name: config[factors.factorId].name */}
            <TableCell>
              <TextField
                key={`${stateId}|factor-${factor.id}-${factor.name}`}
                stateId={`${stateId}|factor-${factor.id}`}
                name={`${factor.id}|name`} // required but not valid e
                value={factor.name} // we are naming the name
                saveChange={(e) =>
                  updateFactorProp(factor.id, 'name', e.target.value)
                }
              />
            </TableCell>
            {/* Input Purpose buttons */}
            {/* Input Purpose: config[factors.factorId].purpose */}
            <TableCell align='center'>
              <PurposeButtons
                key={`${stateId}|purpose`}
                stateId={`${stateId}|purpose`}
                name='purpose'
                value={factor.purpose}
                onChange={(e) =>
                  updateFactorProp(factor.id, 'purpose', e.target.value)
                }
                showComponent
                showTiming
              />
            </TableCell>
            {/* Input Remove factor button */}
            <TableCell align='center'>
              <IconButton
                // no tab index for the first
                tabIndex={count === 0 ? -1 : 0}
                // must have at least one
                disabled={factors.length === 1}
                style={stylePaddingZero}
                onClick={() => removeFactor(factor.id)}
                size='large'
              >
                <RemoveIcon />
              </IconButton>
            </TableCell>
            {/* Toggle TableCell comes for free */}
          </SummaryDetailRow>
        ))}
      </TableBody>
    </Table>
  );
}
AddFactorTable.propTypes = {
  addFactor: PropTypes.func.isRequired,
  factors: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  removeFactor: PropTypes.func.isRequired,
  stateId: PropTypes.string.isRequired,
  updateFactorProp: PropTypes.func.isRequired,
  getWideFieldValue: PropTypes.func.isRequired,
  changeWideFieldValue: PropTypes.func.isRequired,
};
/**
 * Capture user input, the factor value for each fieldname
 *
 *     fieldName/alias -> { fieldName: factorValue }
 *
 */
function SetFactorValueTable(props) {
  const { factors, updateArrows, fieldAliasIdxsMap, selectFactorValue } = props;
  /*
      Field Name arrow config table
      Note: render sequence dependency - requires factors
      arrow: Field Name -> Factor value
  */
  // field input and regex capacity
  const disabled = (factorName) => factorName.trim() === '';

  return (
    <Table className={clsx('Luci-Table', 'fieldNames')}>
      {/* Header: Field Name | factor-1 | factor-2 etc.. */}
      <TableHead>
        <TableRow
          className={clsx('Luci-FileField-Row', 'header', 'fieldNames')}
        >
          <TableCell>Field Name</TableCell>
          {factors.map((factor) => (
            <TableCell
              className={clsx('factorName')}
              key={`${factor.name}-${factor.id}`}
            >
              <FactorWithMenu
                text={factor.name}
                menu={
                  <RegexMenu
                    name='map-fieldnames.arrows'
                    purpose={factor.purpose}
                    disabled={disabled(factor.name)}
                    handleParseCommand={(e) =>
                      updateArrows({
                        factorId: factor.id,
                        key: 'map-fieldnames.arrows', // ⚠️  plural arrows
                        value: e.target.value,
                      })
                    }
                  />
                }
              />
            </TableCell>
          ))}
        </TableRow>
      </TableHead>

      {/* Input: Field Name | factor-1 | factor-2 etc.. */}
      {/* arrow: Field Name -> Factor value */}
      {/* Number of rows = number of mvalues in headerView */}
      {/* Input fields: fields[factor.name][map-fieldnames][arrows] */}

      <TableBody>
        {/* row for each mvalue::field-alias */}
        {fieldAliasIdxsMap.map(([fieldAlias, headerIdx]) => {
          const $rowId = `${fieldAlias}-${headerIdx}`;
          return (
            <TableRow
              key={$rowId}
              className={clsx(
                'Luci-FileField-Row',
                'Luci-Wide-FieldNames',
                'body',
              )}
            >
              {/* fieldname/alias that contains/embeds the factor values */}
              <TableCell>
                <Typography>{fieldAlias}</Typography>
              </TableCell>
              {/* cell (arrow): for each in factors */}
              {factors.map((factor) => (
                <TableCell key={`${$rowId}|cell-${factor.id}`}>
                  {/* User input */}
                  <TextField
                    className={clsx('Luci-Wide-Factors')}
                    key={`${$rowId}|input-${factor.name}-${selectFactorValue(
                      factor.name,
                      fieldAlias,
                    )}`} // ⚠️  name ensures synced ender
                    stateId={`${$rowId}|input-${factor.name}`}
                    disabled={disabled(factor.name)}
                    name={factor.name || `factorName-${factor.id}`} // temp plug while disabled
                    value={selectFactorValue(factor.name, fieldAlias)}
                    saveChange={(e) =>
                      updateArrows({
                        factorId: factor.id,
                        key: 'map-fieldnames.arrow', // ⚠️  single arrow
                        value: { key: fieldAlias, value: e.target.value },
                      })
                    }
                  />
                </TableCell>
              ))}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
SetFactorValueTable.propTypes = {
  factors: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  updateArrows: PropTypes.func.isRequired,
  fieldAliasIdxsMap: PropTypes.arrayOf(PropTypes.array).isRequired,
  selectFactorValue: PropTypes.func.isRequired,
};

const useStyles = makeStyles(() => ({
  'WideToLongCard-FactorWithMenu': {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
}));

function FactorWithMenu({ text, menu }) {
  const classes = useStyles();
  return (
    <div className={classes['WideToLongCard-FactorWithMenu']}>
      <div style={{ flexGrow: 1 }}>{text}</div>
      <div>{menu}</div>
    </div>
  );
}
FactorWithMenu.propTypes = {
  text: PropTypes.string.isRequired,
  menu: PropTypes.node,
};
FactorWithMenu.defaultProps = {
  menu: undefined,
};

export default WideToLongCard;

/* eslint "no-shadow": "off" */
