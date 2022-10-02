import { matchPath } from 'react-router-dom';

import { routesConfig } from './routes';

export const isValidRoute = (pathname) => {
  return routesConfig.some(
    ({ path }) => path !== '*' && matchPath(path, pathname),
  );
};

export default isValidRoute;
