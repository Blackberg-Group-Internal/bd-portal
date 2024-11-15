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
import { useSession } from 'next-auth/react';
import CollectionTiles from '../components/dam/CollectionTiles';

const DamPage = () => {
  const [viewMode, setViewMode] = useState('tiles');
  const [collectionData, setCollectionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const folderContainerRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const { data: session, status } = useSession();

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const fetchLibraryContents = async (libraryId) => {
    try {
      const response = await axios.get(`/api/graph/library?libraryId=${libraryId}`);
      const data = response.data.value;

      setCollectionData((prevData) => {
        const updatedData = [...data];

        if (prevData) {
          const existingIds = new Set(prevData.map(item => item.id));
          prevData.forEach(item => {
            if (!existingIds.has(item.id)) {
              updatedData.push(item);
            }
          });
        }

        return updatedData;
      });

      localStorage.setItem('collectionData', JSON.stringify(data));
      setLoading(false);

      if (folderContainerRef.current) {
      //  animateFolders();
      }
    } catch (error) {
      console.error('Error fetching library contents:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedCollectionData = JSON.parse(localStorage.getItem('collectionData'));
    if (storedCollectionData) {
      setCollectionData(storedCollectionData);
      setLoading(false);
      fetchLibraryContents('b!IjBwAehgSE2n7qOI215nrR4bdH26ND9OupDVEUroagUhuALlBeVMQpUSNfSQ_FtP');
    } else {
      fetchLibraryContents('b!IjBwAehgSE2n7qOI215nrR4bdH26ND9OupDVEUroagUhuALlBeVMQpUSNfSQ_FtP');
    }
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

  // const animateFolders = () => {
  //   if (folderContainerRef.current) {
  //     const folders = folderContainerRef.current.querySelectorAll('.folder');
  //     gsap.fromTo(
  //       folders,
  //       { opacity: 0, y: 20 },
  //       { opacity: 1, y: 0, stagger: 0.075, ease: 'power1.out', duration: 0.5 }
  //     );
  //   }
  // };

  // useEffect(() => {
  //   if (folderContainerRef.current) {
  //     animateFolders();
  //   }
  // }, [collectionData]);

  // useEffect(() => {
  //   const getAllDamFiles = async () => {
  //     try {
  //       const response = await axios.get('/api/graph/library/files');
  //       if (response.status === 200) {
  //         const data = response.data;
  //         console.log('All Files Data: ', data);
  //         localStorage.setItem('allFiles', JSON.stringify(data));
  //       }
  //     } catch (error) {
  //       console.error('Error fetching files:', error);
  //     }
  //   };

  //   //getAllDamFiles();
  // }, []);

  // useEffect(() => {
  //   const handleGetFavorites = async () => {
  //     try {
  //       if (!session || !session.user?.id) {
  //         return;
  //       }

  //       const userId = session.user.id;

  //       const response = await axios.get(`/api/graph/library/file/favorite?userId=${userId}`);

  //       if (response.status === 200) {
  //         const favoriteFiles = response.data;

  //         if (!favoriteFiles || favoriteFiles.length === 0) {
  //           console.log('No favorites found');
  //           return;
  //         }

  //         const fileDataPromises = favoriteFiles.map(async (favorite) => {
  //           try {
  //             const graphResponse = await axios.get(`/api/graph/library/file?fileId=${favorite.fileId}`);
  //             return graphResponse.data;
  //           } catch (error) {
  //             console.error(`Error fetching file data for file ID ${favorite.fileId}:`, error);
  //             return null;
  //           }
  //         });

  //         const filesData = await Promise.all(fileDataPromises);

  //         const validFilesData = filesData.filter((file) => file !== null);

  //         console.log('Favorites files data:', validFilesData);
  //         localStorage.setItem('userFavorites', JSON.stringify(validFilesData));
  //       } else {
  //         throw new Error('Failed to fetch favorites');
  //       }
  //     } catch (error) {
  //       console.error('Error fetching favorites:', error);
  //     }
  //   };

  //   handleGetFavorites();
  // }, []);

  const refreshLibrary = () => {
    fetchLibraryContents('b!IjBwAehgSE2n7qOI215nrR4bdH26ND9OupDVEUroagUhuALlBeVMQpUSNfSQ_FtP');
    //setTimeout(() => {
    //  animateFolders();
    //}, 500);
  };

  // const handleFilesUploaded = () => {
  //   fetchFolderContents(folderId);
  // };

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
                <AddFolderButton onFolderAdded={refreshLibrary} />
                <FileUploadButton onFilesUploaded={refreshLibrary} />
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
                  <CollectionTiles collections={collectionData} />
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
