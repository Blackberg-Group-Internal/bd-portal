// import React, { useEffect, useState } from 'react';
// import AddFolderModal from '../../components/dam/AddFolder'; 
// import CollectionsIcon from '../../../../public/images/icons/collections.svg';
// import { useFolder } from '@/app/context/FolderContext';
// import { getGroupOwners, getUserGroups } from '@/app/lib/microsoft/graphHelper';
// import { useSession } from 'next-auth/react';


// const AddFolderButton = ({ onFolderAdded }) => {
//   const [showModal, setShowModal] = useState(false);
//   const { folderId } = useFolder();
//   const handleShow = () => setShowModal(true);
//   const handleClose = () => setShowModal(false);

//   const [userIsInGroup, setUserIsInGroup] = useState(false);
//   const { data: session } = useSession();

//   useEffect(() => {
//     const checkUserGroupMembership = async () => {
//       if (session?.user?.id) {
//         try {

//           const groupId = '04fa9f95-f578-49d2-9f24-034869ef02a2'; 

//           const userGroups = await getGroupOwners(groupId);


//           const isInGroup = userGroups.some(group => group.id === groupId);
//           setUserIsInGroup(isInGroup);
//         } catch (error) {
//           console.error('Error checking user group memberships:', error);
//         }
//       }
//     };

//     checkUserGroupMembership();
//   }, [session]);


//   if (!userIsInGroup) {
//     return null; // Do not render the button if the user is not in the group
//   }

//   return (
//     <>
//       <button className="btn btn--white text-dark ms-4 rounded" onClick={handleShow}>
//         <span>Add Folder</span>
//         <CollectionsIcon className="ms-2 icon" />
//       </button>
//       <AddFolderModal
//         show={showModal}
//         handleClose={handleClose}
//         parentFolderId={folderId}
//         onFolderAdded={onFolderAdded}
//       />
//     </>
//   );
// };

// export default AddFolderButton;
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
      if (session && session.user) {
        try {
          const groupId = '04fa9f95-f578-49d2-9f24-034869ef02a2'; 
          const response = await axios.get(`/api/graph/group/owners?groupId=${groupId}`);
          
          if (response.status === 200 && response.data) {
            const isOwner = response.data.some(owner => owner.id === session.user.id);
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
