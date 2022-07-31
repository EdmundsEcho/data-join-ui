import React, { useContext, useCallback } from 'react';
import PropTypes from 'prop-types';

import clsx from 'clsx';

import CardHeader from '@mui/material/CardHeader';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';

import { Context as HeaderViewContext } from '../HeaderViewContext';
import Switch from './Switch';

/**
 * Dumb component
 * No local state.
 *
 * User capacity:
 * 👉 remove the card
 * 👉 show/hide toggle
 *
 * @component
 *
 * @categories Components
 *
 */
const CardHeaderWithToggle = (props) => {
  const { stateId, title, subheader } = props;

  const {
    handleRemove,
    filename,
    toggleShowDetail,
    showDetail,
    hideInactive,
    toggleHideInactive,
    status,
  } = useContext(HeaderViewContext);

  const handleShowDetail = useCallback(() => {
    toggleShowDetail(!showDetail);
  }, [showDetail, toggleShowDetail]);

  return (
    <CardHeader
      className={clsx('Luci-HeaderView', 'summary')}
      key={`${stateId}|Closable-CardHeader`}
      title={title}
      titleTypographyProps={{ variant: 'h6' }}
      subheader={subheader}
      subheaderTypographyProps={{ variant: 'subtitle2' }}
      action={
        <Grid container className='Luci-HeaderView-Actions'>
          <Grid item xs={12} container>
            <Grid item xs={4} />
            <Grid item xs={4}>
              <IconButton
                className={clsx('expandIcon', { expandOpen: showDetail })}
                onClick={handleShowDetail}
                tabIndex={-1}
                size="large">
                <ExpandMoreIcon />
              </IconButton>
            </Grid>
            <Grid item xs={4}>
              <IconButton
                className={clsx('closeIcon')}
                onClick={() => handleRemove(filename)}
                size="large">
                <CloseIcon />
              </IconButton>
            </Grid>
          </Grid>
          <Grid item xs={12} container>
            <Grid
              item
              className={clsx('Luci-HeaderView', 'switch')}
              style={{ marginLeft: 'auto', marginRight: '14px' }}
            >
              {showDetail && status !== 'loading' ? (
                <Switch
                  labelOne='show all'
                  labelTwo='hide disabled'
                  checked={hideInactive}
                  onChange={toggleHideInactive}
                  labelPlacement='start'
                  fontSize='medium'
                />
              ) : null}
            </Grid>
          </Grid>
        </Grid>
      }
    />
  );
};

CardHeaderWithToggle.propTypes = {
  stateId: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  subheader: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
};

CardHeaderWithToggle.defaultProps = {};

export default CardHeaderWithToggle;
