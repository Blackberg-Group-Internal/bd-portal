'use client';

import React, { useState, useEffect } from 'react';
import AddFolderModal from '../../components/dam/AddFolder'; 
import axios from 'axios';
import CollectionsIcon from '../../../../public/images/icons/collections.svg';
import { useSession } from 'next-auth/react';

const AddFolderButton = ({ onFolderAdded }) => {
  const [showModal, setShowModal] = useState(false);
  const [isGroupOwner, setIsGroupOwner] = useState(false);
  const { data: session, status } = useSession();

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  useEffect(() => {
    const checkGroupOwnership = async () => {

      const storedGroupOwners = localStorage.getItem('groupOwners');
      if (storedGroupOwners) {
        const groupOwners = JSON.parse(storedGroupOwners);
        const userEmail = session.user.email.toLowerCase();
        if (groupOwners.some(owner => owner.mail.toLowerCase() === userEmail)) {
          setIsGroupOwner(true);
         // return;
        }
      }


      if (session && session.user) {
        try {
          const groupId = '04fa9f95-f578-49d2-9f24-034869ef02a2'; 
          const response = await axios.get(`/api/graph/groups/owners?groupId=${groupId}`);
          
          if (response.status === 200 && response.data) {
            const currentUserId = session.user.email.toLowerCase();

            localStorage.setItem('groupOwners', JSON.stringify(response.data));
            const isOwner = response.data.some(owner => owner.mail.toLowerCase() === currentUserId);
            setIsGroupOwner(isOwner);
          } else {
            setIsGroupOwner(false);
          }
        } catch (error) {
          console.error('Error fetching group ownership:', error);
        }
      }
    };

    checkGroupOwnership();
  }, [session]);

  return (
    <>
      {isGroupOwner && (
        <button className="btn btn--white text-dark ms-4 rounded" onClick={handleShow}>
          <span>Add Folder</span>
          <CollectionsIcon className="ms-2 icon icon" />
        </button>
      )}
      <AddFolderModal show={showModal} handleClose={handleClose} onFolderAdded={onFolderAdded} />
    </>
  );
};

export default AddFolderButton;
