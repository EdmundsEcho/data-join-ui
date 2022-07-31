// src/components/Workbench/components/EtlUnit/ValueSearchToolbar.jsx

/**
 * Node item - ValueSearchToolbar
 */

import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import makeStyles from '@mui/styles/makeStyles';
import TablePagination from '@mui/material/TablePagination';
import Button from '@mui/material/Button';
import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import TableCell from '@mui/material/TableCell';
import Sort from '@mui/icons-material/SortRounded';
import SearchIcon from '@mui/icons-material/SearchRounded';
import Box from '@mui/material/Box';

// custom components
import TextField from '../../../shared/TextField';
import ToggleIncludeField from '../../../shared/ToggleIncludeField';

// likely deprecate
import styles from './etlUnit.styles';
// last

const useStyles = makeStyles(styles);

/**
 * className ValueSearchToolbar
 */
const ValueSearchToolbar = ({ toggleAll }) => {
  const classes = useStyles();
  return (
    <Box m={0} className={clsx(classes.root, 'AppBarSearchInput')}>
      <TableCell padding='checkbox' variant='head' bottomBorder={false}>
        <Button
          id='All|enabled'
          size='small'
          disableElevation
          style={{
            cursor: 'pointer',
          }}
        >
          <ToggleIncludeField color='primary' checked={toggleAll} />
        </Button>
        <Typography
          className={clsx('MuiFieldLevel--01')}
          component='span'
          color='primary'
        >
          All
        </Typography>
      </TableCell>

      <Box m={0} className={clsx(classes.root, 'input')}>
        <Text classes={classes} />
      </Box>
      <IconButton className='sortIcon' size="large">
        <Sort />
      </IconButton>
    </Box>
  );
};
ValueSearchToolbar.propTypes = {
  toggleAll: PropTypes.bool,
};
ValueSearchToolbar.defaultProps = {
  toggleAll: false,
};

export function SearchField() {
  const classes = useStyles();
  return <>
    <Box m={0} className={clsx(classes.root, 'input')}>
      <Text classes={classes} />
    </Box>
    <IconButton className='sortIcon' size="large">
      <Sort />
    </IconButton>
  </>;
}

export function Paging({
  rowCount,
  rowsPerPage,
  page,
  handleChangePage,
  handleChangeRowsPerPage,
}) {
  return (
    <TablePagination
      rowsPerPageOptions={[5, 10, 25]}
      component='div'
      count={rowCount}
      rowsPerPage={rowsPerPage}
      page={page}
      onPageChange={handleChangePage}
      onRowsPerPageChange={handleChangeRowsPerPage}
    />
  );
}

function Text({ classes }) {
  return (
    <TextField
      stateId='stateId'
      fullWidth
      placeholder='search...'
      className={clsx(classes.root, 'AppBarSearchInput')}
      InputProps={{
        disableUnderline: true,
        startAdornment: (
          <InputAdornment position='start'>
            <Icon className='searchIcon'>
              <SearchIcon className={clsx('EtlUnit-Search-SvgIcon')} />
            </Icon>
          </InputAdornment>
        ),
        // classes: { root: classes.componentsInputText },
      }}
      saveChange={() => {}}
      name='name'
    />
  );
}
Text.propTypes = {
  classes: PropTypes.shape({ root: PropTypes.string }).isRequired,
};

export default ValueSearchToolbar;
