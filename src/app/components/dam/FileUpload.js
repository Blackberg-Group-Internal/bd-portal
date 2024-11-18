import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Modal, ProgressBar, Form } from 'react-bootstrap';
import UploadIcon from '../../../../public/images/icons/upload.svg';
import axios from 'axios';
import { useToast } from '@/app/context/ToastContext';
import { usePathname } from "next/navigation";
import { useSession } from 'next-auth/react';

const FileUpload = ({ show, handleClose, onFilesUploaded }) => {
  const [files, setFiles] = useState([]);
  const { data } = useSession();
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
          const response = await axios.get(`/api/graph/library?libraryId=""`);
          setFolders(response.data.value);
        } catch (error) {
          console.error('Error fetching library contents:', error);
        }
      };
      fetchFolders();

      const parts = pathname.replace(/^\/|\/$/g, '').split('/');
      setShouldShowFolderSelect(parts.length <= 2);
    }
  }, [show]);

  const startUpload = async () => {
    if (!files.length) {
      return;
    }
  
    const folderPath = getFolderPath();
    if (!folderPath) {
      alert('Please select a folder before uploading.');
      return;
    }
  
    setUploading(true);
  
    try {
      for (let i = 0; i < files.length; i++) {
        const fileObj = files[i];
        const file = fileObj.file;
  
        // Create upload session URL via API
        const response = await axios.post('/api/graph/library/upload-session', {
          folderPath,
          fileName: file.name,
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (response.status !== 200 || !response.data.uploadUrl) {
          throw new Error('Failed to create upload session.');
        }
  
        const uploadUrl = response.data.uploadUrl;
  
        // Upload file in chunks
        const chunkSize = 5 * 1024 * 1024; // 5MB chunks
        let start = 0;
        let end = Math.min(chunkSize, file.size) - 1;
        let totalUploaded = 0;
  
        while (start < file.size) {
          const chunk = file.slice(start, end + 1);
          const contentLength = end - start + 1;
  
          await axios.put(uploadUrl, chunk, {
            headers: {
              Authorization: `Bearer ${data.accessToken}`,
              'Content-Length': contentLength,
              'Content-Range': `bytes ${start}-${end}/${file.size}`,
            },
            onUploadProgress: (progressEvent) => {
              // Calculate the progress for the current chunk
              const uploadedBytes = progressEvent.loaded;
              totalUploaded += uploadedBytes;
  
              // Update the total progress for the current file
              const progressValue = Math.min((totalUploaded / file.size) * 100, 99);
              setProgress((prevProgress) => ({
                ...prevProgress,
                [i]: Math.round(progressValue),
              }));
            },
          });
  
          start = end + 1;
          end = Math.min(start + chunkSize - 1, file.size - 1);
        }
  
        // Mark the progress as complete for this file
        setProgress((prevProgress) => ({
          ...prevProgress,
          [i]: 100,
        }));
      }
  
      addToast('Your file(s) were uploaded.', 'success');
      if (onFilesUploaded) {
        onFilesUploaded();
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      addToast('Failed to upload file(s).', 'danger');
    } finally {
      setUploading(false);
      handleClose();
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

    return folderMapping || selectedFolder;
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
          <button className="btn-close p-0" onClick={handleClose} aria-label="Close" disabled={uploading}></button>
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
            <div className="mt-3 file-upload-preview">
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
          <button className="btn btn--white w-100" onClick={handleClose} disabled={uploading}>
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