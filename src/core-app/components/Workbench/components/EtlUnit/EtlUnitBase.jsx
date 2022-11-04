// src/components/Workbench/components/EtlUnit/EtlUnitBase.jsx

import React, { useCallback } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';

import PropTypes from 'prop-types';
import clsx from 'clsx';
import invariant from 'invariant';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';

import { useTraceUpdate } from '../../../../constants/variables';
// 📖
import {
  getNodeDataSeed,
  getIsCompReducedMap,
  getIsTimeSingleton,
  selectEtlUnitDisplayConfig,
} from '../../../../ducks/rootSelectors';

// custom components used to fill the shell/base
import EtlUnitCardHeader from './EtlUnitCardHeader';
import EtlUnitValueGrid from './ValueGridWorkbench';
import EtlUnitSpanGrid from './EtlUnitSpanGrid';
import ToolContextProvider, { ToolContext } from './ToolContext';
// data types
import detailViewTypes from './detailViewTypes';
import displayTypes from './displayTypes';
import etlUnitTypes from './etlUnitTypes';
// import { PURPOSE_TYPES } from '../../../../lib/sum-types';
// actions
import { setCompReduced } from '../../../../ducks/actions/workbench.actions';

/**
 * 📌
 * A shell that only needs props required to render
 * the correct etlUnitType and empower the children to
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
 */
function EtlUnitBase({ nodeId, context }) {
  const { etlUnitType, identifier, displayType } = useSelector(
    (state) => getNodeDataSeed(state, nodeId),
    shallowEqual,
  );
  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <Card className={clsx('EtlUnitBase-root', `${context}`)}>
      <Divider className={clsx('top-bar')} orientation='horizontal' />
      <EtlUnitInner
        nodeId={nodeId}
        palette={context === 'palette'}
        identifier={identifier}
        etlUnitType={etlUnitType}
        displayType={displayType}
      />
      {context === 'palette' ? (
        <Divider className={clsx('foot-bar')} orientation='horizontal' />
      ) : null}
    </Card>
  );
}
EtlUnitBase.propTypes = {
  nodeId: PropTypes.number.isRequired,
  context: PropTypes.oneOf(['palette', 'canvas']).isRequired,
};
EtlUnitBase.defaultProps = {};

/**
 *
 * Called once
 * 📖 selectEtlUnitDisplayConfig
 *
 */
function EtlUnitInner({
  nodeId,
  palette,
  etlUnitType,
  identifier,
  displayType,
}) {
  const configs = useSelector(
    (state) =>
      selectEtlUnitDisplayConfig(
        state,
        nodeId,
        identifier,
        etlUnitType === 'measurement',
      ),
    shallowEqual,
  );

  return (
    <>
      {etlUnitType === 'measurement' ? <Divider variant='middle' /> : null}
      <EtlUnitParameter
        nodeId={nodeId}
        palette={palette}
        configs={configs}
        displayType={displayType}
      />
    </>
  );
}
EtlUnitInner.propTypes = {
  nodeId: PropTypes.number.isRequired,
  palette: PropTypes.bool.isRequired,
  etlUnitType: PropTypes.oneOf(['quality', 'measurement']).isRequired,
  identifier: PropTypes.string.isRequired,
  displayType: PropTypes.oneOf(displayTypes.leaf).isRequired,
};

/**
 * Hosts an array of quality or components
 * Called recursively when dealing with etlUnit::measurement
 * (see DetailView/Components)
 *
 *   one of three detail views
 *
 *    👉 quality or component values
 *    👉 component spanValues
 *    👉 measurement: list of components
 *
 */
export function EtlUnitParameter({
  nodeId,
  palette,
  measurementType,
  configs,
  displayType,
}) {
  const dispatch = useDispatch();

  const handleReducedToggle = useCallback(
    (config, valueIdx) => (rollup) => {
      dispatch(setCompReduced(nodeId, config.identifier, valueIdx, !rollup));
    },
    [dispatch, nodeId],
  );

  // returns an object keyed by identifier
  const isCompReduced = useSelector(
    (state) => getIsCompReducedMap(state, nodeId),
    shallowEqual,
  );

  const isTimeSingleton = useSelector(
    (state) => getIsTimeSingleton(state, nodeId),
    shallowEqual,
  );

  const showSwitch = (tag) => {
    return tag !== 'spanValues' ? true : !isTimeSingleton;
  };

  /*
  const isNoValuesSelected = useSelector(
    (state) => getIsNoValuesSelected(state, nodeId),
    shallowEqual,
  );
  disableSwitch={isNoValuesSelected[config.identifier]}
  */

  return configs.map((config, valueIdx) => {
    const { instanceOf, parameterOrMeasurement } =
      etlUnitParameterInstance(config);
    return (
      <ToolContextProvider
        switchCallback={handleReducedToggle(config, valueIdx)}
        switchOn={!isCompReduced?.[config.identifier] ?? false}
        showSwitch={showSwitch(config.tag)}
        stateId={`EtlUnitBase-${nodeId}-${config.identifier}`}
        key={`ValueGrid-${nodeId}-${config.identifier}`}>
        <ToolContext.Consumer>
          {({ showDetail }) => {
            return (
              <CardContent
                className={clsx({
                  'EtlUnit-parameter': parameterOrMeasurement === 'parameter',
                  'EtlUnit-measurement':
                    parameterOrMeasurement === 'measurement',
                  quality: config.etlUnitType === 'quality',
                  measurement: config.etlUnitType !== 'quality',
                  'no-border': config.tag === 'measurement',
                })}>
                <EtlUnitCardHeader
                  className='EtlUnit-CardHeader'
                  title={config.title}
                  meta={config.fieldCount}
                  palette={palette || displayType === 'alias'}
                  tag={config.tag}
                  etlUnitType={config.etlUnitType}
                  handleMenu={() => {}}
                  showSwitch={isTimeSingleton}
                  displayType={displayType}
                />
                {/* Detail view: values */}
                <Collapse
                  in={showDetail}
                  className={clsx('EtlUnit-ValueGrid-Collapse', config.tag)}
                  timeout='auto'
                  unmountOnExit>
                  {displayType !== 'alias' ? (
                    <DetailView
                      nodeId={nodeId}
                      palette={palette}
                      tag={config.tag}
                      identifier={config.identifier}
                      measurementType={measurementType}
                      instanceOf={instanceOf}
                    />
                  ) : null}
                </Collapse>
              </CardContent>
            );
          }}
        </ToolContext.Consumer>
      </ToolContextProvider>
    );
  });
}

