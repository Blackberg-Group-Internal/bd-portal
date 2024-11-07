import React, { useState } from 'react';
import AddFolderModal from '../../components/dam/AddFolder'; 
import FilesIcon from '../../../../public/images/icons/files.svg';
import { FolderProvider, useFolder } from '@/app/context/FolderContext';

const AddFolderButton = () => {
  const [showModal, setShowModal] = useState(false);
  const { folderId } = useFolder();
  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  return (
    <>
      <button className="btn btn--white text-dark ms-4 rounded" onClick={handleShow}>
        <span>Add Folder</span>
        <FilesIcon className="ms-2 icon icon" />
      </button>
      <AddFolderModal show={showModal} handleClose={handleClose} parentFolderId={folderId}  />
    </>
  );
};

export default AddFolderButton;