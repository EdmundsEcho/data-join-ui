// src/components/Workbench/components/EtlUnit/Tools.jsx

import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import makeStyles from '@mui/styles/makeStyles';
import IconButton from '@mui/material/IconButton';
import MoreVert from '@mui/icons-material/MoreVert';

import Switch from '../../../shared/Switch';
import ShowDetail from './ShowDetail';

import { ToolContext } from './ToolContext';

//
// ⬜ get rid of makeStyles
//
const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    // target child
    '& .EtlUnit-CardHeader-Tools': {
      padding: '0px',
    },
  },
  menu: {
    width: '24px',
  },
});

/**
 * Add-on for a header
 *
 * Options:
 *     👉 switch
 *     👉 toggle view detail
 *     👉 menu
 */
function Tools({ onClickMenu, tag, etlUnitType }) {
  const classes = useStyles();
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
    <div className={clsx(classes.root, 'EtlUnit-CardHeader-Tools')}>
      <Rollup
        showSwitch={showSwitch}
        etlUnitType={etlUnitType}
        tag={tag}
        switchOn={switchOn}
        toggleSwitchOn={toggleSwitchOn}
        disableSwitch={disableSwitch}
      />

      {showMoreMenu ? (
        <IconButton size='small' className='menu' onClick={onClickMenu}>
          <MoreVert />
        </IconButton>
      ) : null}
      <ShowDetail onChange={toggleShowDetail} showDetail={showDetail} />
    </div>
  );
}
Tools.propTypes = {
  etlUnitType: PropTypes.oneOf(['quality', 'measurement']).isRequired,
  tag: PropTypes.oneOf([
    'quality',
    'measurement',
    'txtValues',
    'intValues',
    'spanValues',
  ]).isRequired,
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

export default Tools;
