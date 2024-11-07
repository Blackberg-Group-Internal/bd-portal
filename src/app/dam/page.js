"use client";

import React, { useLayoutEffect, useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import axios from 'axios';
import Folder from '@/app/components/dam/Folder';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import SearchModal from '@/app/components/SearchModal';
import FileUploadButton from '@/app/components/dam/FileUploadButton';
import CollectionList from '@/app/components/dam/CollectionList';
import Loader from '../components/Loader';
import SearchIcon from '../../../public/images/icons/search.svg';
import ListIcon from '../../../public/images/icons/list.svg';
import TilesIcon from '../../../public/images/icons/tiles.svg';
import AddFolderButton from '../components/dam/AddFolderButton';


const DamPage = () => {
  const [viewMode, setViewMode] = useState('tiles');
  const [collectionData, setCollectionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const folderContainerRef = useRef(null);
  const [showModal, setShowModal] = useState(false);

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const fetchLibraryContents = async (libraryId) => {
    try {
      const response = await axios.get(`/api/graph/library?libraryId=${libraryId}`);
      setCollectionData(response.data.value);
      console.log('Library contents', response.data.value)
      setLoading(false);
      if (folderContainerRef.current) {
        const folders = folderContainerRef.current.querySelectorAll('.folder');
        gsap.fromTo(
          folders,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, stagger: 0.075, ease: 'power1.out', duration: 0.5 }
        );
      }
    } catch (error) {
      console.error('Error fetching library contents:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibraryContents('b!IjBwAehgSE2n7qOI215nrR4bdH26ND9OupDVEUroagUhuALlBeVMQpUSNfSQ_FtP');
  }, []);


  const toggleView = (mode) => {
    setViewMode(mode);
    localStorage.setItem('viewMode', mode);
  };

  useEffect(() => {
    const savedViewMode = localStorage.getItem('viewMode');
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
  }, []);

  useEffect(() => {
    if (viewMode === 'tiles' && folderContainerRef.current) {
      animateFolders();
    }
  }, [viewMode]);

  const animateFolders = () => {
    const folders = folderContainerRef.current.querySelectorAll('.folder');
    gsap.fromTo(
      folders,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, stagger: 0.075, ease: 'power1.out', duration: 0.2 }
    );
  };

  return (
    <>
      <section className="container p-4 py-lg-5 px-lg-5">
        <div className="row">
          <div className="col-12">
            <Breadcrumbs first="Digital Asset Manager" second="Collections" />
          </div>
          <div className="col-12">
            <div className="border-bottom d-flex justify-content-between align-items-center page-info">
              <h1 className="fw-bold-500 my-4">Collections</h1>
              <div>
                <button className="border-0 bg-transparent" onClick={handleShow}>
                  <SearchIcon className="icon" />
                </button>
                <AddFolderButton />
                <FileUploadButton />
              </div>
              <SearchModal show={showModal} handleClose={handleClose} />
            </div>
          </div>
        </div>
      </section>
      {!loading ? (
        <section className="container px-4 px-lg-5 mb-6">
          <div className="row">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center pb-3 border-bottom">
                <h2 className="h5 fw-bold-600">{collectionData?.length || 0} Collections</h2>
                <div className="view-toggle d-flex">
                  <button
                    className={`btn btn--layout btn-text bg-white d-flex align-items-center ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => toggleView('list')}>
                    <ListIcon className="me-2 icon" />
                    <span>List</span>
                  </button>
                  <button
                    className={`btn btn--layout btn-text bg-white d-flex align-items-center ${viewMode === 'tiles' ? 'active' : ''}`}
                    onClick={() => toggleView('tiles')}>
                    <TilesIcon className="me-2 icon" />
                    <span>Tiles</span>
                  </button>
                </div>
              </div>
            </div>

            {collectionData && (
            <div className="col-12">
              {viewMode === 'tiles' ? (
                <div className="folder-container d-flex flex-wrap mt-4" ref={folderContainerRef}>
                  {collectionData.map((folder, index) => (
                    <Folder key={index} folder={folder} viewMode={viewMode} />
                  ))}
                </div>
              ) : (
                <CollectionList collections={collectionData} />
              )}
            </div>
            )}
          </div>
        </section>
      ) : (
        <Loader />
      )}
    </>
  );
};

export default DamPage;