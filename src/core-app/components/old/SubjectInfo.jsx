// src/components/FileDialog/components/SubjectInfo.jsx

/**
 * @module old/components/FileDialog/component
 *
 * @description
 * Not sure how active this component is.
 *
 */
import React from 'react';
import PropTypes from 'prop-types';

import TextField from '@mui/material/TextField';
// import styled from 'styled-components';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

import HeadingBox from '../shared/HeadingBox';
import LevelsView from '../LevelsView/index.container';

/**
 * @component
 *
 * @category Old
 *
 */
const SpecialtyInfo = ({ field }) => {
  return (
    <div>
      <HeadingBox heading='Format' width='300'>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell style={{ border: 'none' }}>
                <Typography>In</Typography>
              </TableCell>
              <TableCell style={{ border: 'none' }}>
                <TextField value='' />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell style={{ border: 'none' }}>
                <Typography>Out</Typography>
              </TableCell>
              <TableCell style={{ border: 'none' }}>
                <TextField value='' />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </HeadingBox>
      <HeadingBox heading='Sample' width='300'>
        <div style={{ overflowY: 'scroll', height: 200, paddingRight: 20 }}>
          <LevelsView levels={field.levels.slice(0, 100)} />
        </div>
      </HeadingBox>
    </div>
  );
};

SpecialtyInfo.propTypes = {
  field: PropTypes.shape({
    levels: PropTypes.array(),
  }).isRequired,
};
export default SpecialtyInfo;
