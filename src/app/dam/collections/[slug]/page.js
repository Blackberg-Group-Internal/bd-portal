"use client";

import React, { useState, useEffect, useRef } from 'react';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import SearchIcon from '../../../../../public/images/icons/search.svg';
import ListIcon from '../../../../../public/images/icons/list.svg';
import TilesIcon from '../../../../../public/images/icons/tiles.svg';
import SearchModal from '@/app/components/SearchModal';
import FileUploadButton from '@/app/components/dam/FileUploadButton';
import File from '@/app/components/dam/File';
import FileList from '@/app/components/dam/FileList';
import gsap from 'gsap';

const CollectionDetailPage = ({ params }) => {
  const { slug } = params;
  const collectionTitle = slug.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  const [viewMode, setViewMode] = useState('tiles');
  const folderContainerRef = useRef(null);
  const searchRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const handleClose = () => setShowModal(false);

  const toggleView = (mode) => {
    setViewMode(mode);
    localStorage.setItem('viewMode', mode);
  };

  const data = [
    {
      id: 1,
      name: 'Resume - Ross Burmeister.pdf',
      size: '4.2 MB',
      fileType: 'pdf',
      lastUpdated: 'Sep 15, 2024',
      modifiedBy: 'Ross Burmeister',
      url: 'http://localhost:3000/files/test.pdf',
    },
    {
      id: 2,
      name: 'Test.jpeg',
      size: '.2 MB',
      fileType: 'jpeg',
      lastUpdated: 'Sep 15, 2024',
      modifiedBy: 'Ross Burmeister',
      url: 'http://localhost:3000/files/test.jpeg',
    },
    {
      id: 3,
      name: 'Test.xlsx',
      size: '1.2 MB',
      fileType: 'xlsx',
      lastUpdated: 'Sep 15, 2024',
      modifiedBy: 'Ross Burmeister',
      url: 'http://localhost:3000/files/test.xlsx',
    },
    {
      id: 3,
      name: 'est.docx',
      size: '1.2 MB',
      fileType: 'docx',
      lastUpdated: 'Sep 15, 2024',
      modifiedBy: 'Ross Burmeister',
      url: 'http://localhost:3000/files/test.docx',
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
              <h1 className="fw-bold-600 my-4">{collectionTitle}</h1>
              <div>
                <button className="border-0 bg-transparent" onClick={() => setShowModal(true)} ref={searchRef}>
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
              <h2 className="h5 fw-bold-600">Collections</h2>
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
          <div className="col-12">
            {viewMode === 'tiles' ? (
              <div className={`folder-container d-flex flex-wrap mt-4`} ref={folderContainerRef}>
                {data.map((file, index) => (
                  <File key={index} file={file} preview={true} />
                ))}
              </div>
            ) : (
              <FileList files={data} preview={true} />
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default CollectionDetailPage;
