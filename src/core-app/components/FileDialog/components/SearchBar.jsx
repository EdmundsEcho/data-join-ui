import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Toolbar from '@mui/material/Toolbar';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import InternalSearchBar from '../../shared/SearchBar';

const SearchBar = ({
  path,
  files,
  onChange,
  onCancel,
  className,
  fileSearchText,
}) => {
  return (
    <Toolbar variant='dense' className={clsx('Luci-Toolbar', className)}>
      <Grid
        className='Luci-Toolbar'
        container
        direction='row'
        justifyContent='space-between'
        alignItems='center'
        wrap='nowrap'
        gap='16px'
      >
        <Grid container item alignItems='center'>
          <Grid className='path' item>
            <Typography className='path' variant='subtitle1' noWrap>
              {path}
            </Typography>
          </Grid>
          {files.length === null ? null : (
            <Grid className='fileCount' item>
              {`${files.length} Items`}
            </Grid>
          )}
        </Grid>
        <Grid item>
          <InternalSearchBar
            className='directory'
            onChange={onChange}
            onCancelSearch={onCancel}
            value={fileSearchText}
          />
        </Grid>
      </Grid>
    </Toolbar>
  );
};

SearchBar.propTypes = {
  path: PropTypes.string.isRequired,
  className: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  files: PropTypes.arrayOf(PropTypes.shape({ length: PropTypes.number })),
  fileSearchText: PropTypes.string,
};

SearchBar.defaultProps = {
  files: [],
  className: '',
  fileSearchText: '',
  onCancel: undefined,
};

export default SearchBar;
