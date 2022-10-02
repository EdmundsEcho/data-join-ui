import React from 'react';
import PropTypes from 'prop-types';

import { useSelector, shallowEqual } from 'react-redux';

import clsx from 'clsx';

import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import {
  selectMaybeNodeSeed,
  getAmIDropDisabled,
} from '../../../ducks/rootSelectors';

import DropZone from '../../DropZone';
import Dragger from '../../Dragger';

import EtlUnit from './EtlUnit/EtlUnit';
import EtlUnitGroup from './EtlUnit/EtlUnitGroup';
import { InvalidStateError } from '../../../lib/LuciErrors';

import { NODE_TYPES } from '../../../lib/sum-types';
import markdownFile from '../../../../assets/markdown/workbench-instructions.md';
import useMarkdown from '../../../../hooks/use-markdown';

function parentIndex(paletteOrCanvas, height) {
  return paletteOrCanvas === 'palette' && height === 4;
}
/**
 * Children of a droppable memoized to prevent re-render
 * when a dragged component collides with it.
 *
 * 🔑 Setting of the draggable index using either what was
 *    provided by map, or the parent happens here.
 *    Node only ever uses index to set the draggable props.
 *
 * 🔖 This means we loose the ref to the index value when the
 *    parentIndex is chosen.
 *
 */
const RenderChildren = ({
  childIds,
  type,
  height,
  parentIndex: parentIndexProp,
}) => {
  return childIds.map((childId, index) => (
    <Node
      key={`node-${childId}`}
      id={childId}
      type={type}
      index={parentIndex(type, height) ? parentIndexProp : index}
      parentIndex={index} // the next node is a parent
    />
  ));
};
RenderChildren.propTypes = {
  childIds: PropTypes.arrayOf(PropTypes.number),
  type: PropTypes.oneOf(['palette', 'canvas']).isRequired,
  height: PropTypes.number.isRequired,
  parentIndex: PropTypes.number,
};
RenderChildren.defaultProps = {
  parentIndex: undefined,
  childIds: [],
};

/**
 *
 *  dnd events accomplish the following:
 *
 *      Tree, dnd event -> Tree
 *
 * @component
 *
 */
function Node(props) {
  const {
    id,
    type: paletteOrCanvas,
    direction,
    index,
    parentIndex: parentIndexProp,
  } = props;

  // debugging tool, override = true turns it on (otherwise env)
  // useTraceUpdate(props, { override: false, tag: `${id}` });

  // 📖
  // use shallowEqual to avoid re-render when values remain the same
  const {
    height,
    childIds = [],
    // etlUnitType,
    groupType,
  } = useSelector((state) => selectMaybeNodeSeed(state, id), shallowEqual) || {
    height: null,
    childIds: [],
    // etlUnitType: null,
    groupType: null,
  };

  const isReadyToDisplay = height !== null;

  const moveOrCopy = paletteOrCanvas === NODE_TYPES.PALETTE ? 'COPY' : 'MOVE';

  // the next line is deprecated to prevent re-rendering; use getAmIDropDisabled
  // const nowDragging = useSelector(getDraggedId, shallowEqual);
  //
  const isDropDisabled = useSelector((state) => getAmIDropDisabled(state, id));

  // 💫 increment the height value
  const renderChildren = (
    <RenderChildren
      childIds={childIds}
      type={paletteOrCanvas}
      height={height + 1}
      parentIndex={parentIndexProp}
    />
  );

  switch (true) {
    case !isReadyToDisplay:
      return <Typography>Waiting for data...</Typography>;

    // skip group component for palette (go direct to children)
    case height === 3 && paletteOrCanvas === NODE_TYPES.PALETTE:
      return renderChildren;

    case height === 4: // leaf aka unit
      return (
        <Dragger
          key={`dragger-${id}`}
          className={clsx('Node-root', 'unit', 'dragger', paletteOrCanvas)}
          config={{
            id: `${id}`,
            index,
            height,
            type: 'leaf',
            context: paletteOrCanvas,
          }}
          moveOrCopy={moveOrCopy}>
          <EtlUnit
            className={clsx('Node-inner', 'unit', paletteOrCanvas)}
            context={paletteOrCanvas}
            nodeId={id}
          />
        </Dragger>
      );
    case height === 3: // group
      return (
        <Dragger
          key={`dragger-${id}`}
          className={clsx('Node-root', 'group', 'dragger', paletteOrCanvas)}
          config={{
            id: `${id}`,
            index,
            height,
            type: 'group',
            context: paletteOrCanvas,
          }}
          moveOrCopy={moveOrCopy}>
          <EtlUnitGroup
            context={paletteOrCanvas}
            className={clsx('Node-inner', 'group', paletteOrCanvas)}
            config={{
              type: groupType,
              nodeId: id,
            }}>
            <DropZone
              key={`drop-zone-${id}`}
              config={{
                id: `${id}`,
                height,
                type: 'group',
                context: paletteOrCanvas,
              }}
              droppableId={`${id}`}
              direction={direction}
              isDropDisabled={isDropDisabled}>
              {/* Draggable children */}
              {childIds?.length === 0 ? (
                <Typography>Drop zone</Typography>
              ) : (
                renderChildren
              )}
            </DropZone>
          </EtlUnitGroup>
        </Dragger>
      );

    // 🔖 FYI - first entry point for Palette
    // 🔖 superGroup starts by rendering Node-inner.
    //    This is because superGroup nodes are initiated outside of
    //    this recursive Node component.
    case height === 2: // superGroup
      return (
        <Card
          key={`node-card-${id}`}
          className={clsx('Node-inner', 'superGroup', paletteOrCanvas)}>
          <DropZone
            key={`drop-zone-${id}`}
            config={{
              id: `${id}`,
              height,
              type: 'superGroup',
              context: paletteOrCanvas,
            }}
            droppableId={`${id}`}
            direction={direction}
            isDropDisabled={isDropDisabled}
            isCombineEnabled>
            {/* Draggable children */}
            {childIds?.length === 0
              ? index === 2 && <Instructions />
              : renderChildren}
          </DropZone>
        </Card>
      );
    default:
      throw new InvalidStateError(`Unreachable state in the Node module.`);
  }
}

function Instructions() {
  const markdown = useMarkdown({ markdownFile });
  return (
    <div className='workbench markdown instructions'>
      <ReactMarkdown source={markdown} remarkPlugins={[remarkGfm]}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}

Node.propTypes = {
  id: PropTypes.number.isRequired,
  type: PropTypes.oneOf(Object.values(NODE_TYPES)).isRequired,
  direction: PropTypes.oneOf(['vertical', 'horizonta']),
  dragHandleProps: PropTypes.shape({}),
  index: PropTypes.number,
  parentIndex: PropTypes.number,
};
Node.defaultProps = {
  direction: 'vertical',
  dragHandleProps: undefined,
  index: undefined,
  parentIndex: undefined,
};

// 🔧
Node.whyDidYouRender = true;
Node.displayName = 'Node';

export default React.memo(Node);
