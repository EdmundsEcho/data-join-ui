import { useRef, useEffect } from 'react';

/**
 * instantiate the controller: AbortController
 *   - provides a mock value when not supported by the user-agent
 *
 * read the signal object (AbortSignal): AbortController.signal
 * use AbortSignal to communicate or abort a DOM request
 * (can also use AbortController.abort())
 *
 * Pass the AbortSignal to fetch
 *    - axios options: { signal: <this instance> }
 *
 * Usage with a promise:
 * function doSomthingAsync({signal}) {
 *      if (signal.aborted) {
 *         return Promise.reject(new DOMException('Aborted', 'AbortError'));
 *      }
 *      return new Promise((resolve, reject) =>  {
 *           signal.addEventListener('abort', () => {
 *               reject(new DOMException('Aborted', 'AbortError'));
 *           });
 *      });
 * }
 */

const isAbortControllerSupported = Object.prototype.hasOwnProperty.call(
  window,
  'AbortController',
);
const noop = () => null;

const initAbortController = () =>
  isAbortControllerSupported
    ? new AbortController()
    : { abort: noop, signal: {} };

const useAbortController = (abortControllerProp, shouldAutoRestart = false) => {
  const abortController = useRef(abortControllerProp || initAbortController());

  useEffect(() => {
    if (shouldAutoRestart && abortController.current.signal.aborted) {
      abortController.current = initAbortController();
    }
  }, [abortController.current.signal.aborted, shouldAutoRestart]);

  useEffect(() => () => abortController.current.abort(), []);

  return abortController.current;
};

export default useAbortController;
