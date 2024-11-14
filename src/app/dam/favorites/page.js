"use client";

import React, { useEffect, useRef, useState } from 'react';
import Breadcrumbs from '../../components/Breadcrumbs';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import SearchIcon from '../../../../public/images/icons/search.svg';
import ListIcon from '../../../../public/images/icons/list.svg';
import CollectionEmptyIcon from '../../../../public/images/icons/collection-empty.svg';
import TilesIcon from '../../../../public/images/icons/tiles.svg';
import SearchModal from '@/app/components/SearchModal';
import gsap from 'gsap';
import Loader from '@/app/components/Loader';
import FileList from '@/app/components/dam/FileList';
import FileTiles from '@/app/components/dam/FileTiles';

const FavoritesPage = () => {
  const searchRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  const [viewMode, setViewMode] = useState('tiles');
  const folderContainerRef = useRef(null);
  const [filesData, setFilesData] = useState(null);
  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  useEffect(() => {
    const savedFavoritesData = JSON.parse(localStorage.getItem('userFavorites'));

    if (savedFavoritesData) {
      setFilesData(savedFavoritesData);
    }

    const handleGetFavorites = async () => {
      try {
        if (!session || !session.user?.id) {
          return;
        }

       // setLoading(true);
        const userId = session.user.id;

        const response = await axios.get(`/api/graph/library/file/favorite?userId=${userId}`);

        if (response.status === 200) {
          const favoriteFiles = response.data;

          if (!favoriteFiles || favoriteFiles.length === 0) {
            console.log('No favorites found');
           // setFilesData([]);
          //  setLoading(false);
            return;
          }

          const fileDataPromises = favoriteFiles.map(async (favorite) => {
            try {
              const graphResponse = await axios.get(`/api/graph/library/file?fileId=${favorite.fileId}`);
              return graphResponse.data;
            } catch (error) {
              console.error(`Error fetching file data for file ID ${favorite.fileId}:`, error);
              return null;
            }
          });

          const filesData = await Promise.all(fileDataPromises);
          const validFilesData = filesData.filter(file => file !== null);

          const previousData = JSON.parse(localStorage.getItem('userFavorites'));
          if (JSON.stringify(previousData) !== JSON.stringify(validFilesData)) {
            setFilesData(validFilesData);
            localStorage.setItem('userFavorites', JSON.stringify(validFilesData));
          }

          console.log('Favorites files data:', validFilesData);
        } else {
          throw new Error('Failed to fetch favorites');
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
       // setLoading(false);
      }
    };

    handleGetFavorites();
  }, [session, status]);

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

  return (
    <>
      <section className="container p-4 py-lg-5 px-lg-5">
        <div className="row">
          <div className="col-12">
            <Breadcrumbs first="Digital Asset Manager" second="Favorites" />
          </div>
          <div className="col-12">
            <div className="border-bottom d-flex justify-content-between align-items-center page-info">
              <h1 className="fw-bold-500 my-4">Favorites</h1>
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
      {!loading ? (
        <section className="container px-4 px-lg-5 mb-6">
          <div className="row">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center pb-3 border-bottom">
                <h2 className="h5 fw-bold-600">{filesData?.length} Files</h2>
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
          </div>
        </section>
      ) : (
        <Loader />
      )}
    </>
  );
};

export default FavoritesPage;