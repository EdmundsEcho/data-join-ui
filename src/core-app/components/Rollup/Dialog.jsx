import React from 'react';
import PropTypes from 'prop-types';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Rollup from './index';

/* eslint-disable react/destructuring-assignment */

class RollupDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rollup: {},
      isValid: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(rollup, isValid) {
    this.setState({ rollup, isValid });
  }

  handleCancel() {
    if (this.props.onCancel)
      this.props.onCancel(this.state.rollup, this.state.isValid);
  }

  handleSubmit() {
    if (this.props.onSubmit)
      this.props.onSubmit(this.state.rollup, this.state.isValid);
  }

  render() {
    const { isValid, rollup } = this.state;

    const {
      title,
      body,
      open,
      groups,
      values,
      debug,
      allowEmpty,
      domainDescription,
      codomainDescription,
      submitButtonText,
      cancelButtonText,
    } = this.props;

    return (
      <Dialog open={open}
        fullWidth
        onClose={this.handleCancel}
      >
          {title !== undefined && (
             <DialogTitle id='rollup-dialog'>{title}</DialogTitle>
           )}
        <DialogContent
          style={{ paddingBottom: groups.length + 90, overFlowY: 'scroll' }}
        >
          {body !== undefined && <div>{body}</div>}
          <Rollup
            values={values}
            groups={groups}
            handleRollupUpdate={this.handleChange}
            allowEmpty={allowEmpty}
            domainDescription={domainDescription}
            codomainDescription={codomainDescription}
          />
          {!debug ? null : (
            <div>
              <pre>{JSON.stringify(rollup, null, 2)}</pre>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleCancel}>{cancelButtonText}</Button>
          <Button
            color='secondary'
            disabled={isValid === false}
            onClick={this.handleSubmit}
          >
            {submitButtonText}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

RollupDialog.propTypes = {
  title: PropTypes.string,
  body: PropTypes.any,
  open: PropTypes.bool,
  groups: PropTypes.array,
  values: PropTypes.object,
  debug: PropTypes.bool,
  allowEmpty: PropTypes.bool,
  codomainDescription: PropTypes.string,
  domainDescription: PropTypes.string,
  submitButtonText: PropTypes.string,
  cancelButtonText: PropTypes.string,
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
};

RollupDialog.defaultProps = {
  open: false,
  values: [],
  groups: [],
  debug: false,
  allowEmpty: false,
  codomainDescription: 'Codomain',
  domainDescription: 'Domain',
  submitButtonText: 'Save',
  cancelButtonText: 'Cancel',
};

export default RollupDialog;
