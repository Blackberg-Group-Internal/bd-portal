import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Modal, ProgressBar, Form } from 'react-bootstrap';
import UploadIcon from '../../../../public/images/icons/upload.svg';
import axios from 'axios';
import { useToast } from '@/app/context/ToastContext';
import { usePathname } from "next/navigation";

const FileUpload = ({ show, handleClose, onFilesUploaded }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({});
  const [folders, setFolders] = useState([]); 
  const [selectedFolder, setSelectedFolder] = useState(''); 
  const [shouldShowFolderSelect, setShouldShowFolderSelect] = useState(true);
  const { addToast } = useToast();
  const pathname = usePathname();

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles.map((file) => ({ file, progress: 0 })));
    setProgress({});
  }, []);

  useEffect(() => {
    if (show) {
      const fetchFolders = async () => {
        try {
          const response = await axios.get(`/api/graph/library?libraryId=""}`);
          setFolders(response.data.value);
          console.log('Library contents', response.data.value)
        } catch (error) {
          console.error('Error fetching library contents:', error);
        }
      };
      fetchFolders();

      const parts = pathname.replace(/^\/|\/$/g, '').split('/');
      if (parts.length > 2) {
        setShouldShowFolderSelect(false);
      } else {
        setShouldShowFolderSelect(true);
      }
    }
  }, [show]);

  const startUpload = async () => {

    const folderPath = getFolderPath();

    if (!folderPath) {
      alert('Please select a folder before uploading.');
      return;
    }

    const formData = new FormData();
    files.forEach((fileObj) => {
      formData.append('files', fileObj.file); 
    });



    formData.append('folderPath', folderPath);

    let progressValue = 0;
    setUploading(true);

    const progressInterval = setInterval(() => {
      progressValue = Math.min(progressValue + Math.random() * 10, 90);
      setProgress((prevProgress) => ({
        ...prevProgress,
        global: Math.round(progressValue),
      }));
    }, 100);

    try {
      const response = await fetch('/api/graph/library/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      clearInterval(progressInterval);
      setProgress((prevProgress) => ({
        ...prevProgress,
        global: 100, 
      }));
      setUploading(false);
      if (onFilesUploaded) {
        onFilesUploaded();
      }
      //setTimeout(()=> {
        handleClose();
      //}, 1500);
      //setTimeout(()=> {
      addToast('Your file(s) were uploaded.', 'success');
    //}, 2000);

      console.log('Upload success', data);
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  const getFolderPath = () => {

    const parts = pathname.replace(/^\/|\/$/g, '').split('/');
    let vanityPath;
    
    if (parts.length === 2 && parts[1] === 'dam') {
      return selectedFolder; 
    } else {
      vanityPath = parts.slice(2).join('/').toLowerCase().replace(/\s+/g, '-');
    }

    const folderMapping = localStorage.getItem('folderMapping:' + vanityPath);

    if (folderMapping) {
      return folderMapping || '';
    }
    return selectedFolder;
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
    setSelectedFolder('');
  };

  return (
    <Modal show={show} onHide={handleClose} centered className="file-upload text-figtree">
      <Modal.Header className="d-flex flex-column align-items-start p-4 pb-1 border-0">
        <div className="d-flex justify-content-between align-items-center w-100 mb-2">
          <Modal.Title className="fw-bold-600 h5">Upload Files</Modal.Title>
          <button className="btn-close p-0" onClick={handleClose} aria-label="Close"></button>
        </div>
        <span className="small">Upload files to this collection.</span>
      </Modal.Header>
      <Modal.Body className="px-4">

        <div {...getRootProps()} className="upload-area rounded py-3 text-center">
          <input {...getInputProps()} />
          <div className="btn btn-icon border rounded d-inline-flex align-items-center justify-content-center mb-2 pb-1">
            <UploadIcon className="icon" />
          </div>
          <p className="m-0 small">
            <span className="text-primary fw-bold-600">Click to upload</span> or drag and drop
          </p>
        </div>

        {files.length > 0 && (
          <>
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
                    now={progress.global || 0}
                    style={{ width: '100%' }}
                  />
                  <span className="ms-1 small">{`${progress.global || 0}%`}</span>
                </div>
              </div>
            ))}
          </div>

          {shouldShowFolderSelect && (
          <Form.Group controlId="folderSelect" className="mb-3">
          <Form.Label>Collection</Form.Label>
          <Form.Control
            as="select"
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
          >
             <option value="" disabled>
              Select a collection
            </option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
          )}
        </>
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
            disabled={uploading || files.length === 0 || !getFolderPath()}
          >
            {uploading ? 'Uploading...' : 'Upload Files'}
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default FileUpload;