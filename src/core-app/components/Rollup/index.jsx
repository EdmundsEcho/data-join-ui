/**
 * @module src/component/Rollup
 * @todo Should append codomains found in initial domain object
 */
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import Group from './Group';

import { dedupArray } from '../../utils/common';

/* eslint-disable react/destructuring-assignment */

const isNil = (v) => !(typeof v === 'undefined' || v === null);

/**
 * Rollup
 * @returns {object} rollup `{value1: group1, value2: group1, value3: group2}`
 */
const Rollup = (props) => {
  const {
    allowEmpty,
    noHeading,
    codomainDescription,
    debug,
    groups,
    domainDescription,
    values,
    handleRollupUpdate,
  } = props;

  const [state, setState] = useState(() => ({
    rollup: {},
    errors: [],
    newGroups: [],
  }));

  /**
   * evaluateRollup
   * This method takes the original values input
   * and overrides whatever has been added to the
   * local rollup object
   */
  const evaluateRollup = useCallback(() => {
    const rollup = { ...values, ...state.rollup };
    const isValid =
      allowEmpty === true || Object.values(rollup).filter(isNil).length === 0;
    return { rollup, isValid };
  }, [allowEmpty, state.rollup, values]);

  // Helper method that returns all groups
  // which includes those from props & internal
  // state (groups created within the component)
  const getGroups = useCallback(() => {
    return dedupArray([
      ...Object.values(values).filter(isNil),
      ...(state?.newGroups ?? []),
      ...groups,
    ]);
  }, [groups, state.newGroups, values]);

  useEffect(() => {
    // If a handler callback has been provided we pass updates
    // up to the parent component.
    if (handleRollupUpdate) {
      const { rollup, isValid } = evaluateRollup();
      handleRollupUpdate(rollup, isValid);
    }
  }, [evaluateRollup, handleRollupUpdate]);

  /**
   * Helper method that returns an array of values
   * @returns {array} values
   * @example
   * [
   *   { name: "Payer", group: "Payer" },
   *   { name: "The Payer", group: "Payer" }
   * ]
   */
  const handleChange = useCallback(
    (domain, codomain) => {
      setState({ rollup: { ...state.rollup, [domain]: codomain } }, () => {
        // If this codomain is not found in the existing list of groups we
        // add it to our newGroups array in state.
        if (getGroups().indexOf(codomain) === -1) {
          setState({ newGroups: [...state.newGroups, codomain] });
        }

        if (handleRollupUpdate) {
          const { rollup, isValid } = evaluateRollup();
          const rollupKeys = Object.keys(rollup);

          // We only care to return changed values
          const cleanedRollup = Object.values(rollup).reduce(
            (newRollup, value, idx) => {
              return value === null
                ? newRollup
                : { ...newRollup, [rollupKeys[idx]]: value };
            },
            {},
          );

          handleRollupUpdate(cleanedRollup, isValid);
        }
      });
    },
    [
      evaluateRollup,
      getGroups,
      handleRollupUpdate,
      state.newGroups,
      state.rollup,
    ],
  );

  const getValues = () => {
    return Object.keys(props.values).map((key) => ({
      name: key,
      group: props.values[key],
    }));
  };

  const { errors = [] } = state;

  return (
    <div className='rollup'>
      {errors.map((error) => (
        <div key={`${error}`}>{error}</div>
      ))}
      {!debug ? null : (
        <div>
          <pre>{JSON.stringify(evaluateRollup(), null, 2)}</pre>
        </div>
      )}
      <Table>
        {noHeading === false && (
          <TableHead>
            <TableRow>
              <TableCell>{domainDescription}</TableCell>
              <TableCell>{codomainDescription}</TableCell>
            </TableRow>
          </TableHead>
        )}
        <TableBody>
          {getValues().map((value) => (
            <Group
              key={JSON.stringify(value)}
              codomainDescription={codomainDescription}
              groups={getGroups()}
              handleChange={handleChange}
              allowEmpty={allowEmpty}
              {...value}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

Rollup.propTypes = {
  classes: PropTypes.shape({
    container: PropTypes.string,
  }).isRequired,
  allowEmpty: PropTypes.bool,
  noHeading: PropTypes.bool,
  codomainDescription: PropTypes.string,
  domainDescription: PropTypes.string,
  groups: PropTypes.arrayOf(PropTypes.string),
  handleRollupUpdate: PropTypes.func.isRequired,
  values: PropTypes.shape({}),
  groupPlaceholder: PropTypes.string,
  debug: PropTypes.bool,
};

Rollup.defaultProps = {
  allowEmpty: false,
  noHeading: false,
  codomainDescription: 'Codomain',
  domainDescription: 'Domain',
  groups: [],
  values: {},
  groupPlaceholder: '',
  debug: false,
};

export default Rollup;
