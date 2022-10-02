import { PropTypes } from 'prop-types';
import clsx from 'clsx';
import { Link, Typography } from '@mui/material';

const Copyright = (props) => {
  return (
    <Typography
      variant='body2'
      color='text.secondary'
      align='center'
      {...props}>
      {'Copyright © '}
      <Link color='inherit' href='https://lucivia.com/'>
        Lucivia LLC
      </Link>{' '}
      {new Date().getFullYear()}
    </Typography>
  );
};

const Copyright2 = ({ className }) => {
  return (
    <div className={clsx('stack justify-content align-content', className)}>
      <Typography style={{ margin: 'auto' }} variant='subtitle1'>
        {`\u00A9 Copyright ${/\d{4}/.exec(Date())[0]} Lucivia LLC`}
      </Typography>
    </div>
  );
};
Copyright2.propTypes = {
  className: PropTypes.string,
};
Copyright2.defaultProps = {
  className: undefined,
};

export { Copyright, Copyright2 };
export default Copyright;
