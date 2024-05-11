// src/lib/obsEtlToMatrix/tree.js

/**
 * @module lib/obsEtlToMatrix/tree
 *
 * @description
 * Data structure to support the Workbench.  However, is a generic construct that
 * should not be aware of the leaves it is organizing.
 *
 * Move Types:
 *
 *    👉 Copy - from Palette -> Canvas; the source state remains unchanged
 *    👉 Move - drag and drop within the same node type (canvas | palette)
 *    👉 Delete source - Canvas -> Palette
 *
 * Each node may have a payload using the `data` property. As such,
 *    * A node's distance from the root determines the compatability of each node.
 *    * A payload might represent
 *       * a display value for `react`
 *       * how to render the node in `react`
 *       * how to combine the children (~AST), monoidal operation
 *       * how to compute a derived field
 *
 * Generally, I am avoiding having to use the `new` keyword... a stylistic
 * choice to avoid a potential pain point for JS.
 *
 * Usage: createTree is used once to create a root node.
 * Additional nodes are created from that first node.
 *
 */
import { createQueue } from './queue';
import { NODE_TYPES, ETL_UNIT_TYPES, PURPOSE_TYPES } from '../sum-types'; // move fn?
import { WorkbenchError, InvalidTreeStateError } from '../LuciErrors';
import { range } from '../../utils/common';

/* eslint-disable no-shadow,no-console */

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
// initial data values (something to go into a configuration)
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
/**
 * ⬜
 *
 * 🚧 Data is essentially external to the tree structure.  These functions
 *    and transforming the data value should be encapsulated accordingly;
 *    external/separate from the tree.
 *
 *  The group type starts off as a 'shell' when in the palette context.
 *
 *       qualOrComp -> group.data
 *
 * @param {Object} qualOrComp
 * @return {Object}
 */
function groupNodeData(qualOrMea) {
  return groupFromQualOrMea(qualOrMea, 'palette');
}
/**
 *       leaf.data -> group.data
 *
 * @param {Object} qualOrComp
 * @return {Object}
 */
function groupFromLeaf({ type, value: qualOrMea = null }) {
  return type === 'group'
    ? { type: 'superGroup' }
    : groupFromQualOrMea(qualOrMea, 'leaf extension');
}

function groupFromQualOrMea(qualOrMea, source) {
  return {
    source,
    type: 'group',
    etlUnitType: etlUnitType(qualOrMea),
    displayType: qualOrMea?.qualityName ? 'subjectUniverse' : 'empty',
    groupTag: qualOrMea?.qualityName || qualOrMea?.measurementType,
  };
}
//------------------------------------------------------------------------------
/**
 *       qualOrComp -> leaf.data
 *
 * @param {Object} qualOrComp
 * @return {Object}
 */
function etlUnitNodeData(qualOrMea) {
  return {
    type: etlUnitType(qualOrMea),
    value: qualOrMea,
  };
}

function etlUnitType(qualOrMea) {
  return qualOrMea?.qualityName
    ? ETL_UNIT_TYPES[PURPOSE_TYPES.QUALITY]
    : ETL_UNIT_TYPES[PURPOSE_TYPES.MVALUE];
}
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
/**
 * @class Tree
 * @description
 * A class to organize the static functions that operation on a `node`.
 *
 * The intent is to use this class to reduce the size of the tree nodes that do
 * host state, and are replicated with each node. This is accomplished by
 * moving the function from the node's closure to here.
 *
 * The only "gotcha" is that this can confuse the private vs public interface.
 *
 *
 * 🔖 Notes
 * * The local state is not utilized.
 * * The constructor is not utilized.
 *
 */
export class Tree {
  /**
   * empty instance of a tree
   */
  static EMPTY = {
    nodeCount: 0,
    parent: null,
    index: null,
    height: 0,
    type: NODE_TYPES.EMPTY,
    info: 'empty',
  };

  /**
   * @description
   * Functor using depth first traversal.<br>
   * Implementation of Functor that points to the data within the Tree
   * structure whilst moving through all of the values within the collection.
   */
  static fmap(fn, node) {
    /* eslint-disable no-param-reassign */
    node.data = fn(node.data); // fn application

    if (node.hasChildren()) {
      node.children.forEach((child) => {
        Tree.fmap(fn, child);
      });
    }
    /* eslint-enable no-param-reassign */

    return node.root;
  }

  /**
   * Displays the tree structure.
   * (depth-first per the default iterator)
   *
   */
  static print(node, printer = (x) => x.info || 'no-dislay') {
    return [...node].reduce((acc, node) => {
      const display = printer(node);
      return acc === ''
        ? `${' '.repeat(node.height * 2)}${display}`
        : `${acc}\n${' '.repeat(node.height * 2)}${display}`;
    }, '');
  }

