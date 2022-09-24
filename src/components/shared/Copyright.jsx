import { Link, Typography } from '@mui/material';

export const Copyright = (props) => {
  return (
    <Typography
      variant='body2'
      color='text.secondary'
      align='center'
      sx={{ pt: 4 }}
      {...props}>
      {'Copyright © '}
      <Link color='inherit' href='https://lucivia.com/'>
        Lucivia LLC
      </Link>{' '}
      {new Date().getFullYear()}
    </Typography>
  );
};

export default Copyright;
