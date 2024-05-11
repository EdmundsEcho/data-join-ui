import { interpret, createMachine } from 'xstate';
import {
  newSelectionModel,
  EVENT_TYPES,
  ALL_STATE,
  PURPOSE_TYPES,
  COMPUTATION_TYPES,
  REQUEST_TYPES,
  testSuite,
} from './selectionModel';
import sm, { createSelectionModelMachine } from './xstate-machine';

import testData from './selectionModel.data.json';
import testFn from '../obsEtlToMatrix/matrix-request';

/* eslint-disable no-console */

describe('Build rules', () => {
  const { ALL } = testSuite;
  test('baseRequestValue from bool true', () => {
    const actual = testSuite.baseRequestValue(true);
    const expected = { [ALL]: { value: ALL, request: true } };
    expect(actual).toMatchObject(expected);
  });
  test('baseRequestValue from bool false', () => {
    const actual = testSuite.baseRequestValue(false);
    const expected = { [ALL]: { value: ALL, request: false } };
    expect(actual).toMatchObject(expected);
  });
  test('allState from the All value', () => {
    const actual = testSuite.allStateFromAllValue(true);
    const expected = ALL_STATE.SELECT_ALL;
    expect(actual).toBe(expected);
  });
  test('allState from the All value in model', () => {
    const model = newSelectionModel({
      purpose: PURPOSE_TYPES.QUALITY,
      rowCountTotal: 3,
    });
    const actual = testSuite.allStateFromAllValue(model);
    const expected = ALL_STATE.SELECT_ALL;
    expect(actual).toBe(expected);
  });
  test('requestType from the All value', () => {
    const actual = testSuite.requestTypeFromAllValue(true);
    const expected = REQUEST_TYPES.ANTIREQUEST;
    expect(actual).toBe(expected);
  });
  test('allState from the All value in model', () => {
    const model = newSelectionModel({
      purpose: PURPOSE_TYPES.QUALITY,
      rowCountTotal: 3,
    });
    const actual = testSuite.requestTypeFromAllValue(model);
    const expected = REQUEST_TYPES.ANTIREQUEST;
    expect(actual).toBe(expected);
  });
  test('model from ALL_STATE.SELECT_ALL', () => {
    const actual = testSuite.modelFromAllState(ALL_STATE.SELECT_ALL);
    const expected = {
      values: testSuite.baseRequestValue(true),
      requestType: testSuite.requestTypeFromAllValue(true),
    };
    expect(actual.values).toMatchObject(expected.values);
    expect(actual.requestType).toBe(expected.requestType);
    expect(actual.requestType).toBe(REQUEST_TYPES.ANTIREQUEST);
  });
  test('model from ALL_STATE.SELECT_NONE', () => {
    const actual = testSuite.modelFromAllState(ALL_STATE.SELECT_NONE);
    const expected = {
      values: testSuite.baseRequestValue(false),
      requestType: testSuite.requestTypeFromAllValue(false),
    };
    expect(actual.values).toMatchObject(expected.values);
    expect(actual.requestType).toBe(expected.requestType);
    expect(actual.requestType).toBe(REQUEST_TYPES.REQUEST);
  });
});

describe('handleToggleAllUpdate rules', () => {
  test('When in SELECT_NONE, sets requestType to REQUEST', () => {
    const { ALL } = testSuite;
    const state = { allState: ALL_STATE.SELECT_NONE };
    const context = {
      selectionModel: {
        requestType: 'will be reset',
        values: { a: { a: 'does not matter' } },
      },
    };
    const actual = testSuite.handleToggleAllUpdate(context, state);
    expect(actual.requestType).toBe(REQUEST_TYPES.REQUEST);
    expect(actual.values[ALL].request).toBe(false);
  });
  test('When in SELECT_ALL, sets requestType to ANTIREQUEST', () => {
    const { ALL } = testSuite;
    const state = { allState: ALL_STATE.SELECT_ALL };
    const context = {
      selectionModel: {
        requestType: 'will be reset',
        values: { a: { a: 'does not matter' } },
      },
    };
    const actual = testSuite.handleToggleAllUpdate(context, state);
    expect(actual.requestType).toBe(REQUEST_TYPES.ANTIREQUEST);
    expect(actual.values[ALL].request).toBe(true);
  });
});