  /**
   *
   * 📌 Dnd event-driven mutation
   *
   * In the event removeNode is called (during a MOVE), the
   * branch will be trimmed to height = 1.
   *
   * @function
   * @param {Tree} tree Tree state
   * @param {Object} input
   * @param {Object} input.event dnd event data
   * @param {('MOVE'|'COPY')='COPY'} input.moveOrCopy
   * @param {boolean=false} input.DEBUG toggle
   * @return {Tree} pointing to the destination node
   *
   */
  static moveNode(tree, { event, dataMaker, DEBUG = false }) {
    // align the uid generator with the node count
    getIdGenerator().setIdWithMaxId(tree.maxId);

    //--------------------------------------------------------------------------
    // redirect non-DND events
    if (event?.type !== 'DND') {
      throw new WorkbenchError(`Tried to move a node without a DND event`);
    }
    //--------------------------------------------------------------------------

    if (DEBUG) {
      console.group(`1️⃣  moveNode tree in response to the dnd event`);
      console.debug(event);
      console.debug(tree.nodeCount);
      console.debug(Tree.print(tree));
    }

    const {
      draggableId: draggedNode,
      sourceId: sourceNode,
      destinationId: destinationNode,
    } = Tree._getNodes(tree, getNodeIdsFromEvent(event), DEBUG);
    const { moveOrCopy } = event;

    const pos = event.destination.index;

    if (DEBUG) {
      console.debug(`2️⃣  _getNodes`);
      console.debug(`source: ${sourceNode.info}`);
      console.debug(`destination: ${destinationNode.info}`);
      console.debug(`dragged node: ${draggedNode.info}`);
    }

    // compare heights of draggable with destination children (root height = 0)
    const draggedHeight = draggedNode.height;
    const toNodeHeight = destinationNode.height;

    // Return ref to node
    let ref = null;

    // 🔖 See this as a list of predicates; should be something that can be
    //    configured (eventually and to separate generic vs custom behavior)
    //
    switch (true) {
      // reject moves of items outside the bounds of the tree
      case draggedHeight + 1 > tree.root.treeHeight ||
        toNodeHeight + 1 > tree.root.treeHeight:
        throw new InvalidTreeStateError(
          `The destination ${toNodeHeight} or dragged node height (${draggedHeight}) is higher than the tree (${tree.height})`,
        );

      // source and destination are one in the same, do nothing
      case draggedNode.id === destinationNode.id:
        ref = destinationNode;
        break;

      // source or destination is root; do nothing
      // destination is a leaf: do nothing
      case sourceNode.id === 0 || destinationNode.id === 0:
      case toNodeHeight + 1 === tree.treeHeight: // adjusted for zero-based index
        console.warn(`⛔ The destination node is a leaf node`);
        ref = destinationNode;
        break;

      // move from CANVAS -> PALETTE; delete node
      case sourceNode.type === NODE_TYPES.CANVAS &&
        destinationNode.type === NODE_TYPES.PALETTE:
        if (DEBUG) {
          console.debug(`🗑️  Soure node ${draggedNode.id} removed`);
        }
        ref = draggedNode.parent.removeNode(draggedNode);
        break;

      // move Leaf -> Group; same children; zero gap
      // move Leaf -> SuperGroup; gap 1
      // fill the gap if exists, and append
      case draggedHeight >= toNodeHeight + 1: {
        const gap = draggedHeight - (toNodeHeight + 1); /* children of destination */

        if (DEBUG) {
          console.debug(
            `👎 Dragged (${draggedHeight}) is lower; fill gap: ${gap}; join to destination (${toNodeHeight})`,
          );
        }

        console.assert(gap >= 0, `The gap logic is flawed`);

        ref = destinationNode;
        destinationNode
          // ⬜ extend functionality to larger gap (low priority but FYI)
          .extendN(gap === 1 ? [groupFromLeaf(draggedNode.data)] : gap)
          .insertNode(draggedNode, { pos, moveOrCopy, dataMaker, DEBUG });

        break;
      }

      // 🔖 DND syntesized event using combine limited to Group -> Group
      // move SuperGroup -> Group, Leaf -> Group | SuperGroup
      // find the children in the draggedNode to be appended to the destination
      //
      // 🔑 Grab the data from the draggableId to create an alias of sorts
      //    in the leaf position: makeData :: GroupData -> LeafData
      //
      // 🔑 When draggedId == dataMaker source, call the
      //    Group -> Leaf data maker
      //
      // 🔑 A new node now depends on a node *outside* of the primary
      //    tree structure.  Introduce a new listener to link leaf/alias with
      //    group state.
      //
      case draggedHeight < toNodeHeight + 1: {
        if (DEBUG) {
          console.debug(
            `👍 Dragged (${draggedHeight}) is higher than destination (${toNodeHeight})`,
          );
        }
        // retrieve the nodes from the draggable that are the same height
        // as the destination
        ref = Tree.findNodes(
          draggedNode,
          (draggedChild) => draggedChild.height === toNodeHeight + 1,
        ).reduce((destination, draggedChild, idx) => {
          const gap = draggedChild.height - (destination.height + 1);
          console.assert(
            gap === 0,
            'dragged children are not compatible with the destination node',
          );
          const newId = getIdGenerator().nextId();

          draggedNode.listeners.push(newId);
          draggedNode.listeners = [...new Set(draggedNode.listeners)];

          const configNewNode = {
            id: newId,
            pos: pos + idx,
            moveOrCopy,
            DEBUG,
          };

          draggedNode.id === dataMaker.source
            ? (configNewNode.data = dataMaker.maker(draggedNode.data))
            : (configNewNode.dataMaker = dataMaker);

          /* eslint-disable-next-line no-param-reassign */
          destination = destination.insertNode(draggedChild, configNewNode);
          return destination;
        }, destinationNode);

        break;
      }
      default:
    }

    if (DEBUG) {
      console.debug(`3️⃣  new destination node`);
      console.debug(Tree.print(ref));
      console.debug(`👉 Resulting tree`);
      console.debug(Tree.print(ref.root));
      console.groupEnd();
    }

    return ref;
  }

