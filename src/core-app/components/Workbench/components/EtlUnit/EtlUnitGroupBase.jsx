// src/components/Workbench/components/EtlUnit/EtlUnitGroupBase.jsx

import React, { useCallback, useState, useContext } from 'react';
// import { useSelector } from 'react-redux';

import PropTypes from 'prop-types';
import clsx from 'clsx';

import { useDispatch, useSelector } from 'react-redux';

import makeStyles from '@mui/styles/makeStyles';
import CardContent from '@mui/material/CardContent';
import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import IconButton from '@mui/material/IconButton';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMoreRounded';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLessRounded';
import MenuIcon from '@mui/icons-material/Menu';
import Card from '@mui/material/Card';
// icons
import AddIcon from '@mui/icons-material/AddRounded';
import ClearIcon from '@mui/icons-material/ClearRounded';
import PersonIcon from '@mui/icons-material/PersonRounded';
import Function from '@mui/icons-material/Functions';

import ShowDetail from './ShowDetail';
import DerivedFieldConfig from './DerivedFieldConfig';

import groupTypes from './groupTypes';
import { selectNodeState } from '../../../../ducks/rootSelectors';
import {
  addDerivedField,
  removeNode,
} from '../../../../ducks/actions/workbench.actions';

// import { colors } from '../../../../constants/variables';

// custom components used to fill the shell/base
import EtlUnitGroupProvider, {
  EtlUnitGroupContext,
} from './EtlUnitGroupContext';

/**
 * Group shell
 *
 * ... tree node at level-3
 *
 * A shell that only needs props required to render
 * the correct "type" and empower the children to
 * retrieve the data values.
 *
 *    👉 palette | canvas
 *    👉 quality | measurement | component
 *
 *    Layers to a shell
 *    👉 App bar <<< group
 *    👉 Derived field <<< group
 *    👉 EtlUnit
 *
 * ⬜ Introduce the stateId to store the toggled state
 *
 *
 */
function EtlUnitGroupBase({ nodeId, context, children }) {
  // 📖
  const { data } = useSelector((state) => selectNodeState(state, nodeId));

  const dispatch = useDispatch();

  const handleRemoveGroup = useCallback(() => {
    dispatch(removeNode(nodeId));
  }, [dispatch, nodeId]);

  const [showDetailInit, setShowDetailInit] = useState(() => undefined);

  const handleAddDerivedField = useCallback(() => {
    dispatch(addDerivedField({ id: nodeId }));
    setShowDetailInit(true);
  }, [dispatch, nodeId]);

  /*
  const handleRemoveDerivedField = useCallback(() => {
    dispatch(removeDerivedField(nodeId));
    setShowDetailInit(undefined);
  }, [dispatch, nodeId]);
*/

  const version = 1;
  const displayType =
    context === 'palette' ? 'shell' : data?.displayType || 'empty';
  // when to show group semantic
  const withShowMore = ['derivedField'].includes(displayType);
  const showFab = displayType === 'empty';

  return (
    <EtlUnitGroupProvider
      displayType={displayType}
      clearCallback={handleRemoveGroup}
      clickFabCallback={handleAddDerivedField}
      data={data}
      showDetail={showDetailInit}
      stateId={`groupNodeContext-${nodeId}`}
      showMoreMenu={false}
    >
      {/* only use class to show/hide header 🦀 ? */}
      <EtlUnitGroupContext.Consumer>
        {({ showDetail, handleClickFab }) => (
          <>
            <Card className={clsx('EtlUnitGroupBase-root', context)}>
              {/* Header */}
              <CardContent
                className={clsx(
                  'header-wrapper',
                  displayType === 'shell' && 'shell',
                )}
              >
                <Header
                  className={clsx('header')}
                  type={displayType}
                  version={version}
                  withShowMore={withShowMore}
                />
              </CardContent>
              {/* Group semantic */}
              <Grid className='group-semantic' container spacing={0}>
                <Grid item xs>
                  <Collapse
                    in={showDetail}
                    timeout='auto'
                    unmountOnExit={false}
                  >
                    {displayType === 'derivedField' ? (
                      <DerivedFieldConfig
                        nodeId={nodeId}
                        className='semantic'
                      />
                    ) : null}
                  </Collapse>
                </Grid>
              </Grid>
              {/* EtlUnits */}
              <div className='units'>{children}</div>

              {/* Footer */}
              <div
                className={clsx(
                  'footer-wrapper',
                  displayType === 'shell' && 'shell',
                )}
              >
                <Footer type={displayType} showFab={displayType === 'empty'} />
              </div>
            </Card>

            {showFab ? (
              <>
                <Fab
                  className='fab'
                  size='small'
                  color='secondary'
                  onClick={handleClickFab}
                >
                  <AddIcon fontSize='small' />
                </Fab>
                <div className={clsx('spacer')} />
              </>
            ) : null}
          </>
        )}
      </EtlUnitGroupContext.Consumer>
    </EtlUnitGroupProvider>
  );
}
EtlUnitGroupBase.propTypes = {
  children: PropTypes.node.isRequired,
  context: PropTypes.oneOf(['palette', 'canvas']).isRequired,
  nodeId: PropTypes.number.isRequired,
};

