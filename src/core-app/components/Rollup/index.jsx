/**
 * @module src/component/Rollup
 * @todo Should append codomains found in initial domain object
 */
import React from 'react';
import PropTypes from 'prop-types';

import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import withStyles from '@mui/styles/withStyles';

import Group from './Group';

import { dedupArray } from '../../utils/common';

/* eslint-disable react/destructuring-assignment */

const styles = {
  container: {
    backgroundColor: '#FFF',
  },
};

const isNil = (v) => !(typeof v === 'undefined' || v === null);

/**
 * Rollup
 * @returns {object} rollup `{value1: group1, value2: group1, value3: group2}`
 */
class Rollup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rollup: {},
      errors: [],
      newGroups: [],
    };

    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    // If a handler callback has been provided we pass updates
    // up to the parent component.
    if (this.props.handleRollupUpdate) {
      const { rollup, isValid } = this.evaluateRollup();
      this.props.handleRollupUpdate(rollup, isValid);
    }
  }

  /**
   * Helper method that returns an array of values
   * @returns {array} values
   * @example
   * [
   *   { name: "Payer", group: "Payer" },
   *   { name: "The Payer", group: "Payer" }
   * ]
   */
  getValues() {
    return Object.keys(this.props.values).map((key) => ({
      name: key,
      group: this.props.values[key],
    }));
  }

  // Helper method that returns all groups
  // which includes those from props & internal
  // state (groups created within the component)
  getGroups() {
    return dedupArray([
      ...Object.values(this.props.values).filter(isNil),
      ...this.state.newGroups,
      ...this.props.groups,
    ]);
  }

  /**
   * evaluateRollup
   * @description
   * This method takes the original values input
   * and overrides whatever has been added to the
   * local rollup object
   */
  evaluateRollup() {
    const rollup = { ...this.props.values, ...this.state.rollup };
    const isValid =
      this.props.allowEmpty === true ||
      Object.values(rollup).filter(isNil).length === 0;
    return { rollup, isValid };
  }

  handleChange(domain, codomain) {
    this.setState(
      { rollup: { ...this.state.rollup, [domain]: codomain } },
      () => {
        // If this codomain is not found in the existing list of groups we
        // add it to our newGroups array in state.
        if (this.getGroups().indexOf(codomain) === -1) {
          this.setState({ newGroups: [...this.state.newGroups, codomain] });
        }

        if (this.props.handleRollupUpdate) {
          const { rollup, isValid } = this.evaluateRollup();
          const rollupKeys = Object.keys(rollup);

          // We only care to return changed values
          const cleanedRollup = Object.values(rollup).reduce(
            (rollup, value, idx) => {
              return value === null
                ? rollup
                : { ...rollup, [rollupKeys[idx]]: value };
            },
            {},
          );

          this.props.handleRollupUpdate(cleanedRollup, isValid);
        }
      },
    );
  }

  render() {
    const {
      allowEmpty,
      noHeading,
      classes,
      codomainDescription,
      debug,
      domainDescription,
    } = this.props;

    const { errors } = this.state;

    return (
      <div className={classes.container}>
        {errors.map((error, idx) => (
          <div key={idx}>{error}</div>
        ))}
        {!debug ? null : (
          <div>
            <pre>{JSON.stringify(this.evaluateRollup(), null, 2)}</pre>
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
            {this.getValues().map((value, idx) => (
              <Group
                key={idx}
                codomainDescription={codomainDescription}
                groups={this.getGroups()}
                handleChange={this.handleChange}
                allowEmpty={allowEmpty}
                {...value}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
}

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
};

Rollup.defaultProps = {
  allowEmpty: false,
  noHeading: false,
  codomainDescription: 'Codomain',
  domainDescription: 'Domain',
  groups: [],
  values: {},
  groupPlaceholder: '',
};

export default withStyles(styles)(Rollup);
