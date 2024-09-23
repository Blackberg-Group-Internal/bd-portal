'use client';

import React, { useState, useRef, useEffect, useContext } from 'react';
import MenuIcon from '../../../../public/images/icons/dots-vertical.svg';
import ShareIcon from '../../../../public/images/icons/share.svg';
import FavoritesIcon from '../../../../public/images/icons/favorites-small.svg';
import DownloadIcon from '../../../../public/images/icons/download.svg';
import DocPreview from '../../../../public/images/icons/docx.svg';
import PdfPreview from '../../../../public/images/icons/pdf.svg';
import PngPreview from '../../../../public/images/icons/png.svg';
import XlsxPreview from '../../../../public/images/icons/xlsx.svg';
import { FileViewerContext } from '@/app/layout';
import gsap from 'gsap';

const FileList = ({ files, preview }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [activeActionPanel, setActiveActionPanel] = useState(null);
  const [showPreviews, setShowPreviews] = useState(false);
  const listViewRef = useRef(null);
  const { openModal } = useContext(FileViewerContext);

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
      try {
        return (
          // <FileViewer
          //   fileType={file.fileType || fileExtension}
          //   filePath={file.url}
          //   unsupportedComponent={<img src="/default-file-icon.png" alt="unsupported" />}
          // />
          <></>
        );
      } catch (error) {
        console.error('Error rendering file preview', error);
        return <img src="/default-file-icon.png" alt="default" />;
      }
    } else {
      switch (file.fileType || fileExtension) {
        case 'docx':
          return <DocPreview className="icon--file me-2" width="40" height="48" />;
        case 'pdf':
          return <PdfPreview className="icon--file me-2" width="40" height="48" />;
        case 'xlsx':
          return <XlsxPreview className="icon--file me-2" width="40" height="48" />;
        case 'png':
        case 'jpg':
        case 'jpeg':
          return <PngPreview className="icon--file me-2" width="40" height="48" />;
        default:
          return <img src="/default-file-icon.png" alt="default" className="icon--file me-2" width="40" height="48" />;
      }
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
        <div className="col-10 col-md-7 col-lg-5 small">Name</div>
        <div className="col-4 d-none d-md-flex small">File Size</div>
        <div className="col-2 d-none d-lg-flex small">Last Updated</div>
      </div>

      {files.map((file) => (
        <div
          className="row align-items-center px-3 py-3 border bg-white position-relative"
          key={file.id}
        >
          <div className="col-auto pe-0 d-flex align-items-center d-none d-md-flex">
            <input
              type="checkbox"
              checked={selectedItems.includes(file.id)}
              onChange={() => handleItemSelect(file.id)}
              className="rounded"
            />
          </div>
          <div
            className="col-10 col-md-7 col-lg-5 d-flex align-items-center pointer"
            onClick={() => showModal(file)}
          >
            {renderFilePreview(file)}
            <span className="text-nowrap">{file.name}</span>
          </div>
          <div className="col-4 d-none d-md-flex">{file.size}</div>
          <div className="col-2 d-none d-lg-flex">{file.lastUpdated}</div>

          <div className="col-auto ms-auto position-absolute end-0 me-2">
            <button
              className="btn-action border-0 bg-transparent"
              onClick={() => toggleActions(file.id)}
            >
              <MenuIcon className="icon" />
            </button>
          </div>

          {activeActionPanel === file.id && (
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

export default FileList;
