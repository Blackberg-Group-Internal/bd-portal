"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from 'react-query';
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

const fetchFavorites = async (userId) => {
  const response = await axios.get(`/api/graph/library/file/favorite?userId=${userId}`);
  const favoriteFiles = response.data;

  const fileDataPromises = favoriteFiles.map(async (favorite) => {
    try {
      const graphResponse = await axios.get(`/api/graph/library/file?fileId=${favorite.fileId}`);
      return graphResponse.data;
    } catch (error) {
      if (error.response && error.response.status === 500) {
        try {
          await axios.delete(`/api/graph/library/file/favorite?favoriteId=${favorite.id}`);
        } catch (deleteError) {

        }
      } else {

      }
      return null;
    }
  });

  const filesData = await Promise.all(fileDataPromises);
  return filesData.filter((file) => file !== null);
};

const FavoritesPage = () => {
  const searchRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const { data: session, status } = useSession();
  const [viewMode, setViewMode] = useState('tiles');
  const folderContainerRef = useRef(null);
  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const { data: filesData, isLoading, error } = useQuery(
    ['favorites', session?.user?.id],
    () => fetchFavorites(session?.user?.id),
    {
      enabled: !!session?.user?.id, 
      staleTime: 1, 
      initialData: () => {
        const savedFavoritesData = JSON.parse(localStorage.getItem('userFavorites'));
        return savedFavoritesData || [];
      },
      onSuccess: (data) => {
        localStorage.setItem('userFavorites', JSON.stringify(data));
      },
    }
  );

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
          stagger: 0.05,
          ease: 'power1.out',
          duration: 0.3,
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
      {!isLoading ? (
        <section className="container px-4 px-lg-5 mb-6">
          <div className="row">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center pb-3 border-bottom">
                <h2 className="h5 fw-bold-600">{filesData?.length} Favorites</h2>
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
              {isLoading ? (
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
