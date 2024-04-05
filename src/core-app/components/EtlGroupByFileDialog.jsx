// src/components/EtlFieldGroupByFileForm.jsx

/**
 * @module components/EtlFieldGroupByFileForm
 *
 * @description
 * Form that returns the output for a new derived field name from filenames of
 * stacked files
 *
 * Example output:
 *         {
 *           ...
 *           map-files: {
 *             domain: null,
 *             codomain: 3, //
 *             arrows: {
 *               product1.csv: 'product1',
 *               product2.csv: 'product2'
 *             }
 *           },
 *           map-weight: {
 *             arrows: {
 *               product1: 1,
 *               product2: 4
 *             }
 *           }
 *         }
 */
import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

import Collapse from '@mui/material/Collapse';
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Box from '@mui/material/Box';

// import PurposeButtons from '../shared/PurposeButtons';
import HeadingBox from './shared/HeadingBox';
import TextField from './shared/TextField';
import Dialog from './shared/Dialog';
import ErrorCard from './shared/ErrorCard';

import { getFilenameFromPath } from '../utils/common';
import { isValidSeedData } from '../lib/filesToEtlUnits/create-etl-field';

import { PURPOSE_TYPES as TYPES } from '../lib/sum-types';
import ERRORS from '../constants/error-messages';

import { debug, useTraceUpdate } from '../constants/variables';

/* eslint-disable no-console */

const DEBUG = process.env.REACT_APP_DEBUG_RENDER_HIGH === 'true';

const dummyData = { purpose: TYPES.QUALITY, etlUnit: null };

/**
 * Form for a new etl field - group-by-file.
 *
 * ⚠️  The component must render in the closed state without any data.
 *
 * 🦀 Does not enable the save button when the user corrects the fieldName
 * duplicate error.
 *
 * 🦀 For mcomp: should list only the files in that etlUnit (not all units).
 *
 * @component
 *
 */
function EtlFieldForm(props) {
  const {
    open,
    stateId,
    seedValues = dummyData,
    files,
    onSave,
    onCancel,
    error,
  } = props;

  useTraceUpdate(props);

  if (process.env.REACT_APP_DEBUG_RENDER === 'true') {
    console.debug(`%crendering EtlFieldGroupByFileForm`, debug.color.green);
  }
  if (DEBUG) {
    console.dir(props);
  }

  // use to render the dialog
  const [readyToSave, setReadyToSave] = useState(() => false);

  const tryReadyToSave = useCallback(
    (formData) => {
      setReadyToSave(isValidSeedData(formData) && !error(formData.name));
    },
    [error],
  );

  // initiale form state
  const initialState = useMemo(
    () => ({
      name: '',
      nullExp: null,
      purpose: seedValues.purpose,
      etlUnit: seedValues.etlUnit || null,
      groupByFileArrows: {},
    }),
    [seedValues.etlUnit, seedValues.purpose],
  );

  const [formData, setFormData] = useState(() => initialState);

  const clearForm = useCallback(() => {
    setFormData(initialState);
    setReadyToSave(false);
  }, [initialState]);

  const updateForm = (update) => {
    setFormData({
      ...formData,
      ...update,
    });
    tryReadyToSave(formData);
  };

  const addArrow = ({ domain, codomain }) => {
    setFormData({
      ...formData,
      groupByFileArrows: {
        ...formData.groupByFileArrows,
        [domain]: codomain,
      },
    });
    tryReadyToSave(formData);
  };

  // events from the Dialog
  // just a click event from the Dialog prop without any data
  const handleSave = useCallback(() => {
    if (!isValidSeedData(formData)) {
      throw new Error('Tried to save a new etl field with falty data');
    }
    onSave(formData, files); // send to parent
    clearForm();
  }, [clearForm, files, formData, onSave]);

  const handleCancel = () => {
    onCancel(); // parent to set the state open = {false}
    clearForm();
  };

  // console.debug('%crender readyToSave', debug.color.green, readyToSave);

  return (
    <Dialog
      open={open}
      activeSaveFeature={readyToSave} // ability to save
      title={
        seedValues.purpose === TYPES.QUALITY
          ? 'New Quality'
          : `New Component for ${seedValues.etlUnit}`
      }
      instructions={`Record the information encoded by definition of a subject being
          included in a given file.`}
      handleSave={handleSave}
      handleCancel={handleCancel}
    >
      <TableContainer>
        <Table className='Luci-Table group-by-file dialog'>
          <TableBody>
            <TableRow>
              <TableCell className='cell'>New Field Name:</TableCell>
              <TableCell className='cell'>
                <TextField
                  key={`${stateId}|name`}
                  stateId={`${stateId}|name`}
                  name='name'
                  value={formData.name}
                  error={formData.name.trim() === '' || error(formData.name)}
                  saveChange={({ target }) => updateForm({ name: target.value })}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className='cell'>Null-value (expansion):</TableCell>
              <TableCell className='cell'>
                <TextField
                  key={`${stateId}|null-value-expansion`}
                  stateId={`${stateId}|null-value-expansion`}
                  name='null-value-expansion'
                  value={formData.nullExp || ''}
                  saveChange={({ target }) =>
                    updateForm({
                      nullExp: target.value === '' ? null : target.value,
                    })
                  }
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <HeadingBox
          stateId={`${stateId}|levels`}
          heading='Levels'
          className='Luci-GroupByFileConfig'
        >
          <InlineLevels files={files} onChange={addArrow} />
        </HeadingBox>
      </TableContainer>
      <Collapse
        className='Luci-Collapse group-by-file dialog error'
        in={error(formData.name)}
        timeout='auto'
        unmountOnExit
      >
        <Box mx={0} mt={5} mb={0}>
          <ErrorCard
            key={`${stateId}|errorCard`}
            stateId={`${stateId}|errorCard`}
            errors={[ERRORS.uniqueEtlFieldName]}
            viewDetail
            onHide={() => {}}
          />
        </Box>
      </Collapse>
    </Dialog>
  );
}

