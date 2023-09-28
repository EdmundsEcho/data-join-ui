// src/components/Workbench/components/EtlUnit/Tools.jsx

import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import IconButton from '@mui/material/IconButton';
import MoreVert from '@mui/icons-material/MoreVert';

import Switch from '../../../shared/Switch';
import ShowDetail from './ShowDetail';

import { ToolContext } from './ToolContext';

const tags = ['quality', 'measurement', 'txtValues', 'intValues', 'spanValues'];
const etlUnitTypes = ['quality', 'measurement'];

/**
 * Add-on for a header
 *
 * Options:
 *     👉 switch
 *     👉 toggle view detail
 *     👉 menu
 */
function Tools({ onClickMenu, tag, etlUnitType }) {
  const {
    // setShowDetail, ⬜ read from stateId record
    // setSwitchOn,
    showDetail,
    toggleShowDetail,
    switchOn,
    toggleSwitchOn,
    disableSwitch,
    showSwitch,
    showMoreMenu,
  } = useContext(ToolContext);

  return (
    <div className={clsx('Luci-Workbench', 'etlUnit', 'tools')}>
      <Rollup
        showSwitch={showSwitch}
        etlUnitType={etlUnitType}
        tag={tag}
        switchOn={switchOn}
        toggleSwitchOn={toggleSwitchOn}
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
Tools.propTypes = {
  etlUnitType: PropTypes.oneOf(etlUnitTypes).isRequired,
  tag: PropTypes.oneOf(tags).isRequired,
  onClickMenu: PropTypes.func.isRequired,
};

Tools.defaultProps = {};

// Rollup component: show or not
function Rollup({
  showSwitch,
  etlUnitType,
  tag,
  switchOn,
  toggleSwitchOn,
  disableSwitch,
}) {
  return !showSwitch ||
    etlUnitType === 'quality' ||
    tag === 'measurement' ? null : (
    <Switch
      className={tag}
      labelOne='series'
      labelTwo='rollup'
      checked={switchOn}
      onChange={toggleSwitchOn}
      disabled={disableSwitch}
    />
  );
}
Rollup.propTypes = {
  showSwitch: PropTypes.bool.isRequired,
  etlUnitType: PropTypes.oneOf(etlUnitTypes).isRequired,
  tag: PropTypes.oneOf(tags).isRequired,
  switchOn: PropTypes.bool.isRequired,
  toggleSwitchOn: PropTypes.bool.isRequired,
  disableSwitch: PropTypes.bool.isRequired,
};

export default Tools;
