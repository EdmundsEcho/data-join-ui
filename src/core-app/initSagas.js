/**
 * @module initSagas
 *
 * @description
 * Convenience module to be imported when configuring the redux middleware.
 * It will read-in the full inventory of sagas listed in the
 * `src/sagas/index.js` file.
 *
 */
import { all, fork } from 'redux-saga/effects';
import * as sagas from './sagas';
import { SagasError } from './lib/LuciErrors';

// TODO Discuss this change with Edmund
// export default (sagaMiddleware) => {
//  Object.values(sagas).forEach(sagaMiddleware.run.bind(sagaMiddleware));
// }

// https://github.com/redux-saga/redux-saga/issues/171#issuecomment-345042076
export default function* rootSaga() {
  try {
    yield all(Object.values(sagas).map((saga) => fork(saga)));
  } catch (e) {
    throw new SagasError(e);
  }
}
