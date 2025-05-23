import React, { useState } from 'react';
import FolderIcon from '../../../../public/images/icons/folder.svg';
import MenuIcon from '../../../../public/images/icons/dots-vertical.svg';
import ShareIcon from '../../../../public/images/icons/share.svg';
import FavoritesIcon from '../../../../public/images/icons/favorites-small.svg';
import DownloadIcon from '../../../../public/images/icons/download.svg';
import Link from 'next/link';
import { useFolder } from '@/app/context/FolderContext'; 
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/app/context/ToastContext';
import { useSession } from 'next-auth/react';
import axios from 'axios';

const Folder = ({ folder, viewMode }) => {
  const { updateFolderId, updateFolderMapping } = useFolder(); 
  const [showActions, setShowActions] = useState(false);
  const router = useRouter();
  const pathname = usePathname().toLowerCase();
  const { addToast } = useToast();
  const { data: session, status } = useSession();

  const toggleActions = () => {
    setShowActions((prevState) => !prevState);
  };

  const handleFolderClick = (folder) => {
    updateFolderId(folder.id); 
    updateFolderMapping(folder, folder.id);
      const url = createDynamicUrl(folder);
      router.push(url);
  };

  const handleShareFolder = (folder) => {
    updateFolderId(folder.id); 
    updateFolderMapping(folder, folder.id);
    const url = createDynamicUrl(folder);
    navigator.clipboard.writeText("https://bd.blackberggroup.com" + url)
    .then(() => addToast('Share link copied to clipboard.', 'success'))
    .catch(error => addToast('Failed to create link.', 'danger'));
  };

  const createDynamicUrl = (folder) => {
    let newPath = folder.name.toLowerCase().replace(/\s+/g, '-');
    let parent = folder.parentReference;
  
    let currentUrlParts = pathname.replace(/^\/|\/$/g, '').split('/').slice(2);

    let constructedPath = [];
    while (parent && parent.id !== "01MODA5PF6Y2GOVW7725BZO354PWSELRRZ") {
      const parentName = parent.name.toLowerCase().replace(/\s+/g, '-');
      constructedPath.unshift(parentName);
      parent = parent.parentReference;
    }
  
    if (currentUrlParts.length > 0 && constructedPath.length > 0 && currentUrlParts[currentUrlParts.length - 1] === constructedPath[constructedPath.length - 1]) {
      currentUrlParts = currentUrlParts.concat(newPath);
    } else {
      currentUrlParts = constructedPath.concat(newPath);
    }
  
    return `/dam/collections/${currentUrlParts.join('/')}`;
  };
  
  const handleFavoriteFile = async (fileId) => {
    if (!fileId) {
      alert('File ID is missing');
      return;
    }
  
    try {
      const userId = session.user.id;
      
      const response = await axios.post('/api/graph/library/file/favorite', {
        fileId,
        userId
      });
  
      if (response.status === 201) {
        addToast('File favorited successfully.', 'success');
      } else {
        throw new Error('Error favoriting file');
      }
    } catch (error) {
      console.error('Error favoriting file:', error);
    addToast('Failed to favorite file.', 'danger');
    } finally {;
    }
  };

  return (
    <div
      className={`folder tile count-${folder.folder.childCount} text-figtree text-center p-3 mb-4 col-6 col-sm-4 col-md-3 col-xl-2 d-flex flex-column  align-items-center position-relative ${viewMode} ${folder.isEmpty ? 'folder-empty' : ''}`} 
      onMouseLeave={() => setShowActions(false)}
    >
      <div onClick={() => handleFolderClick(folder)} className="folder-icon text-black text-decoration-none pointer">
        <FolderIcon className={`icon--folder`} width="48" height="48" />
        <div className="folder-name mt-3">{folder.name}</div>
      </div>

      <button 
        className="btn-action border-0 bg-transparent position-absolute top-0 end-0 mt-2" 
        onClick={toggleActions}
      >
        <MenuIcon className="icon" />
      </button>

      {showActions && (
        <div className="action-panel position-absolute top-0 mt-6 end-0 bg-white text-left d-flex flex-column align-items-stretch text-nowrap">
          <button className="btn-text px-3 py-2 border-0 text-left" onClick={() => handleShareFolder(folder)}>
            <ShareIcon className="icon me-2" />
            Share & Get Link
          </button>
          <button className="btn-text px-3 py-2 border-0 text-left" onClick={() => handleFavoriteFile(folder.id)}>
            <FavoritesIcon className="icon me-2" />
            Add to Favorites
          </button>
          {/* <button className="btn-text px-3 py-2 border-0 text-left" onClick={() => alert('Download')}>
            <DownloadIcon className="icon me-2" />
            Download
          </button> */}
        </div>
      )} 
    </div>
  );
};

export default Folder;
