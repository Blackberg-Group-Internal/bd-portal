import React, { useState } from 'react';
import AddFolderModal from '../../components/dam/AddFolder'; 
import CollectionsIcon from '../../../../public/images/icons/collections.svg';
import { useFolder } from '@/app/context/FolderContext';

const AddFolderButton = ({ onFolderAdded }) => {
  const [showModal, setShowModal] = useState(false);
  const { folderId } = useFolder();
  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  return (
    <>
      <button className="btn btn--white text-dark ms-4 rounded" onClick={handleShow}>
        <span>Add Folder</span>
        <CollectionsIcon className="ms-2 icon" />
      </button>
      <AddFolderModal
        show={showModal}
        handleClose={handleClose}
        parentFolderId={folderId}
        onFolderAdded={onFolderAdded}
      />
    </>
  );
};

export default AddFolderButton;
