import { useState } from 'react';
import axios from 'axios';

/* eslint-disable no-console, no-shadow */

export const useUploadForm = (url) => {
  const [status, setStatus] = useState(() => 'initializing'); // 'successful', 'failed'
  const [progress, setProgress] = useState(() => 0);
  const [isLoading, setIsLoading] = useState(() => false);

  const uploadForm = async (formData) => {
    setIsLoading(true);
    try {
      const response = await axios.post(url, formData, {
        onUploadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          const progress = Math.floor((loaded * 100) / total);
          setProgress(() => progress);
          // console.debug(progressEvent);
          // console.debug(progress);
        },
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStatus('successful');
      return response;
    } catch (e) {
      setStatus('failed');
      return e;
    } finally {
      setIsLoading(false);
    }
  };

  return { uploadForm, status, isLoading, progress };
};
