// src/components/Workbench/components/EtlUnit/DerivedFieldConfig.jsx

import React, { useCallback } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import PropTypes from 'prop-types';
import clsx from 'clsx';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import SelectMenu from '../../../shared/SelectMenu';

// 📖 supported derived fields
import { derivedFields } from '../../../../lib/obsEtlToMatrix/derived-field-requests';
import { addDerivedField } from '../../../../ducks/actions/workbench.actions';
import { selectMaybeDerivedFieldConfig as selectConfig } from '../../../../ducks/rootSelectors';

/**
 * @component
 */
function DerivedFieldConfig({ nodeId, children }) {
  // const field = derivedFields.decile;
  const menuOptions = Object.values(derivedFields).map(({ menuItem, id }) => ({
    value: id,
    option: menuItem,
  }));

  const dispatch = useDispatch();

  // minimum required to pull the config from derivedFields
  const configName = useSelector(
    (state) => selectConfig(state, nodeId),
    shallowEqual,
  );

  const handleChange = useCallback(
    ({ target: { value } }) => {
      dispatch(
        addDerivedField({
          identifier: value,
          id: nodeId,
        }),
      );
    },
    [dispatch, nodeId],
  );

  return (
    <Grid container className={clsx('Luci-Workbench-Instructions')}>
      <Grid item xs={4}>
        <SelectMenu
          options={menuOptions}
          name='function'
          value={configName}
          label='function'
          placeholder='function'
          onChange={handleChange}
          className='derivedField'
        />
      </Grid>
      <Grid item xs={7}>
        <Typography display='inline'>
          {derivedFields[configName]?.meta.instructions ||
            derivedFields.meta.instructions}
        </Typography>
      </Grid>
      {children}
    </Grid>
  );
}
DerivedFieldConfig.propTypes = {
  nodeId: PropTypes.number.isRequired,
  children: PropTypes.node,
};
DerivedFieldConfig.defaultProps = { children: null };

export default DerivedFieldConfig;