EtlFieldForm.propTypes = {
  open: PropTypes.bool.isRequired,
  stateId: PropTypes.string.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  files: PropTypes.shape({
    filename: PropTypes.string,
    nrows: PropTypes.number,
  }).isRequired, // Map key: filename, nrows
  seedValues: PropTypes.shape({
    purpose: PropTypes.oneOf([TYPES.QUALITY, TYPES.MCOMP]).isRequired,
    etlUnit: PropTypes.string,
  }),
  error: PropTypes.func,
};
EtlFieldForm.defaultProps = {
  seedValues: dummyData,
  error: () => {},
};

/**
 * Levels dialog
 * A subcomponent of the new field form.
 *
 * @component
 *
 */
function InlineLevels({ files, onChange }) {
  return (
    <Table className='Luci-Table group-by-file dialog'>
      <TableHead>
        <TableRow>
          <TableCell className='cell'>File Name</TableCell>
          <TableCell className='cell'>Field Value (level)</TableCell>
          {/* <TableCell align='center'>Weight</TableCell> */}
        </TableRow>
      </TableHead>
      <TableBody>
        {files &&
          Object.entries(files).map(([filename]) => (
            <TableRow key={filename}>
              <TableCell className='cell'>
                <span title={filename}>{getFilenameFromPath(filename)}</span>
              </TableCell>
              <TableCell className='cell'>
                <TextField
                  key={`${filename}|new-etl-field|codomain`}
                  stateId={`${filename}|new-etl-field|codomain`}
                  name='codomain'
                  value=''
                  saveChange={({ target }) =>
                    onChange({ domain: filename, codomain: target.value })
                  }
                />
              </TableCell>
              {/* hide for now [mvp] */}
              {/*
            <TableCell align='center'>
              <TextField
                name='weight'
                inputProps={{ min: 0, style: { textAlign: 'center' } }}
                value={1.0}
                onSave={() => {}}
              />
            </TableCell>
              */}
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}

InlineLevels.propTypes = {
  files: PropTypes.shape({}).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default EtlFieldForm;
