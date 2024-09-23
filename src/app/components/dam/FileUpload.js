import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Modal, ProgressBar } from 'react-bootstrap';
import UploadIcon from '../../../../public/images/icons/upload.svg';

const FileUpload = ({ show, handleClose }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({});

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles.map((file) => ({ file, progress: 0 })));
    setProgress({});
  }, []);

  const startUpload = () => {
    setUploading(true);
    files.forEach((fileObj, index) => {
      simulateUpload(fileObj, index);
    });
  };

  const simulateUpload = (fileObj, index) => {
    const totalSteps = 100;
    let currentProgress = 0;

    const uploadInterval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 10) + 5;
      setProgress((prevProgress) => ({
        ...prevProgress,
        [index]: Math.min(currentProgress, 100),
      }));

      if (currentProgress >= totalSteps) {
        clearInterval(uploadInterval);
      }
    }, 500);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop, multiple: true });

  useEffect(() => {
    if (!show) {
      resetForm();
    }
  }, [show]);

  const resetForm = () => {
    setFiles([]);
    setUploading(false);
    setProgress({});
  };

  return (
    <Modal show={show} onHide={handleClose} centered className="file-upload text-figtree">
      <Modal.Header className="d-flex flex-column align-items-start p-4 pb-1 border-0">
        <div className="d-flex justify-content-between align-items-center w-100 mb-2">
            <Modal.Title className="fw-bold-600 h5">Upload Files</Modal.Title>
            <button className="btn-close p-0" onClick={handleClose} aria-label="Close">
          </button>
        </div>
        <span className="small">Upload files to this collection.</span>
      </Modal.Header>
      <Modal.Body className="px-4">
        <div {...getRootProps()} className="upload-area rounded py-3 text-center">
          <input {...getInputProps()} />
          <div className="btn btn-icon border rounded d-inline-flex align-items-center justify-content-center mb-2 pb-1">
            <UploadIcon className="icon" />
          </div>
          <p className="m-0 small"><span className="text-primary fw-bold-600">Click to upload</span> or drag and drop</p>
        </div>

        {files.length > 0 && (
          <div className="mt-3">
            {files.map((fileObj, index) => (
              <div key={index} className="d-flex flex-column align-items-start mb-3 border rounded p-3">
                <div className="file-details d-flex flex-column mb-2">
                  <p className="mb-1 fw-bold-500 small">{fileObj.file.name}</p>
                  <small className="small">{(fileObj.file.size / (1024 * 1024)).toFixed(1)} MB</small>
                </div>
                <div className="d-flex w-100 align-items-center">
                  <ProgressBar
                    className="me-2"
                    now={progress[index] || 0}
                    style={{ width: '100%' }}
                  />
                  <span className="ms-1 small">{`${progress[index] || 0}%`}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="d-flex pt-0 px-4 pb-4 gap border-0">
        <div className="col pe-0 me-2 ms-0">
          <button className="btn btn--white w-100" onClick={handleClose}>
            Cancel
          </button>
        </div>
        <div className="col ps-0 ms-2 me-0">
          <button
            className="btn btn-primary w-100"
            onClick={startUpload}
            disabled={uploading || files.length === 0}
          >
            {uploading ? 'Uploading...' : 'Upload Files'}
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default FileUpload;