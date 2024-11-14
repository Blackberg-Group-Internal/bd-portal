'use client';

import FolderIcon from '../../../../public/images/icons/folder.svg';
import React, { useState, useRef, useEffect } from 'react';
import MenuIcon from '../../../../public/images/icons/dots-vertical.svg';
import ShareIcon from '../../../../public/images/icons/share.svg';
import FavoritesIcon from '../../../../public/images/icons/favorites-small.svg';
import DownloadIcon from '../../../../public/images/icons/download.svg';
import gsap from 'gsap';
import Link from 'next/link';
import { useFolder } from '@/app/context/FolderContext';
import { useRouter, usePathname } from 'next/navigation';
import { format } from 'date-fns'; 

const CollectionList = ({ collections }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [activeActionPanel, setActiveActionPanel] = useState(null);
  const listViewRef = useRef(null); 
  const { updateFolderId, updateFolderMapping } = useFolder(); 

  const handleItemSelect = (id) => {
    setSelectedItems((prevSelectedItems) =>
      prevSelectedItems.includes(id)
        ? prevSelectedItems.filter((itemId) => itemId !== id)
        : [...prevSelectedItems, id]
    );
  };

  const formatModifiedDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  };

  const handleFolderClick = (folder) => {

    updateFolderId(folder.id); 
    updateFolderMapping(folder, folder.id);
   // setTimeout(() => {
      const url = createDynamicUrl(folder);
      router.push(url);
   // }, 0); 
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      const allItemIds = collections.map((item) => item.id);
      setSelectedItems(allItemIds);
    }
    setSelectAll(!selectAll);
  };

  const toggleActions = (id) => {
    setActiveActionPanel((prevActivePanel) => (prevActivePanel === id ? null : id));
  };

  const createDynamicUrl = (folder) => {
    let urlPath = folder.name.toLowerCase().replace(/\s+/g, '-');
    let parent = folder.parentReference;

    while (parent && parent.id !== "01MODA5PF6Y2GOVW7725BZO354PWSELRRZ") {
      const parentName = parent.name.toLowerCase().replace(/\s+/g, '-');
      urlPath = `${parentName}/${urlPath}`;
      parent = parent.parentReference; 
    }

    return `/dam/collections/${urlPath}`;
  };


  useEffect(() => {
    if (listViewRef.current) {
        const rows = listViewRef.current.querySelectorAll('.row');
        gsap.fromTo(
          rows,
            { opacity: 0, y: 20 },
            {
                opacity: 1,
                y: 0,
                stagger: 0.075,
                ease: 'power1.out',
                duration: 0.5,
                onComplete: () => {
                    rows.forEach((row) => {
                      row.style.transform = 'none';
                    });
                  },
            }
        );
    }
}, []);

  return (
    <div className="list-view text-figtree container mt-4" ref={listViewRef}>
      <div className="row px-3 py-3 list-view-header border">
        <div className="col-auto pe-0 d-flex align-items-center d-none d-md-flex">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAll}
            className="rounded"
          />
        </div>
        <div className="col-9 col-md-7 col-lg-5 small">Name</div>
        <div className="col-3 col-lg-2 d-none d-md-flex small">Last updated</div>
        <div className="col-4 d-none d-lg-flex small">Modified by</div>
      </div>

      {collections.map((item) => (
        <div
        className={`row align-items-center px-3 py-3 border bg-white position-relative count-${item.folder.childCount}`} key={item.id}>
          <div className="col-auto pe-0 d-flex align-items-center d-none d-md-flex">
            <input
              type="checkbox"
              checked={selectedItems.includes(item.id)}
              onChange={() => handleItemSelect(item.id)}
              className="rounded"
            />
          </div>
          <div onClick={() => handleFolderClick(item)} className="col-10 col-md-7 col-lg-5 d-flex align-items-center text-black text-decoration-none pointer">
            <FolderIcon className="icon--folder me-1 pe-1" width="40" height="48" />
            <span className="text-nowrap ">{item.name}</span>
          </div>
          <div className="col-3 col-lg-2 d-none d-md-flex">{formatModifiedDate(item.lastModifiedDateTime)}</div>
          <div className="col-4 d-none d-lg-flex">{item.lastModifiedBy.user.displayName}</div>
          
          <div className="col-auto ms-auto position-absolute end-0 me-2">
            <button
              className="btn-action border-0 bg-transparent"
              onClick={() => toggleActions(item.id)} 
            >
              <MenuIcon className="icon" />
            </button>
          </div>
          {activeActionPanel === item.id && (
              <div className="action-panel position-absolute top-0 mt-8 end-0 bg-white text-left d-flex flex-column align-items-stretch w-auto">
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
      ))}
    </div>
  );
};

export default CollectionList;