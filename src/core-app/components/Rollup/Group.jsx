import React from 'react';
import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import AutoComplete from '../AutoSuggestText';

const Group = ({
  name,
  group,
  groups,
  allowEmpty,
  handleChange,
  codomainDescription,
}) => {
  return (
    <TableRow hover>
      <TableCell>{name}</TableCell>
      <TableCell>
        <AutoComplete
          allowEmpty={allowEmpty}
          suggestions={groups}
          suggestionTypeText={codomainDescription}
          onChange={(e) => handleChange(name, e)}
          defaultValue={group || ''}
        />
      </TableCell>
    </TableRow>
  );
};

Group.propTypes = {
  allowEmpty: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  group: PropTypes.string.isRequired,
  groups: PropTypes.arrayOf(PropTypes.string).isRequired,
  handleChange: PropTypes.func.isRequired,
  codomainDescription: PropTypes.string,
};
Group.defaultProps = {
  codomainDescription: undefined,
};

export default Group;