//------------------------------------------------------------------------------
// Footer
function Footer() {
  return <div className={clsx('footer')} />;
}
Footer.propTypes = {};
Footer.defaultProps = {};
//------------------------------------------------------------------------------
// Title
function Title({ Icon, text }) {
  return (
    <div className='title'>
      <Icon className='icon' />
      <Typography variant='subtitle2' className='text'>
        {text}
      </Typography>
    </div>
  );
}
Title.propTypes = {
  Icon: PropTypes.oneOfType([PropTypes.func, PropTypes.shape()]).isRequired,
  text: PropTypes.string.isRequired,
};

//------------------------------------------------------------------------------
// Tools
const useToolStyles = makeStyles((theme) => ({
  icon: {
    margin: 0,
    padding: 0,
    fontSize: '1.3rem',
  },
  toolBox: {
    display: 'flex',
    flex: 0.3,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  version1: { justifyContent: 'flex-end' },
  tool: {
    color: theme.palette.primary.main,
    padding: 0,
  },

  clearIcon: { padding: theme.spacingFn(1), fontSize: '1.2rem' },
  menuIcon: { padding: theme.spacingFn(1), fontSize: '1.2rem' },
  expandMoreIcon: { fontSize: '1.5rem', padding: theme.spacingFn(1) },

  foldingToolBox: {
    display: 'flex',
    justifyContent: 'flex-start',
    width: '50px',
  },

  foldIcon: {},
  //
}));
function Tools({ version, withShowMore }) {
  const classes = useToolStyles();

  const { handleClearCommand, toggleShowDetail, showDetail } =
    useContext(EtlUnitGroupContext);

  /* eslint-disable no-nested-ternary */
  return version === 1 ? (
    <div className={clsx('tools-root', classes.toolBox, classes.version1)}>
      {withShowMore && (
        <ShowDetail
          iconButtonClass={clsx(classes.tool, classes.version1)}
          expandIconClass={clsx(classes.icon, classes.expandMoreIcon)}
          onChange={toggleShowDetail}
          showDetail={showDetail}
        />
      )}
      <Clear classes={classes} handleClearCommand={handleClearCommand} />
      <Menu classes={classes} />
    </div>
  ) : version === 2 ? (
    <div className={clsx('tools-root', classes.toolBox, classes.version1)}>
      {withShowMore && (
        <ShowDetail
          iconButtonClass={clsx(classes.tool, classes.version1)}
          expandIconClass={clsx(classes.icon, classes.expandMoreIcon)}
          onChange={toggleShowDetail}
          showDetail={showDetail}
        />
      )}
      <Menu classes={classes} />
    </div>
  ) : (
    <div className={clsx('tools-root', classes.toolBox)}>
      <div className={clsx(classes.foldingToolBox)}>
        <IconButton
          className={clsx(classes.tool, classes.version2)}
          size='large'
        >
          <UnfoldMoreIcon className={clsx(classes.icon, classes.foldIcon)} />
        </IconButton>
        <IconButton
          className={clsx(classes.tool, classes.version2)}
          size='large'
        >
          <UnfoldLessIcon className={clsx(classes.icon, classes.foldIcon)} />
        </IconButton>
      </div>
      <Clear classes={classes} handleClearCommand={handleClearCommand} />
    </div>
  );
  /* eslint-enable no-nested-ternary */
}
Tools.propTypes = {
  version: PropTypes.number,
  withShowMore: PropTypes.bool,
};
Tools.defaultProps = {
  version: 1,
  withShowMore: false,
};

function Clear(classes, handleClearCommand) {
  return (
    <IconButton
      className={clsx(classes.tool)}
      onClick={handleClearCommand}
      size='large'
    >
      <ClearIcon className={clsx(classes.icon, classes.clearIcon)} />
    </IconButton>
  );
}

function Menu({ classes }) {
  return (
    <IconButton className={clsx(classes.tool)} size='large'>
      <MenuIcon className={clsx(classes.icon, classes.menuIcon)} />
    </IconButton>
  );
}

// empty component
const Empty = () => <></>;

//------------------------------------------------------------------------------
// Header
/**
 *
 * ⬜ Create a db for how to display the different group types.
 *
 * @component
 *
 */
function Header({ type, version, withShowMore, className }) {
  //
  let titleProps = {};
  switch (type) {
    case 'subjectUniverse':
      titleProps = {
        Icon: PersonIcon,
        text: 'Subject Universe',
      };
      break;
    case 'derivedField':
      titleProps = {
        Icon: Function,
        text: 'Derived Field',
      };
      break;
    default:
      titleProps = { Icon: Empty, text: '' };
  }
  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <div className={className}>
      <Title {...titleProps} />
      <Tools version={version} withShowMore={withShowMore} />
    </div>
  );
}
Header.propTypes = {
  type: PropTypes.oneOf(groupTypes),
  version: PropTypes.number,
  withShowMore: PropTypes.bool,
  className: PropTypes.string.isRequired,
};
Header.defaultProps = {
  type: 'shell',
  version: 1,
  withShowMore: false,
};

export default EtlUnitGroupBase;

/*
  <IconButton
        className={clsx(classes.tool, classes.version1)}
        onClick={toggleShowDetail}
      >
        <ExpandMoreIcon
          className={clsx(classes.icon, classes.expandMoreIcon)}
        />
  </IconButton>
*/
