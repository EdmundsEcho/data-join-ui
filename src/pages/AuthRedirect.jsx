/**
 *
 * Authorization (not Authentication)
 *
 * Include this component in the routes configuration
 * navigate(/auth?provider=...&projectId=...) -> this component
 *
 */
import { useSearchParams, useLocation } from 'react-router-dom';
import usePersistedState from '../core-app/hooks/use-persisted-state';

const AUTH_URL = process.env.REACT_APP_DRIVE_AUTH_URL;
export const AuthRedirect = () => {
  // 1. persist the history stored in location to local storage
  // (consumed by the RedirectPage, navigate(origin))
  const location = useLocation();
  const origin = location.state?.fromPathname || '/';
  usePersistedState(`tncAuthRedirectOrigin`, origin);

  // 2. redirect to the authorization url
  const [search] = useSearchParams();
  const provider = search.get('provider');
  const projectId = search.get('projectId');
  const url = `${AUTH_URL}/${provider}/${projectId}`;
  window.location.replace(url);

  return null;
};
