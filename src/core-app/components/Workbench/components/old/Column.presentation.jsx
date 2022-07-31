// src/components/Workbench/components/Column.presentation.jsx

import React from 'react';
import { PropTypes } from 'prop-types';

import makeStyles from '@mui/styles/makeStyles';

import Dragger from '../../Dragger';
import Dropzone from '../../Dropzone';
import Group from './Group.presentation';
import EtlUnit from './EtlUnit/EtlUnit.container';
import { PALETTE_GROUP_ID } from '../../../constants/variables';

const useStyles = makeStyles({
  columnStyle: {
    float: 'left',
    height: '100%',
    marginRight: 20,
    width: 340,
  },
  poc: {
    height: '100%',
    width: '100%',
  },
  card: {
    paddingBottom: 20,
    '&:last-child': {},
  },
});

const Column = ({ config }) => {
  const { columnStyle } = useStyles();
  return (
    <div className={columnStyle}>
      <Dropzone config={config} isCombineEnabled>
        {config.children.map((child) => (
          <WorkbenchNode key={child.id} config={child} />
        ))}
      </Dropzone>
    </div>
  );
};
Column.propTypes = {
  config: PropTypes.shape({
    children: PropTypes.arrayOf(
      PropTypes.shape({ id: PropTypes.number.isRequired }),
    ),
  }).isRequired,
};

// // TODO: Tree can't seem to handle dropping a height-5 card on the height-2 canvas
// // also having overlapping dropzones is very wonky. Tabling in favor of more important tasks.
// // https://github.com/atlassian/react-beautiful-dnd/issues/1001
const PorC = ({ config }) => {
  const { poc } = useStyles();
  return (
    <div className={poc}>
      {config.children.map((child) => (
        <WorkbenchNode key={child.id} config={child} />
      ))}
    </div>
  );
};
PorC.propTypes = {
  config: PropTypes.shape({
    children: PropTypes.arrayOf(
      PropTypes.shape({ id: PropTypes.number.isRequired }),
    ),
  }).isRequired,
};

const DraggableGroup = ({ config }) => (
  <Dragger config={config}>
    <Group config={config} />
  </Dragger>
);
DraggableGroup.propTypes = {
  config: PropTypes.shape({}).isRequired,
};

const Card = ({ config }) => {
  const { card } = useStyles();
  const isInPaletteGroup = config.parent.id === PALETTE_GROUP_ID;
  return (
    <Dragger config={config} immutable={isInPaletteGroup}>
      <div className={card}>
        <EtlUnit config={config} />
      </div>
    </Dragger>
  );
};
Card.propTypes = {
  config: PropTypes.shape({
    parent: PropTypes.arrayOf(
      PropTypes.shape({ id: PropTypes.number.isRequired }),
    ),
  }).isRequired,
};

const CompByHeight = ({ config }) => {
  switch (config.height) {
    case 1:
      return <PorC config={config} />;
    case 2:
      return <Column config={config} />;
    case 3:
      return <Group config={config} />;
    case 4:
      return <Card config={config} />;
    default:
      return 'N/A';
  }
};

CompByHeight.propTypes = {
  config: PropTypes.shape({}).isRequired,
};

export const WorkbenchNode = ({ config /* aka column */ }) => {
  return !config ? null : (
    <>
      <CompByHeight config={config}>
        {config.children &&
          config.children.map((child) => (
            <WorkbenchNode key={child.id} config={child} />
          ))}
      </CompByHeight>
    </>
  );
};
WorkbenchNode.propTypes = {
  config: PropTypes.shape({
    children: PropTypes.arrayOf(
      PropTypes.shape({ id: PropTypes.number.isRequired }),
    ),
  }).isRequired,
};

export default Column;
