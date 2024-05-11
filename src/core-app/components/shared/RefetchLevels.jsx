/**
 * Experimental.  Works in conjunction with the use-poll-status hook.
 */

import React, { useState, useContext } from 'react';
import { useParams } from 'react-router-dom';

import { startInspectionTask } from '../../services/api'; // Import the API function
import useFetchStatus from '../../../hooks/use-poll-status'; // Import the custom hook
import useAbortController from '../../../hooks/use-abort-controller'; // Import the custom hook
import { Context as HeaderViewContext } from '../HeaderViewContext';

const RefetchLevels = () => {
  const { projectId } = useParams();
  const { filename } = useContext(HeaderViewContext);
  const [taskId, setTaskId] = useState(() => null);
  const [taskStatus, error, turnOn] = useFetchStatus(projectId, taskId);
  const abortController = useAbortController();
  /* r = {
      "status": "Successful",
      "count": None,
      "results": {
          "project_id": project_id,
          "job_id": jid,
          "process_id": pid,
          "service": service,
      },
  } */
  console.debug('Headerview filename:', filename);
  console.debug('jid', taskId);
  const handleStartTask = async () => {
    try {
      const ticket = await startInspectionTask(
        projectId,
        { project_id: projectId, path: filename },
        abortController.signal,
      );
      console.debug('ticket', ticket);
      setTaskId(() => ticket?.results?.job_id);
      turnOn(true);
    } catch (err) {
      console.error('Failed to start task:', err.message);
    }
  };

  return (
    <div>
      <button onClick={handleStartTask}>Start Fetch</button>
      {taskId && (
        <>
          <h4>Task Status for ID: {taskId}</h4>
          <p>{taskStatus}</p>
          {error && <p>Error: {error}</p>}
        </>
      )}
    </div>
  );
};

export default RefetchLevels;
