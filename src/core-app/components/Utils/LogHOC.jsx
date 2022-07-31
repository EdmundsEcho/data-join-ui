import React from 'react';
import { debug } from '../../constants/variables';

/* eslint-disable no-console */

/**
 *
 * Re-render debugging tool.
 * Logs when pure components are rendered.
 *
 * [Source] (https://marmelab.com/blog/2017/02/06/react-is-slow-react-is-fast.html)
 *
 *```js
 * // in src/MyComponent.js
 * import log from './log';
 * export default log(MyComponent);
 * ```
 *
 * @category Utility
 *
 * @component
 *
 */

// in src/log.js
const log = (BaseComponent) => (props) => {
  console.log(`%cRendering ${BaseComponent.name}`, debug.color.orange);
  return <BaseComponent {...props} />;
};
export default log;
