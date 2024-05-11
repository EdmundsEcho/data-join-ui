// src/components/FieldDetailView.jsx

/**
 *
 * So far, there are two contexts:
 * 1. Form in the HeaderView
 * 2. Dialog that backtracks to an individual file
 *
 * The following components use this component to express their state:
 * ⬆ Parent HeaderView 📖 headerViews
 * ⬆ WideToLongCard
 * ⬆ HeaderViewDialog 📖 headerView
 *
 * Uses onFieldChange that wraps this.props.onFieldUpdate
 *
 * ✅ Specialize for header view (file) data
 * ✅ Interface for sourcing/updating machine | redux
 * ✅ Test with WideToLongCard
 * ✅ Test with ImpliedMvalueCard
 * ✅ Finalize how to update format for time prop
 * ✅ Integrate levels
 *
 * @module /components/FieldDetailView
 *
 */
import React from 'react';
import PropTypes from 'prop-types';

import clsx from 'clsx';

import { Div } from '../../luci-styled/Styled';

// content
import FieldInputDelegate from './FieldDelegate';
import Levels from './shared/Levels';
import SourcesBox from './shared/FieldInputs/SourcesBox';
import CodomainReducerRow from './shared/FieldInputs/CodomainReducerRow';

import { displayInput as init, FIELD_TYPES } from '../constants/field-input-config';

// debug
import { debug, useTraceUpdate } from '../constants/variables';

/* eslint-disable no-console, react/jsx-props-no-spreading */
const DEBUG = process.env.REACT_APP_DEBUG_RENDER_HIGH === 'true';

/**
 *
 * Utilized by:
 * * WideToLongCard -> file-field
 * * HeaderViewField -> file-field
 * * EtlFieldView/component -> etl-field
 *
 * @component
 *
 * Viewed using a toggle.
 * ⬆ Parent is a table row HeaderViewField
 *   - ui input: alias, purpose and inclusion
 * 📖 headerView field; what we can edit
 *   - ui input: null-value, format (in), time spec
 * ⬇ NullValueBox, Levels etc.
 *
 * ⚙️  What components get displayed in this detail view
 *    is set using an imported schema.
 * ⚠️  Note the null-value override for wide-to-long caller.
 *
 */
function FieldDetailView(props) {
  const {
    stateId,
    getValue,
    fieldType,
    canEditSources,
    handleViewSourceOpen,
    saveChange,
    hasNullValues,
    hasImpliedMvalue,
  } = props;

  useTraceUpdate(props);

  if (process.env.REACT_APP_DEBUG_RENDER === 'true') {
    console.debug(`%crendering FieldDetailView`, debug.color.green);
  }

  if (DEBUG) {
    console.dir(props);
  }

  return (
    <Div className={clsx('Luci-FieldData', 'detail', 'root', fieldType)}>
      {/* three chunks of information */}
      {/* 1. configuration fields LEFT */}
      {/* 2. levels RIGHT */}
      {/* 3. sources BOTTOM ... when fieldType == ETL */}

      {/* TOP main row container */}
      <div className={clsx('main-content')}>
        {/* column 1 */}
        <div className={clsx('inputGroup')}>
          <FieldInputDelegate
            fieldType={fieldType}
            getValue={getValue}
            stateId={stateId}
            canEditSources={canEditSources}
            handleViewSourceOpen={handleViewSourceOpen}
            saveChange={saveChange}
            hasNullValues={hasNullValues}
            hasImpliedMvalue={hasImpliedMvalue}
          />
        </div>
        {/* column 2 */}
        <div className={clsx('Luci-DataContainer levels', getValue('purpose'))}>
          <Levels
            fieldType={fieldType}
            getValue={getValue}
            stateId={stateId}
            showLevels
          />
        </div>
      </div>
      {/* BOTTOM footer row 2 */}
      {fieldType === FIELD_TYPES.ETL && (
        <div className='footer'>
          <Sources
            fieldType={fieldType}
            getValue={getValue}
            stateId={stateId}
            saveChange={saveChange}
            canEditSources={canEditSources}
            handleViewSourceOpen={handleViewSourceOpen}
          />
        </div>
      )}
    </Div>
  );
}

FieldDetailView.propTypes = {
  stateId: PropTypes.string.isRequired,
  fieldType: PropTypes.oneOf(Object.values(FIELD_TYPES)).isRequired,
  getValue: PropTypes.func.isRequired,
  saveChange: PropTypes.func.isRequired,
  hasNullValues: PropTypes.bool.isRequired,
  hasImpliedMvalue: PropTypes.bool,
  canEditSources: PropTypes.bool,
  handleViewSourceOpen: PropTypes.func,
};

FieldDetailView.defaultProps = {
  canEditSources: undefined,
  handleViewSourceOpen: undefined,
  hasImpliedMvalue: undefined,
};

function Sources({
  getValue,
  stateId,
  saveChange,
  canEditSources,
  handleViewSourceOpen,
}) {
  // ⚙️
  // instantiate given field type and purpopse
  const displayInput = init(FIELD_TYPES.ETL, getValue('purpose'));

  return !displayInput('sources') ? null : (
    <SourcesBox
      stateId={`${stateId}|sources-box`}
      name='sources'
      sources={getValue('sources')}
      mapFiles={getValue('map-files')}
      onChange={saveChange}
      canEditSources={canEditSources}
      canReorderSources={displayInput('sources-reorder')}
      onViewSource={handleViewSourceOpen} // ⚠️  callback that enables backtracking
    >
      {displayInput('codomain-reducer') && getValue('sources').length > 1 ? (
        <>
          <CodomainReducerRow
            component='box'
            key={`${stateId}|codomain-reducer`}
            stateId={`${stateId}|codomain-reducer`}
            name='codomain-reducer'
            value={
              getValue('codomain-reducer') ||
              (getValue('purpose') === 'mvalue' ? 'SUM' : 'FIRST')
            }
            onChange={saveChange}
          />
          <p />
        </>
      ) : null}
    </SourcesBox>
  );
}
Sources.propTypes = {
  stateId: PropTypes.string.isRequired,
  getValue: PropTypes.func.isRequired,
  saveChange: PropTypes.func.isRequired,
  canEditSources: PropTypes.bool.isRequired,
  handleViewSourceOpen: PropTypes.func.isRequired,
};

export default FieldDetailView;
