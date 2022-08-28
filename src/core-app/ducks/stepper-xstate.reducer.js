import { Machine, assign } from 'xstate';

const countMachine = Machine(
  {
    id: 'count',
    context: { count: 0 },
    initial: 'counting',
    states: {
      counting: {
        on: {
          increment: {
            actions: 'increment',
          },
          decrement: {
            actions: 'decrement',
          },
        },
      },
    },
  },
  {
    actions: {
      increment: assign({
        count: (context) => context.count + 1,
      }),
      decrement: assign({
        count: (context) => context.count - 1,
      }),
    },
  },
);

function addReducer(state = countMachine.initialState, event) {
  return countMachine.transition(state, event);
}

export function increment() {
  return {
    type: 'increment',
  };
}

export function decrement() {
  return {
    type: 'decrement',
  };
}

export const getCount = (state) => state.context.count;

export default addReducer;
