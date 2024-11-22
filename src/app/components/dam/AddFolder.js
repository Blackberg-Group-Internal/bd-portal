'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { useToast } from '@/app/context/ToastContext';
import { useRouter, usePathname } from 'next/navigation';
import { buildVanityName } from '@/app/context/FolderContext'; 
import { track } from '@vercel/analytics';
import { useSession } from 'next-auth/react';

const AddFolder = ({ show, handleClose, parentFolderId, onFolderAdded }) => {
  const [folderName, setFolderName] = useState('');
  const [creating, setCreating] = useState(false);
  const { addToast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      alert('Folder name cannot be empty');
      return;
    }

    const parentFolderId = getParentFolderId();

    setCreating(true);

    

    try {
      const response = await axios.post('/api/graph/library/folder/add', {
        folderName,
        parentFolderId, 
      });

      if (response.status === 201) {
        addToast('Folder created successfully.', 'success');
        console.log('User Client Session: ', session.user);
        track('Folder Created', { user: session.user.id, name: session.user.name, app: "DAM", folderName: folderName});
        if (onFolderAdded) {
          onFolderAdded(response.data);
        }
        handleClose();
      } else {
        throw new Error('Error creating folder');
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      addToast('Failed to create folder.', 'danger');
    } finally {
      setCreating(false);
    }
  };

  const getParentFolderId = () => {

    const parts = pathname.replace(/^\/|\/$/g, '').split('/');
    let vanityPath;
    

    if (parts.length === 2 && parts[1] === 'dam') {
      return '';
    } else {
      vanityPath = parts.slice(2).join('/').toLowerCase().replace(/\s+/g, '-');
    }


    const folderMapping = localStorage.getItem('folderMapping:' + vanityPath);

    if (folderMapping) {


      return folderMapping || '';
    }


    return '';
  };

  useEffect(() => {
    if (!show) {
      setFolderName(''); 
    }
  }, [show]);

  return (
    <Modal show={show} onHide={handleClose} centered className="add-folder text-figtree">
      <Modal.Header className="d-flex flex-column align-items-start p-4 pb-1 border-0">
        <div className="d-flex justify-content-between align-items-center w-100 mb-2">
          <Modal.Title className="fw-bold-600 h5">Add New Folder</Modal.Title>
          <button className="btn-close p-0" onClick={handleClose} aria-label="Close"></button>
        </div>
        <span className="small">Create a new folder in the collection.</span>
      </Modal.Header>
      <Modal.Body className="px-4">
        <Form.Group controlId="folderName">
          <Form.Label>Folder Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter folder name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer className="d-flex pt-0 px-4 pb-4 gap border-0">
        <Button className="btn btn--white text-dark" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleCreateFolder}
          disabled={creating || !folderName.trim()}
        >
          {creating ? 'Creating...' : 'Create Folder'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddFolder;