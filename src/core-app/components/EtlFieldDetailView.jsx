// src/components/EtlFieldDetailView.jsx

/**
 * @module components/EtlFieldDetailView
 *
 * @description
 *
 * Single purpose for EtlUnit
 *
 * An interface-like component that specifies which purpose-specific
 * input components to be displayed.
 *
 * ⚠️  This component is for Etl.  The component requires the callbacks
 * required to backtrack using the "edit source" link, rendered by the
 * SourcesBox.
 *
 * ⬆ Parent: EtlFieldView/component
 *   📖 etlObject computed using `pivot`
 *   ⬆ Parent: Right hand side of the split-pane
 *     📖 Etl Field computed using pivot.
 *     ⬇ Form components given the EtlField.purpose
 *     ✨ editing happens in these components
 *
 * Where is the data retrieved from?
 * How do we update the state of that data?
 * ☎️  updateEtlField
 *
 * @category Components
 *
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';

import HeaderViewDialog from './HeaderViewDialog';

import { FIELD_TYPES } from '../constants/field-input-config';

// debug
import { debug, useTraceUpdate } from '../constants/variables';
import FieldDetailView from './FieldDetailView';

/* eslint-disable no-console, react/prop-types */

const DEBUG = process.env.REACT_APP_DEBUG_RENDER_HIGH === 'true';

/**
 *
 * @component
 *
 * Part of the right-hand side
 *
 */
const EtlFieldDetailView = (props) => {
  const {
    canEditSources,
    field, // 📖 data in etlObject
    saveChange, // ☎️  update data
    hasNullValues,
  } = props;

  useTraceUpdate(props);

  if (process.env.REACT_APP_DEBUG_RENDER === 'true') {
    console.debug(
      '%crendering EtlFieldForm v1 - specialized',
      debug.color.green,
    );
  }
  if (DEBUG) {
    console.dir(props);
  }

  const stateId = `etlField-${field.name}`;

  // ⚠️  Backtracking
  // state value: filename | ''
  const [viewingSource, setViewingSource] = useState(() => '');

  const handleViewSourceOpen = (filename) => {
    console.debug('callback: handleViewSourceOpen:', filename);
    setViewingSource(filename);
  };

  const handleViewSourceClose = () => {
    setViewingSource('');
  };

  const showHeaderViewDialog = (
    <HeaderViewDialog
      filename={viewingSource}
      handleClose={handleViewSourceClose}
    />
  );

  return (
    <>
      {/* ⚠️  backtracking dialog */}
      {viewingSource ? showHeaderViewDialog : null}
      <FieldDetailView
        stateId={stateId}
        fieldType={FIELD_TYPES.ETL}
        getValue={(prop) => field[prop]}
        canEditSources={canEditSources}
        saveChange={saveChange}
        hasNullValues={hasNullValues}
        handleViewSourceOpen={handleViewSourceOpen}
        handleViewSourceClose={handleViewSourceClose}
      />
    </>
  );
};

EtlFieldDetailView.propTypes = {
  field: PropTypes.shape({}).isRequired,
  canEditSources: PropTypes.bool,
  saveChange: PropTypes.func.isRequired,
  hasNullValues: PropTypes.bool.isRequired,
};

EtlFieldDetailView.defaultProps = {
  canEditSources: true,
};
export default EtlFieldDetailView;
