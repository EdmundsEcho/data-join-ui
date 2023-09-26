import { useState } from 'react';
import axios from 'axios';

/* eslint-disable no-console */

export const useUploadForm = (url) => {
  const [status, setStatus] = useState(() => 'initializing'); // 'successful', 'failed'
  const [progress, setProgress] = useState(() => ({ pc: 0 }));
  const [isLoading, setIsLoading] = useState(() => false);

  const uploadForm = async (formData) => {
    setIsLoading(true);
    try {
      const response = await axios.post(url, formData, {
        onUploadProgress: (progressEvent) => {
          setProgress((prevState) => {
            return { ...prevState, pc: progressEvent.progress * 100 };
          });
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
