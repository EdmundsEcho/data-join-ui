// src/components/Workbench/components/EtlUnit/EtlUnitGroupBase.jsx

import React, { useCallback, useState, useContext } from 'react';
// import { useSelector } from 'react-redux';

import PropTypes from 'prop-types';
import clsx from 'clsx';

import { useDispatch, useSelector } from 'react-redux';

import CardContent from '@mui/material/CardContent';
import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import IconButton from '@mui/material/IconButton';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMoreRounded';
// import UnfoldLessIcon from '@mui/icons-material/UnfoldLessRounded';
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
  const dispatch = useDispatch();
  const { data } = useSelector((state) => selectNodeState(state, nodeId));

  const [showDetailInit, setShowDetailInit] = useState(() => undefined);

  // the provider wraps these in a memo or useCallback
  const handleRemoveGroup = () => dispatch(removeNode(nodeId));

  // the provider wraps these in a memo or useCallback
  const handleAddDerivedField = () => {
    dispatch(addDerivedField({ id: nodeId }));
    setShowDetailInit(true);
  };

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
      showMoreMenu={false}>
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
                )}>
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
                    unmountOnExit={false}>
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
                )}>
                <Footer type={displayType} showFab={displayType === 'empty'} />
              </div>
            </Card>

            {showFab ? (
              <>
                <Fab
                  className='fab'
                  size='small'
                  color='secondary'
                  onClick={handleClickFab}>
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
function Tools({ version, withShowMore }) {
  const { handleClearCommand, toggleShowDetail, showDetail } =
    useContext(EtlUnitGroupContext);

  /* eslint-disable no-nested-ternary */
  return version === 1 ? (
    <div className={clsx('Luci-tools', 'v1')}>
      {withShowMore && (
        <ShowDetail
          iconButtonClass={clsx('v1', 'tool')}
          expandIconClass={clsx('icon', 'expandMoreIcon')}
          onChange={toggleShowDetail}
          showDetail={showDetail}
        />
      )}
      <Clear handleClearCommand={handleClearCommand} />
      <Menu />
    </div>
  ) : version === 2 ? (
    <div className={clsx('Luci-tools', 'v1')}>
      {withShowMore && (
        <ShowDetail
          iconButtonClass={clsx('v1', 'tool')}
          expandIconClass={clsx('icon', 'expandMoreIcon')}
          onChange={toggleShowDetail}
          showDetail={showDetail}
        />
      )}
      <Menu />
    </div>
  ) : (
    <div className={clsx('Luci-tools')}>
      <div className={clsx('folding')}>
        <IconButton className={clsx('tool', 'v2')} size='large'>
          <UnfoldMoreIcon className={clsx('icon')} />
        </IconButton>
        <IconButton className={clsx('tool', 'v2')} size='large'>
          <UnfoldMoreIcon className={clsx('icon')} />
        </IconButton>
      </div>
      <Clear handleClearCommand={handleClearCommand} />
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

function Clear({ handleClearCommand }) {
  return (
    <IconButton
      className={clsx('tool')}
      onClick={handleClearCommand}
      size='large'>
      <ClearIcon className={clsx('icon', 'clear')} />
    </IconButton>
  );
}
Clear.propTypes = {
  handleClearCommand: PropTypes.func.isRequired,
};
Clear.defaultProps = {};

function Menu() {
  return (
    <IconButton className={clsx('tool')} size='large'>
      <MenuIcon className={clsx('icon', 'menu')} />
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