  static removeNode(tree, { type, nodeId }) {
    if (type !== 'remove') {
      throw new WorkbenchError(
        `Tried to call removeNode with the wrong event type: ${type}`,
      );
    }
    // local
    const findNode = (nodeId) =>
      Tree.findNodes(tree, (node) => node.id === nodeId)?.[0] ?? null;

    const nodeToRemove = findNode(nodeId);

    const listenerSet = [...new Set(nodeToRemove.listeners)];
    // cascade to listeners
    listenerSet.forEach((listenerId) => {
      const maybeRemove = findNode(listenerId);
      if (maybeRemove !== null) {
        maybeRemove.parent.removeNode(maybeRemove);
      }
    });

    // when the removed node is an alias
    if (typeof nodeToRemove.data?.source === 'number') {
      // update the listeners prop belonging to source id
      const updateSourceListeners = findNode(nodeToRemove.data.source);
      updateSourceListeners.listeners = updateSourceListeners.listeners.filter(
        (listenerId) => listenerId !== nodeId,
      );
    }

    // return ref to primary
    return nodeToRemove.parent.removeNode(nodeToRemove);
  }

  /**
   * Set the type of the node following a move
   *
   * The dominant type is that of the node that becomes the parent; `tree.type`.
   * Order of priority:
   *
   *    1. parent when parent is not root
   *    2. node.type when specified
   *    3. 'canvas'
   *
   * @function
   * @param {Tree} parent provides the type when not the root
   * @param {Tree} node subject of the computation
   * @param {('root'|'canvas'|'palette')} defaultValue
   * @return {NodeType}
   */
  static deriveNodeType(parent, node, configType = undefined) {
    switch (true) {
      case parent === Tree.EMPTY && node === Tree.EMPTY:
        return NODE_TYPES.ROOT;

      case !parent.isRoot && parent.type !== Tree.EMPTY:
        return parent.type;

      case parent.isRoot && typeof node.type !== 'undefined' && node !== Tree.EMPTY:
        return node.type;

      case typeof configType !== 'undefined':
        return configType;

      default:
        console.error(
          `parent type: ${parent.type} node type: ${node.type} configType: ${configType}`,
        );
        throw new WorkbenchError(
          `Something went wrong when setting the node type: ${parent.type} node: ${
            node?.type || 'no node type'
          }`,
        );
    }
  }

  /**
   * a utility function to support retrieving multiple nodes
   *
   * @function
   * @param {Tree} tree
   * @param {Object} reqNodes requested nodes
   * @return {Object} draggedNode, sourceNode, destinationNode,
   *
   * @private
   *
   */
  static _getNodes(tree, reqNodes, DEBUG = false) {
    const nodes = Tree.findNodes(tree, (node) =>
      [...Object.values(reqNodes)].includes(node.id),
    );
    if (DEBUG) {
      console.debug(`👉 _getNodes`);
      console.debug(reqNodes);
    }

    return Object.entries(reqNodes).reduce(
      /* eslint-disable no-param-reassign */
      (reqNodes, [key, value]) => {
        reqNodes[key] = Object.values(nodes).find((node) => node.id === value);
        return reqNodes;
      },
      {},
    );
  }