/**
 * config -> etlUnitParameterInstance
 * Local helper to identify display characteristics.
 *
 * FYI for when streamline types - {
 *   measurement: PURPOSE_TYPES.MVALUE,
 *   quality: PURPOSE_TYPES.QUALITY,
 *   component: PURPOSE_TYPES.MCOMP,
 *   mspan: PURPOSE_TYPES.MSPAN,
 * };
 *
 * @function
 * @param {Object} config
 * @return {Object}
 */
function etlUnitParameterInstance({ tag, etlUnitType }) {
  switch (true) {
    case tag === 'measurement':
      invariant(
        etlUnitType === 'measurement',
        `Unexpected etlUnitType: ${etlUnitType}`,
      );
      return {
        instanceOf: 'measurement',
        parameterOrMeasurement: 'measurement',
      };

    case etlUnitType === 'quality':
      return { instanceOf: 'quality', parameterOrMeasurement: 'parameter' };

    case etlUnitType !== 'quality' && ['txtValues', 'intValues'].includes(tag):
      return { instanceOf: 'component', parameterOrMeasurement: 'parameter' };

    case tag === 'spanValues':
      return { instanceOf: 'mspan', parameterOrMeasurement: 'parameter' };

    default:
      throw Error('Unreachable');
  }
}
const INSTANCES = ['measurement', 'quality', 'component', 'mspan'];

EtlUnitParameter.propTypes = {
  nodeId: PropTypes.number.isRequired,
  palette: PropTypes.bool.isRequired,
  measurementType: PropTypes.string,
  configs: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      identifier: PropTypes.string.isRequired,
      etlUnitType: PropTypes.oneOf(etlUnitTypes).isRequired,
      // values/levels that make-up the collection
      tag: PropTypes.oneOf(detailViewTypes).isRequired,
      fieldCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ).isRequired,
};
EtlUnitParameter.defaultProps = {
  measurementType: undefined,
};

/**
 * One of four instances
 * - Measurement (a parent)
 * - Component or Quality
 * - mspan (a version of component)
 */
function DetailView(props) {
  const { nodeId, palette, measurementType, identifier, tag, instanceOf } =
    props;
  useTraceUpdate(props);

  switch (true) {
    case instanceOf === 'measurement':
      // expand measurement to components
      return (
        <Components nodeId={nodeId} palette={palette} identifier={identifier} />
      );

    case ['quality', 'component'].includes(instanceOf):
      return (
        <EtlUnitValueGrid
          type={tag}
          measurementType={measurementType}
          identifier={identifier}
          nodeId={nodeId}
          instanceOf={instanceOf}
        />
      );

    case instanceOf === 'mspan':
      return <EtlUnitSpanGrid nodeId={nodeId} />;

    default:
      return <div>{`${identifier} ${instanceOf} Unreachable`}</div>;
  }
}

DetailView.propTypes = {
  nodeId: PropTypes.number.isRequired,
  palette: PropTypes.bool.isRequired,
  identifier: PropTypes.string.isRequired,
  tag: PropTypes.string.isRequired,
  measurementType: PropTypes.string,
  instanceOf: PropTypes.oneOf(INSTANCES).isRequired,
};

DetailView.defaultProps = {
  measurementType: undefined,
};

export function Components({ nodeId, palette, identifier }) {
  const configs = useSelector(
    (state) => selectEtlUnitDisplayConfig(state, nodeId, identifier),
    shallowEqual,
  );
  return (
    <EtlUnitParameter
      nodeId={nodeId}
      palette={palette}
      measurementType={identifier}
      configs={configs}
    />
  );
}
Components.propTypes = {
  nodeId: PropTypes.number.isRequired,
  palette: PropTypes.bool.isRequired,
  identifier: PropTypes.string.isRequired,
};

export default EtlUnitBase;
