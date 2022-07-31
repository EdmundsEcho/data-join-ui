import { withStyles } from '@material-ui/core/styles';

const GlobalCss = withStyles({
  '@global': {
    '.MuiButton-root': {
      fontSize: '1rem',
    },
  },
})(() => null);

export default GlobalCss;
