// src/components/Workbench/components/EtlUnit/EtlUnitBase.jsx

import React, { useCallback, useMemo } from 'react';
import { useSelector, shallowEqual } from 'react-redux';

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
  getMaybeSelectionModel,
  getIsTimeSingleton,
  selectEtlUnitDisplayConfig,
} from '../../../../ducks/rootSelectors';

// custom components used to fill the shell/base
import EtlUnitCardHeader from './EtlUnitCardHeader';
import EtlUnitValueGrid from './ValueGridWorkbench';
import EtlUnitSpanGrid from './EtlUnitSpanGrid';
import EtlUnitDisplayContextProvider, {
  EtlUnitDisplayDataContext,
  useDisplayDataContext,
} from '../../../../contexts/EtlUnitDisplayContext';
import SelectionModelContextProvider from '../../../../contexts/SelectionModelContext';
// data types
import detailViewTypes from './detailViewTypes';
import displayTypes from './displayTypes';
import etlUnitTypes from './etlUnitTypes';
// import { PURPOSE_TYPES } from '../../../../lib/sum-types';
import { PURPOSE_TYPES } from '../../../../lib/sum-types';
import { InputError } from '../../../../lib/LuciErrors';

// -----------------------------------------------------------------------------
const DEBUG =
  process.env.REACT_APP_DEBUG_WORKBENCH === 'true' ||
  process.env.REACT_APP_DEBUG_LEVELS === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

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
 *    * App bar <<< group
 *    * Derived field <<< group
 *    * EtlUnit
 *
 * Layers of EtlUnit
 *   * EtlUnitBase
 *   * EtlUnitInner
 *   * PaletteEtlUnitMain | CanvasEtlUnitMain
 *
 * The MAP function drives the lion share of the renderering.
 *
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
 * Layers of EtlUnit
 *   * EtlUnitBase
 *   * EtlUnitInner
 *   * PaletteEtlUnitMain | CanvasEtlUnitMain
 *
 */
