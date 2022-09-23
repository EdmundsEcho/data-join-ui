import './wdyr'; // why did you render debug utility

import React, { version as reactVersion } from 'react';
import * as ReactDOMClient from 'react-dom/client';

import * as serviceWorker from './serviceWorker';

// css that works in addition to mui-theme
import './assets/index.css';
import './assets/dashboard.css';
import './assets/core-app-sizing.css';
import './assets/fonts.css';

import Root from './Root';

/* eslint-disable-next-line */
console.info(`App using react version: ${reactVersion}`);

const container = document.getElementById('root');
const root = ReactDOMClient.createRoot(container);
root.render(<Root />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
