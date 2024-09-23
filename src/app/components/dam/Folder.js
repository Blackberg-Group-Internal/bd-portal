import React, { useState } from 'react';
import FolderIcon from '../../../../public/images/icons/folder.svg';
import MenuIcon from '../../../../public/images/icons/dots-vertical.svg';
import ShareIcon from '../../../../public/images/icons/share.svg';
import FavoritesIcon from '../../../../public/images/icons/favorites-small.svg';
import DownloadIcon from '../../../../public/images/icons/download.svg';
import Link from 'next/link';

const Folder = ({ folder, viewMode }) => {

  const [showActions, setShowActions] = useState(false);

  const toggleActions = () => {
    setShowActions((prevState) => !prevState);
  };
  return (
    <div
      className={`folder text-figtree text-center p-3 mb-4 col-6 col-sm-4 col-md-3 col-xl-2 d-flex flex-column  align-items-center position-relative ${viewMode} ${folder.isEmpty ? 'folder-empty' : ''}`} 
      onMouseLeave={() => setShowActions(false)}
    >
      <Link 
      href={`/dam/collections/${folder.name.toLowerCase().replace(/\s+/g, '-')}`} className="folder-icon text-black text-decoration-none">
        <FolderIcon className="icon--folder" width="48" height="48" />
        <div className="folder-name mt-3">{folder.name}</div>
      </Link>

      <button 
        className="btn-action border-0 bg-transparent position-absolute top-0 end-0 mt-2" 
        onClick={toggleActions}
      >
        <MenuIcon className="icon" />
      </button>

      {showActions && (
        <div className="action-panel position-absolute top-0 mt-6 end-0 bg-white text-left d-flex flex-column align-items-stretch">
          <button className="btn-text px-3 py-2 border-0 text-left" onClick={() => alert('Share & Get Link')}>
            <ShareIcon className="icon me-2" />
            Share & Get Link
          </button>
          <button className="btn-text px-3 py-2 border-0 text-left" onClick={() => alert('Add to Favorites')}>
            <FavoritesIcon className="icon me-2" />
            Add to Favorites
          </button>
          <button className="btn-text px-3 py-2 border-0 text-left" onClick={() => alert('Download')}>
            <DownloadIcon className="icon me-2" />
            Download
          </button>
        </div>
      )} 
    </div>
  );
};

export default Folder;
