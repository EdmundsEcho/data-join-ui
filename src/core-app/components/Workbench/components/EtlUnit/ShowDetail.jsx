// src/components/Workbench/components/EtlUnit/ShowDetail.jsx

import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import IconButton from '@mui/material/IconButton';
import ExpandMore from '@mui/icons-material/ExpandMore';

/**
 * Self containing toggle
 *
 */
function Toggle({
  iconButtonClass,
  expandIconClass,
  showDetail: showDetailProp,
  onChange,
}) {
  const [showDetail, setShowDetail] = useState(() => showDetailProp);
  const handleOnChange = useCallback(() => {
    setShowDetail(!showDetail);
    onChange(!showDetail);
  }, [onChange, showDetail]);

  return (
    <IconButton
      size='small'
      className={clsx(iconButtonClass, 'Luci-IconButton etlUnit workbench', {
        open: showDetail,
      })}
      onClick={handleOnChange}>
      <ExpandMore className={clsx(expandIconClass)} />
    </IconButton>
  );
}

Toggle.propTypes = {
  showDetail: PropTypes.bool,
  onChange: PropTypes.func,
  iconButtonClass: PropTypes.string,
  expandIconClass: PropTypes.string,
};
Toggle.defaultProps = {
  /* eslint-disable no-console */
  onChange: () => console.log('not configured'),
  showDetail: false,
  iconButtonClass: '',
  expandIconClass: '',
};

export default Toggle;
