// src/components/ErrorCard.jsx

/**
 *
 * @component
 *
 * Composed of the sub-components
 * 2. List item
 * 3. List generator/container
 *
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { useDispatch } from 'react-redux';

import clsx from 'clsx';

import Card from '@mui/material/Card';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';

// error fix action-related
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import ErrorIcon from '@mui/icons-material/ErrorOutline';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import ErrorFlag from './ErrorFlag';
import usePersistedState from '../../hooks/use-persisted-state';

// ☎️  callback
import { fixAction } from '../../ducks/actions/headerView.actions';

export default function ErrorCard(props) {
  const { viewDetail, errors, stateId, onHide } = props;

  const [showDetail, setShowHide] = usePersistedState(stateId, viewDetail);

  const handleOnClick = () => {
    if (onHide) {
      onHide();
    } // parent override
    else {
      setShowHide(!showDetail);
    }
  };

  // 📬
  const dispatch = useDispatch();

  const handleOnFix = useCallback(
    (event, action) => {
      event.stopPropagation();
      dispatch(fixAction(action));
    },
    [dispatch],
  );

  return (
    <div
      className={clsx('Luci-error-card', {
        'detail-view': showDetail,
      })}>
      <Card key={`${stateId}|Card`} className='view' onClick={handleOnClick}>
        <Collapse key={`${stateId}|Collapse`} in={showDetail} timeout='auto'>
          <List key={`${stateId}|List`} className='list-root' dense>
            {errors.map((error = {}, idx) => {
              const {
                message = `Null`,
                fix = `No fix provided`,
                key = `null-key`,
              } = error;
              const hasLazyFix = 'action' in error;
              return (
                <React.Fragment key={`${stateId}|${key}`}>
                  <ListItem key={`${stateId}|${key}-root`}>
                    <ListItemAvatar className='avatar'>
                      <ErrorIcon className='error-icon' />
                    </ListItemAvatar>
                    <ErrorItem
                      key={`${stateId}|${key}-item`}
                      message={message}
                      fix={fix}
                    />
                    {!hasLazyFix ? null : (
                      <Tooltip title={error.action.description}>
                        <IconButton
                          onClick={(event) => handleOnFix(event, error.action)}
                          size='large'>
                          <DirectionsRunIcon color='primary' fontSize='small' />
                        </IconButton>
                      </Tooltip>
                    )}
                  </ListItem>
                  {idx < errors.length - 1 ? (
                    <Divider
                      key={`${key}-divider`}
                      className='divider'
                      component='li'
                    />
                  ) : null}
                </React.Fragment>
              );
            })}
          </List>
        </Collapse>
      </Card>
      <ErrorFlag
        className='error-flag'
        show={!showDetail}
        onClick={handleOnClick}
      />
    </div>
  );
}

ErrorCard.propTypes = {
  errors: PropTypes.arrayOf(
    PropTypes.shape({
      message: PropTypes.string.isRequired,
      fix: PropTypes.string,
    }),
  ),
  viewDetail: PropTypes.bool,
  stateId: PropTypes.string.isRequired,
  onHide: PropTypes.func,
};
ErrorCard.defaultProps = {
  errors: [],
  viewDetail: false,
  onHide: undefined,
};

/**
 * @component
 *
 * Sub-component for ErrorCard
 *
 */
function ErrorItem({ message, fix = '' }) {
  return (
    <ListItemText
      className='error-item'
      primary={message}
      secondary={
        <Typography
          component='span'
          variant='body2'
          color='textSecondary'>{`Fix: ${fix}`}</Typography>
      }
    />
  );
}

ErrorItem.propTypes = {
  message: PropTypes.string.isRequired,
  fix: PropTypes.string,
};
ErrorItem.defaultProps = {
  fix: '',
};
