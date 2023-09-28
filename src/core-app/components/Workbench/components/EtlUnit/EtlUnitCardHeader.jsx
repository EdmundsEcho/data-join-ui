// src/components/Workbench/components/EtlUnit/EtlUnitCardHeader.jsx

import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import Icon from '@mui/material/Icon';
import Typography from '@mui/material/Typography';

import InsertChart from '@mui/icons-material/InsertChart';
import PersonPin from '@mui/icons-material/PersonPinCircleRounded';
import PieChart from '@mui/icons-material/PieChart';
import DateRange from '@mui/icons-material/DateRange';
import Functions from '@mui/icons-material/Functions';

import TextField from '../../../shared/TextField';
import Tools from './Tools';

/**
 * className EtlUnit-CardHeader
 *
 * There are three sub-components that depend on the type of data being
 * displayed.  The Header captures the set name/group of values.
 *
 * 1. Display icon
 * 2. Title
 * 3. Tools
 *
 * Two contexts:
 * 1. palette where we only show names
 * 2. canvas where we can click-through to values
 *
 * Header for any of the following:
 * 👉 quality
 * 👉 measurement
 * 👉 component
 * 👉 spanValues
 *
 * The context varies/impacts
 * 👉 functionality of menu
 * 👉 updating the data
 * 👉 format of the presentation
 *
 */
function EtlUnitCardHeader({
  title,
  meta,
  palette,
  tag,
  etlUnitType,
  displayType,
  handleMenu,
  handleNameChange,
}) {
  // required to control styles linked to Box

  // TODO make sure part of custom theme
  const format =
    etlUnitType === 'quality' || tag === 'measurement' ? 'large' : 'small';

  let IconImg;
  switch (true) {
    case displayType === 'alias':
      IconImg = Functions;
      break;
    case etlUnitType === 'quality':
      IconImg = PersonPin;
      break;
    case tag === 'measurement':
      IconImg = InsertChart;
      break;
    case etlUnitType === 'measurement' && tag !== 'spanValues':
      IconImg = PieChart;
      break;
    case tag === 'spanValues':
      IconImg = DateRange;
      break;
    default:
      /* eslint-disable-next-line */
      console.error(`Should not be here: ${tag} ${etlUnitType}`);
      break;
  }

  // const { showDetail } = useContext(ToolContext);

  // 🔖 Parent is EtlUnit-measurement | -parameter
  return (
    <div className='root header-root'>
      <div className='EtlUnit-CardHeader-IconWrap'>
        <Icon className='EtlUnit-CardHeader-Icon'>
          <IconImg
            className={clsx('EtlUnit-CardHeader-SvgIcon', format)}
            color='secondary'
          />
        </Icon>
      </div>
      <div className='EtlUnit-CardHeader-Name'>
        <TextWrap
          handleNameChange={handleNameChange}
          etlUnitType={etlUnitType}
          meta={meta}
          title={title}
          palette={palette}
        />
      </div>
      <div className='EtlUnit-CardHeader-Tools'>
        <MaybeTools
          handleMenu={handleMenu}
          palette={palette}
          tag={tag}
          etlUnitType={etlUnitType}
        />
      </div>
    </div>
  );
}

/* eslint-disable-next-line */
const noop = () => console.log(`Not configured`);

EtlUnitCardHeader.propTypes = {
  palette: PropTypes.bool.isRequired,
  tag: PropTypes.oneOf([
    'quality',
    'measurement',
    'txtValues',
    'intValues',
    'spanValues',
    'empty',
  ]).isRequired,
  etlUnitType: PropTypes.oneOf(['quality', 'measurement', 'transformation'])
    .isRequired,
  displayType: PropTypes.oneOf(['alias', 'none']),
  title: PropTypes.string.isRequired,
  meta: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  handleMenu: PropTypes.func,
  handleNameChange: PropTypes.func,
};
EtlUnitCardHeader.defaultProps = {
  displayType: 'none',
  meta: undefined,
  handleMenu: noop,
  handleNameChange: noop,
};

function MaybeTools({ handleMenu, palette, tag, etlUnitType }) {
  return palette ? null : (
    <Tools onClickMenu={handleMenu} tag={tag} etlUnitType={etlUnitType} />
  );
}
MaybeTools.propTypes = {
  handleMenu: PropTypes.func.isRequired,
  palette: PropTypes.bool.isRequired,
  tag: PropTypes.oneOf([
    'quality',
    'measurement',
    'txtValues',
    'intValues',
    'spanValues',
  ]).isRequired,
  etlUnitType: PropTypes.oneOf(['quality', 'measurement']).isRequired,
};

function TextWrap({ handleNameChange, etlUnitType, meta, title, palette }) {
  return palette ? (
    <Typography component='span'>{title}</Typography>
  ) : (
    <TextField
      stateId={title}
      className={clsx('EtlUnit-CardHeader-TextField')}
      InputLabelProps={{
        classes: 'componentsInputLabel',
      }}
      FormHelperTextProps={{
        classes: 'componentsHelperText',
      }}
      InputProps={{
        classes: 'componentsInputText',
      }}
      saveChange={handleNameChange}
      name={title}
      value={title}
      helperText={
        ['measurement'].includes(etlUnitType)
          ? `field-count: ${meta || 'WIP'}`
          : null
      }
    />
  );
}
TextWrap.propTypes = {
  handleNameChange: PropTypes.func.isRequired,
  etlUnitType: PropTypes.oneOf(['quality', 'measurement']).isRequired,
  meta: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  palette: PropTypes.string.isRequired,
};

export default EtlUnitCardHeader;
