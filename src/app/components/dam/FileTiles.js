'use client';

import React, { useState, useRef, useEffect, useContext } from 'react';
import MenuIcon from '../../../../public/images/icons/dots-vertical.svg';
import ShareIcon from '../../../../public/images/icons/share.svg';
import FavoritesIcon from '../../../../public/images/icons/favorites-small.svg';
import DownloadIcon from '../../../../public/images/icons/download.svg';
import { FileViewerContext } from '@/app/layout';
import gsap from 'gsap';
import File from '@/app/components/dam/File';
import Folder from '@/app/components/dam/Folder';

const FileTiles = ({ files, preview }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeActionPanel, setActiveActionPanel] = useState(null);
  const tileViewRef = useRef(null);
  const renderedItemsRef = useRef(new Set()); 
  const { openModal } = useContext(FileViewerContext);

  const handleItemSelect = (id) => {
    setSelectedItems((prevSelectedItems) =>
      prevSelectedItems.includes(id)
        ? prevSelectedItems.filter((itemId) => itemId !== id)
        : [...prevSelectedItems, id]
    );
  };

  const showModal = (file) => {
    openModal(file);
  };

  const toggleActions = (id) => {
    setActiveActionPanel((prevActivePanel) => (prevActivePanel === id ? null : id));
  };

  useEffect(() => {
    const tiles = tileViewRef.current.querySelectorAll('.tile');
    gsap.set(tiles.current, { y: 20, opacity: 0 });
  });

  useEffect(() => {
    if (tileViewRef.current) {
      const newTiles = Array.from(tileViewRef.current.querySelectorAll('.tile')).filter(
        (tile) => !renderedItemsRef.current.has(tile.dataset.id)
      );

      if (newTiles.length > 0) {
        gsap.fromTo(
          newTiles,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.05,
            ease: 'power1.out',
            duration: 0.3,
          }
        );

        newTiles.forEach((tile) => renderedItemsRef.current.add(tile.dataset.id));
      }
    }
  }, [files]);

  return (
    <div className="tile-view container mt-4 d-flex flex-wrap" ref={tileViewRef}>
      {files.map((item, index) => (
        item.folder ? (
          <Folder key={index} folder={item} viewMode="tiles" data-id={item.id} />
        ) : (
          <File key={index} file={item} preview={preview} data-id={item.id} />
        )
      ))}
    </div>
  );
};

export default FileTiles;
