/**
 * Wrap a component with a label
 * Generally used for inputs
 *
 * @component
 */

import { Box } from '@mui/material';
import PropTypes from 'prop-types';

//
// ⬜ avoid using Box sx; create a className instead
//
export const WithLabel = (props) => {
  const { label, description, children: child } = props;
  return (
    <Box sx={{ mt: 3, mb: 3 }}>
      {label && (
        <div>
          <b>{label}</b>
        </div>
      )}
      {description && <div>{description}</div>}
      <Box className='input-row-group'>{child}</Box>
    </Box>
  );
};

WithLabel.propTypes = {
  label: PropTypes.string,
  description: PropTypes.string,
  children: PropTypes.element.isRequired,
};

export default WithLabel;
