import React from 'react';
import PropTypes from 'prop-types';
import ReactJson from 'react-json-view';

/* eslint-disable no-console */
const ConsoleLog = ({
  value,
  replace,
  space,
  advancedView,
  collapsed,
  expanded,
}) => {
  return advancedView ? (
    <ReactJson
      src={value}
      theme='rjv-default'
      iconStyle='circle'
      collapsed={collapsed && !expanded}
      displayDataTypes={false}
    />
  ) : (
    <pre style={{ backgroundColor: '#eee', padding: '1em' }}>
      <code>{JSON.stringify(value, replace, space)}</code>
    </pre>
  );
};

ConsoleLog.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({}),
    PropTypes.arrayOf(PropTypes.any),
  ]).isRequired,
  replace: PropTypes.string,
  space: PropTypes.number,
  advancedView: PropTypes.bool,
  collapsed: PropTypes.bool,
  expanded: PropTypes.bool,
};
ConsoleLog.defaultProps = {
  replace: null,
  space: 4,
  advancedView: false,
  collapsed: true,
  expanded: false,
};
export default ConsoleLog;
