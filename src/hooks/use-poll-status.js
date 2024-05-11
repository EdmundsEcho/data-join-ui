/**
 * Experimental light-weight status check.
 */
import { useState, useEffect } from 'react';
import { apiInstance } from '../core-app/services/api';

/* eslint-disable no-console */

/**
 * @inspection_blueprint.route("/v1/inspection/<project_id>/<jid>", methods=["GET", "DELETE"])  # noqa E501
 */
function useFetchStatus(projectId, taskId) {
  const [status, setStatus] = useState('Pending...');
  const [error, setError] = useState(null);
  const [on, turnOn] = useState(() => false);

  useEffect(() => {
    let interval;
    if (on) {
      const fetchStatus = async () => {
        try {
          const response = await apiInstance({
            url: `/inspection/${projectId}/${taskId}`,
            method: 'GET',
          });
          console.debug('response', response);
          const { data } = response;
          console.log('Task status: ', data);
          if (['SUCCESS', 'FAILURE', 'KILLED'].includes(data.state)) {
            setStatus(`Status: ${data.state} - ${data.status}`);
            clearInterval(interval); // Stop the interval when task completes
          } else {
            setStatus(`Status: ${data.state} - ${data.status}`);
          }
        } catch (err) {
          console.error('Error checking task status:', err);
          setError(err.message);
          clearInterval(interval);
        }
      };

      turnOn(() => false);
      interval = setInterval(fetchStatus, 5000);
    }
    // Cleanup function to clear interval on component unmount
    return () => clearInterval(interval);
  }, [projectId, taskId]); // Dependencies on projectId and taskId

  return [status, error, turnOn];
}

export default useFetchStatus;
