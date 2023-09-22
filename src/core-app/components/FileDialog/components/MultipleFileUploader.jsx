import React, { useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import moment from 'moment';

import { styled } from '@mui/material/styles';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import FileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';

/* eslint-disable no-console */

// const DRIVE_AUTH_URL = process.env.REACT_APP_DRIVE_AUTH_URL;
const makeUploadUrl = (projectId) => {
  return `https://www.lucivia.net/v1/upload/${projectId}`;
};

const MultipleFileUploader = ({ projectId, className }) => {
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
  const handleDeleteFile = (delFile) => {
    setFiles([...files].filter((file) => file.name !== delFile.name));
  };

  const showSelectButton = files.length === 0;
  console.log(`👉 files in state: ${files.length}`);

  const handleUpload = async () => {
    if (files) {
      setStatus('uploading');

      const formData = new FormData();

      // append to files (coordinate with tnc-py)
      // (reuse the same key to create an index)
      [...files].forEach((file) => {
        formData.append('files', file);
      });

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

  /* display states
   * 1. no files selected
   * 2. files selected
   * 3. files uploaded
   */

  return (
    <Card className={className} sx={{ minHeight: '220px' }}>
      <CardActions>
        <InputFileUpload
          showSelectButton={showSelectButton}
          onChange={handleFileChange}
        />
      </CardActions>

      {files.length > 0 && (
        <div>
          <CardContent>
            <List className='Luci-FileUploader'>
              {[...files].map((file) => (
                <ListItem
                  key={file.name}
                  secondaryAction={
                    <IconButton
                      onClick={() => handleDeleteFile(file)}
                      size='inherit'
                      edge='end'
                      aria-label='delete'>
                      <DeleteIcon fontSize='inherit' />
                    </IconButton>
                  }>
                  <ListItemIcon size='large'>
                    <FileIcon fontSize='large' />
                  </ListItemIcon>
                  <ListItemText
                    primary={file.name}
                    secondary={`${file.size} ${file.type}`}
                  />
                  {/* lastModified */}
                </ListItem>
              ))}
            </List>
          </CardContent>
          <CardActions>
            <Button type='submit' onClick={handleUpload} className='submit'>
              Upload
            </Button>
          </CardActions>
          <Result status={status} />
        </div>
      )}
    </Card>
  );
};

MultipleFileUploader.propTypes = {
  className: PropTypes.string.isRequired,
  projectId: PropTypes.string.isRequired,
};

function InputFileUpload({ onChange, showSelectButton }) {
  return (
    <Button
      className={clsx({ hidden: !showSelectButton })}
      component='label'
      variant='contained'>
      Select files
      <input
        id='upload-files'
        type='file'
        multiple
        className='Lucidrive hidden-input'
        onChange={onChange}
      />
    </Button>
  );
}
InputFileUpload.propTypes = {
  onChange: PropTypes.func.isRequired,
  showSelectButton: PropTypes.bool.isRequired,
};

function Result({ status }) {
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
}
Result.propTypes = {
  status: PropTypes.oneOf(['initial', 'success', 'fail', 'uploading'])
    .isRequired,
};

export default MultipleFileUploader;
