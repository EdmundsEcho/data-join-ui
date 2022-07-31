/**
 * @module test/lib/obsEtlToMatrix/tree
 *
 * @description
 * Jest testing module for the `tree.js` module.
 * Note: the `fmap` capacity has thus far not been tested.
 */
import { Tree, createTree, UidGenerator } from './tree';
import { data } from './tree.data';
import { NODE_TYPES, ETL_UNIT_TYPES, PURPOSE_TYPES } from '../sum-types';

// This is used to pass to test print functions to maintain the same strings
// in case .info method is ever changed.
//
// const printFn = node => `id:${node.id} height:${node.height}`;

/* eslint-disable no-shadow */

/**
 * local utility for comparing string literals
 */
function scrubb(str) {
  return str.split(/\r?\n/).reduce((acc, line) => {
    return `${acc}\n${line.trim()}`;
  }, '');
}

describe('Tree lib', () => {
  //------------------------------------------------------------------------------
  /**
   * Tree for testing
   * Note: the uid was for testing purposes only.  It is a separate id than what
   * each tree node also has.
   */
  test('Test.EMPTY when compared returns true', () => {
    expect(Tree.EMPTY).toEqual(Tree.EMPTY);
    expect(Tree.EMPTY).toBe(Tree.EMPTY);
  });

  let uid = 0;
  const testTree = createTree({
    data: {
      id: (uid += 1),
      title: 'This is root with Column Children',
    },
  });
  testTree.append({
    type: 'testing',
    data: { id: (uid += 1), title: 'root child column 0' },
  });
  testTree.append({
    type: 'testing',
    data: { id: (uid += 1), title: 'root child column 1' },
  });
  testTree.append({
    type: 'testing',
    data: { id: (uid += 1), title: 'root child column 2' },
  });
  testTree.children[0].append({
    data: {
      id: (uid += 1),
      title: 'column 0 child group 0',
    },
  });
  testTree.children[0].children[0].append({
    data: {
      id: (uid += 1),
      title: 'group 0 child unit 0',
    },
  });
  testTree.children[1].append({
    data: {
      id: (uid += 1),
      title: 'column 1 child group 1',
    },
  });
  testTree.children[1].children[0].append({
    data: {
      id: (uid += 1),
      title: 'test1 group 1 child unit 1',
    },
  });
  testTree.children[1].children[0].append({
    data: {
      id: (uid += 1),
      title: 'test1 group 1 child unit 2',
    },
  });
  testTree.children[1].append({
    data: {
      id: (uid += 1),
      title: 'column 1 child group 2',
    },
  });
  testTree.extendN(3, 'testing');
  testTree.extendN(2, 'testing');
  //------------------------------------------------------------------------------
  test('first tree', () => {
    expect(scrubb(Tree.print(testTree.root))).toEqual(
      scrubb(`id:0 height:0 parent:null index:null
              id:1 height:1 parent:0 index:0
              id:4 height:2 parent:1 index:0
              id:5 height:3 parent:4 index:0
              id:2 height:1 parent:0 index:1
              id:6 height:2 parent:2 index:0
              id:7 height:3 parent:6 index:0
              id:8 height:3 parent:6 index:1
              id:9 height:2 parent:2 index:1
              id:3 height:1 parent:0 index:2
              id:10 height:1 parent:0 index:3
              id:11 height:2 parent:10 index:0
              id:12 height:3 parent:11 index:0
              id:13 height:1 parent:0 index:4
              id:14 height:2 parent:13 index:0`),
    );
    expect(testTree.root.nodeCount).toEqual(15);

    expect(testTree.childCount).toEqual(5);
    expect(testTree.children[0].childCount).toEqual(1);
  });

  test('a copy of a copy should match', () => {
    expect(Tree.print(Tree.clone(testTree.root))).toBe(
      Tree.print(testTree.root),
    );
  });

  //------------------------------------------------------------------------------
  test('simple tree', () => {
    let tmp = createTree()
      .append({ type: 'test' })
      .append({ type: 'test' })
      .extend({ type: 'test' })
      .extend()
      .append().root;

    expect(scrubb(Tree.print(tmp))).toEqual(
      scrubb(`id:0 height:0 parent:null index:null
              id:1 height:1 parent:0 index:0
              id:2 height:1 parent:0 index:1
              id:3 height:1 parent:0 index:2
              id:4 height:2 parent:3 index:0
              id:5 height:3 parent:4 index:0`),
    );
    expect(tmp.root.nodeCount).toEqual(6);
    expect(UidGenerator.getInstance().getId()).toEqual(5);

    tmp = tmp.children[0].extend().root;
    expect(scrubb(Tree.print(tmp))).toEqual(
      scrubb(`id:0 height:0 parent:null index:null
              id:1 height:1 parent:0 index:0
              id:6 height:2 parent:1 index:0
              id:2 height:1 parent:0 index:1
              id:3 height:1 parent:0 index:2
              id:4 height:2 parent:3 index:0
              id:5 height:3 parent:4 index:0`),
    );

    expect(tmp.root.nodeCount).toEqual(7);
    expect(UidGenerator.getInstance().getId()).toEqual(6);

    const t1 = tmp.children[0].extend().root;
    const t2 = tmp.children[0].extendN(1).root;
    expect(t1).toEqual(t2);

    tmp = tmp.children[0].extendN(3).root;
    expect(tmp.root.nodeCount).toEqual(12);
    expect(UidGenerator.getInstance().getId()).toEqual(11);
  });
  //------------------------------------------------------------------------------
  test('copies should match', () => {
    const tmp = createTree().append({ type: 'test' }).append({ type: 'test' })
      .root;
    const tmpCopy = Tree.clone(tmp);
    expect(Tree.print(tmp)).toEqual(Tree.print(tmpCopy));
    expect(scrubb(Tree.print(tmp))).toEqual(
      scrubb(`id:0 height:0 parent:null index:null
              id:1 height:1 parent:0 index:0
              id:2 height:1 parent:0 index:1`),
    );
    expect(scrubb(Tree.print(tmpCopy))).toEqual(
      scrubb(`id:0 height:0 parent:null index:null
              id:1 height:1 parent:0 index:0
              id:2 height:1 parent:0 index:1`),
    );
  });

  // ------------------------------------------------------------
  // Event driven mutations
  // ------------------------------------------------------------
  const nodeRoot = Tree.fromObsEtl(data.obsEtl);

  test('event-based mutation; tree validation', () => {
    expect(nodeRoot.nodeCount).toEqual(12);
    expect(nodeRoot.childCount).toEqual(2); // palette + canvas
    expect(nodeRoot.children[0].type).toEqual(NODE_TYPES.PALETTE);
    expect(nodeRoot.children[0].children[0].childCount).toEqual(4); // 4 etlUnits
    expect(nodeRoot.children[0].children[0].type).toEqual(NODE_TYPES.PALETTE);
    expect(nodeRoot.children[0].children[0].children[0].type).toEqual(
      NODE_TYPES.PALETTE,
    );
    expect(
      nodeRoot.children[0].children[0].children[0].children[0].data.type,
    ).toEqual(ETL_UNIT_TYPES[PURPOSE_TYPES.QUALITY]);

    expect(nodeRoot.children[0].children[0].childCount).toEqual(4); // 4 etlUnits
    expect(nodeRoot.children[0].children[0].children[3].childCount).toEqual(1); // 4 etlUnits
    expect(nodeRoot.children[1].type).toEqual(NODE_TYPES.CANVAS);
    expect(nodeRoot.children[1].childCount).toEqual(0); // empty canvas
    expect(scrubb(Tree.print(nodeRoot))).toEqual(
      scrubb(` id:0 height:0 parent:null index:null
               id:1 height:1 parent:0 index:0
               id:3 height:2 parent:1 index:0
               id:4 height:3 parent:3 index:0
               id:5 height:4 parent:4 index:0
               id:6 height:3 parent:3 index:1
               id:7 height:4 parent:6 index:0
               id:8 height:3 parent:3 index:2
               id:9 height:4 parent:8 index:0
               id:10 height:3 parent:3 index:3
               id:11 height:4 parent:10 index:0
               id:2 height:1 parent:0 index:1`),
    );
  });
  let event = {
    draggableId: 4,
    source: { droppableId: 2, index: 0 },
    destination: { droppableId: 2, index: 0 },
  };
  const tmp = Tree.moveNode(Tree.clone(nodeRoot.root), {
    event,
    moveOrCopy: 'COPY',
    DEBUG: false,
  }).root;
  test('morphing the tree: dragged height === dropped height', () => {
    expect(tmp.nodeCount).toEqual(15);
    expect(scrubb(Tree.print(tmp.root))).toBe(
      scrubb(` id:0 height:0 parent:null index:null
               id:1 height:1 parent:0 index:0
               id:3 height:2 parent:1 index:0
               id:4 height:3 parent:3 index:0
               id:5 height:4 parent:4 index:0
               id:6 height:3 parent:3 index:1
               id:7 height:4 parent:6 index:0
               id:8 height:3 parent:3 index:2
               id:9 height:4 parent:8 index:0
               id:10 height:3 parent:3 index:3
               id:11 height:4 parent:10 index:0
               id:2 height:1 parent:0 index:1
                  id:12 height:2 parent:2 index:0
                  id:13 height:3 parent:12 index:0
                  id:14 height:4 parent:13 index:0`),
    );
  });

  // ------------------------------------------------------------
  event = {
    draggableId: 5,
    source: { droppableId: 4, index: 0 },
    destination: { droppableId: 8, index: 1 },
  };
  const tmp1 = Tree.moveNode(Tree.clone(nodeRoot.root), {
    event,
    moveOrCopy: 'COPY',
    DEBUG: false,
  }).root;

  test('morphing the tree: dragged height < dropped height', () => {
    expect(scrubb(Tree.print(tmp1))).toBe(
      scrubb(`id:0 height:0 parent:null index:null
              id:1 height:1 parent:0 index:0
              id:3 height:2 parent:1 index:0
              id:4 height:3 parent:3 index:0
              id:5 height:4 parent:4 index:0
              id:6 height:3 parent:3 index:1
              id:7 height:4 parent:6 index:0
              id:8 height:3 parent:3 index:2
              id:9 height:4 parent:8 index:0
              id:12 height:4 parent:8 index:1
              id:10 height:3 parent:3 index:3
              id:11 height:4 parent:10 index:0
              id:2 height:1 parent:0 index:1`),
    );
    expect(tmp1.nodeCount).toEqual(13);
    expect(tmp1.children[0].children[0].children[0].data.type).toEqual(
      NODE_TYPES.GROUP,
    );
    // the dragged node was copied ...
    expect(Tree.findNodes(tmp1, (node) => node.id === 5)[0].data.type).toEqual(
      ETL_UNIT_TYPES[PURPOSE_TYPES.QUALITY],
    );
    expect(
      Tree.findNodes(tmp1, (node) => node.id === 5)[0].data.value.qualityName,
    ).toEqual('q_specialty');

    // ... to leaf node 11 with parent 7
    expect(Tree.findNodes(tmp1, (node) => node.id === 5)[0].data).toEqual(
      Tree.findNodes(tmp1, (node) => node.id === 12)[0].data,
    );
    expect(Tree.findNodes(tmp1, (node) => node.id === 12)[0].parent.id).toEqual(
      8,
    );

    expect(tmp1.nodeCount).toEqual(13);
  });
  // ------------------------------------------------------------
  // Event that includes mutating the source
  // ------------------------------------------------------------
  event = {
    draggableId: 7,
    source: { droppableId: 6, index: 0 },
    destination: { droppableId: 10, index: 0 },
  };

  const tmp2 = Tree.moveNode(Tree.clone(nodeRoot.root), {
    event,
    moveOrCopy: 'MOVE',
    DEBUG: false,
  }).root;

  test('event with a move semantic (no copy, change the source node)', () => {
    expect(tmp2.nodeCount).toEqual(13);

    expect(
      Tree.findNodes(tmp2, (node) => node.id === 7)[0].data.value.qualityName,
    ).toEqual('q_state');

    expect(scrubb(Tree.print(tmp2))).toBe(
      scrubb(`id:0 height:0 parent:null index:null
              id:1 height:1 parent:0 index:0
              id:3 height:2 parent:1 index:0
              id:4 height:3 parent:3 index:0
              id:5 height:4 parent:4 index:0
              id:8 height:3 parent:3 index:2
              id:9 height:4 parent:8 index:0
              id:10 height:3 parent:3 index:3
              id:7 height:4 parent:10 index:0
              id:11 height:4 parent:10 index:0
              id:2 height:1 parent:0 index:1`),
    );
  });
  // ------------------------------------------------------------
  event = {
    draggableId: 8,
    source: { droppableId: 6, index: 0 },
    destination: { droppableId: 1, index: 0 },
  };
  const tmp3 = Tree.moveNode(Tree.clone(testTree.root), {
    event,
    moveOrCopy: 'COPY',
    DEBUG: false,
  }).root;
  test('copy where dragged height > dropped height', () => {
    expect(scrubb(Tree.print(tmp3))).toBe(
      scrubb(`id:0 height:0 parent:null index:null
         id:1 height:1 parent:0 index:0
              id:4 height:2 parent:1 index:0
                  id:5 height:3 parent:4 index:0
         id:15 height:2 parent:1 index:1
           id:16 height:3 parent:15 index:0
              id:2 height:1 parent:0 index:1
         id:6 height:2 parent:2 index:0
                  id:7 height:3 parent:6 index:0
                  id:8 height:3 parent:6 index:1
              id:9 height:2 parent:2 index:1
              id:3 height:1 parent:0 index:2
              id:10 height:1 parent:0 index:3
              id:11 height:2 parent:10 index:0
              id:12 height:3 parent:11 index:0
              id:13 height:1 parent:0 index:4
              id:14 height:2 parent:13 index:0`),
    );
  });
  // ------------------------------------------------------------
  event = {
    draggableId: 8,
    source: { droppableId: 6, index: 0 },
    destination: { droppableId: 1, index: 0 },
  };
  const tmp4 = Tree.moveNode(Tree.clone(testTree.root), {
    event,
    moveOrCopy: 'MOVE',
    DEBUG: false,
  }).root;
  test('move where dragged height > dropped height', () => {
    expect(scrubb(Tree.print(tmp4))).toBe(
      scrubb(`id:0 height:0 parent:null index:null
         id:1 height:1 parent:0 index:0
              id:4 height:2 parent:1 index:0
              id:5 height:3 parent:4 index:0
         id:15 height:2 parent:1 index:1
           id:8 height:3 parent:15 index:0
              id:2 height:1 parent:0 index:1
         id:6 height:2 parent:2 index:0
              id:7 height:3 parent:6 index:0
              id:9 height:2 parent:2 index:1
              id:3 height:1 parent:0 index:2
              id:10 height:1 parent:0 index:3
              id:11 height:2 parent:10 index:0
              id:12 height:3 parent:11 index:0
              id:13 height:1 parent:0 index:4
              id:14 height:2 parent:13 index:0`),
    );
  });

  test('removing a child node should reset index for siblings', () => {
    const tree = createTree()
      .extend({ type: 'test' })
      .append({ type: 'test' })
      .append({ type: 'test' })
      .append({ type: 'test' })
      .root.append({ type: 'test' });

    // id:0 height:0 parent:null index:null
    // id:1 height:1 parent:0 index:0
    // id:2 height:2 parent:1 index:0
    // id:3 height:2 parent:1 index:1
    // id:4 height:2 parent:1 index:2
    // id:5 height:1 parent:0 index:1

    expect(tree.index).toBe(null);
    expect(tree.children[0].index).toEqual(0);

    // Before the move the 3 children should have indexes 0-2
    expect(tree.children[0].children[0].index).toEqual(0);
    expect(tree.children[0].children[1].index).toEqual(1);
    expect(tree.children[0].children[2].index).toEqual(2);
    expect(tree.children[1].children[2]).toBeUndefined();

    // Moving the node
    event = {
      draggableId: 3,
      source: { droppableId: 1, index: 0 },
      destination: { droppableId: 5, index: 0 },
    };

    Tree.moveNode(tree, { event, moveOrCopy: 'MOVE', DEBUG: false });

    // Before
    //   id:0 height:0 parent:null index:null
    //   id:1 height:1 parent:0 index:0
    //   id:2 height:2 parent:1 index:0
    //   id:3 height:2 parent:1 index:1 // move
    //   id:4 height:2 parent:1 index:2
    //   id:5 height:1 parent:0 index:1
    //                                  <<< to here

    expect(tree.index).toBe(null);
    expect(tree.children[0].index).toEqual(0);
    expect(tree.children[0].children[0].index).toEqual(0);
    expect(tree.children[0].children[1].index).toEqual(1);
    expect(tree.children[0].children[2]).toBeUndefined(); // Removed
    expect(tree.children[1].children[0].index).toEqual(0); // Added
  });
  test('repeat without removing the source node', () => {
    const tree = createTree();
    tree.append({ type: 'test' });
    tree.children[0].append();
    tree.children[0].append();
    tree.children[0].append();
    tree.append({ type: 'test' });

    //    Before
    //      id:0 idx:0 // Root
    //        id:1 idx:0
    //          id:2 idx:0
    //          id:3 idx:1 // To be copied
    //          id:4 idx:2
    //        id:5 idx:1

    expect(tree.index).toBe(null);
    expect(tree.children[0].index).toEqual(0);

    // Before the move the 3 children should have indexes 0-2
    expect(tree.children[0].children[0].index).toEqual(0);
    expect(tree.children[0].children[1].index).toEqual(1);
    expect(tree.children[0].children[2].index).toEqual(2);
    expect(tree.children[1].children[2]).toBeUndefined();

    // Moving the node
    event = {
      draggableId: 3,
      source: { droppableId: 1, index: 0 },
      destination: { droppableId: 5, index: 0 },
    };

    Tree.moveNode(tree, {
      event,
      moveOrCopy: 'COPY',
      DEBUG: false,
    });

    expect(tree.children[0].index).toEqual(0);
    expect(tree.children[0].children[0].index).toEqual(0);
    expect(tree.children[0].children[1].index).toEqual(1);
    expect(tree.children[0].children[2].index).toEqual(2);
    expect(tree.children[1].children[0].index).toEqual(0); // Added
    expect(tree.children[1].children[0].id).toEqual(6); // Added
  });
});

