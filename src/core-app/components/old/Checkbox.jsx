import React from 'react';
import CheckboxMui from '@mui/material/Checkbox';
import { createTheme, ThemeProvider, StyledEngineProvider, adaptV4Theme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import { orange } from '@mui/material/colors';

const useStyles = makeStyles((theme) => ({
  root: {
    color: theme.danger,
    '&$checked': {
      color: theme.danger,
    },
  },
  checked: {
    color: theme.danger,
  },
}));

function Checkbox() {
  const classes = useStyles();

  return (
    <CheckboxMui
      classes={{
        root: classes.root,
        checked: classes.checked,
      }}
    />
  );
}

const theme = createTheme(adaptV4Theme({
  status: {
    danger: orange[500],
  },
}));

export default function CustomStyles() {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <Checkbox />
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