  /**
   * Return an Array of Nodes.
   *
   * 🔑 The nodes may come several nodes; thus it can involve
   *
   *       [[]] -> []
   *
   * Utilizes filter, a reducer.
   * Filter is a curried function first takes a predicate to return a function.
   * The returned function appends values to an Array using the predicate.
   *
   *       fn :: [Node] -> Tree -> [Node]
   *
   * @function
   * @param {Tree} tree
   * @param {Object} predicate
   * @return {Array<Node>}
   */
  static findNodes(tree, predicate = (id) => id) {
    const filter =
      (predicate) =>
      (acc = [], value) => {
        if (predicate(value)) {
          acc.push(value);
        }
        return acc;
      };

    return Tree.foldl(filter(predicate), [], Tree.traverseDF(tree));
  }

  /**
   * A *depth first* node generator to enable iteration using `foldl`.
   * Note: Anything that references this function becomes a `generator object`.
   * `yield*` is a reserved syntax for calling other generators (including
   * recursively) *without* generating a `generator object`.
   * @function
   * @param {Tree} tree
   * @return {Iterator}
   */
  static *traverseDF(tree) {
    yield tree; // yield a tree, before iterating some some
    for (let i = 0; i < tree.children.length; i += 1) {
      yield* Tree.traverseDF(tree.children[i]);
    }
  }

  /**
   * A *breadth first* node generator.
   *
   * @function
   * @param {Tree} tree
   * @return {Iterator}
   */
  static *traverseBF(node) {
    const q = createQueue();
    q.enqueue(node.root);
    let currentNode = q.dequeue();

    while (currentNode) {
      if (currentNode.children) {
        currentNode.children.map((childNode) => q.enqueue(childNode));
      }
      yield currentNode;
      currentNode = q.dequeue();
    }
  }

  /**
   * Universal reducing function. It consumes an iterator.
   * When used in combination with `newBranch` will make a copy.
   * `foldl :: (a -> b -> a) -> b -> t b -> a`
   * `where t :: traversable`
   *
   * @function
   * @param {Object} fn
   * @param {Array<Node>} acc
   * @param {Iterator} nodeIt
   * @return {Array<Node>}
   */
  static foldl(fn, ref, nodeIt) {
    const { value, done } = nodeIt.next();
    if (done) {
      return ref;
    }
    return Tree.foldl(fn, fn(ref, value), nodeIt); // the reduction is fn(acc, value)
  }

  /**
   * Generates a clone of the tree. This includes using the same node ids.
   *
   * @function
   * @param {Tree} tree
   * @return {Tree}
   */
  static clone(tree, DEBUG) {
    return Tree.foldl(
      Tree.newBranch('CLONE', { DEBUG }),
      Tree.EMPTY,
      Tree.traverseDF(tree),
    ).root;
  }

  /**
   * Generates a copy of a branch to be added to an existing tree.
   *
   * 🚧 The moveOrCopy tag is useful but right now redundant when
   *    called by insertNode.
   *
   * 🔑 This is the only way to grow the tree once instantiated.
   *    Specifically, growth only comes from other branches.
   *
   * @function
   * @param {Tree} fromTree
   * @param {Tree} toTree
   * @param {String} moveOrCopy one of 'MOVE' 'COPY'
   * @param {boolean} DEBUG
   * @return {Tree}
   */
  static copyBranch(fromTree, toTree, { DEBUG = false, ...nodeConfig }) {
    if (toTree === Tree.EMPTY) {
      throw new WorkbenchError(
        'Tried to copy a branch to an empty Tree; use clone instead',
      );
    }
    if (DEBUG) {
      console.log(`👉 copyBranch`);
      console.log(`from:\n${Tree.print(fromTree)}`);
      console.log(`to:\n${Tree.print(toTree)}`);
    }

    // ⬜ Make this logic more explicit
    //
    // 🚧 🦀
    //
    // takes 'CLONE' or 'GROW'
    // moveOrCopy -> cloneOrGrow
    // MOVE -> [extend with new id] + change parent
    // COPY -> [extend with new id] + copy with new ids for all
    //
    return Tree.foldl(
      Tree.newBranch('GROW', { ...nodeConfig, DEBUG }),
      toTree,
      Tree.traverseDF(fromTree),
    );
  }

