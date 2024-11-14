import { createContext, useContext, useEffect, useState } from 'react';

const FolderContext = createContext();

export const FolderProvider = ({ children }) => {
  const [folderId, setFolderId] = useState(null);
  const [previousFolderId, setPreviousFolderId] = useState(null);
  const [previousFolderMapping, setPreviousFolderMapping] = useState(null);

  useEffect(() => {
    const savedFolderId = localStorage.getItem('folderId');
    if (savedFolderId && !folderId) {
      setFolderId(savedFolderId);
    }
  }, []);

  useEffect(() => {
    if (folderId) {
      localStorage.setItem('folderId', folderId);
    }
  }, [folderId]);

  const updateFolderMapping = (folder) => {
    if (folder && folder.id) {
      const vanityName = buildVanityName(folder);
      if (vanityName) {
        const key = `folderMapping:${vanityName}`;
        if (previousFolderMapping && vanityName.includes(previousFolderMapping.split('/').pop())) {
          const updatedVanityName = `${previousFolderMapping}/${vanityName.split('/').pop()}`;
          localStorage.setItem(`folderMapping:${updatedVanityName}`, folder.id);
          setPreviousFolderMapping(updatedVanityName); 
        } else {
          localStorage.setItem(key, folder.id);
          setPreviousFolderMapping(vanityName); 
        }
      }
    }
  };

  const getFolderIdFromVanity = (vanityName) => {
    return localStorage.getItem(`folderMapping:${vanityName}`);
  };

  const updateFolderId = (newFolderId) => {
    setPreviousFolderId(folderId); 
    setFolderId(newFolderId);
  };

  const buildVanityName = (folder) => {
    let vanityNameParts = [];
    let currentFolder = folder;

    while (currentFolder && currentFolder.name) {
      if (currentFolder.id !== "01MODA5PF6Y2GOVW7725BZO354PWSELRRZ") {
        vanityNameParts.unshift(currentFolder.name.toLowerCase().replace(/\s+/g, '-'));
      } else {
        break;
      }
      currentFolder = currentFolder.parentReference ? currentFolder.parentReference : null;
    }
    return vanityNameParts.join('/');
  };

  return (
    <FolderContext.Provider value={{ folderId, previousFolderId, previousFolderMapping, updateFolderId, updateFolderMapping, getFolderIdFromVanity }}>
      {children}
    </FolderContext.Provider>
  );
};

export const useFolder = () => {
  const context = useContext(FolderContext);
  if (!context) {
    throw new Error('useFolder must be used within a FolderProvider');
  }
  return context;
};