describe('Selection Model Response to Events', () => {
  let actor;

  beforeEach(() => {
    const dispatchContext = (context, event) => {
      console.debug('Event processed:', event.type, context);
    };
    actor = init({ dispatchContext, LOG: false, DEBUG: false });
  });

  afterEach(() => {
    actor.stop();
  });

  // ---------------------------------------------------------------------------
  // Results for global use
  let results = [];
  const resetResults = () => {
    results = [];
  };

  const simulateEvent = (event) => {
    try {
      actor.send(event);
      const currentContext = actor.state.context;
      results.push({
        testEvent: event,
        context: currentContext,
        read: `isSelected: ${event.isSelected} ${currentContext.selectionModel.requestType}`,
        state: actor.state.value,
        shouldAddOrRemove:
          event.type === EVENT_TYPES.onRowClick
            ? testSuite.shouldAddOrRemove(
                event.isSelected,
                currentContext.selectionModel.requestType,
              )
            : { event: event.type },
        result: {
          count: Object.keys(currentContext.selectionModel.values).length,
          requestType: currentContext.selectionModel.requestType,
        },
      });
    } catch (e) {
      console.error('It went bad in the test', {
        state: JSON.stringify(actor.state.value, null, 2),
        history: JSON.stringify(actor.state.historyValue, null, 2),
      });
      throw e;
    }
  };

  const processResult = (expectedResult, index) => {
    const { count, requestType } =
      typeof expectedResult === 'number'
        ? { count: expectedResult, requestType: undefined }
        : expectedResult;

    if (results[index]) {
      console.debug(
        `Test ${index + 1}: actual: ${JSON.stringify(
          results[index],
          null,
          2,
        )} \nexpected: ${JSON.stringify(expectedResult, null, 2)}`,
        '\nState: ',
        actor.state.value,
      );
      expect(results[index].result.count).toBe(count);
      if (requestType) {
        expect(results[index].result.requestType).toBe(requestType);
      }
    }
  };
  // ---------------------------------------------------------------------------

  test('quality - processes each event correctly', () => {
    resetResults();

    const expected = [
      { count: 1, requestType: REQUEST_TYPES.ANTIREQUEST },
      2,
      1,
      { count: 1, requestType: REQUEST_TYPES.ANTIREQUEST },
      { count: 1, requestType: REQUEST_TYPES.REQUEST },
      { count: 1, requestType: REQUEST_TYPES.ANTIREQUEST },
      { count: 1, requestType: REQUEST_TYPES.REQUEST },
      2,
      1,
      2,
      3,
      { count: 1, requestType: REQUEST_TYPES.ANTIREQUEST },
      2,
      3,
      { count: 1, requestType: REQUEST_TYPES.REQUEST },
      2,
      3,
      { count: 1, requestType: REQUEST_TYPES.ANTIREQUEST },
      2,
      3,
    ];

    actor.start();

    simulateEvent({
      type: EVENT_TYPES.INIT,
      selectionModel: newSelectionModel({
        purpose: PURPOSE_TYPES.QUALITY,
        rowCountTotal: 3,
      }),
    });
    const { onRowClick } = EVENT_TYPES;
    const { onToggleAll } = EVENT_TYPES;
    simulateEvent({ type: onRowClick, id: 'row1', isSelected: false });
    simulateEvent({ type: onRowClick, id: 'row1', isSelected: true });
    simulateEvent({ type: onToggleAll, isSelected: true });
    simulateEvent({ type: onToggleAll, isSelected: false });
    simulateEvent({ type: onToggleAll, isSelected: true });
    simulateEvent({ type: onToggleAll, isSelected: false });
    simulateEvent({ type: onRowClick, id: 'row2', isSelected: true });
    simulateEvent({ type: onRowClick, id: 'row2', isSelected: false });
    simulateEvent({ type: onRowClick, id: 'row1', isSelected: true });
    simulateEvent({ type: onRowClick, id: 'row2', isSelected: true });
    // will switch build type to onToggleAll isSelected true
    simulateEvent({ type: onRowClick, id: 'row3', isSelected: true });
    // now in ANTIREQUEST
    simulateEvent({ type: onRowClick, id: 'row1', isSelected: false });
    simulateEvent({ type: onRowClick, id: 'row2', isSelected: false });
    // will switch build type to onToggleAll isSelected false
    simulateEvent({ type: onRowClick, id: 'row3', isSelected: false });
    // now in REQUEST
    simulateEvent({ type: onRowClick, id: 'row1', isSelected: true });
    simulateEvent({ type: onRowClick, id: 'row2', isSelected: true });
    simulateEvent({ type: onToggleAll, isSelected: true });
    simulateEvent({ type: onRowClick, id: 'row1', isSelected: false });
    simulateEvent({ type: onRowClick, id: 'row2', isSelected: false });
    simulateEvent({ type: onRowClick, id: 'row3', isSelected: false });

    expected.forEach(processResult);
  });

  test('component - processes each event correctly', () => {
    resetResults();
    const expected = [
      0,
      { count: 1, requestType: REQUEST_TYPES.REQUEST },
      0,
      { count: 2, requestType: REQUEST_TYPES.REQUEST },
      { count: 3, requestType: REQUEST_TYPES.REQUEST },
      { count: 2, requestType: REQUEST_TYPES.REQUEST },
      { count: 1, requestType: REQUEST_TYPES.REQUEST },
      { count: 1, requestType: REQUEST_TYPES.ANTIREQUEST },
      { count: 2, requestType: REQUEST_TYPES.ANTIREQUEST },
      { count: 1, requestType: REQUEST_TYPES.ANTIREQUEST },
      { count: 2, requestType: REQUEST_TYPES.ANTIREQUEST },
      { count: 1, requestType: REQUEST_TYPES.REQUEST },
      2,
      3,
      { count: 1, requestType: REQUEST_TYPES.ANTIREQUEST },
      2,
      2,
      3,
      { count: 1, requestType: REQUEST_TYPES.REQUEST },
      2,
      3,
      { count: 1, requestType: REQUEST_TYPES.REQUEST },
      { count: 1, requestType: REQUEST_TYPES.ANTIREQUEST },
      2,
      { count: 1, requestType: REQUEST_TYPES.ANTIREQUEST },
      { count: 1, requestType: REQUEST_TYPES.ANTIREQUEST },
    ];
    // const expected = [0, 1, 2, 1, 1, 2, 1, 1, 2, 3, 4, 1, 2, 3, 4];
    actor.start();
    const initEvent = () =>
      simulateEvent({
        type: EVENT_TYPES.INIT,
        selectionModel: newSelectionModel({
          purpose: PURPOSE_TYPES.MCOMP,
          rowCountTotal: 3,
        }),
      });
    const seed = newSelectionModel({
      purpose: PURPOSE_TYPES.MCOMP,
      rowCountTotal: 3,
    });
    const resume = () =>
      simulateEvent({
        type: EVENT_TYPES.RESUME,
        selectionModel: {
          ...seed,
          values: {
            ...seed.values,
            row1: { value: 'row1', request: true },
          },
        },
      });
    const reset = () => simulateEvent({ type: EVENT_TYPES.RESET });
    reset();
    initEvent();
    reset();
    resume();
    const { onRowClick } = EVENT_TYPES;
    const { onToggleAll } = EVENT_TYPES;
    // select none is the initial state for the mcomp type
    simulateEvent({ type: onRowClick, id: 'row2', isSelected: true });
    simulateEvent({ type: onRowClick, id: 'row2', isSelected: false });
    simulateEvent({ type: onRowClick, id: 'row1', isSelected: false });
    // select all
    simulateEvent({ type: onToggleAll, isSelected: true });
    simulateEvent({ type: onRowClick, id: 'row2', isSelected: false });
    simulateEvent({ type: onRowClick, id: 'row2', isSelected: true });
    simulateEvent({ type: onRowClick, id: 'row2', isSelected: false });
    simulateEvent({ type: onToggleAll, isSelected: false });
    simulateEvent({ type: onRowClick, id: 'row1', isSelected: true });
    simulateEvent({ type: onRowClick, id: 'row2', isSelected: true });
    // will switch build type to onToggleAll isSelected true
    simulateEvent({ type: onRowClick, id: 'row3', isSelected: true });
    simulateEvent({ type: onRowClick, id: 'row1', isSelected: false });
    // ignores repeated entries
    simulateEvent({ type: onRowClick, id: 'row1', isSelected: false });
    simulateEvent({ type: onRowClick, id: 'row2', isSelected: false });
    // will switch build type to onToggleAll isSelected false
    simulateEvent({ type: onRowClick, id: 'row3', isSelected: false });
    simulateEvent({ type: onRowClick, id: 'row1', isSelected: true });
    simulateEvent({ type: onRowClick, id: 'row2', isSelected: true });
    // clear values when hit toggleAll = false, matching current build state
    simulateEvent({ type: onToggleAll, isSelected: false });
    // test clear values from the toggleAll = true
    simulateEvent({ type: onToggleAll, isSelected: true });
    simulateEvent({ type: onRowClick, id: 'row1', isSelected: false });
    simulateEvent({ type: onToggleAll, isSelected: true });
    simulateEvent({ type: onToggleAll, isSelected: true });

    expected.forEach(processResult);
  });
});

