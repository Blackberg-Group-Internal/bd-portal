'use client';

import React, { useState, useEffect, useRef } from 'react';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import SearchIcon from '../../../../../public/images/icons/search.svg';
import ListIcon from '../../../../../public/images/icons/list.svg';
import CollectionEmptyIcon from '../../../../../public/images/icons/collection-empty.svg';
import TilesIcon from '../../../../../public/images/icons/tiles.svg';
import SearchModal from '@/app/components/SearchModal';
import FileUploadButton from '@/app/components/dam/FileUploadButton';
import FileList from '@/app/components/dam/FileList';
import gsap from 'gsap';
import { useFolder } from '@/app/context/FolderContext';
import Loader from '@/app/components/Loader';
import AddFolderButton from '@/app/components/dam/AddFolderButton';
import FileTiles from '@/app/components/dam/FileTiles';

const CollectionDetailPage = ({ params }) => {
  const { folderId, updateFolderId, previousFolderId, getFolderIdFromVanity } = useFolder();
  const { slug } = params;

  const collectionTitle = slug?.at(-1)?.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase()) || '';

  const [viewMode, setViewMode] = useState('tiles');
  const folderContainerRef = useRef(null);
  const [previousSlug, setPreviousSlug] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const handleClose = () => setShowModal(false);
  const [loading, setLoading] = useState(true);
  const [collectionData, setCollectionData] = useState([]);
  const handleShow = () => setShowModal(true);

  const toggleView = (mode) => {
    setViewMode(mode);
    localStorage.setItem('viewMode', mode);
  };

  useEffect(() => {
    if (slug && slug.length > 0) {
      const vanitySlug = slug.join('/');

      if (vanitySlug !== previousSlug) {
        setPreviousSlug(vanitySlug);

        const mappedFolderId = getFolderIdFromVanity(vanitySlug);
        if (mappedFolderId && mappedFolderId !== folderId) {
          updateFolderId(mappedFolderId);
        } else if (vanitySlug !== folderId) {
          updateFolderId(vanitySlug);
        }
      }
    }
  }, [slug]);

  useEffect(() => {
    if (folderId && folderId !== previousFolderId && !isVanityOrId(folderId)) {
      fetchFolderContents(folderId);
    }
  }, [folderId]);

  const isVanityOrId = (folderId) => {
    return !(folderId.length > 20 && /[A-Za-z]/.test(folderId) && /[0-9]/.test(folderId));
  };

  const fetchFolderContents = async (folderId) => {
    try {
      const response = await fetch(`/api/graph/library/folder?folderId=${folderId}`);
      const data = await response.json();

      if (response.ok) {
        if (data?.value && data.value.length > 0) {
          console.log('Folder contents', data.value);

          setCollectionData((prevData) => {
            const existingItemsMap = new Map(prevData.map(item => [item.id, item]));

            const updatedData = data.value.map(item => {
              return existingItemsMap.get(item.id) || item;
            });

            const newItems = updatedData.filter(item => !existingItemsMap.has(item.id));
            if (newItems.length > 0) {
              animateNewItems(newItems);
            }

            return updatedData;
          });
        }
      } else {
        console.error('Error fetching folder contents:', data.error);
      }
    } catch (error) {
      console.error('Error fetching folder contents:', error);
    } finally {
      setLoading(false);
    }
  };

  const animateNewItems = (newItems) => {
    if (folderContainerRef.current) {
      newItems.forEach((newItem) => {
        const newFolderElement = document.createElement('div');
        newFolderElement.className = 'folder';
        newFolderElement.innerHTML = `<strong>${newItem.name}</strong>`; 

        folderContainerRef.current.appendChild(newFolderElement);

        gsap.fromTo(
          newFolderElement,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            ease: 'power1.out',
            duration: 0.5,
          }
        );
      });
    }
  };

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
  }, [viewMode]);

  useEffect(() => {
    const savedViewMode = localStorage.getItem('viewMode');
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
  }, []);

  const handleFolderAdded = () => {
    fetchFolderContents(folderId);
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
              <h1 className="fw-bold-500 my-4">{collectionTitle}</h1>
              <div>
                <button className="border-0 bg-transparent" onClick={handleShow}>
                  <SearchIcon className="icon" />
                </button>
                <AddFolderButton onFolderAdded={handleFolderAdded} />
                <FileUploadButton onFilesUploaded={handleFolderAdded}  />
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
              <h2 className="h5 fw-bold-600">{collectionData?.length || 0} {collectionTitle}</h2>
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
            ) : collectionData && collectionData.length > 0 ? (
            <div className="col-12">
              {viewMode === 'tiles' ? (
                <div className="folder-container d-flex flex-wrap mt-4" ref={folderContainerRef}>
                  <FileTiles files={collectionData} preview={true} />
                </div>
              ) : (
                <FileList files={collectionData} preview={true} />
              )}
            </div>
          ) : (
            <div className="d-flex flex-column w-100 py-7 align-items-center justify-content-center">
              <CollectionEmptyIcon />
              <h4>This Collection is empty</h4>
            </div>
          )}
        </div>
    </section>
    </>
  );
};

export default CollectionDetailPage;
