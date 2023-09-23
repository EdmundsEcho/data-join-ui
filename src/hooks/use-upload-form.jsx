import { useState } from 'react';
import axios from 'axios';

/* eslint-disable no-console */

export const useUploadForm = (url) => {
  const [isSuccess, setIsSuccess] = useState(() => false);
  const [progress, setProgress] = useState(() => 0);
  const [isLoading, setIsLoading] = useState(() => false);

  const uploadForm = async (formData) => {
    setIsLoading(true);
    await axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        setProgress((progressEvent.loaded / progressEvent.total) * 50);
      },
    });
    setIsLoading(false);
    setIsSuccess(true);
  };

  return { uploadForm, isSuccess, isLoading, progress };
};
