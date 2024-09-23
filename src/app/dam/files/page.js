"use client";

import React, { useState } from 'react';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import Folder from '@/app/components/dam/Folder';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import SearchIcon from '../../../../public/images/icons/search.svg';
import ListIcon from '../../../../public/images/icons/list.svg';
import TilesIcon from '../../../../public/images/icons/tiles.svg';
import SearchModal from '@/app/components/SearchModal';
import CollectionList from '@/app/components/dam/CollectionList';
import FileUploadButton from '@/app/components/dam/FileUploadButton';
import File from '@/app/components/dam/File';
import FileList from '@/app/components/dam/FileList';

const FilesPage = ({ }) => {

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
        name: 'Resume - Ross Burmeister.docx',
        size: '4.2 MB',
        fileType: 'docx',
        lastUpdated: 'Sep 15, 2024',
        modifiedBy: 'Ross Burmeister',
    },
    {
        id: 2,
        name: 'Project Proposal - Marketing Strategy.pdf',
        size: '3.1 MB',
        fileType: 'pdf',
        lastUpdated: 'Aug 20, 2024',
        modifiedBy: 'Will Elder',
    },
    {
        id: 3,
        name: 'Graphics Design Draft.png',
        size: '5.5 MB',
        fileType: 'png',
        lastUpdated: 'Jul 30, 2024',
        modifiedBy: 'Ross Burmeister',
    },
    {
        id: 4,
        name: 'Company Policies Update.docx',
        size: '2.9 MB',
        fileType: 'docx',
        lastUpdated: 'Sep 01, 2024',
        modifiedBy: 'Will Elder',
    },
    {
        id: 5,
        name: 'Sales Report Q2 2024.xlsx',
        size: '1.5 MB',
        fileType: 'xlsx',
        lastUpdated: 'Jun 15, 2024',
        modifiedBy: 'Ross Burmeister',
    },
    {
        id: 6,
        name: 'Team Meeting Agenda.docx',
        size: '0.8 MB',
        fileType: 'docx',
        lastUpdated: 'Aug 10, 2024',
        modifiedBy: 'Will Elder',
    },
    {
        id: 7,
        name: 'Graphic Design Final.png',
        size: '6.1 MB',
        fileType: 'png',
        lastUpdated: 'Jul 25, 2024',
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
              <Breadcrumbs first="Digital Asset Manager" second="Files" />
            </div>
            <div className="col-12">
              <div className="border-bottom d-flex justify-content-between align-items-center page-info">
                <h1 className="fw-bold-600 my-4">Files</h1>
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
                <h2 className="h5 fw-bold-600">{} Collections</h2>
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
                {data.map((file, index) => (
                  <File key={index} file={file} viewMode={viewMode}  />
                ))}
              </div>
              ) : (
                <FileList files={data} />
              )}
            </div>
        </div>
    </section>
  </>
  )

};

export default FilesPage;