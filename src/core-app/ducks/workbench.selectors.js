// import { Tree } from '../lib/obsEtlToMatrix/tree';

// tree-specific selectors
// to be integrated with rootSelectors;
export const selectPaletteGroup = (state) => {
  try {
    return state.workbench.tree.children[0].children[0].children;
  } catch (e) {
    return [];
  }
};

export const selectCanvasNode = (state) =>
  state.workbench.tree && state.workbench.tree.children
    ? state.workbench.tree.children[1]
    : {};

/*
export const selectCanvasNodeCount = (state) =>
  state.workbench.tree && state.workbench.tree.children[1]
    ? Tree.findNodes(
        state.workbench.tree.children[1],
        (t) => t.data.type === 'card',
      ).length
    : 0;
    */
