// src/components/Workbench/components/EtlUnit/EtlUnit.jsx

import React from 'react';
import PropTypes from 'prop-types';
import EtlUnitBase from './EtlUnitBase';
// import { colors } from '../../../../constants/variables';

/**
 *
 * Interface between what the tree renders (Node), and the
 * EtlUnitBase and EtlUnitGroupBase components.
 *
 * Node -> EtlUnitBase
 *
 *
 * @component
 *
 * @category Components
 *
 */
const EtlUnit = ({ context, nodeId }) => {
  return <EtlUnitBase context={context} nodeId={nodeId} />;
};
EtlUnit.propTypes = {
  nodeId: PropTypes.number.isRequired,
  context: PropTypes.oneOf(['palette', 'canvas']).isRequired,
};
EtlUnit.defaultProps = {};

export default EtlUnit;
