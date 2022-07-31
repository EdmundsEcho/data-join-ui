import { REHYDRATE } from 'redux-persist';
import middleware from '../resumePendingJobs';

/**
 * See https://redux.js.org/recipes/writing-tests#middleware
 * @param {object} storeContents
 */
const create = (storeContents = {}) => {
  const store = {
    getState: jest.fn(() => storeContents),
    dispatch: jest.fn(),
  };
  const next = jest.fn();

  const invoke = (action) => middleware(store)(next)(action);

  return { store, next, invoke };
};

describe('middleware', () => {
  describe('resumePendingJobs', () => {
    it('should ignore actions that are not rehydrate', () => {
      const { store, next, invoke } = create();
      const action = { type: 'ANYTHING_ELSE' };
      invoke(action);
      expect(next).toHaveBeenCalledWith(action);
      expect(store.dispatch).not.toHaveBeenCalled();
    });
    it("should not dispatch if there aren't pending inspections", () => {
      const identifier = 'my/file';

      const state = {
        jobs: {
          pending: {
            [identifier]: {
              jobId: '222.111',
              jobType: 'inspection',
              processId: '111',
            },
          },
        },
      };
      const { store, next, invoke } = create(state);
      const action = { type: REHYDRATE };
      invoke(action);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(action);
      expect(store.dispatch).toHaveBeenCalledTimes(1);
      expect(store.dispatch).toHaveBeenCalledWith({
        identifier,
        type: 'jobs/PENDING_JOB_ADD',
        jobType: 'inspection',
        jobId: '222.111',
        processId: '111',
      });
    });
  });
});
