// src/components/HeaderView.jsx

/**
 * @module components/HeaderView
 *
 *
 * @description
 * A single card used to represent a selected file.
 *
 * Displays meta information such as size, last
 * modified and a small sample of headers & data.
 *
 * ⬆ Parent: SelectedListOfFiles: provides filename
 * 📖 filename -> headerView and errors
 * ☎️  cancelHeaderView (remove a file)
 * ⬇ ⬇ header.map => (header: [id, id..]) HeaderViewField for each field in the header
 *
 * What data to pass as headerView? Only what is expected to be unchanged.
 *
 * User input:
 * Updates the `/ducks/headerView.reducer.js` using
 * `/ducks/actions/headerView.actions.js`.
 *
 * 1. wide-to-long
 *     headerView && headerView.wideToLongFields && (
 *
 * 2. implied-mvalue
 *     headerView && headerView['implied-mvalue'] && (
 */
import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';

import { useDispatch, useSelector } from 'react-redux';

import clsx from 'clsx';

import Card from '@mui/material/Card';
import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';

import WideToLongCard from './WideToLongCard';
import ImpliedMvalueCard from './ImpliedMvalueCard';
import HeaderViewFieldHeader from './HeaderViewFieldHeader';
import HeaderViewField from './HeaderViewField';

import CardHeaderWithToggle from './shared/CardHeaderWithToggle';
import ErrorCard from './shared/ErrorCard';
import ErrorBoundary from './shared/ErrorBoundary';
import ErrorFlag from './shared/ErrorFlag';
// import ConfirmAlert from './shared/ConfirmModal';

// 📖 data selectors
import {
  selectHeaderViewLean,
  selectHasWideToLongFields,
  selectImpliedMvalue,
  selectHasImpliedMvalue,
  selectHeaderViewFixes,
  getActiveFieldCount,
} from '../ducks/rootSelectors';
import { SOURCE_TYPES } from '../lib/sum-types';

// ☎️  callback
// import { cancelHeaderView } from '../ducks/actions/headerView.actions';
// action creator
// import { withConfirmation } from '../ducks/actions/modal.actions';
// import { filesConfirmRemovingFileText } from '../constants/strings';

import { prettyNumber, getParentPath } from '../utils/common';
import { memoize } from '../lib/filesToEtlUnits/headerview-helpers';
import { colors, useTraceUpdate } from '../constants/variables';

// context provider
import ContextProvider, {
  Context as HeaderViewContext,
} from './HeaderViewContext';

// -----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_RENDER_HIGH === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

/**
 * @component
 *
 * Will re-render when return value of selector changes.
 * This component is called when a file is added to the selected list.
 * However, it takes time for the inspection to complete. During that waiting
 * period, will display a linear-progress bar.
 *
 */
function HeaderView(props) {
  const { displayName, filename, removeFile } = props;
  // ignoring stateId (generating it instead locally)

  useTraceUpdate(props);

  if (process.env.REACT_APP_DEBUG_RENDER === 'true') {
    console.debug(`%crendering HeaderView`, colors.green);
  }
  if (DEBUG) {
    console.dir(props);
  }

  // return the same ref when presented with the same filename
  // 🔑 1:1 with mounting of the component itself (no need to clear)
  const [{ memoFn: selectHeaderViewLeanWithMemo }] = useState(
    () => memoize(selectHeaderViewLean, false), // debug off
  );

  // 📖 data from selectors
  // headerView without any fields
  const headerView = useSelector((state) =>
    selectHeaderViewLeanWithMemo(state, filename),
  );
  const activeFieldCount = useSelector((state) =>
    getActiveFieldCount(state, filename),
  );

  return (
    <Card key={`|${filename}|HeaderView`} className={clsx('Luci-HeaderView')}>
      <ContextProvider
        stateId={`${filename}|HeaderView|Context`}
        filename={filename}
        displayName={displayName}
        headerView={headerView || { nrows: null }}
        handleRemove={removeFile}
        hideInactive
        status={headerView ? 'success' : 'loading'}
        activeFieldCount={activeFieldCount}>
        <HeaderViewContext.Consumer>
          {({ showDetail }) => {
            return (
              <>
                <Summary />
                {!headerView ? (
                  <>
                    <LinearProgress />
                    <p />
                  </>
                ) : (
                  <>
                    <Collapse in={showDetail} timeout='auto' unmountOnExit>
                      <Main
                        filename={filename}
                        titleRow={<HeaderViewFieldHeader />}>
                        <HeaderViewFields key={`|${filename}|Header}`} />
                      </Main>
                      <DerivedField
                        filename={filename}
                        header={headerView.header}
                      />
                    </Collapse>
                    <CollapseErrors
                      key={`${filename}|CollapseErrors`}
                      filename={filename}
                    />
                  </>
                )}
              </>
            );
          }}
        </HeaderViewContext.Consumer>
      </ContextProvider>
    </Card>
  );
}
HeaderView.propTypes = {
  filename: PropTypes.string.isRequired,
  removeFile: PropTypes.func.isRequired,
};
// 🔧
HeaderView.whyDidYouRender = true;
// -----------------------------------------------------------------------------
/**
 * has two states that impacts the display of nrows.
 * 1. when we have the inspection results
 * 2. when waiting for the inspection results
 * ... nrows
 *
 * 👎 single value change (nrows) forces the whole header to updated.
 *
 */