describe('Instantiation', () => {
  //------------------------------------------------------------------------------
  const tree = Tree.fromObsEtl(data.obsEtl);
  //------------------------------------------------------------------------------
  test('equivalent instances', () => {
    const treeFromObsEtl = tree;

    // Top-level
    expect(treeFromObsEtl.children.length).toEqual(2);
    expect(treeFromObsEtl.nodeCount).toEqual(12);

    expect(treeFromObsEtl.children[0].id).toEqual(1);
    expect(treeFromObsEtl.children[0].type).toEqual(NODE_TYPES.PALETTE);
    expect(treeFromObsEtl.children[0].children[0].children.length).toEqual(4);

    expect(treeFromObsEtl.children[1].type).toEqual(NODE_TYPES.CANVAS);
    expect(treeFromObsEtl.children[1].children.length).toEqual(0);
  });

  test('redux id:: serialize.deserialize(flatNode)', () => {
    const stateTree = Tree.toFlatNodes(tree);
    const treeEcho = Tree.fromFlatNodes(stateTree);

    expect(Tree.print(tree)).toBe(Tree.print(treeEcho));
    expect(tree).toEqual(treeEcho);
  });

  test('obsEtl id:: serialize.deserialize(flatNode)', () => {
    // eslint-disable-next-line no-shadow
    const tree = Tree.fromObsEtl(data.obsEtl);
    const treeEcho = Tree.fromFlatNodes(Tree.toFlatNodes(tree));

    expect(tree.nodeCount).toEqual(12);
    expect(treeEcho.nodeCount).toEqual(12);

    expect(Tree.print(tree)).toBe(Tree.print(treeEcho));
    expect(tree).toStrictEqual(treeEcho);
  });
});