describe('Component -> machine transitions', () => {
  const machine = createMachine(sm.baseMachineConfig, sm.baseMachineOptions);
  let service;

  beforeEach(() => {
    service = interpret(machine).start();
  });
  afterEach(() => {
    service.stop();
  });

  test('init transition for mspan', () => {
    const event = {
      type: EVENT_TYPES.INIT,
      selectionModel: newSelectionModel({
        purpose: PURPOSE_TYPES.MSPAN,
        rowCountTotal: 3,
      }),
    };
    service.send(event);
    // initial state for mspan
    console.log('💥 Current State:', service.state.value);
    expect(service.state.value).toMatchObject({
      active: {
        allState: { SELECT_NONE: 'waiting' },
        computationType: 'SERIES',
        antiRequestFeature: 'disabled',
      },
    });

    service.send({ type: EVENT_TYPES.onSetReduceComputation, isSelected: true });
    console.log('💥 Current State:', service.state.value);
    expect(service.state.value).toEqual({
      active: {
        allState: { SELECT_NONE: 'waiting' },
        computationType: 'REDUCE',
        antiRequestFeature: 'enabled',
      },
    });

    service.send({ type: EVENT_TYPES.onSetReduceComputation, isSelected: false });
    console.log('💥 Current State:', service.state.value);
    expect(service.state.value).toEqual({
      active: {
        allState: { SELECT_NONE: 'waiting' },
        computationType: 'SERIES',
        antiRequestFeature: 'disabled',
      },
    });
  });
});

