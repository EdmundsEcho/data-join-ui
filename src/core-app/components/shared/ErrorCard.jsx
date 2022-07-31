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
import makeStyles from '@mui/styles/makeStyles';

import Box from '@mui/material/Box';
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

const useStyles = makeStyles((theme) => ({
  grid: {
    marginTop: '15px',
    display: 'grid',
    gridTemplateColumns: '5px auto',
    backgroundColor: 'transparent',
  },
  gridDetail: {
    marginTop: '0px',
  },
  view: {
    margin: '5px',
    marginTop: '0px',
    marginBottom: '15px',
    padding: '5px',
    minHeight: '0px',
    // boxShadow: theme.palette.boxShadow.error,
    gridRow: '1',
    gridColumn: '1 / span 2',
    alignSelf: 'start',
  },
  divider: {
    backgroundcolor: `rgba(209,5,20,0.2)`,
  },
  errorIcon: {
    color: theme.palette.error.main,
  },
  errorBlock: {
    marginLeft: theme.spacing(5),
  },
  list: {},
  avatar: {},
}));

// style prop for the Flag
const flag = {
  marginTop: '-45px',
  gridRow: '2',
  gridColumn: '2',
  justifySelf: 'start',
  width: '30px',
  height: '30px',
};

export default function ErrorCard(props) {
  const { viewDetail, errors, stateId, onHide } = props;

  const [showDetail, setShowHide] = usePersistedState(stateId, viewDetail);

  const classes = useStyles({ showDetail });

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
    <Box className={clsx(classes.grid, { [classes.gridDetail]: showDetail })}>
      <Card
        key={`${stateId}|Card`}
        className={classes.view}
        onClick={handleOnClick}
      >
        <Collapse key={`${stateId}|Collapse`} in={showDetail} timeout='auto'>
          <List key={`${stateId}|List`} className={classes.list} dense>
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
                    <ListItemAvatar className={classes.avatar}>
                      <ErrorIcon className={classes.errorIcon} />
                    </ListItemAvatar>
                    <ErrorItem
                      key={`${stateId}|${key}-item`}
                      message={message}
                      fix={fix}
                      classes={classes}
                    />
                    {!hasLazyFix ? null : (
                      <Tooltip title={error.action.description}>
                        <IconButton
                          onClick={(event) => handleOnFix(event, error.action)}
                          size='large'
                        >
                          <DirectionsRunIcon color='primary' fontSize='small' />
                        </IconButton>
                      </Tooltip>
                    )}
                  </ListItem>
                  {idx < errors.length - 1 ? (
                    <Divider
                      key={`${key}-divider`}
                      className={classes.divider}
                      component='li'
                    />
                  ) : null}
                </React.Fragment>
              );
            })}
          </List>
        </Collapse>
      </Card>
      <ErrorFlag show={!showDetail} style={flag} onClick={handleOnClick} />
    </Box>
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
function ErrorItem({ classes, message, fix = '' }) {
  return (
    <ListItemText
      className={classes.errorBlock}
      primary={message}
      secondary={
        <Typography
          component='span'
          variant='body2'
          color='textSecondary'
        >{`Fix: ${fix}`}</Typography>
      }
    />
  );
}

ErrorItem.propTypes = {
  classes: PropTypes.shape({
    errorBlock: PropTypes.string.isRequired,
  }).isRequired,
  message: PropTypes.string.isRequired,
  fix: PropTypes.string,
};
ErrorItem.defaultProps = {
  fix: '',
};
