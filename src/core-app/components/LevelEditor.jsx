import React from 'react';
import PropTypes from 'prop-types';
import RollupDialog from './Rollup/Dialog';

/**
 * @param {array} levels Array of level tuples
 * @returns {object} values
 * @example
 * {
 *    value1: 'myvalue',
 *    value2: null
 * }
 */
export const transformLevelsToValues = (levelKeys, arrows) => {
  if (arrows === undefined) {
    return levelKeys.reduce((values, key) => ({ ...values, [key]: null }), {});
  }
  return levelKeys.reduce((values, key) => {
    return { ...values, [key]: arrows[key] || null };
  }, {});
};

const LevelEditor = (props) => {
  const { levels, levelIdx, arrows, open, onCancel, onSubmit } = props;

  // Levels list that is used in the LevelEditor interface
  const editingLevels = levelIdx == null ? levels : [levels[levelIdx]];

  const levelKeys = editingLevels.map((lvl) => lvl[0]);
  const values = transformLevelsToValues(levelKeys, arrows);

  return (
    <RollupDialog
      open={open}
      title='Rename Levels'
      body='Rename levels'
      domainDescription='Original Name'
      codomainDescription='New Name'
      values={values}
      groups={levelKeys}
      allowEmpty
      submitButtonText='Save Changes'
      onCancel={onCancel}
      onSubmit={onSubmit}
    />
  );
};

LevelEditor.propTypes = {
  levels: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    ),
  ).isRequired,
  mappedSymbols: PropTypes.shape({}),
  open: PropTypes.bool,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  arrows: PropTypes.shape({}),
  levelIdx: PropTypes.number,
};
LevelEditor.defaultProps = {
  open: false,
  mappedSymbols: {},
  arrows: {},
  levelIdx: null,
};

export default LevelEditor;