  /**
   *
   * 🔑 New branch can only be sourced from existing branches.  There is no way
   *    to create a new node without another node as the reference to copy from.
   *
   *    newBranch -> copyBranch +/- extend with a single COPY/GROW new node
   *
   *    `fn :: Tree -> Node from iterator -> Tree`
   *
   *    Copies the provided node onto the tree. In the event the tree is EMPTY,
   *    it creates a new copy of the tree *in toto*.
   *
   * Tasks:
   *
   *   👉 when EMPTY, initiate the accumulating tree with a copy of the
   *      first node from the node in the second parameter
   *
   *   👉 move to the next node, append to the accumulating tree
   *
   *   👉 repeat until there are no nodes remaining
   *
   *   👉 append the accumulating tree to somewhere else on the tree by
   *      setting the parent prop null -> value
   *
   * @function
   * @param {Tree} tree tree to which we are growing a new branch
   * @param {Tree} node from an iterator to be copied
   * @return {Tree} ref to most recently added child
   *
   * @throws InvalidTreeStateError
   * @private
   *
   */
  static newBranch(cloneOrGrow, { DEBUG = false, ...nodeConfigProp }) {
    //
    // the binary operation that combines tree and node.  It does so by
    // extending the tree using either the node itself ('CLONE') or a
    // derivative therein with a new set of ids and optional data maker.
    //
    // 🔖 This is not a recursive operation.  Use fold to compose accordingly.
    //
    return (tree, node) => {
      /* eslint-disable no-console */
      if (DEBUG) {
        console.group(`👉 ${cloneOrGrow} newBranch tree (acc), node to be copied`);
        console.debug(Tree.print(tree));
      }

      // three possible sources of data
      // These constuctions only matter when 'GROW'
      let data;
      switch (cloneOrGrow === 'GROW') {
        // dataMaker not yet applied
        case nodeConfigProp?.dataMaker?.source === node.id:
          data = nodeConfigProp.dataMaker?.maker(node.data);
          break;
        // dataMaker applied "earlier"
        case typeof nodeConfigProp.data !== 'undefined':
          data = nodeConfigProp.data;
          break;
        default:
          data = node.data;
      }

      // configure the new node
      const nodeConfig =
        cloneOrGrow === 'CLONE'
          ? node // re-use the same ids
          : {
              ...node,
              data,
              id: nodeConfigProp?.id ?? undefined,
              type: Tree.deriveNodeType(tree, node),
            };

      if (tree === Tree.EMPTY) {
        // assert
        if (cloneOrGrow !== 'CLONE') {
          throw new WorkbenchError(
            'Trying to clone to a non-empty tree; use GROW instead',
          );
        }
        // start a new tree
        if (DEBUG) {
          console.debug('✨ Starting with empty tree');
        }
        const firstNode = createTree(nodeConfig);

        if (DEBUG) {
          console.debug('🏁');
          console.debug(firstNode);
          console.groupEnd();
        }

        // :: Tree
        return firstNode;
      }

      const gap = tree.height + 1 - node.height;

      if (gap < 0) {
        console.debug(`🚨 Why is the tree higher than the branch?`);
        console.debug(Tree.print(tree));
        console.debug(Tree.print(node));
        throw new WorkbenchError(
          `The to tree height (${tree.height}, and node (${node.height}) has a negative gap)`,
        );
      }

      // sub-routine
      // move the acc pointer up to match the incoming node being copied
      const goUp = (treeP, gap) => {
        if (gap === 0) {
          return treeP;
        }
        if (treeP.parent === null) {
          console.error(treeP.root);
          throw new WorkbenchError(
            `Growing the tree failed when filling-in the gap: ${gap}`,
          );
        }
        return goUp(treeP.parent, gap - 1);
      };

      const result = goUp(tree, gap).extend(nodeConfig);

      if (DEBUG) {
        console.debug(`gap ${gap}`);
        console.debug(`🏁 result`);
        console.debug(Tree.print(result.root));
        console.groupEnd();
      }

      return result;
    };
    /* eslint-disable no-console */
  }

  /**
   * Serialize the Tree state
   *
   * @function
   * @param {Tree} tree
   * @return {Object} keyed by id
   * @public
   */
  static toFlatNodes(tree) {
    //
    // local sub-routine
    //
    const serializeNode = (node) => ({
      id: node.id,
      type: node.type,
      height: node.height,
      parent: node.parent?.id ?? null,
      data: node.data,
      index: node.index,
      childIds: node.children.map((child) => child.id),
      listeners: node.listeners,
    });

    return [...tree].reduce((stateTree, node) => {
      stateTree[node.id] = serializeNode(node);
      return stateTree;
    }, {});
  }

  /**
   * Instantiate/deserialize from a flat version of the tree
   *
   *
   * @function
   * @param {Object} nodes keyed using node.id
   * @return {Tree}
   * @public
   *
   * @throws WorkbenchError when nodes[0] is not root
   *
   */
  static fromFlatNodes(nodes) {
    if (nodes[0].type !== NODE_TYPES.ROOT) {
      throw new WorkbenchError(
        `Failed to instantiate with the first node as the root node: ${nodes[0].type}`,
      );
    }

    // sub-routine
    const appendChildren = (tree, flatNode) => {
      if (flatNode.childIds.length === 0) {
        return;
      }
      // side-effect
      // append the child instances
      flatNode.childIds.forEach((childId) => {
        tree.append({ ...nodes[childId] });
      });
      // forEach child instance, call appendChildren
      // but now with each child as the tree
      tree.children.forEach((child) => {
        appendChildren(child, nodes[child.id]);
      });
    };

    const tree = createTree({ data: nodes[0].data });
    appendChildren(tree, nodes[0]);

    return tree.root;
  }

