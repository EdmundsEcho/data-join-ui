// src/components/Workbench/components/EtlUnit/EtlUnitGroup.jsx

import React from 'react';
import PropTypes from 'prop-types';
import EtlUnitGroupBase from './EtlUnitGroupBase';

// import { colors } from '../../../../constants/variables';

/**
 * Thin wrapper of EtlUnitGroupBase
 *
 * Interface between what the tree renders (Node), and the
 * EtlUnitGroupBase components.
 *
 * Node -> EtlUnitGroupBase
 *
 *
 * ⚠️  ⬜ Streamline dependency on type that can change by user.
 *        ... may cause rerender.
 *
 * @component
 *
 * @category Components
 *
 */
const EtlUnitGroup = ({ context, config, children }) => {
  return (
    <EtlUnitGroupBase nodeId={config.nodeId} context={context}>
      {children}
    </EtlUnitGroupBase>
  );
};
EtlUnitGroup.propTypes = {
  context: PropTypes.oneOf(['palette', 'canvas']).isRequired,
  config: PropTypes.shape({
    nodeId: PropTypes.number.isRequired,
  }).isRequired,
  children: PropTypes.node.isRequired,
};
EtlUnitGroup.defaultProps = {};
export default EtlUnitGroup;
