import React, { useContext, useCallback } from 'react';
import PropTypes from 'prop-types';

import clsx from 'clsx';

import CardHeader from '@mui/material/CardHeader';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import IconButton from '@mui/material/IconButton';

// import RefetchLevels from './RefetchLevels';
import { Div } from '../../../luci-styled';

import { Context as HeaderViewContext } from '../HeaderViewContext';
import Switch from './Switch';

/**
 * Dumb component
 * No local state. Uses HeaderViewContext.
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
    toggleShowDetail,
    showDetail,
    hideInactive,
    wideMode,
    toggleHideInactive,
    toggleMvalueMode,
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
        <Div className='Luci-HeaderView-actions'>
          <div className='luci-action-row'>
            <IconButton
              className={clsx('expandIcon', { expandOpen: showDetail })}
              onClick={handleShowDetail}
              tabIndex={-1}
              size='large'>
              <ExpandMoreIcon />
            </IconButton>
            <IconButton className='closeIcon' onClick={handleRemove} size='large'>
              <CloseIcon />
            </IconButton>
          </div>

          <div className='luci-action-row'>
            {showDetail && status !== 'loading' && (
              <>
                <Switch
                  className='mvalue-mode-switch'
                  labelOne='multiple-values'
                  labelTwo='multi-value-wide' // sync with context toggle
                  checked={!wideMode}
                  onChange={toggleMvalueMode}
                  labelPlacement='start'
                  fontSize='medium'
                />
                <Switch
                  className='show-all-fields-switch'
                  labelOne='show all'
                  labelTwo='hide disabled'
                  checked={hideInactive}
                  onChange={toggleHideInactive}
                  labelPlacement='start'
                  fontSize='medium'
                />
              </>
            )}
          </div>
        </Div>
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
