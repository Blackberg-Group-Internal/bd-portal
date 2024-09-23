
"use client";

import React, { useState } from 'react';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import Folder from '@/app/components/dam/Folder';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import SearchIcon from '../../../public/images/icons/search.svg';
import UploadIcon from '../../../public/images/icons/upload.svg';
import ListIcon from '../../../public/images/icons/list.svg';
import TilesIcon from '../../../public/images/icons/tiles.svg';
import SearchModal from '@/app/components/SearchModal';
import CollectionList from '@/app/components/dam/CollectionList';
import FileUploadButton from '@/app/components/dam/FileUploadButton';

const DamPage = () => {

  const [viewMode, setViewMode] = useState('tiles');
  const folderContainerRef = useRef(null); 
  const searchRef = useRef(null);
  const handleShow = () => setShowModal(true);
  const [showModal, setShowModal] = useState(false);
  const handleClose = () => setShowModal(false);

  const toggleView = (mode) => {
    setViewMode(mode);
    localStorage.setItem('viewMode', mode);
  };

  const data = [
    {
      id: 1,
      name: 'Performance Records',
      isEmpty: false,
      lastUpdated: 'Aug 9, 2024',
      modifiedBy: 'Ross Burmeister',
    },
    {
      id: 2,
      name: 'Technical',
      isEmpty: false,
      lastUpdated: 'Aug 9, 2024',
      modifiedBy: 'Ross Burmeister',
    },
    {
      id: 3,
      name: 'Management',
      isEmpty: true,
      lastUpdated: 'Jul 15, 2024',
      modifiedBy: 'Will Elder',
    },
    {
      id: 4,
      name: 'Awards',
      isEmpty: false,
      lastUpdated: 'Aug 9, 2024',
      modifiedBy: 'Ross Burmeister',
    },
    {
      id: 5,
      name: 'Graphics',
      isEmpty: false,
      lastUpdated: 'Aug 9, 2024',
      modifiedBy: 'Ross Burmeister',
    },
    {
      id: 6,
      name: 'Resumes',
      isEmpty: true,
      lastUpdated: 'Jul 1, 2024',
      modifiedBy: 'Ross Burmeister',
    },
    {
      id: 7,
      name: 'Prior Proposals',
      isEmpty: false,
      lastUpdated: 'Aug 9, 2024',
      modifiedBy: 'Ross Burmeister',
    },
  ];
  

  useEffect(() => {
    if (folderContainerRef.current) {
        const folders = folderContainerRef.current.querySelectorAll('.folder');
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
}, [viewMode]);

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
              <Breadcrumbs first="Digital Asset Manager" second="Collections" />
            </div>
            <div className="col-12">
              <div className="border-bottom d-flex justify-content-between align-items-center page-info">
                <h1 className="fw-bold-600 my-4">Collections</h1>
                  <div>
                    <button className="border-0 bg-transparent" onClick={handleShow} ref={searchRef}>
                      <SearchIcon className="icon" />
                    </button>
                    <FileUploadButton />
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
                <h2 className="h5 fw-bold-600">8 Collections</h2>
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

            <div className="col-12">
            {viewMode === 'tiles' ? (
              <div className={`folder-container d-flex flex-wrap mt-4`} ref={folderContainerRef}>
                {data.map((folder, index) => (
                  <Folder key={index} folder={folder} viewMode={viewMode} />
                ))}
              </div>
              ) : (
                <CollectionList collections={data} />
              )}
            </div>
        </div>
    </section>
  </>
  )

};

export default DamPage;