describe('Selection -> Request fragment', () => {
  const machine = createMachine(sm.baseMachineConfig, sm.baseMachineOptions);
  let service;

  beforeEach(() => {
    service = interpret(machine).start();
  });
  afterEach(() => {
    service.stop();
  });

  test('mcomp -> request fragment', () => {
    const valueType = 'txtValues';
    const expected = findFirstComponentWithValue(testData, 0, valueType);
    const requestValues = expected.componentValues[valueType];

    console.debug('✅ expected', expected);
    console.debug('requestValues', requestValues);

    // extract data from expected to generate the mock event
    const purpose = Object.keys(expected.componentValues).includes('spanValues')
      ? PURPOSE_TYPES.MSPAN
      : PURPOSE_TYPES.MCOMP;

    // reduced true
    service.send({
      type: EVENT_TYPES.INIT,
      selectionModel: newSelectionModel({
        purpose,
        rowCountTotal: 3,
      }),
    });
    service.send({ type: 'onToggleAll', isSelected: true });
    requestValues.forEach((value) => {
      service.send({ type: 'onRowClick', id: value, isSelected: false });
    });
    expect(service.state.value.active.computationType).toBe(
      purpose === PURPOSE_TYPES.MSPAN
        ? COMPUTATION_TYPES.SERIES
        : COMPUTATION_TYPES.REDUCE,
    );
    // set computation type to SERIES
    service.send({ type: EVENT_TYPES.onSetReduceComputation, isSelected: false });
    expect(service.state.value.active.computationType).toBe(COMPUTATION_TYPES.SERIES);

    const preFragment = mkMockQualOrComp(
      purpose,
      valueType,
      expected,
      service.state.context.selectionModel,
    );
    const actual = testFn.mkComponent(preFragment);

    // the computation type -> reduced
    expect(preFragment.selectionModel.computationType).toBe(COMPUTATION_TYPES.SERIES);
    expect(actual.componentValues.reduced).toBe(false);

    // the requested values -> componentValues.txtValues
    expect(Object.keys(preFragment.selectionModel.values).length).toBe(1); // includes ALL
    expect(actual.componentValues.txtValues.length).toBe(0);
    expect(actual.antiRequest).toBe(false);
    expect(service.state.value).toMatchObject({
      active: {
        antiRequestFeature: 'disabled',
        allState: { SELECT_NONE: 'waiting' },
        computationType: 'SERIES',
      },
    });
  });

  test('quality -> request fragment', () => {
    const valueType = 'txtValues';
    const expected = testData.variables.request.subReq.qualityMix[0];
    const requestValues = expected.qualityValues[valueType];

    console.debug('✅ expected', expected);
    console.debug('requestValues', requestValues);

    // extract data from expected to generate the mock event
    const purpose = PURPOSE_TYPES.QUALITY;
    service.send({
      type: EVENT_TYPES.INIT,
      selectionModel: newSelectionModel({
        purpose,
        rowCountTotal: 44,
      }),
    });

    service.send({ type: 'onToggleAll', isSelected: true });
    requestValues.forEach((value) => {
      service.send({ type: 'onRowClick', id: value, isSelected: false });
    });
    expect(service.state.value.active.computationType).toBe(COMPUTATION_TYPES.SELECT);
    // set computation type to SERIES -> ignored
    service.send({ type: EVENT_TYPES.onSetReduceComputation, isSelected: false });
    expect(service.state.value.active.computationType).toBe(COMPUTATION_TYPES.SELECT);

    const preFragment = mkMockQualOrComp(
      purpose,
      valueType,
      expected,
      service.state.context.selectionModel,
    );
    const actual = testFn.mkQuality(preFragment);

    // the computation type reduced bool -> undefined
    expect(preFragment.selectionModel.computationType).toBe(COMPUTATION_TYPES.SELECT);
    expect(actual.qualityValues?.reduced ?? true).toBe(true);

    // the requested values -> componentValues.txtValues
    expect(Object.keys(preFragment.selectionModel.values).length).toBe(
      expected.qualityValues.txtValues.length + 1,
    ); // includes ALL
    expect(actual.qualityValues.txtValues.length).toBe(
      expected.qualityValues.txtValues.length,
    );
    expect(actual).toMatchObject(expected);
  });
});

