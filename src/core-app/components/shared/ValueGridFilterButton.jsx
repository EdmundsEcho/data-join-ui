import React from 'react';
import { Tooltip, Badge, IconButton } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import {
  useGridApiContext,
  useGridSelector,
  gridFilterActiveItemsSelector,
} from '@mui/x-data-grid-pro';

const ValueGridFilterButton = () => {
  const apiRef = useGridApiContext();
  const activeFilters = useGridSelector(apiRef, gridFilterActiveItemsSelector);

  const handleOpenFilterPanel = () => {
    apiRef.current.showFilterPanel();
  };

  return (
    <Tooltip title='Filter list' enterDelay={1000}>
      <IconButton onClick={handleOpenFilterPanel} aria-label='filter list'>
        <Badge badgeContent={activeFilters.length} color='primary'>
          <FilterListIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  );
};

export default ValueGridFilterButton;
