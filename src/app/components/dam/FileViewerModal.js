'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import DownloadIcon from '../../../../public/images/icons/download.svg';
import ShareIcon from '../../../../public/images/icons/share.svg';
import InfoIcon from '../../../../public/images/icons/info.svg';
import ArrowLeftIcon from '../../../../public/images/icons/arrow-left.svg';
import FilesIcon from '../../../../public/images/icons/files.svg';
import CloseIcon from '../../../../public/images/icons/close.svg';
import { gsap } from 'gsap';
import XlsxViewer from './XlsxViewer';
import { useToast } from '@/app/context/ToastContext';
import axios from 'axios';
import { Document, Page } from 'react-pdf';
import { fieldNameFromStoreName } from '@apollo/client/cache';
import { format } from 'date-fns'; 



const FileViewerModal = ({ show, handleClose, fileData }) => {
  const modalRef = useRef(null);
  const fileInfoRef = useRef(null); 
  const [tags, setTags] = useState(fileData.tags || []);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  const pdfCanvasRef = useRef(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const memoizedFileData = useMemo(() => fileData, [fileData.id]);
  const hasFetched = useRef(false);
  

  const handleShareFile = () => {
    navigator.clipboard.writeText(fileData.webUrl)
    .then(() => addToast('Share link copied to clipboard.', 'success'))
    .catch(error => addToast('Failed to create link.', 'danger'));
  }

  const handleAddTag = () => {
    if (newTag.trim()) {
      const newTagObject = {
        id: Math.random().toString(36).substr(2, 9),
        tag: newTag.trim(),
      };
      setTags([...tags, newTagObject]);
      setNewTag('');
    }
  };

  const handleRemoveTag = async (tagToRemove) => {
    try {
      const response = await axios.delete(`/api/graph/library/file/tag`, {
        params: { tagId: tagToRemove },
      });

      if (response.status === 200) {
        setTags(tags.filter(tag => tag.id !== tagToRemove));
        addToast('Tag removed successfully.', 'success');
      } else {
        throw new Error('Error removing tag');
      }
    } catch (error) {
      console.error('Error removing tag:', error);
      addToast('Failed to remove tag.', 'danger');
    }
  };


  useEffect(() => {
    if (!hasFetched.current) { 
      hasFetched.current = true; 

      if (fileData) {
        const fileExtension = fileData.name.split('.').pop().toLowerCase();

        if (fileExtension === 'pdf') {
          fetchPdfBlob();
        } else if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(fileExtension)) {
          convertToPdfAndFetchBlob(); 
        }
        fetchTags();
      }
    }
  }, [memoizedFileData]);


  const fetchTags = async () => {
    try {
      const response = await axios.get(`/api/graph/library/file/tag?fileId=${fileData.id}`);
      if (response.status === 200) {
        setTags(response.data);
      } else {
        throw new Error('Error fetching tags');
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
      addToast('Failed to load tags.', 'danger');
    }
  };


  const convertToPdfAndFetchBlob = async () => {
    if (fileData) {
      try {
        const id = fileData.id;
        const response = await axios.get('/api/graph/library/file/pdf', {
          params: {
            fileId: fileData.id,
          },
          responseType: 'blob', 
        });
  
        
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        setFileUrl(url);
      } catch (error) {
        console.error('Error fetching PDF:', error);
        addToast('Error loading PDF.', 'danger');
      }
    }
  };
  

  const handleSaveTags = async () => {
    setSaving(true);
    try {
      const fileId = fileData.id;
      const tagStrings = tags.map(tag => tag.tag || tag);
  
      const response = await axios.post('/api/graph/library/file/tag', {
        fileId,
        tags: tagStrings, 
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (response.status === 201) {
        addToast('Tags successfully updated.', 'success');
 
      } else {
        throw new Error('Error updating tags');
      }
    } catch (error) {
      console.error('Error saving tags:', error);
      addToast('Failed to update tags.', 'danger');
    } finally {
      setSaving(false);
      setIsEditingTags(false);
    }
  };
  
  

  const handleCancelTags = () => {
    setTags(fileData.tags || []); 
    setIsEditingTags(false);
  };

  const fetchPdfBlob = async () => {
    if (fileData) {
      try {
        const response = await axios.get(fileData['@microsoft.graph.downloadUrl'], {
          responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        setFileUrl(url);
      } catch (error) {
        console.error('Error fetching PDF:', error);
        addToast('Error loading PDF.', 'danger');
      }
    }
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
          <div class="d-flex align-items-center justify-content-center col-12 col-lg-8 mx-auto">
            <img
              src={file.webUrl}
              alt={file.name}
              className="img-fluid"
            />
          </div>
        );
      
        case 'pdf':
        case 'doc':
        case 'docx':
        case 'ppt':
        case 'pptx':
        case 'xls':
        case 'xlsx':
          return pdfUrl ? (
            <object
              data={pdfUrl}
              type="application/pdf"
              width="100%"
              height="600px"
            >
            </object>
          ) : (
            <p>Loading file...</p>
          );

      case 'txtx':
        return (
          <iframe
            src={file.url}
            style={{ width: '100%', height: '600px' }}
            frameBorder="0"
          />
        );
  
      default:
        return (
          <div className="d-flex flex-column align-items-center justify-content-center py-6 my-6 h-100">
            <FilesIcon className="mb-3"/>
            <p>File type not supported for preview.</p>
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

  const fileName = fileData.name.split('.')[0];
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };
  

  useEffect(() => {
    if (fileInfoRef.current) {
      gsap.set(fileInfoRef.current, { y: 20, opacity: 0 });
    }
  }, []);

  useEffect(() => {
    console.log('useEffect triggered with fileData:', fileData);
  }, [memoizedFileData]);

  const handleDownload = async () => {
    try {
      const response = await axios.get(`/api/graph/library/download?fileId=${fileData.id}`);
      if (response.status === 200 && response.data.downloadUrl) {
        return response.data.downloadUrl;
      } else {
        console.error('Error fetching the download URL:', response.data.error || 'Unknown error');
        return null;
      }
    } catch (error) {
      console.error('Error making request to fetch the download URL:', error.message);
      return null;
    }
  }

  const formatModifiedDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  };

  return (
    <div ref={modalRef} className="file-viewer container position-fixed top-0 start-0 w-100 bg-light pt-0 pb-6 px-5 h-100">
      <div className="row file-menu position-sticky bg-light start-0 pt-2 top-0">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <button type="button" className="btn btn-text" onClick={handleClose}>
            <ArrowLeftIcon className="me-1" />
            Back
          </button>
          <div className="d-flex ms-auto">
            <a className="btn btn-text me-3" href={fileData['@microsoft.graph.downloadUrl']} download><DownloadIcon className="me-1" target="_blank" /> Download</a>
            <button type="button" className="btn btn-text me-3" onClick={handleShareFile}>
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

      <div className="row mt-4 h-100">
        <div className="col-12">
          <div className="file-preview position-relative z-2 mb-6 h-100">
            {renderFilePreviewModal()}
          </div>
        </div>

        {showInfoPanel && (
        <div className="position-absolute h-100 top-0 end-0 z-3">
          <div ref={fileInfoRef} className="file-info d-flex flex-column align-items-start bg-white shadow p-4 rounded h-100 position-sticky end-0 ms-auto me-2">
            <div className="d-flex justify-content-between align-items-center w-100 mb-4">
              <span>File Details</span>
              <button className="btn btn-text p-2" onClick={toggleInfoPanel}>
                <CloseIcon className="" />
              </button>
            </div>
            <span className="h6 mb-4 fw-bold-500">{fileName}</span>

            <div className="d-flex flex-column align-items-start mb-4">
              <span className="fw-400">Type</span>
              <span>{fileType}</span>
            </div>
            <div className="d-flex flex-column align-items-start mb-4">
              <span className="fw-400">Size</span>
              <span>{formatFileSize(fileData.size)}</span>
            </div>
            <div className="d-flex flex-column align-items-start mb-4">
              <span className="fw-400">Modified</span>
              <span>{formatModifiedDate(fileData.lastModifiedDateTime)}</span>
            </div>
            <div className="d-flex flex-column align-items-start mb-4">
              <span className="fw-400">Created</span>
              <span>{formatModifiedDate(fileData.createdDateTime)}</span>
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
                        <span key={index} className="badge bg-white border text-dark rounded-3 p-2 me-2">
                          {tag.tag}
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
                      onClick={() => handleRemoveTag(tag.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      {tag.tag} &times;
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
                  <button className="btn btn--white text-dark me-2" onClick={() => setIsEditingTags(false)} disabled={saving}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleSaveTags} disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default FileViewerModal;
