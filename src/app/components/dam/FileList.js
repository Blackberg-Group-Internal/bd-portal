'use client';

import React, { useState, useRef, useEffect, useContext } from 'react';
import MenuIcon from '../../../../public/images/icons/dots-vertical.svg';
import ShareIcon from '../../../../public/images/icons/share.svg';
import FavoritesIcon from '../../../../public/images/icons/favorites-small.svg';
import DownloadIcon from '../../../../public/images/icons/download.svg';
import DocPreview from '../../../../public/images/icons/docx.svg';
import PdfPreview from '../../../../public/images/icons/pdf.svg';
import FolderIcon from '../../../../public/images/icons/folder.svg';
import DefaultIcon from '../../../../public/images/icons/default.svg';
import PngPreview from '../../../../public/images/icons/png.svg';
import XlsxPreview from '../../../../public/images/icons/xlsx.svg';
import PowerpointIcon from '../../../../public/images/icons/ppt.svg';
import { FileViewerContext } from '@/app/layout';
import Folder from '@/app/components/dam/Folder';
import gsap from 'gsap';
import Link from 'next/link';
import { useFolder } from '@/app/context/FolderContext';
import { format } from 'date-fns'; 
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useToast } from '@/app/context/ToastContext';
import Image from 'next/image';

const FileList = ({ files, preview }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [activeActionPanel, setActiveActionPanel] = useState(null);
  const [showPreviews, setShowPreviews] = useState(false);
  const listViewRef = useRef(null);
  const { folderId, updateFolderId, updateFolderMapping } = useFolder(); 
  const { openModal } = useContext(FileViewerContext);
  const router = useRouter();
  const [pendingFolder, setPendingFolder] = useState(null);
  const { data: session, status } = useSession();
  const { addToast } = useToast();
  const pathname = usePathname();
  
  const handleFolderClick = (folder) => {
    updateFolderId(folder.id); 
    updateFolderMapping(folder, folder.id);
    setPendingFolder(folder);
  };

  useEffect(() => {
    if (folderId && pendingFolder && folderId === pendingFolder.id) {
      const url = createDynamicUrl(pendingFolder);
      router.push(url);
      setPendingFolder(null); 
    }
  }, [folderId, pendingFolder]);

  const handleItemSelect = (id) => {
    setSelectedItems((prevSelectedItems) =>
      prevSelectedItems.includes(id)
        ? prevSelectedItems.filter((itemId) => itemId !== id)
        : [...prevSelectedItems, id]
    );
  };

  const showModal = (file) => {

    openModal(file);

  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      const allItemIds = files.map((file) => file.id);
      setSelectedItems(allItemIds);
    }
    setSelectAll(!selectAll);
  };

  const toggleActions = (id) => {
    setActiveActionPanel((prevActivePanel) => (prevActivePanel === id ? null : id));
  };

  const renderFilePreview = (file) => {
    const fileExtension = file.name.split('.').pop();

    if (preview && showPreviews) {
      switch (fileExtension) {
        case 'doc':
        case 'docx':
          return <DocPreview className="icon--file me-2" width="40" height="48" />;
        case 'pdf':
          return <PdfPreview className="icon--file me-2 test" width="40" height="48" />;
        case 'xls':
        case 'xlsx':
          return <XlsxPreview className="icon--file me-2" width="40" height="43" />;
        case 'ppt':
        case 'pptx':
          return <PowerpointIcon className="icon--file me-2" width="40" height="48" />;
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'webp':
        case 'bmp':
        case 'tiff':
        case 'svg':
            return (
              <div className="img-preview">
                <img
                  src={file.webUrl}
                  alt={file.name}
                  className="img-fluid"
                  loading="lazy"
                />
                </div>
            );
        default:
          return <DefaultIcon className="icon--file me-2" width="40" height="48" />;;
      }
    }
  };

  const formatModifiedDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  };

  const createDynamicUrl = (folder) => {

    let urlPath = folder.name.toLowerCase().replace(/\s+/g, '-');

    const pathParts = pathname.replace('/dam/collections', '').split('/').filter(Boolean);

    const lastPathPart = pathParts[pathParts.length - 1];
  
    if (folder.parentReference && folder.parentReference.name.toLowerCase().replace(/\s+/g, '-') === lastPathPart) {

      urlPath = `${pathname}/${urlPath}`;
    } else {

      urlPath = `/dam/collections/${urlPath}`;
    }
  
    return urlPath;
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
    } finally {


    }
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
          stagger: 0.05,
          ease: 'power1.out',
          duration: 0.3,
          onComplete: () => {
            rows.forEach((row) => {
              row.style.transform = 'none';
            });
          },
        }
      );
    }
  }, []);

  const handleShareFile = (file) => {
    navigator.clipboard.writeText(file.webUrl)
    .then(() => addToast('Share link copied to clipboard.', 'success'))
    .catch(error => addToast('Failed to create link.', 'danger'));
  }

  useEffect(() => {
    setShowPreviews(true);
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
        <div className="col-3 col-lg-2 d-none d-md-flex small">Last Updated</div>
        <div className="col-4 d-none d-lg-flex small">Modified By</div>
      </div>

      {files.map((item, index) => (
        item.folder ? (
          <div
          className="row align-items-center px-3 py-3 border bg-white position-relative"
          key={item.id}
        >
          <div className="col-auto pe-0 d-flex align-items-center d-none d-md-flex">
            <input
              type="checkbox"
              checked={selectedItems.includes(item.id)}
              onChange={() => handleItemSelect(item.id)}
              className="rounded"
            />
          </div>
          <div
            className={`col-9 col-md-7 col-lg-5 d-flex align-items-center pointer count-${item.folder?.childCount}`}
          >
            <div onClick={() => handleFolderClick(item)}  className="folder-icon text-black text-decoration-none d-flex pointer">
          <FolderIcon className={`icon--folder`} width="48" height="48" />
          <div className="folder-name mt-3 ms-2">{item.name}</div>
        </div>
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
              <button className="btn-text px-3 py-2 border-0 text-left" onClick={() => handleShareFile(item)}>
                  <ShareIcon className="icon me-2" />
                  Share & Get Link
                </button>
                <button className="btn-text px-3 py-2 border-0 text-left" onClick={() => handleFavoriteFile(item.id)}>
                  <FavoritesIcon className="icon me-2" />
                  Add to Favorites
                </button>
                {!item.folder && (
                <a className="btn-text px-3 py-2 border-0 text-left w-100 text-decoration-none text-dark" href={item['@microsoft.graph.downloadUrl']} download>
                  <DownloadIcon className="icon me-2" target="_blank" /> 
                  Download
                </a>
                )}
            </div>
          )}
        </div>
        ) : (
        <div
          className="row align-items-center px-3 py-3 border bg-white position-relative"
          key={item.id}
        >
          <div className="col-auto pe-0 d-flex align-items-center d-none d-md-flex">
            <input
              type="checkbox"
              checked={selectedItems.includes(item.id)}
              onChange={() => handleItemSelect(item.id)}
              className="rounded"
            />
          </div>
          <div
            className="col-9 col-md-7 col-lg-5 d-flex align-items-center pointer"
            onClick={() => showModal(item)}
          >
            {renderFilePreview(item)}
            <span className="text-nowrap ms-2 d-flex w-75 overflow-hidden">{item.name}</span>
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
     <button className="btn-text px-3 py-2 border-0 text-left" onClick={handleShareFile}>
            <ShareIcon className="icon me-2" />
            Share & Get Link
          </button>
          <button className="btn-text px-3 py-2 border-0 text-left" onClick={() => handleFavoriteFile(item.id)}>
            <FavoritesIcon className="icon me-2" />
            Add to Favorites
          </button>
          <a className="btn-text px-3 py-2 border-0 text-left w-100 text-decoration-none text-dark" href={item['@microsoft.graph.downloadUrl']} download>
            <DownloadIcon className="icon me-2" target="_blank" /> 
            Download
          </a>
            </div>
          )}
        </div>
        )
      ))}
    </div>
  );
};

export default FileList;
