// src/components/Workbench/components/EtlUnit/EtlUnitTools.jsx

import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import IconButton from '@mui/material/IconButton';
import MoreVert from '@mui/icons-material/MoreVert';

import Switch from '../../../shared/Switch';
import ShowDetail from './ShowDetail';

import {
  useDisplayApiContext,
  useDisplayDataContext,
} from '../../../../contexts/EtlUnitDisplayContext';
import {
  useSelectionModelApiContext,
  useSelectionModelDataContext,
} from '../../../../contexts/SelectionModelContext';

const tags = ['quality', 'measurement', 'txtValues', 'intValues', 'spanValues'];
const etlUnitTypes = ['quality', 'measurement'];
const noop = () => {};

/**
 * Add-on for a header
 *
 * Options:
 *     👉 switch
 *     👉 toggle view detail
 *     👉 menu
 */
function EtlUnitTools({ onClickMenu, tag, etlUnitType }) {
  // display context
  const { toggleShowDetail } = useDisplayApiContext();
  const { showDetail, showSwitch, disableSwitch } = useDisplayDataContext();
  // selectionModel series toggle
  const { onSetReduceComputation = noop } = useSelectionModelApiContext();
  const { seriesComputation: initialChecked = false } = useSelectionModelDataContext();

  const showMoreMenu = false;

  return (
    <div className={clsx('Luci-Workbench', 'etlUnit', 'tools')}>
      <ReduceSeriesSwitch
        showSwitch={showSwitch}
        etlUnitType={etlUnitType}
        tag={tag}
        checked={initialChecked}
        onChange={onSetReduceComputation}
        disableSwitch={disableSwitch}
      />
      {showMoreMenu ? (
        <IconButton size='small' className='button menu' onClick={onClickMenu}>
          <MoreVert />
        </IconButton>
      ) : null}
      <ShowDetail onChange={toggleShowDetail} showDetail={showDetail} />
    </div>
  );
}
EtlUnitTools.propTypes = {
  etlUnitType: PropTypes.oneOf(etlUnitTypes).isRequired,
  tag: PropTypes.oneOf(tags).isRequired,
  onClickMenu: PropTypes.func.isRequired,
};

EtlUnitTools.defaultProps = {};

// Rollup component: show or not
function ReduceSeriesSwitch({ showSwitch, tag, checked, onChange, disableSwitch }) {
  return showSwitch ? (
    <Switch
      className={tag}
      labelOne='series'
      labelTwo='rollup'
      checked={checked}
      onChange={onChange}
      disabled={disableSwitch}
    />
  ) : null;
}
ReduceSeriesSwitch.propTypes = {
  showSwitch: PropTypes.bool.isRequired,
  tag: PropTypes.oneOf(tags).isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  disableSwitch: PropTypes.bool.isRequired,
};

export default EtlUnitTools;
