import React, { useState } from 'react';
import MenuIcon from '../../../../public/images/icons/dots-vertical.svg';
import ShareIcon from '../../../../public/images/icons/share.svg';
import FavoritesIcon from '../../../../public/images/icons/favorites-small.svg';
import DownloadIcon from '../../../../public/images/icons/download.svg';
import DocPreview from '../../../../public/images/icons/docx.svg'; 
import PdfPreview from '../../../../public/images/icons/pdf.svg';
import PngPreview from '../../../../public/images/icons/png.svg';
import XlsxPreview from '../../../../public/images/icons/xlsx.svg';
// import FileViewer from 'react-file-viewer';
import FileViewerModal from './FileViewerModal';

const File = ({ file, preview }) => {
  const [showActions, setShowActions] = useState(false);
  const [show, setShow] = useState(false);
  const [showModal, setShowModal] = useState(false); 
  const [fileToView, setFileToView] = useState(null); 

  const toggleActions = () => {
    setShowActions((prevState) => !prevState);
  };

  const renderFilePreview = () => {
    const fileExtension = file.name.split('.').pop(); 
    console.log('File Extension: ' + fileExtension);
    console.log('File: ', file);
    if (preview) {
      try {
        return (
          // <FileViewer
          //   fileType={fileExtension} // Dynamic file type
          //   filePath={file.url} // Path to the file
          //   unsupportedComponent={<img src="../../../../public/images/icons/xlsx.svg" alt="unsupported" />} // Fallback for unsupported files
          // />
          <></>
        );
      } catch (error) {
        console.error('Error rendering file preview', error);
        return <img src="../../../../public/images/icons/xlsx.svg" alt="default" />;
      }
    } else {
      switch (fileExtension) {
        case 'docx':
          return <DocPreview className="icon--file me-2" width="40" height="48" />;
        case 'pdf':
          return <PdfPreview className="icon--file me-2" width="40" height="48" />;
        case 'xlsx':
          return <XlsxPreview className="icon--file me-2" width="40" height="48" />;
        case 'png':
        case 'jpg':
        case 'jpeg':
          return <PngPreview className="icon--file me-2" width="40" height="48" />;
        default:
          return <img src="/default-file-icon.png" alt="default" className="icon--file me-2" width="40" height="48" />;
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

  return (
    <div
      className="file text-figtree text-center p-3 mb-4 col-6 col-sm-4 col-md-3 col-xl-2 d-flex flex-column align-items-center position-relative"
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="d-flex flex-column pointer" onClick={() => handleOpenModal()}>
      <div className="file-icon">
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
          <button className="btn-text px-3 py-2 border-0 text-left" onClick={() => alert('Share & Get Link')}>
            <ShareIcon className="icon me-2" />
            Share & Get Link
          </button>
          <button className="btn-text px-3 py-2 border-0 text-left" onClick={() => alert('Add to Favorites')}>
            <FavoritesIcon className="icon me-2" />
            Add to Favorites
          </button>
          <button className="btn-text px-3 py-2 border-0 text-left" onClick={() => alert('Download')}>
            <DownloadIcon className="icon me-2" />
            Download
          </button>
        </div>
      )}

    {file && showModal && (
        <FileViewerModal
          show={showModal}
          handleClose={handleCloseModal}
          fileData={file}
        />
      )}
    </div>
  );
};

export default File;