describe('Test machine transitions', () => {
  const machine = createMachine(sm.baseMachineConfig, sm.baseMachineOptions);
  let actor;

  beforeEach(() => {
    actor = interpret(machine).start();
  });
  afterEach(() => {
    actor.stop();
  });

  test('start in idle state', () => {
    expect(actor.state.matches('idle')).toBe(true);
  });
  test('init transition for mspan', () => {
    const event = {
      type: EVENT_TYPES.INIT,
      selectionModel: newSelectionModel({
        purpose: PURPOSE_TYPES.MSPAN,
        rowCountTotal: 3,
      }),
    };
    actor.send(event);
    console.log('💥 Current State:', actor.state.value);
    expect(actor.state.value).toMatchObject({
      active: {
        antiRequestFeature: 'disabled',
        allState: { SELECT_NONE: 'waiting' },
        computationType: 'SERIES',
      },
    });
  });
  test('init transition for mspan toggle to reduce', () => {
    const event = {
      type: EVENT_TYPES.INIT,
      selectionModel: newSelectionModel({
        purpose: PURPOSE_TYPES.MSPAN,
        rowCountTotal: 3,
      }),
    };
    actor.send(event);
    actor.send({ type: 'onSetReduceComputation', isSelected: true });
    console.log('💥 Current State:', actor.state.value);
    expect(actor.state.value).toEqual({
      active: {
        antiRequestFeature: 'enabled',
        allState: { SELECT_NONE: 'waiting' },
        computationType: 'REDUCE',
      },
    });
  });
  test('init transition for mcomp', () => {
    const event = {
      type: EVENT_TYPES.INIT,
      selectionModel: newSelectionModel({
        purpose: PURPOSE_TYPES.MCOMP,
        rowCountTotal: 3,
      }),
    };
    actor.send(event);
    expect(
      actor.state.matches({
        active: { allState: 'SELECT_NONE', computationType: 'REDUCE' },
      }),
    ).toBe(true);
  });
  test('init transition for mcomp toggle to series', () => {
    const event = {
      type: EVENT_TYPES.INIT,
      selectionModel: newSelectionModel({
        purpose: PURPOSE_TYPES.MCOMP,
        rowCountTotal: 3,
      }),
    };
    actor.send(event);
    actor.send({
      type: 'onSetReduceComputation',
      isSelected: false,
    });
    expect(
      actor.state.matches({
        active: { allState: 'SELECT_NONE', computationType: 'SERIES' },
      }),
    ).toBe(true);
  });
  test('init transition for mcomp toggle to series and back', () => {
    const event = {
      type: EVENT_TYPES.INIT,
      selectionModel: newSelectionModel({
        purpose: PURPOSE_TYPES.MCOMP,
        rowCountTotal: 3,
      }),
    };
    actor.send(event);
    actor.send({
      type: 'onSetReduceComputation',
      isSelected: false,
    });
    actor.send({
      type: 'onSetReduceComputation',
      isSelected: true,
    });
    expect(
      actor.state.matches({
        active: { allState: 'SELECT_NONE', computationType: 'REDUCE' },
      }),
    ).toBe(true);
  });
  test('init transition for quality', () => {
    const event = {
      type: EVENT_TYPES.INIT,
      selectionModel: newSelectionModel({
        purpose: PURPOSE_TYPES.QUALITY,
        rowCountTotal: 44,
      }),
    };
    actor.send(event);
    expect(
      actor.state.matches({
        active: { allState: 'SELECT_ALL', computationType: 'SELECT' },
      }),
    ).toBe(true);
    /*
    console.debug(actor.state);
    const { value: state } = actor.state;
    expect(state.active.allState).toBe('SELECT_ALL');
    expect(state.active.computationType).toBe('SELECT');
    */
    // will ignore reduce/series event
    actor.send({
      type: 'onSetReduceComputation',
      isSelected: false,
    });
    expect(
      actor.state.matches({
        active: { allState: 'SELECT_ALL', computationType: 'SELECT' },
      }),
    ).toBe(true);
  });
  test('reset transition to idle state', () => {
    const event = {
      type: EVENT_TYPES.INIT,
      selectionModel: newSelectionModel({
        purpose: PURPOSE_TYPES.QUALITY,
        rowCountTotal: 44,
      }),
    };
    actor.send(event);
    expect(
      actor.state.matches({
        active: { allState: 'SELECT_ALL', computationType: 'SELECT' },
      }),
    ).toBe(true);
    actor.send({ type: 'RESET' });
    expect(actor.state.matches('idle')).toBe(true);
  });
  test('init transition from idle', () => {
    const event = {
      type: EVENT_TYPES.INIT,
      selectionModel: newSelectionModel({
        purpose: PURPOSE_TYPES.QUALITY,
        rowCountTotal: 44,
      }),
    };
    actor.send(event);
    expect(
      actor.state.matches({
        active: {
          allState: ALL_STATE.SELECT_ALL,
          computationType: COMPUTATION_TYPES.SELECT,
        },
      }),
    ).toBe(true);
    actor.send({ type: 'RESET' });
    actor.send(event);
    console.log('💥 Current State:', actor.state.value);
    expect(
      actor.state.matches({
        active: {
          allState: ALL_STATE.SELECT_ALL,
          computationType: COMPUTATION_TYPES.SELECT,
        },
      }),
    ).toBe(true);
  });
});

