import React, { useContext, useState } from 'react';
import MenuIcon from '../../../../public/images/icons/dots-vertical.svg';
import ShareIcon from '../../../../public/images/icons/share.svg';
import FavoritesIcon from '../../../../public/images/icons/favorites-small.svg';
import DownloadIcon from '../../../../public/images/icons/download.svg';
import DocPreview from '../../../../public/images/icons/docx.svg'; 
import PdfPreview from '../../../../public/images/icons/pdf.svg';
import PngPreview from '../../../../public/images/icons/png.svg';
import XlsxPreview from '../../../../public/images/icons/xlsx.svg';
import FolderIcon from '../../../../public/images/icons/folder.svg';
import DefaultIcon from '../../../../public/images/icons/default.svg';
import PowerpointIcon from '../../../../public/images/icons/ppt.svg';
import FileViewerModal from './FileViewerModal';
import { useToast } from '@/app/context/ToastContext';
import { FileViewerContext } from '@/app/layout';
import { useSession } from 'next-auth/react';
import axios from 'axios';

const File = ({ file, preview }) => {
  const [showActions, setShowActions] = useState(false);
  const [show, setShow] = useState(false);
  const [fileToView, setFileToView] = useState(null); 
  const { addToast } = useToast();
  const { openModal } = useContext(FileViewerContext);
  const { data: session, status } = useSession();

  const showModal = (file) => {
    openModal(file);
  };

  const toggleActions = () => {
    setShowActions((prevState) => !prevState);
  };

  const renderFilePreview = () => {
    const fileExtension = file.name.split('.').pop(); 
    console.log('File Extension: ' + fileExtension);
    console.log('File: ', file);
    if (preview) {
      switch (fileExtension) {
        case 'doc':
        case 'docx':
          return <DocPreview className="icon--file me-2" width="40" height="48" />;
        case 'pdf':
          return <PdfPreview className="icon--file me-2 test" width="40" height="48" />;
        case 'xls':
        case 'xlsx':
          return <XlsxPreview className="icon--file me-2" width="40" height="43" />;
        case 'ppt':
        case 'pptx':
          return <PowerpointIcon className="icon--file me-2" width="40" height="48" />;
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'webp':
        case 'bmp':
        case 'tiff':
        case 'svg':
            return (
              <div className="img-preview">
                <img
                  src={file.webUrl}
                  alt={file.name}
                  className="img-fluid"
                />
                </div>
            );
        default:
          return <DefaultIcon className="icon--file me-2" width="40" height="48" />;;
      }
    }
  };

  const handleOpenModal = (file) => {
    setFileToView(file);
    setShowModal(true);
    setShow(true)
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setShow(false)
    setFileToView(null);
  };

  const handleShareFile = () => {
    navigator.clipboard.writeText(file.webUrl)
    .then(() => addToast('Share link copied to clipboard.', 'success'))
    .catch(error => addToast('Failed to create link.', 'danger'));
  }

  const handleFavoriteFile = async (fileId) => {
    if (!fileId) {
      alert('File ID is missing');
      return;
    }
  
    try {
      const userId = session.user.id;
      
      const response = await axios.post('/api/graph/library/file/favorite', {
        fileId,
        userId
      });
  
      if (response.status === 201) {
        addToast('File favorited successfully.', 'success');
      } else {
        throw new Error('Error favoriting file');
      }
    } catch (error) {
      console.error('Error favoriting file:', error);
    addToast('Failed to favorite file.', 'danger');
    } finally {;
    }
  };

  return (
    <div
      className="file tile text-figtree text-center p-3 mb-4 col-6 col-sm-4 col-md-3 col-xl-2 d-flex flex-column align-items-center position-relative"
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="d-flex flex-column pointer" onClick={() => showModal(file)}>
      <div className="file-icon d-flex justify-content-center">
        {renderFilePreview()}
      </div>
      <div className="file-name mt-3">{file.name}</div>
      </div>

      <button
        className="btn-action border-0 bg-transparent position-absolute top-0 end-0 mt-2"
        onClick={toggleActions}
      >
        <MenuIcon className="icon" />
      </button>

      {showActions && (
        <div className="action-panel position-absolute top-0 mt-6 end-0 bg-white text-left d-flex flex-column align-items-stretch">
          <button className="btn-text px-3 py-2 border-0 text-left" onClick={handleShareFile}>
            <ShareIcon className="icon me-2" />
            Share & Get Link
          </button>
          <button className="btn-text px-3 py-2 border-0 text-left" onClick={() => handleFavoriteFile(file.id)}>
            <FavoritesIcon className="icon me-2" />
            Add to Favorites
          </button>
          <a className="btn-text px-3 py-2 border-0 text-left w-100 text-decoration-none text-dark" href={file['@microsoft.graph.downloadUrl']} download>
            <DownloadIcon className="icon me-2" target="_blank" /> 
            Download
          </a>
        </div>
      )}

    {/* {file && showModal && (
        <FileViewerModal
          show={showModal}
          handleClose={handleCloseModal}
          fileData={file}
        />
      )} */}
    </div>
  );
};

export default File;

