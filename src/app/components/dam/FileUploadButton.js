import React, { useState } from 'react';
import FileUploadModal from '../../components/dam/FileUpload';
import UploadIcon from '../../../../public/images/icons/upload.svg';

const FileUploadButton = ({ onFilesUploaded }) => {
  const [showModal, setShowModal] = useState(false);

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  return (
    <>
        <button className="btn btn-primary ms-4 rounded" onClick={handleShow}>
            <span>Upload Files</span>
            <UploadIcon className="ms-2 icon" />
        </button>
        <FileUploadModal 
          show={showModal} 
          handleClose={handleClose} 
          onFilesUploaded={onFilesUploaded}
          />
    </>
  );
};

export default FileUploadButton;
