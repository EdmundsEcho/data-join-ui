import React, { useEffect, useCallback } from 'react';

import PropTypes from 'prop-types';
import { useDispatch, useStore } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import clsx from 'clsx';

import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import CheckIcon from '@mui/icons-material/Check';
import Button from '@mui/material/Button';

// debugging
import { useClear } from '../hooks/use-persisted-state';
import { hideStepper } from '../ducks/actions/stepper.actions';

// public resources
import logo from '../assets/images/Logo.png';
// import logoL from '../assets/images/LogoL.png';
//
const SHOW_DEBUG_PANEL = false;

/* eslint-disable no-console, react/jsx-props-no-spreading */

/**
 * @component
 */
const Overview = (props) => {
  const dispatch = useDispatch();
  const clearUiState = useClear();

  const clearReduxState = useCallback(() => {
    dispatch({ type: 'RESET' });
    clearUiState();
  }, [clearUiState, dispatch]);

  return (
    <div style={{ margin: '30px' }}>
      <img src={logo} alt='Lucivia LLC' style={{ width: '140px' }} />
      <p>
        Thank you for taking the time to preview this exciting new product that
        promises to truly change the way data analysts spend their time.
      </p>
      <p>
        Authorization to view the content is permitted under the terms of a
        non-disclosure-agreement. If such an agreement has not been executed,
        you are not authorized to continue.
      </p>
      <p>
        All content presented herein falls under the terms of the
        non-disclosure-agreement.
      </p>
      <p>
        Finally, the data used to demonstrate the features of this application
        are randomly generated. No conclusions or inferences can be made
        accordingly.
      </p>
      <p />
      <Divider />
      <p />
      <Projects {...props} />
      <p />
      <div>
        <Button onClick={clearReduxState}>Clear</Button>
      </div>

      <Debugging hide={!SHOW_DEBUG_PANEL} />

      <Divider />
      <p />
      <CopyRight />
    </div>
  );
};

Overview.propTypes = {};

//-------------------------------------------------------------------------------
// Projects-related
//-------------------------------------------------------------------------------
const projects = [
  {
    id: 1,
    displayName: 'Project 1',
    progress: [0, 0, 0],
  },
  {
    id: 2,
    displayName: 'Project 2',
    progress: [1, 1, 1],
  },
  {
    id: 3,
    displayName: 'Project 3',
    progress: [1, 0, 0],
  },
];

function Projects(/* props tbd */) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const stepStrings = ['Data Sources', 'Stack Sources', 'Matrix'];

  const openProject = (project) => {
    navigate(`/campaigns/${project.id}/files`);
  };

  useEffect(() => {
    dispatch(hideStepper());
  }, [dispatch]);

  return (
    <>
      <Typography>Projects</Typography>
      <Table>
        <TableHead />
        <TableBody>
          {projects.map((project) => (
            <TableRow
              key={project.displayName}
              onClick={() => openProject(project)}
            >
              <TableCell style={{ width: '40%' }}>
                {project.displayName}
              </TableCell>
              {project.progress.map((progress, idx) => (
                <TableCell key={`progress-${project.id}-${idx}`}>
                  <Grid container className='Luci-Overview-step'>
                    <StepIcon
                      className='stepIcon'
                      isSet={Boolean(progress)}
                      num={idx + 1}
                    />
                    <Grid item>{stepStrings[idx]}</Grid>
                  </Grid>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
Projects.propTypes = {};

function StepIcon({ className, num, isSet }) {
  return isSet ? (
    <Grid item container className={clsx(className, 'done')}>
      <CheckIcon />
    </Grid>
  ) : (
    <Grid item container className={clsx(className, 'todo')}>
      <Typography>{num}</Typography>
    </Grid>
  );
}
StepIcon.propTypes = {
  className: PropTypes.string.isRequired,
  num: PropTypes.number.isRequired,
  isSet: PropTypes.bool.isRequired,
};

function Debugging({ hide }) {
  // debugging
  const store = useStore();

  const printStore = () => {
    console.debug(JSON.stringify(store.getState()));
  };

  // clear ui recorded state
  const clear = useClear();

  const clearUiState = () => {
    console.debug(`Clearing ui state`);
    clear();
  };
  const printEnv = () => console.dir(process.env);

  return hide ? null : (
    <div
      style={{ display: 'flex', justifyContent: 'center', fontSize: '12px' }}
    >
      <div>
        <Button onClick={printStore}>Print State To Console</Button>
      </div>
      <div>
        <Button onClick={clearUiState}>Clear UI State</Button>
      </div>
      <div>
        <Button onClick={printEnv}>Print CRA env</Button>
      </div>
    </div>
  );
}

Debugging.propTypes = {
  hide: PropTypes.bool,
};
Debugging.defaultProps = {
  hide: false,
};
function CopyRight() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        justifyContent: 'center',
        alignContent: 'center',
        margin: '30px',
      }}
    >
      <Typography style={{ margin: 'auto' }} variant='subtitle1'>
        {`\u00A9 Copyright ${/\d{4}/.exec(Date())[0]} Lucivia LLC`}
      </Typography>
    </div>
  );
}
export default Overview;