function EtlUnitInner({ nodeId, palette, etlUnitType, identifier, displayType }) {
  // get the configs to render multipe nodes
  const configs = useSelector(
    (state) =>
      selectEtlUnitDisplayConfig(
        state,
        nodeId,
        identifier,
        etlUnitType === 'measurement', // meaFlag
        'EtlUnitRoot',
      ),
    shallowEqual,
  );

  return palette ? (
    <PaletteEtlUnitMain parameterOrMeasurement={etlUnitType} config={configs[0]} />
  ) : (
    <CanvasEtlUnitMain
      nodeId={nodeId}
      palette={palette}
      configs={configs}
      measurementType={etlUnitType === 'measurement' ? identifier : undefined}
      displayType={displayType}
      type='EtlUnitRoot'
    />
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
 * (see DetailView/EtlUnitComponents)
 *
 *   one of three detail views
 *
 *    👉 quality or component values
 *    👉 component spanValues
 *    👉 measurement: list of components
 *
 * 💥 cleanup of user settings: stateId = `EtlUnitBase-${nodeId}`;
 *
 */
export function CanvasEtlUnitMain({
  nodeId,
  palette,
  measurementType,
  configs,
  displayType,
}) {
  console.debug('CanvasEtlUnitMain', configs);
  //----------------------------------------------------------------------------
  // MAP
  return configs.map((config) => {
    const { parameterOrMeasurement } = etlUnitParameterInstance(config);

    // one of three versions with a display set using purpose:
    // 1. quality
    // 2. meaasurement
    // 3. parameter

    // Configure the display with instance-specific values
    // (e.g., one or more mspan values). This returns true
    // for all of measurement components.
    const isTimeSingleton = useSelector(
      (state) => getIsTimeSingleton(state, nodeId),
      shallowEqual,
    );
    // Configure the display using purpose
    const showDetail =
      (isTimeSingleton && config.purpose === PURPOSE_TYPES.MSPAN) ||
      config.purpose === PURPOSE_TYPES.MVALUE;

    const data = useMemo(
      () => ({
        switchOn: config.purpose === PURPOSE_TYPES.MSPAN,
        showSwitch:
          config.purpose === PURPOSE_TYPES.MCOMP ||
          (!isTimeSingleton && config.purpose !== PURPOSE_TYPES.QUALITY),
        showDetail,
        ...config,
      }),
      [config, showDetail, isTimeSingleton],
    );

    if (!config.purpose) {
      throw new InputError('MAP - SelectionModelContext requires a purpose object');
    }

    return (
      <EtlUnitDisplayContextProvider
        key={`$EtlUnitDisplayContext-${config.nodeId}-${config.identifier}`}
        stateId={`$EtlUnitBase-${config.nodeId}-${config.identifier}`}
        identifier={config.identifier}
        data={data}
      >
        <MaybeContextProvider
          props={{ config }}
          Context={SelectionModelContextProvider}
          guard={[
            PURPOSE_TYPES.QUALITY,
            PURPOSE_TYPES.MCOMP,
            PURPOSE_TYPES.MSPAN,
          ].includes(config.purpose)}
        >
          <EtlUnitDisplayDataContext.Consumer>
            {({ showDetail, showSwitch }) => (
              <CardContent
                className={clsx({
                  'EtlUnit-parameter': parameterOrMeasurement === 'parameter',
                  'EtlUnit-measurement': parameterOrMeasurement === 'measurement',
                  quality: config.etlUnitType === 'quality',
                  measurement: config.etlUnitType !== 'quality',
                  'no-border': config.tag === 'measurement',
                })}
              >
                <EtlUnitCardHeader
                  className='EtlUnit-CardHeader'
                  title={config.title}
                  meta={config.fieldCount}
                  palette={palette || displayType === 'alias'}
                  tag={config.tag}
                  etlUnitType={config.etlUnitType}
                  showSwitch={showSwitch}
                  displayType={displayType}
                />
                <Collapse
                  in={showDetail}
                  className={clsx(
                    'EtlUnit-ValueGrid-Collapse',
                    config.tag,
                    'Luci-Collapse-prerender',
                    { hidden: !showDetail },
                  )}
                >
                  {displayType !== 'alias' ? (
                    <DetailView
                      nodeId={nodeId}
                      palette={palette}
                      tag={config.tag}
                      identifier={config.identifier}
                      valueIdx={config?.valueIdx}
                      measurementType={measurementType}
                      purpose={config.purpose}
                      displayType={displayType}
                    />
                  ) : null}
                </Collapse>
              </CardContent>
            )}
          </EtlUnitDisplayDataContext.Consumer>
        </MaybeContextProvider>
      </EtlUnitDisplayContextProvider>
    );
  });
}
/**
 * Optional selection model context provider
 */
function MaybeContextProvider({ guard, Context, props, children }) {
  if (guard) {
    return <Context {...props}>{children}</Context>;
  }
  return children;
}
MaybeContextProvider.propTypes = {
  guard: PropTypes.bool.isRequired,
  Context: PropTypes.elementType.isRequired,
  props: PropTypes.shape({}).isRequired,
  children: PropTypes.node.isRequired,
};
/*
 */
function PaletteEtlUnitMain({ parameterOrMeasurement, config }) {
  return (
    <CardContent
      className={clsx({
        'EtlUnit-parameter': parameterOrMeasurement === 'parameter',
        'EtlUnit-measurement': parameterOrMeasurement === 'measurement',
        quality: config.purpose === PURPOSE_TYPES.QUALITY,
        measurement: config.purpose !== PURPOSE_TYPES.QUALITY,
        'no-border': config.tag === 'measurement',
      })}
    >
      <EtlUnitCardHeader
        className='EtlUnit-CardHeader'
        title={config.title}
        palette
        tag={config.tag}
        etlUnitType={config.etlUnitType}
        handleMenu={() => {}}
        displayType='none'
      />
    </CardContent>
  );
}
// proptypes for PaletteEtlUnitMain
PaletteEtlUnitMain.propTypes = {
  parameterOrMeasurement: PropTypes.oneOf(['measurement', 'parameter', 'quality'])
    .isRequired,
  config: PropTypes.shape({
    title: PropTypes.string.isRequired,
    etlUnitType: PropTypes.oneOf(etlUnitTypes).isRequired,
    tag: PropTypes.oneOf(detailViewTypes).isRequired,
    purpose: PropTypes.oneOf(Object.values(PURPOSE_TYPES)).isRequired,
  }).isRequired,
};
/**
 * config -> etlUnitParameterInstance
 *
 * @function
 * @param {Object} config
 * @return {Object}
 */
function etlUnitParameterInstance({ tag, etlUnitType }) {
  switch (true) {
    case tag === 'measurement':
      invariant(
        etlUnitType === 'measurement' || etlUnitType === 'transformation',
        `Unexpected etlUnitType: ${etlUnitType}`,
      );
      return {
        parameterOrMeasurement: 'measurement',
      };

    case etlUnitType === 'quality':
      return { parameterOrMeasurement: 'parameter' };

    case etlUnitType !== 'quality' && ['txtValues', 'intValues'].includes(tag):
      return { parameterOrMeasurement: 'parameter' };

    case tag === 'spanValues':
      return { parameterOrMeasurement: 'parameter' };

    default:
      throw Error('Unreachable');
  }
}

CanvasEtlUnitMain.propTypes = {
  nodeId: PropTypes.number.isRequired,
  palette: PropTypes.bool.isRequired,
  measurementType: PropTypes.string,
  type: PropTypes.oneOf(['EtlUnitComponents', 'EtlUnitRoot']).isRequired,
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
CanvasEtlUnitMain.defaultProps = {
  measurementType: undefined,
};

/**
 * One of four instances
 * - Measurement (a parent)
 * - Component or Quality
 * - mspan (a version of component)
 */
function DetailView(props) {
  const { nodeId, palette, measurementType, identifier, valueIdx, tag, displayType } =
    props;
  useTraceUpdate(props);

  const { purpose } = useDisplayDataContext();

  switch (true) {
    case purpose === PURPOSE_TYPES.MVALUE:
      // expand measurement to components
      return (
        <EtlUnitComponents
          nodeId={nodeId}
          palette={palette}
          identifier={identifier}
          displayType={displayType}
        />
      );

    case [PURPOSE_TYPES.QUALITY, PURPOSE_TYPES.MCOMP].includes(purpose):
      return (
        <EtlUnitValueGrid
          type={tag}
          measurementType={measurementType}
          identifier={identifier}
          valueIdx={valueIdx} // relevant for component lookup
          nodeId={nodeId}
          purpose={purpose}
        />
      );

    case purpose === PURPOSE_TYPES.MSPAN:
      return (
        <EtlUnitSpanGrid
          type={tag}
          measurementType={measurementType}
          identifier={identifier}
          nodeId={nodeId}
          valueidx={valueIdx}
        />
      );

    default:
      return <div>{`${identifier} ${purpose} Unreachable`}</div>;
  }
}

DetailView.propTypes = {
  nodeId: PropTypes.number.isRequired,
  palette: PropTypes.bool.isRequired,
  identifier: PropTypes.string.isRequired,
  valueIdx: PropTypes.number,
  tag: PropTypes.string.isRequired,
  measurementType: PropTypes.string,
  displayType: PropTypes.oneOf(displayTypes.leaf).isRequired,
};

DetailView.defaultProps = {
  measurementType: undefined,
  valueIdx: undefined,
};

export function EtlUnitComponents({ nodeId, palette, identifier, displayType }) {
  const configs = useSelector(
    (state) =>
      selectEtlUnitDisplayConfig(state, nodeId, identifier, false, 'EtlUnitComponents'),
    shallowEqual,
  );
  console.debug('Canvas do configs have valueIdx', configs);
  return (
    <CanvasEtlUnitMain
      nodeId={nodeId}
      palette={palette}
      displayType={displayType}
      measurementType={identifier}
      configs={configs}
      type='EtlUnitComponents'
    />
  );
}
EtlUnitComponents.propTypes = {
  nodeId: PropTypes.number.isRequired,
  palette: PropTypes.bool.isRequired,
  identifier: PropTypes.string.isRequired,
  displayType: PropTypes.oneOf(displayTypes.leaf).isRequired,
};

export default EtlUnitBase;
