import React, { useState } from 'react';
import PropTypes from 'prop-types';

import clsx from 'clsx';
import moment from 'moment';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

import FileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';

import { useUploadForm } from '../../../../hooks';

/* eslint-disable no-console */

const configUppy = {
  id: 'luci-file-uploader',
  autoProceed: false,
  debug: true,
  allowMultipleUpladBatches: true,

  restrictions: {
    maxNumberOfFiles: 20,
    minNumberOfFiles: 1,
    allowFilesTyps: ['csv'],
    maxTotalFileSize: 100 * 1024 * 1024,
    maxFileSize: 80 * 1024 * 1024,
    minFileSize: 16,
  },
};
// const DRIVE_AUTH_URL = process.env.REACT_APP_DRIVE_AUTH_URL;
const makeUploadUrl = (projectId) => {
  return `https://www.lucivia.net/v1/upload/${projectId}`;
};

const MultipleFileUploader = ({ projectId, className }) => {
  const [files, setFiles] = useState(() => []);
  const { isLoading, progress, status, uploadForm } = useUploadForm(
    makeUploadUrl(projectId),
  );

  const handleFileChange = (e) => {
    // save the file objects
    if (e.target.files) {
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
      const formData = new FormData();

      // use the same key to create an index; files match tnc-py
      [...files].forEach((file) => {
        formData.append('files', file);
      });
      const response = uploadForm(formData);
      // const data = await response.json();

      console.dir(response);
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
            {isLoading ? (
              <CircularProgressWithLabel value={progress} />
            ) : (
              <Button
                type='submit'
                onClick={handleUpload}
                className='upload-files submit'
                component='label'
                size='small'
                color='primary'
                variant='contained'>
                Upload
              </Button>
            )}
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
      size='small'
      color='primary'
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

function CircularProgressWithLabel(props) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress variant='determinate' {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Typography variant='caption' component='div' color='text.secondary'>
          {`${Math.round(props.value)}%`}
        </Typography>
      </Box>
    </Box>
  );
}
CircularProgressWithLabel.propTypes = {
  /**
   * The value of the progress indicator for the determinate variant.
   * Value between 0 and 100.
   * @default 0
   */
  value: PropTypes.number.isRequired,
};

export default MultipleFileUploader;
