'use client';

import React, { useState, useEffect, useRef } from 'react';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import SearchIcon from '../../../../public/images/icons/search.svg';
import ListIcon from '../../../../public/images/icons/list.svg';
import CollectionEmptyIcon from '../../../../public/images/icons/collection-empty.svg';
import TilesIcon from '../../../../public/images/icons/tiles.svg';
import SearchModal from '@/app/components/SearchModal';
import FileUploadButton from '@/app/components/dam/FileUploadButton';
import FileList from '@/app/components/dam/FileList';
import gsap from 'gsap';
import Loader from '@/app/components/Loader';
import AddFolderButton from '@/app/components/dam/AddFolderButton';
import FileTiles from '@/app/components/dam/FileTiles';
import axios from 'axios';
import { getRecentFiles } from '@/app/lib/microsoft/graph';
import { useSession } from 'next-auth/react';
import { getDocumentLibraryAllFiles } from '@/app/lib/microsoft/graphHelper';

const FileListPage = () => {
  const [viewMode, setViewMode] = useState('tiles');
  const folderContainerRef = useRef(null);
  const searchRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);
  const [loading, setLoading] = useState(false);
  const [filesData, setFilesData] = useState(null);

  const toggleView = (mode) => {
    setViewMode(mode);
    localStorage.setItem('viewMode', mode);
  };


  const { data: session, status } = useSession();

  useEffect(() => {

    const fetchFiles = async () => {


      setLoading(true);
      try {
        const response = await axios.get('/api/graph/library/files');
        if (response.status === 200) {
          const data = response.data;
          console.log('All Files Data: ', data);
          setFilesData(data);
        } else {
        }
      } catch (error) {
        console.error('Error fetching files:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  useEffect(() => {
    if (folderContainerRef.current) {
      const folders = folderContainerRef.current.querySelectorAll('.folder-container div');
      gsap.fromTo(
        folders,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.075,
          ease: 'power1.out',
          duration: 0.5,
        }
      );
    }
  }, [viewMode, filesData]);

  useEffect(() => {
    const savedViewMode = localStorage.getItem('viewMode');
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
  }, []);

  return (
<>
<section className="container p-4 py-lg-5 px-lg-5">
        <div className="row">
          <div className="col-12">
            <Breadcrumbs first="Digital Asset Manager" second="Files" />
          </div>
          <div className="col-12">
            <div className="border-bottom d-flex justify-content-between align-items-center page-info">
              <h1 className="fw-bold-500 my-4">Files</h1>
              <div>
                <button className="border-0 bg-transparent" onClick={handleShow}>
                  <SearchIcon className="icon" />
                </button>
              </div>
              <SearchModal show={showModal} handleClose={handleClose} />
            </div>
          </div>
        </div>
      </section>
      <section className="container px-4 px-lg-5 mb-6">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center pb-3 border-bottom">
              <h2 className="h5 fw-bold-600">Files</h2>
              <div className="view-toggle d-flex">
                <button className={`btn btn--layout btn-text bg-white d-flex align-items-center ${viewMode === 'list' ? 'active' : ''}`} onClick={() => toggleView('list')}>
                  <ListIcon className="me-2 icon" />
                  <span>List</span>
                </button>
                <button className={`btn btn--layout btn-text bg-white d-flex align-items-center ${viewMode === 'tiles' ? 'active' : ''}`} onClick={() => toggleView('tiles')}>
                  <TilesIcon className="me-2 icon" />
                  <span>Tiles</span>
                </button>
              </div>
            </div>
          </div>
          {loading ? (
            <Loader />
          ) : filesData && filesData.length > 0 ? (
            <div className="col-12">
              {viewMode === 'tiles' ? (
                <FileTiles files={filesData} preview={true} />
              ) : (
                <FileList files={filesData} preview={true} />
              )}
            </div>
          ) : (
            <div className="d-flex flex-column w-100 py-7 align-items-center justify-content-center">
              <CollectionEmptyIcon />
              <h4>No Files Available</h4>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default FileListPage;