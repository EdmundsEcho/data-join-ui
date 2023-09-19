import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
// import { useLocation, useParams, useSearchParams } from 'react-router-dom';

/* eslint-disable no-console */

const Result = ({ status }) => {
  if (status === 'success') {
    return <p>✅ Uploaded successfully!</p>;
  }
  if (status === 'fail') {
    return <p>❌ Upload failed!</p>;
  }
  if (status === 'uploading') {
    return <p>⏳ Uploading started...</p>;
  }
  return null;
};

Result.propTypes = {
  status: PropTypes.oneOf(['success', 'fail', 'uploading']).isRequired,
};

// const DRIVE_AUTH_URL = process.env.REACT_APP_DRIVE_AUTH_URL;
const makeUploadUrl = (projectId) => {
  return `https://www.lucivia.net/v1/upload/${projectId}`;
};

const MultipleFileUploader = ({projectId, className}) => {

  const [files, setFiles] = useState(() => []);
  // < "initial" | "uploading" | "success" | "fail" >
  const [status, setStatus] = useState(() => 'initial');

  const handleFileChange = (e) => {
        // save the file objects
    if (e.target.files) {
      setStatus('initial');
      setFiles(e.target.files);
    }
  };

  const handleUpload = async () => {
    if (files) {
      setStatus('uploading');

      const formData = new FormData();

      // append to files (coordinate with tnc-py)
      // (reuse the same key to create an index)
      [...files].forEach((file) => {
        formData.append('files', file);
      });

      console.log("🦀 Debugging output of input");
      console.debug(formData);

      try {
        const result = await fetch(makeUploadUrl(projectId), {
          method: 'POST',
          body: formData,
        });

        const data = await result.json();

        console.log(data);
        setStatus('success');
      } catch (error) {
        console.error(error);
        setStatus('fail');
      }
    }
  };

  return (
    <div className={className}>
      <div className='input-group'>
        <label htmlFor='file' className='sr-only'>
          Choose files
          <input id='upload-files'
                 type='file'
                 name='files'
                 multiple
                 onChange={handleFileChange} />
        </label>
      </div>
      {files &&
        [...files].map((file, index) => (
          <section key={file.name}>
            File number {index + 1} details:
            <ul>
              <li>Name: {file.name}</li>
              <li>Type: {file.type}</li>
              <li>Size: {file.size} bytes</li>
              <li>Last modified: {file.lastModified}</li>
            </ul>
          </section>
        ))}

      {files && (
        <button type='submit' onClick={handleUpload} className='submit'>
          Upload {files.length > 1 ? 'files' : 'a file'}
        </button>
      )}

      <Result status={status} />
    </div>
  );
};

MultipleFileUploader.propTypes = {
    className: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired
}

export default MultipleFileUploader;
