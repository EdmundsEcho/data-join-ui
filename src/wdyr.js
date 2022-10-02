import React from 'react';

/* eslint-disable global-require */

if (
  process.env.NODE_ENV !== 'production' &&
  process.env.REACT_APP_DEBUG_WHY_DID_YOU_RENDER === 'true'
) {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  // const ReactRedux = require('../node_modules/react-redux/lib/index.js');
  whyDidYouRender(React, {
    trackAllPureComponents: true,
    // trackExtraHooks: [[ReactRedux, 'useSelector']],
  });
}

// Usage: will track many automatically
// Manually add the following prop: BigListPureComponent.whyDidYouRender = true