function Summary() {
  const { headerView, filename, displayName, activeFieldCount } =
    useContext(HeaderViewContext);
  const { nrows = null } = headerView;

  return filename ? (
    <CardHeaderWithToggle
      key={`${filename}|closable-card`}
      stateId={`${filename}|closable-card`}
      title={displayName}
      subheader={
        <Grid className='Luci-HeaderView-summary' container>
          <Grid item xs={12} className='path'>
            <Typography variant='subtitle2'>Parent path</Typography>
          </Grid>
          <Grid item className='rowCount'>
            <Typography className='metaText'>
              {`Rows:  ${nrows ? prettyNumber(nrows) : '...'}`}
            </Typography>
          </Grid>
          <Grid item className='fieldCount'>
            <Typography>
              Active fields:{' '}
              <span className='count'>{activeFieldCount || null}</span>
            </Typography>
          </Grid>
        </Grid>
      }
    />
  ) : null;
}
Summary.propTypes = {};
Summary.defaultProps = {};

// -----------------------------------------------------------------------------
/**
 * Static
 * State depends on headerView.header
 * Will always be present... eventually.
 */
function Main({ titleRow, children }) {
  return (
    <Table
      className={clsx('Luci-HeaderView', 'Luci-Table', 'headerView', 'detail')}
      size='medium'>
      {/* Row of field titles */}
      <TableHead>{titleRow}</TableHead>

      {/* Rows to display the data - HeaderViewFields */}
      <TableBody>{children}</TableBody>
    </Table>
  );
}
Main.propTypes = {
  titleRow: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
};

/**
 * HeaderView Fields (body of the content)
 *
 * 👍 re-render only when the hv.header changes (it is fixed!)
 *    The only thing being passed to children is the fixed headerIdx
 *    and filename.
 */
function HeaderViewFields() {
  const { headerView, filename } = useContext(HeaderViewContext);

  return headerView.header.map((_, headerIdx) => (
    <HeaderViewField
      key={`|${filename}|HeaderViewField|${headerIdx}`}
      stateId={`|${filename}|HeaderViewField|${headerIdx}`}
      className={clsx('LuciHeaderViewField')}
      fieldIdx={headerIdx}
    />
  ));
}

/**
 * Error/fix display
 * independent state management
 */
function CollapseErrors({ filename }) {
  // 📖 data, fixable errors
  const fixes = useSelector((state) =>
    selectHeaderViewFixes(state, filename, SOURCE_TYPES.RAW),
  );
  const hasErrors = fixes?.length > 0 ?? false;

  // show errors; hide when first loading
  const [showErrors, setShowErrors] = useState(() => false);

  return (
    <>
      <Collapse in={hasErrors && showErrors}>
        <p />
        <ErrorCard
          key={`|${filename}|Main|ErrorCard`}
          stateId={`|${filename}|Main|ErrorCard`}
          errors={fixes}
          viewDetail
          onHide={() => setShowErrors(false)}
        />
      </Collapse>
      <ErrorFlag
        key={`|${filename}|ErrorFlag`}
        show={!showErrors && hasErrors}
        onClick={() => setShowErrors(!showErrors)}
      />
    </>
  );
}
CollapseErrors.propTypes = {
  filename: PropTypes.string.isRequired,
};

// -----------------------------------------------------------------------------
/**
 * State depends on presence of
 * headerView['implied-mvalue'] || headerView.wideToLongFields
 */
function DerivedField({ filename }) {
  // 📖 data from selectors
  const hasImpliedMvalue = useSelector((state) =>
    selectHasImpliedMvalue(state, filename),
  );

  // 📖 data from selectors
  const hasWideToLongFields = useSelector((state) =>
    selectHasWideToLongFields(state, filename),
  );

  let Field = () => null;
  switch (true) {
    case hasImpliedMvalue:
      Field = ImpliedMvalueConfig;
      break;
    case hasWideToLongFields:
      Field = WideToLongFieldsConfig;
      break;
    default:
  }
  Field.displayName = 'DerivedField';
  return <Field filename={filename} />;
}
DerivedField.propTypes = {
  filename: PropTypes.string.isRequired,
};

/**
 * Only call when there is a wideToLongFields prop to retrieve
 * ✅ filename interface
 */
function WideToLongFieldsConfig({ filename }) {
  return (
    <ErrorBoundary message='wideToLongFields: Something went wrong'>
      <WideToLongCard
        key={`|${filename}|wideToLongFields`}
        stateId={`|${filename}|wideToLongFields`}
        filename={filename}
      />
    </ErrorBoundary>
  );
}
WideToLongFieldsConfig.propTypes = {
  filename: PropTypes.string.isRequired,
};

/**
 * Only call when there is a implied-mvalue prop to retrieve
 * ✅ filename interface
 */
function ImpliedMvalueConfig({ filename }) {
  const config = useSelector((state) => selectImpliedMvalue(state, filename));
  return (
    <ErrorBoundary message='impliedMvalue: Something went wrong'>
      <ImpliedMvalueCard
        key={`|${filename}|impliedMvalue`}
        stateId={`|${filename}|impliedMvalue`}
        impliedMvalueConfig={config}
        filename={filename}
      />
    </ErrorBoundary>
  );
}
ImpliedMvalueConfig.propTypes = {
  filename: PropTypes.string.isRequired,
};
// -----------------------------------------------------------------------------

export default HeaderView;
