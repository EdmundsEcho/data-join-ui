import React from 'react';

import makeStyles from '@mui/styles/makeStyles';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import MoreVert from '@mui/icons-material/MoreVert';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { WorkbenchNode } from './Column.presentation';

import Dropzone from '../../Dropzone';
import MoreMenu from '../../Menu.presentation';

import { PALETTE_GROUP_ID } from '../../../constants/variables';

const useStyles = makeStyles({
  group: ({ show }) =>
    show
      ? {
          background: '#EEE',
          border: '1px dashed #999',
          marginBottom: 20,
          padding: 10,
          width: '100%',
          boxSizing: 'border-box',
        }
      : {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
          margin: 0,
        },
  title: ({ show }) =>
    show
      ? {
          padding: '5px 5px 0 5px',
        }
      : {
          display: 'none',
        },
  content: ({ show }) =>
    show
      ? {
          padding: 0,
        }
      : {
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
          padding: 0,
        },
});

const Group = ({ config }) => {
  const numChildren = config.children.length;
  const inPaletteGroup = config.id === PALETTE_GROUP_ID;
  const show = numChildren > 0 && inPaletteGroup === false;

  const { group, title, content } = useStyles({ show });

  const menuOptions = ['Remove Group'];

  const handleMenuItemClick = (data, index) => {
    console.log('group', data, index);
  };

  return (
    <Card className={group}>
      {show && (
        <CardHeader
          className={title}
          title={`Group${config.id}`}
          action={
            <MoreMenu options={menuOptions} onItemClick={handleMenuItemClick}>
              {(handleOnClick) => (
                <IconButton onClick={handleOnClick} size="large">
                  <MoreVert />
                </IconButton>
              )}
            </MoreMenu>
          }
        />
      )}
      <CardContent className={content}>
        <div>
          <Dropzone config={config} isCombineEnabled={inPaletteGroup === false}>
            {config.children &&
              config.children.map((child) => (
                // 🦀 ref cycle
                <WorkbenchNode key={child.id} config={child} />
              ))}
          </Dropzone>
        </div>
      </CardContent>
      <div>
        <Select fullWidth defaultValue='none'>
          <MenuItem value='none' />
          <MenuItem value='decile'>Decile</MenuItem>
          <MenuItem value='propensity'>Propensity Score</MenuItem>
        </Select>
      </div>
    </Card>
  );
};

export default Group;