describe('Event-driven mutations', () => {
  test('copy a leaf from palette to a canvas branch', () => {
    //------------------------------------------------------------------------------
    // eslint-disable-next-line no-shadow
    const tree = Tree.fromObsEtl(data.obsEtl);
    //------------------------------------------------------------------------------
    const event = {
      draggableId: 4,
      source: { droppableId: 3, index: 0 },
      destination: { droppableId: 2, index: 0 },
    };
    const result = Tree.moveNode(Tree.clone(tree), {
      event,
      moveOrCopy: 'COPY',
      DEBUG: false,
    }).root;

    // two more nodes than before
    expect(tree.nodeCount).toEqual(12);
    expect(result.nodeCount).toEqual(15);

    // unchanged
    expect(result.children[0].type).toEqual(NODE_TYPES.PALETTE);
    expect(result.children[0].children[0].children.length).toEqual(4);

    // unchanged part of the canvas
    expect(result.children[1].type).toEqual(NODE_TYPES.CANVAS);

    // new child on canvas
    expect(result.children[1].children.length).toEqual(1);
    expect(
      scrubb(Tree.print(result, (node) => `${node.type} ${node.info}`)),
    ).toBe(
      scrubb(` root id:0 height:0 parent:null index:null
               palette id:1 height:1 parent:0 index:0
               palette id:3 height:2 parent:1 index:0
               palette id:4 height:3 parent:3 index:0
               palette id:5 height:4 parent:4 index:0
               palette id:6 height:3 parent:3 index:1
               palette id:7 height:4 parent:6 index:0
               palette id:8 height:3 parent:3 index:2
               palette id:9 height:4 parent:8 index:0
               palette id:10 height:3 parent:3 index:3
               palette id:11 height:4 parent:10 index:0
               canvas id:2 height:1 parent:0 index:1
               canvas id:12 height:2 parent:2 index:0
               canvas id:13 height:3 parent:12 index:0
               canvas id:14 height:4 parent:13 index:0`),
    );
  });
  test('series of event-driven mutations', () => {
    //------------------------------------------------------------------------------
    // eslint-disable-next-line no-shadow
    const tree = Tree.fromObsEtl(data.obsEtl);
    //------------------------------------------------------------------------------
    // grab the leaf
    const event = {
      draggableId: 5,
      source: { droppableId: 4, index: 0 },
      destination: { droppableId: 2, index: 0 },
    };
    const result = Tree.moveNode(Tree.clone(tree), {
      event,
      moveOrCopy: 'COPY',
      DEBUG: false,
    }).root;

    expect(scrubb(Tree.print(result))).toEqual(
      scrubb(`id:0 height:0 parent:null index:null
              id:1 height:1 parent:0 index:0
              id:3 height:2 parent:1 index:0
              id:4 height:3 parent:3 index:0
              id:5 height:4 parent:4 index:0
              id:6 height:3 parent:3 index:1
              id:7 height:4 parent:6 index:0
              id:8 height:3 parent:3 index:2
              id:9 height:4 parent:8 index:0
              id:10 height:3 parent:3 index:3
              id:11 height:4 parent:10 index:0
              id:2 height:1 parent:0 index:1
              id:12 height:2 parent:2 index:0
              id:13 height:3 parent:12 index:0
              id:14 height:4 parent:13 index:0`),
    );
    //------------------------------------------------------------------------------
    // grab the group with only one leaf
    const event2 = {
      draggableId: 4,
      source: { droppableId: 3, index: 0 },
      destination: { droppableId: 2, index: 1 },
    };
    const result2 = Tree.moveNode(Tree.clone(result), {
      event: event2,
      moveOrCopy: 'COPY',
      DEBUG: false,
    }).root;

    expect(result.nodeCount).toEqual(15);
    expect(result2.nodeCount).toEqual(18);

    //------------------------------------------------------------------------------
    // grab a leaf, put on canvas root (2)
    const event3 = {
      draggableId: 5,
      source: { droppableId: 4, index: 0 },
      destination: { droppableId: 2, index: 0 },
    };

    const result3 = Tree.moveNode(Tree.clone(result2), {
      event: event3,
      moveOrCopy: 'COPY',
      DEBUG: false,
    }).root;

    expect(result2.nodeCount).toEqual(18);
    expect(result3.nodeCount).toEqual(21);
    expect(scrubb(Tree.print(result3))).toEqual(
      scrubb(` id:0 height:0 parent:null index:null
              id:1 height:1 parent:0 index:0
              id:3 height:2 parent:1 index:0
              id:4 height:3 parent:3 index:0
              id:5 height:4 parent:4 index:0
              id:6 height:3 parent:3 index:1
              id:7 height:4 parent:6 index:0
              id:8 height:3 parent:3 index:2
              id:9 height:4 parent:8 index:0
              id:10 height:3 parent:3 index:3
              id:11 height:4 parent:10 index:0
              id:2 height:1 parent:0 index:1
              id:12 height:2 parent:2 index:0
              id:13 height:3 parent:12 index:0
              id:14 height:4 parent:13 index:0
              id:15 height:2 parent:2 index:1
              id:16 height:3 parent:15 index:0
              id:17 height:4 parent:16 index:0
                 id:18 height:2 parent:2 index:2
                 id:19 height:3 parent:18 index:0
                 id:20 height:4 parent:19 index:0`),
    );

    //------------------------------------------------------------------------------
    // grab a group, put on group
    const event4 = {
      draggableId: 4,
      source: { droppableId: 3, index: 0 },
      destination: { droppableId: 16, index: 2 },
    };

    const result4 = Tree.moveNode(Tree.clone(result3), {
      event: event4,
      moveOrCopy: 'COPY',
      DEBUG: false,
    }).root;

    expect(result3.nodeCount).toEqual(21);
    expect(result4.nodeCount).toEqual(22);

    //------------------------------------------------------------------------------
    // grab a supergroup put on group
    const event5 = {
      draggableId: 15,
      source: { droppableId: 2, index: 0 },
      destination: { droppableId: 13, index: 0 },
    };

    const result5 = Tree.moveNode(Tree.clone(result4), {
      event: event5,
      moveOrCopy: 'COPY',
      DEBUG: false,
    }).root;

    expect(result4.nodeCount).toEqual(22);
    expect(result5.nodeCount).toEqual(24);

    //------------------------------------------------------------------------------
    // repeat with a move
    const result6 = Tree.moveNode(Tree.clone(result4), {
      event: event5,
      moveOrCopy: 'MOVE',
      DEBUG: false,
    }).root;

    expect(result4.nodeCount).toEqual(22);
    expect(result6.nodeCount).toEqual(24);
  });

  test('repeat the event; insert it before the branch already in place', () => {
    //------------------------------------------------------------------------------
    // eslint-disable-next-line no-shadow
    const tree = Tree.fromObsEtl(data.obsEtl);
    //------------------------------------------------------------------------------
    let event = {
      draggableId: 4,
      source: { droppableId: 3, index: 0 },
      destination: { droppableId: 2, index: 0 },
    };

    const tmp = Tree.moveNode(Tree.clone(tree), {
      event,
      moveOrCopy: 'COPY',
      DEBUG: false,
    }).root;

    // second event
    event = {
      draggableId: 5,
      source: { droppableId: 4, index: 0 },
      destination: { droppableId: 2, index: 0 },
    };

    const result = Tree.moveNode(tmp, {
      event,
      moveOrCopy: 'COPY',
      DEBUG: false,
    }).root;

    expect(tree.nodeCount).toEqual(12);
    expect(result.nodeCount).toEqual(18);

    // unchanged
    expect(result.children[0].type).toEqual(NODE_TYPES.PALETTE);
    expect(result.children[0].children[0].children.length).toEqual(4);

    // unchanged part of the canvas
    expect(result.children[1].type).toEqual(NODE_TYPES.CANVAS);

    // new child on canvas
    expect(result.children[1].children.length).toEqual(2);
    expect(
      scrubb(Tree.print(result, (node) => `${node.type} ${node.info}`)),
    ).toBe(
      scrubb(`root id:0 height:0 parent:null index:null
      palette id:1 height:1 parent:0 index:0
        palette id:3 height:2 parent:1 index:0
          palette id:4 height:3 parent:3 index:0
            palette id:5 height:4 parent:4 index:0
          palette id:6 height:3 parent:3 index:1
            palette id:7 height:4 parent:6 index:0
          palette id:8 height:3 parent:3 index:2
            palette id:9 height:4 parent:8 index:0
          palette id:10 height:3 parent:3 index:3
            palette id:11 height:4 parent:10 index:0
      canvas id:2 height:1 parent:0 index:1
        canvas id:12 height:2 parent:2 index:0
          canvas id:13 height:3 parent:12 index:0
            canvas id:14 height:4 parent:13 index:0
        canvas id:15 height:2 parent:2 index:1
          canvas id:16 height:3 parent:15 index:0
             canvas id:17 height:4 parent:16 index:0`),
    );
  });
});