describe('Test resuming transitions', () => {
  // The user determines whether to resume using the provided
  // selection model by sending the resume event.
  const machine = createMachine(sm.baseMachineConfig, sm.baseMachineOptions);

  let actor;

  beforeEach(() => {
    actor = interpret(machine).start();
  });
  afterEach(() => {
    actor.stop();
  });

  test('start in idle state', () => {
    expect(actor.state.matches('idle')).toBe(true);
  });
  test('resume transition', () => {
    const seed = newSelectionModel({
      purpose: PURPOSE_TYPES.MCOMP,
      rowCountTotal: 3,
    });
    const selectionModel = {
      ...seed,
      values: {
        ...seed.values,
        row1: { value: 'row1', request: true },
      },
    };
    const event = {
      type: EVENT_TYPES.RESUME,
      selectionModel,
    };
    actor.send(event);
    expect(
      actor.state.matches({
        active: { allState: 'SELECT_NONE', computationType: 'REDUCE' },
      }),
    ).toBe(true);
    expect(Object.keys(actor.state.context.selectionModel.values).length === 2).toBe(
      true,
    );
  });
  test('repeated init ignored until reset', () => {
    const initEvent = {
      type: EVENT_TYPES.INIT,
      selectionModel: newSelectionModel({
        purpose: PURPOSE_TYPES.QUALITY,
        rowCountTotal: 4,
      }),
    };
    actor.send(initEvent);
    actor.send({ type: 'onRowClick', isSelected: false });
    expect(
      actor.state.matches({
        active: { allState: 'SELECT_ALL', computationType: 'SELECT' },
      }),
    ).toBe(true);
    expect(Object.keys(actor.state.context.selectionModel.values).length === 2).toBe(
      true,
    );
    // ignore init
    actor.send(initEvent);
    expect(Object.keys(actor.state.context.selectionModel.values).length === 2).toBe(
      true,
    );
  });
  test('resume then init ignored until reset', () => {
    const seed = newSelectionModel({
      purpose: PURPOSE_TYPES.MCOMP,
      rowCountTotal: 3,
    });
    const selectionModel = {
      ...seed,
      values: {
        ...seed.values,
        row1: { value: 'row1', request: true },
      },
    };
    const event = {
      type: EVENT_TYPES.RESUME,
      selectionModel,
    };
    actor.send(event);
    expect(
      actor.state.matches({
        active: { allState: { SELECT_NONE: 'waiting' }, computationType: 'REDUCE' },
      }),
    ).toBe(true);
    expect(Object.keys(actor.state.context.selectionModel.values).length === 2).toBe(
      true,
    );
    // ignore init
    const initEvent = {
      type: EVENT_TYPES.INIT,
      selectionModel: newSelectionModel({
        purpose: PURPOSE_TYPES.QUALITY,
        rowCountTotal: 4,
      }),
    };
    actor.send(initEvent);
    expect(Object.keys(actor.state.context.selectionModel.values).length === 2).toBe(
      true,
    );
  });
});

