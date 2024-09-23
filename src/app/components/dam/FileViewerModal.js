'use client';

import React, { useState, useRef, useEffect } from 'react';
import FileViewer from 'react-file-viewer'; 
import DownloadIcon from '../../../../public/images/icons/download.svg';
import ShareIcon from '../../../../public/images/icons/share.svg';
import InfoIcon from '../../../../public/images/icons/info.svg';
import ArrowLeftIcon from '../../../../public/images/icons/arrow-left.svg';
import CloseIcon from '../../../../public/images/icons/close.svg';
import { gsap } from 'gsap';
import XlsxViewer from './XlsxViewer';

const FileViewerModal = ({ show, handleClose, fileData }) => {
  const modalRef = useRef(null);
  const fileInfoRef = useRef(null); 
  const [tags, setTags] = useState(fileData.tags || []);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [showInfoPanel, setShowInfoPanel] = useState(false);

  const handleAddTag = () => {
    if (newTag.trim()) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSaveTags = () => {
    setIsEditingTags(false);
    console.log('Tags saved:', tags);
  };

  const handleCancelTags = () => {
    setTags(fileData.tags || []); 
    setIsEditingTags(false);
  };

  const renderFilePreviewModal = () => {
    const file = fileData;
    const fileExtension = file.name.split('.').pop().toLowerCase(); 
  
    switch (fileExtension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':

        return (
          <div class="d-flex align-items-center col-12 col-lg-8 mx-auto">
            <img
              src={file.url}
              alt={file.name}
              className="img-fluid"
            />
          </div>
        );
      
      case 'pdf':
        return (
          <embed
            src={file.url}
            type="application/pdf"
            width="100%"
          />
        );
  
        case 'doc':
        case 'docx':
        case 'ppt':
        case 'pptx':
        return (
             <FileViewer
              fileType={file.fileType || fileExtension}
              filePath={file.url}
              errorComponent={<img src="/default-file-icon.png" alt="unsupported" />}
          />
        );

        case 'xls':
        case 'xlsx':
          return (
             <XlsxViewer fileUrl={file.url} />
          );

      case 'txt':
        return (
          <iframe
            src={file.url}
            style={{ width: '100%', height: '600px' }}
            frameBorder="0"
          />
        );
  
      default:
        return (
          <div>
            <img
              src="../../../../public/images/icons/file.svg"
              alt="unsupported"
              style={{ width: '100px', height: '100px' }}
            />
            <p>File type not supported for preview.</p>
            <a href={file.url} download>Download {file.name}</a>
          </div>
        );
    }
  };
  

  const toggleInfoPanel = () => {
    if (!showInfoPanel) {
      gsap.to(fileInfoRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.3,
        ease: 'power1.out',
      });
    } else {
      gsap.to(fileInfoRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.3,
        ease: 'power1.out',
      });
    }
    setShowInfoPanel(!showInfoPanel);
  };

  const fileType = fileData.name.split('.').pop().toLowerCase(); 

  useEffect(() => {
    if (show) {
      gsap.to(modalRef.current, {
        autoAlpha: 1, 
        y: 0,    
        duration: 0.3,
        ease: 'power1.out',
      });
    } else {
      gsap.to(modalRef.current, {
        autoAlpha: 0, 
        y: 20,   
        duration: 0.3,
        ease: 'power1.out',
        onComplete: handleClose, 
      });
    }
  }, [show]);

  useEffect(() => {
    if (fileInfoRef.current) {
      gsap.set(fileInfoRef.current, { y: 20, opacity: 0 });
    }
  }, []);

  return (
    <div ref={modalRef} className="file-viewer container position-fixed top-0 start-0 w-100 bg-light pt-0 pb-2 px-5">
      <div className="row file-menu position-sticky bg-light start-0 pt-2 top-0">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <button type="button" className="btn btn-text" onClick={handleClose}>
            <ArrowLeftIcon className="me-1" />
            Back
          </button>
          <div className="d-flex ms-auto">
            <button type="button" className="btn btn-text me-3">
              <DownloadIcon className="me-1" />
              Download
            </button>
            <button type="button" className="btn btn-text me-3">
              <ShareIcon className="me-1" />
              Share
            </button>
            <button type="button" className="btn btn-text" onClick={toggleInfoPanel}>
              <InfoIcon className="me-1" />
              Info
            </button>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="file-preview position-relative z-2">
            {renderFilePreviewModal()}
          </div>
        </div>

        <div className="position-absolute h-100 top-0 end-0">
          <div ref={fileInfoRef} className="file-info d-flex flex-column align-items-start bg-white shadow p-4 rounded h-100 position-sticky end-0 ms-auto me-2">
            <div className="d-flex justify-content-between align-items-center w-100 mb-4">
              <span>File Details</span>
              <button className="btn btn-text p-2" onClick={toggleInfoPanel}>
                <CloseIcon className="" />
              </button>
            </div>
            <span className="h6 mb-4">{fileData.name}</span>

            <div className="d-flex flex-column align-items-start mb-4">
              <span className="fw-400">Type</span>
              <span>{fileData.type}</span>
            </div>
            <div className="d-flex flex-column align-items-start mb-4">
              <span className="fw-400">Size</span>
              <span>{fileData.size}</span>
            </div>
            <div className="d-flex flex-column align-items-start mb-4">
              <span className="fw-400">Modified</span>
              <span>{fileData.modified}</span>
            </div>
            <div className="d-flex flex-column align-items-start mb-4">
              <span className="fw-400">Created</span>
              <span>{fileData.created}</span>
            </div>

            <div className="tags-section d-flex flex-column pt-4 border-top w-100 align-items-start">
              <div className="d-flex justify-content-between align-items-center w-100 mb-2">
                <h6 className="fw-400">Tags</h6>
                <button
                    className="btn btn-text p-0 fw-400"
                    onClick={() => setIsEditingTags(true)}>
                    + Add Tags
                  </button>
              </div>
              {!isEditingTags ? (
                <>
                  {tags.length > 0 ? (
                    <div className="tags-list">
                      {tags.map((tag, index) => (
                        <span key={index} className="badge bg-secondary me-2">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p>No tags</p>
                  )}
                </>
              ) : (
                <div className="edit-tags d-flex flex-column align-items-start w-100">
                  <div className="tags d-flex">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="rounded border me-2 py-1 px-2"
                      onClick={() => handleRemoveTag(tag)}
                      style={{ cursor: 'pointer' }}
                    >
                      {tag} &times;
                    </span>
                  ))}
                  </div>
                  <input
                    type="text"
                    className="form-control mt-2 w-100"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add new tag"
                  />
                  <button
                    className="btn btn-link mt-2 p-0"
                    onClick={handleAddTag}
                  >
                    Add Tag
                  </button>

                  <div className="mt-3 ms-auto">
                    <button className="btn btn-secondary me-2" onClick={handleCancelTags}>
                      Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleSaveTags}>
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileViewerModal;