describe('Meta features', () => {
  //------------------------------------------------------------------------------
  //
  const tree = Tree.fromObsEtl(data.obsEtl);
  test('Breadth-first iteration: nodes at level 2', () => {
    expect(tree.nodesAtHeight(2).length).toEqual(1);
  });
  const event = {
    draggableId: 4,
    source: { droppableId: 3, index: 0 },
    destination: { droppableId: 2, index: 0 },
  };

  const ref = Tree.moveNode(Tree.clone(tree), {
    event,
    moveOrCopy: 'COPY',
    DEBUG: false,
  }).root;

  test('... now one more at that level', () => {
    expect(ref.nodesAtHeight(2).length).toEqual(2);
  });
  //------------------------------------------------------------------------------
  test('Retrieve an arbitrary node - palette @height 1', () => {
    const foundNode = Tree.maybeNode(tree, {
      type: NODE_TYPES.PALETTE,
      height: 1,
      index: 0,
    });
    expect(foundNode.type).toEqual(NODE_TYPES.PALETTE);
    expect(foundNode.height).toEqual(1);
  });
  test('Retrieve an arbitrary node - canvas @height 1', () => {
    const foundNode = Tree.maybeNode(tree, {
      type: NODE_TYPES.CANVAS,
      height: 1,
      index: 1,
    });
    expect(foundNode.type).toEqual(NODE_TYPES.CANVAS);
    expect(foundNode.height).toEqual(1);
  });
  //------------------------------------------------------------------------------
  test('Create a tree with extra canvas superGroup stubbs', () => {
    const tree = Tree.fromObsEtl(data.obsEtl, 3);
    const foundNode = Tree.maybeNode(tree, {
      type: NODE_TYPES.CANVAS,
      height: 1,
      index: 1,
    });
    expect(foundNode.type).toEqual(NODE_TYPES.CANVAS);
    expect(foundNode.height).toEqual(1);
    expect(foundNode.childCount).toEqual(3);
  });
});