  /**
   * Instantiate from the obsEtl
   *
   * This is specialized and should be made generic. Use the lib api
   * to create the required function.
   *
   * @function
   * @param {Object} nodes keyed using node.id
   * @param {Number} canvasSuperGroupCount
   * @return {Tree}
   * @public
   */
  static fromObsEtl(obsEtl, canvasSuperGroupCount = 0) {
    const { qualities = [], measurements = [] } = obsEtl;

    let ref = createTree()
      .append({
        type: NODE_TYPES.PALETTE,
      })
      .append({
        type: NODE_TYPES.CANVAS,
      })
      .root.children[0].extend({
        type: NODE_TYPES.PALETTE,
      })
      .appendEtlUnits([...qualities, ...measurements]).root;

    if (canvasSuperGroupCount === 0) {
      return ref.root;
    }
    ref = range(0, canvasSuperGroupCount).reduce((ref) => {
      ref = Tree.maybeNode(ref, {
        type: NODE_TYPES.CANVAS,
        height: 1,
        index: 1,
      }).append();
      return ref;
    }, ref);

    return ref.root;
  }

  /**
   * Access a node using type and height
   * @function
   * @param {Tree}
   * @param {Search}
   * @return {(Node | undefined)}
   */
  static maybeNode(tree, { type, height, index }) {
    // bf search for height
    let result = tree.nodesAtHeight(height);

    result = result.find((node) => node.type === type && node.index === index);
    return result;
  }

  /**
   * @function
   * @param {Tree} tree
   * @return {Object} keyed by id
   */
  static serialize(tree) {
    return Tree.toFlatNodes(tree);
  }

  /**
   * Deprecate
   * Use fromFlatNodes
   * @function
   */
  static deserialize(obj) {
    const addChildren = (node) => {
      // 🦀 ?? was unamed function
      return {
        ...node,
        isRoot: () => node.height === 0,
        children: node.children.map(addChildren),
      };
    };

    const enhanced = addChildren(obj);

    return Tree.clone(enhanced);
  }
}

// End Tree Class
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// Tree implementation
//------------------------------------------------------------------------------
/*

   export type NodeConfig = {
       id: number,
       type: 'root'|'palette'|'canvas'|'unspecified',
       data: object,
       index: number
    }

*/

//------------------------------------------------------------------------------
/**
 * 📌
 *
 * API to instantiate a Tree
 *
 * The 'createTree' function should only be called once. The following
 * functions should be used (they wrap a call to 'createNode')
 *
 * Tree is instantiated from
 *
 *   👉 fromObsEtl
 *
 *   👉 fromFlatNodes
 *
 *
 * 🔖 CreateNode creates a closure.  The return value provides the public
 *    interface. It is often useful to return a ref to the closure.
 *
 * 🔑 Properties of the tree
 *
 *   👉 meaning is encoded in the height of the node
 *
 *   👉 uid is generated using the nodeCount as a base
 *
 *   👉 a node has a type to complement the meaning encoded in height
 *
 *   👉 has constant/fixed height
 *
 *   The latter means that when inserting a new branch, any gap between
 *   the height of the node and where it is being added, must be "closed"
 *   by "extending" the node accordingly.
 *
 * @function
 * @param {Object} config node configuration or data
 * @return {Node} public interface for a Node
 */
