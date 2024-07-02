import { requestFromTree } from './matrix-request';
import treeData from './workbench-tree.json';

/* eslint-disable no-console */
const DEBUG = false;

const flatTree = Object.values(treeData.tree);

describe('requestFromTree', () => {
  let req;
  beforeAll(() => {
    req = requestFromTree(flatTree);
    if (DEBUG) {
      console.debug(JSON.stringify(req.derivedFields[1], null, 2));
    }
  });

  test('The request should have 2 derived fields', () => {
    expect(req.derivedFields).toHaveLength(2);
  });
  test('The first field has source type MatrixField with a specified field identifier', () => {
    expect(req.derivedFields[0].config.inputs[0].sourceType).toBe('MatrixField');
    expect(req.derivedFields[0].config.inputs[0].identifier).toBe(
      'MeaType::Unit Count.Year-Month::0_20',
    );
  });
  test('The second field has source type EtlUnit with identifier `Unit Count`', () => {
    expect(req.derivedFields[1].config.inputs[0].sourceType).toBe(
      'EtlUnit::measurement',
    );
    expect(req.derivedFields[1].config.inputs[0].identifier).toBe('Unit Count');
  });
});