describe('Disable antiRequestFeature -> machine transitions', () => {
  const machine = createMachine(sm.baseMachineConfig, sm.baseMachineOptions);
  let service;

  beforeEach(() => {
    service = interpret(machine).start();
  });
  afterEach(() => {
    service.stop();
  });

  test('init transition for mcomp', () => {
    const event = {
      type: EVENT_TYPES.INIT,
      selectionModel: newSelectionModel({
        purpose: PURPOSE_TYPES.MCOMP,
        rowCountTotal: 3,
      }),
    };
    service.send(event);

    expect(service.state.value.active).toStrictEqual({
      allState: { SELECT_NONE: 'waiting' },
      antiRequestFeature: 'enabled',
      computationType: 'REDUCE',
    });

    service.send({ type: EVENT_TYPES.onSetReduceComputation, isSelected: false });
    expect(service.state.value.active).toStrictEqual({
      allState: { SELECT_NONE: 'waiting' },
      antiRequestFeature: 'disabled',
      computationType: 'SERIES',
    });
  });
  test('init with antirequest feature disabled', () => {
    const seed = newSelectionModel({
      purpose: PURPOSE_TYPES.MCOMP,
      rowCountTotal: 3,
    });
    const event = {
      type: EVENT_TYPES.RESUME,
      selectionModel: {
        ...seed,
        meta: {
          ...seed.meta,
          reduced: false,
        },
        requestType: REQUEST_TYPES.REQUEST,
        computationType: COMPUTATION_TYPES.SERIES,
        disableAntiRequest: true,
        values: {
          ...testSuite.baseRequestValue(false),
          rw1: { value: 'rw1', request: true },
          rw2: { value: 'rw2', request: true },
          rw3: { value: 'rw3', request: true },
        },
      },
    };
    service.send(event);
    expect(service.state.value.active).toStrictEqual({
      allState: { SELECT_NONE: 'waiting' },
      antiRequestFeature: 'disabled',
      computationType: 'SERIES',
    });
    expect(Object.keys(service.state.context.selectionModel.values).length).toBe(4);
  });
});
// -----------------------------------------------------------------------------
// test helpers
function init({ dispatchContext, LOG = false, DEBUG = false }) {
  const machine = createSelectionModelMachine(dispatchContext);
  const service = interpret(machine).onTransition((state) => {
    if (DEBUG) {
      console.log(JSON.stringify(state.context.selectionModel, null, 2));
    }
  });

  if (LOG) {
    service.onTransition((state) =>
      console.log(JSON.stringify(state.context.selectionModel, null, 2)),
    );
  }

  return service;
}

// -----------------------------------------------------------------------------
// raw data parsing helpers
//
function findFirstComponentWithValue(data, measurementIndex, valueType) {
  // Ensure the data is structured as expected and the index is valid
  if (
    !data.variables ||
    !data.variables.request ||
    !data.variables.request.meaReqs ||
    data.variables.request.meaReqs.length <= measurementIndex
  ) {
    console.error('Invalid data structure or measurement index out of bounds.');
    return null;
  }

  // Get the specific measurement requested
  const measurement = data.variables.request.meaReqs[measurementIndex];

  // Iterate over the component mix to find the first component with the specified value type
  for (const component of measurement.componentMix) {
    if (component.componentValues && component.componentValues[valueType]) {
      return component; // Return the first matching component
    }
  }

  // If no component was found with the specified value type
  console.log(
    `No component found with ${valueType} in measurement index ${measurementIndex}.`,
  );
  return null;
}

function mkMockQualOrComp(purpose, tag, expected, selectionModel) {
  return purpose === PURPOSE_TYPES.QUALITY
    ? {
        tag,
        qualityName: expected.qualityName,
        selectionModel,
      }
    : {
        tag,
        componentName: expected.componentName,
        selectionModel,
      };
}
