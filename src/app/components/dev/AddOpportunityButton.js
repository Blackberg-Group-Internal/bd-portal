'use client';

import React, { useState, useEffect } from 'react';
import AddOpportunity from './AddOpportunity';
import axios from 'axios';
import PlusIcon from '../../../../public/images/icons/plus.svg';
import WatchlistIcon from '../../../../public/images/icons/glasses.svg';
import { useSession } from 'next-auth/react';

const AddOpportunityButton = ({ users, onOpportunityAdded, initialData = {} }) => {
  const [showModal, setShowModal] = useState(false);
  const [isGroupOwner, setIsGroupOwner] = useState(false);
  const { data: session } = useSession();

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  useEffect(() => {
    const checkGroupOwnership = async () => {
      const storedGroupOwners = localStorage.getItem('groupOwners');
      if (storedGroupOwners) {
        const groupOwners = JSON.parse(storedGroupOwners);
        const userEmail = session?.user?.email?.toLowerCase();
        if (groupOwners.some(owner => owner.mail.toLowerCase() === userEmail)) {
          setIsGroupOwner(true);
          return;
        }
      }

      if (session && session.user) {
        try {
          const groupId = '04fa9f95-f578-49d2-9f24-034869ef02a2'; // Update if needed
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
          console.error('Error checking group ownership:', error);
        }
      }
    };

    checkGroupOwnership();
  }, [session]);

  return (
    <>
      {isGroupOwner && (
        <button className="btn btn-primary rounded px-3 d-flex justify-content-center" onClick={handleShow}>
          <span>Add To Watchlist</span>
          <WatchlistIcon className="ms-2 icon icon-white d-none" />
        </button>
      )}
      <AddOpportunity
        show={showModal}
        handleClose={handleClose}
        onOpportunityAdded={onOpportunityAdded}
        users={users}
        initialData={initialData}
      />
    </>
  );
};

export default AddOpportunityButton;