export function createTree(config) {
  const id = config?.id ?? getIdGenerator().reset().nextId();
  const type = config?.type ?? Tree.deriveNodeType(Tree.EMPTY, Tree.EMPTY);
  //-----------------------------------------------------------------------------
  // payloads external to the tree structure
  const data = config?.data ?? {}; // tree service, host data state
  const listeners = config?.listeners ?? []; // tree service, cascade state
  //-----------------------------------------------------------------------------
  const height = config?.height ?? 0; // key quality of the tree
  // subsequently updated
  let nodeCount = 1; // updated when getter is called
  const parent = null; // used to "climb-up" the tree from a child node
  const info = `id:0 height:0 parent:${null} index:${null}`;
  let children = [];

  /**
   * called by insertNode and _newChild
   *
   * @private
   */
  const _setMeAsParent = (me, node, pos) => {
    // logic for clearing previous parent/child
    if (node.parent !== null) {
      node.parent.removeNode(node);
    }
    /* eslint-disable no-param-reassign */
    me.children.splice(pos, 0, node); // add to the array of children
    me.incrementNodeCount();
    node.parent = me;
    node.height = me.height + 1;
    // node.index = pos;
    node.info = `id:${node.id} height:${node.height} parent:${node.parent.id} index:${node.index}`;
    /* eslint-enable no-param-reassign */

    return node;
  };
  /**
   *
   * @function
   * @param {Tree} parent
   * @param {NodeConfig} nodeConfig
   * @return {Tree} pointing to the new node
   *
   * @private
   *
   */
  const createNode = (parent, nodeConfig = {}) => {
    // provide a node id when missing
    /* eslint-disable no-param-reassign */
    nodeConfig.id = nodeConfig?.id ?? getIdGenerator().nextId();
    if (parent.isRoot && typeof nodeConfig.type === 'undefined') {
      throw new WorkbenchError('Parent is root; node does not have a type');
    }
    nodeConfig.type = Tree.deriveNodeType(parent, Tree.EMPTY, nodeConfig?.type);

    let newNode = createTree(nodeConfig);

    newNode = _setMeAsParent(
      parent,
      newNode,
      nodeConfig?.pos || nodeConfig?.index || parent.childCount,
    );

    // finished value
    return newNode;
  };

  /**
   * Only a parent can call this function
   * Sets the values of a newly instantiated node by a parent.
   * @private
   */
  const _newChildE = (...args) => {
    return createNode(...args);
  };

  /**
   * Append a new child node
   * Return the parent
   * @private
   */
  const _newChildA = (...args) => {
    return createNode(...args).parent;
  };

  // return the public interface to the closure
  return {
    id,
    type,
    parent,
    height,
    info,
    listeners,
    data,

    *[Symbol.iterator]() {
      yield* Tree.traverseDF(this);
    },

    *iterBF() {
      yield* Tree.traverseBF(this);
    },

    /**
     * @public
     */
    get isRoot() {
      return Boolean(this.parent === null); // dynamic this
    },

    get root() {
      if (this.parent == null) return this;
      return this.parent.root;
    },

    get maxId() {
      return [...this.root].reduce((max, node) => (max > node.id ? max : node.id), 0);
    },

    incrementNodeCount() {
      this.nodeCount += 1;
      if (!this.isRoot) {
        this.parent.incrementNodeCount();
      }
    },

    get nodeCount() {
      if (this.isRoot) {
        return nodeCount;
      }
      return this.parent.nodeCount;
    },

    set nodeCount(value) {
      nodeCount = value;
    },

    get treeHeight() {
      const go = (node, count) =>
        node?.hasChildren ? go(node.children[0], count + 1) : count;

      if (this.isRoot) {
        return go(this, 0);
      }
      return this.parent.treeHeight;
    },

    hasChildren() {
      return this.children.length > 0; // dynamic this
    },

    get childCount() {
      return this.children.length; // dynamic this
    },

    get children() {
      return children; // implied dynamic this??
    },

    set children(newChildren) {
      children = newChildren;
    },

    get index() {
      return this.isRoot
        ? null
        : this.parent.children.findIndex((node) => node.id === this.id);
    },

    /**
     * Returns an Array of refs to nodes at the requested height.
     * 🔑 Breadth first search that avoids searching the whole tree.
     */
    nodesAtHeight(height = 0) {
      if (height === 0) return [this.root];
      const result = [];
      for (const node of this.iterBF()) {
        if (node.height === height) {
          result.push(node);
        } else if (node.height > height) {
          break;
        }
      }
      return result;
    },

    /**
     * Generates and appends a new child; returns self (a ref to the parent of
     * the now appended noe).
     *
     * @function
     * @param {(NodeConfig | Array<NodeConfig>} nodeConfig
     * @return {Tree} Object literal
     *
     */
    append(nodeConfig) {
      if (Array.isArray(nodeConfig)) {
        return nodeConfig.reduce((ref, nodeConfig) => {
          ref = _newChildA(ref, nodeConfig);
          return ref;
        }, this);
      }
      return _newChildA(this, nodeConfig); // this ~> caller
    },

    /**
     * Generates and appends a new child; returns the child
     *
     * @function
     * @param {NodeConfig} nodeConfig
     * @return {Tree} Object literal
     *
     */
    extend(nodeConfig) {
      return _newChildE(this, nodeConfig); // this ~> caller
    },

    /**
     * extend the node with requested number
     */
    extendN(
      lengthOrDatas, // default at least one extension
      type = undefined,
    ) {
      const extension = Array.isArray(lengthOrDatas)
        ? lengthOrDatas
        : Array.from(Array(lengthOrDatas).keys());

      if (extension.length === 0) {
        return this;
      }

      return extension.reduce((ref, idxOrData, idx) => {
        /* eslint-disable-next-line no-param-reassign */
        ref = _newChildE(ref, {
          id: undefined,
          type,
          data: {
            source: `extension ${idx}`,
            ...(typeof idxOrData === 'number' ? {} : idxOrData),
          },
        });
        return ref;
      }, this);
    },

    /**
     *
     * Side-effect
     * Adds a new node to "this.children" at a specific position in the child
     * index.
     *
     * 🦀 COPY
     *    Using the source id as the top-most instead of the newly generated id.
     *    When moving...
     *
     *        this.Tree -> Tree -> this.Tree
     *
     * @function
     * @param {Tree} node The node to be inserted into "this" tree
     * @param {Object} config
     * @param {Object} config.pos
     * @param {('COPY'|'MOVE')} config.moveOrCopy
     * @param {dataMaker} config.dataMaker
     * @param {boolean} config.DEBUG
     * @return {Tree}
     */
    insertNode(
      node,
      { pos = this.children.length, moveOrCopy = 'COPY', DEBUG = false, ...nodeConfig },
    ) {
      const ref =
        moveOrCopy === 'COPY' // all new ids
          ? Tree.copyBranch(node /* src */, this /* dst */, {
              ...nodeConfig,
              DEBUG,
            })
          : _setMeAsParent(this, node, pos); // use same ids

      return ref.parent;
    },

    /**
     *
     * ⬜ Consider moving this outside of the tree. Pass in a function.
     *
     * This is a specialized function for obsEtl
     *
     * Add the ~etlUnits from the obsEtl object.
     *
     * * [Quality]
     * * [Measurement]
     *
     * @function
     * @param {Array<Object>} qualityOrMeasurements
     * @return {Tree}
     *
     */
    appendEtlUnits(qualityOrMeasurements) {
      // palette is the first child off of root
      return qualityOrMeasurements.reduce((ref, qualOrMea) => {
        const groupNode = {
          data: groupNodeData(qualOrMea),
        };

        const etlUnitNode = {
          data: etlUnitNodeData(qualOrMea),
        };

        ref.extend(groupNode).append(etlUnitNode);

        return ref;
      }, this);
    },

    /**
     * a morphisms to remove a node
     *
     *    Node [children] -> Node [children]
     *
     * 🚧 Keep superGroup stubbs (for now)
     * 🦀 Where the tree is protected is hidden
     */
    removeNode(child) {
      this.children = this.children.filter((node) => node.id !== child.id);
      // preserve tree above 3
      if (this.children.length === 0 && this.height > 2) {
        return this.parent.removeNode(this);
      }
      return this;
    },
  };
}

/**
 *
 * Specialized utility function
 *
 *     DnD Event -> NodeIds
 *
 * @function
 * @param {Object} dndEvent
 * @return {Obecjt} the three node ids
 */
export function getNodeIdsFromEvent(event) {
  let {
    draggableId,
    source: { droppableId: sourceId },
    destination: { droppableId: destinationId },
  } = event;

  [draggableId, sourceId, destinationId] = [draggableId, sourceId, destinationId].map(
    (x) => parseInt(x, 10),
  );

  return {
    draggableId,
    sourceId,
    destinationId,
  };
}

/**
 * 🚧 WIP for how to include and access
 *
 * UID generator
 * Creates a singleton with a private closure when the module is loaded.
 *
 * ⚠️  The first value returned is 1.  Only nodes require the uid generator.
 *    (not root).
 *
 * 🔑 call nextId() to receive a uid whilst incrementing the value
 *
 */
export const UidGenerator = (() => {
  let instance;
  const createInstance = () => {
    let uid = null;
    // the exposed functionality once instantiated
    const generator = {
      nextId: (step = 1) => {
        if (uid === null) {
          uid = 0;
          return uid;
        }
        uid += step;
        return uid;
      },
      getId: () => uid,
      setIdWithMaxId: (value) => {
        uid = value;
      },
      reset: () => {
        uid = null;
        return generator;
      },
    };
    return generator;
  };
  // the singleton machinery
  return {
    getInstance: () => {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    },
  };
})();

/**
 * Convenience function to lift access to the
 * UidGenerator.
 * @function
 * @return {UidGenerator}
 */
function getIdGenerator() {
  return UidGenerator.getInstance();
}

/* eslint-disable-next-line no-param-reassign */
/**
 * Augments a tree with the
 * nextId and getId functions
 *
 * @function
 * @param {Tree} tree
 * @return {Tree}
function withIdGenerator(tree) {
  tree.idGenerator = UidGenerator.getInstance();
  return tree;
}
 */
