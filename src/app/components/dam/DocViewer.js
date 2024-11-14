import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';

const DocViewer = ({ fileUrl }) => {
  const [docxContent, setDocxContent] = useState('');

  useEffect(() => {
    fetch(fileUrl)
      .then(response => response.arrayBuffer())
      .then(buffer => {
        mammoth.extractRawText({ arrayBuffer: buffer })
          .then(result => {
            setDocxContent(result.value);
          })
          .catch(err => console.error('Error rendering docx file:', err));
      });
  }, [fileUrl]);

  return (
    <div>
      <h3>DOCX Viewer</h3>
      <div dangerouslySetInnerHTML={{ __html: docxContent }} />
    </div>
  );
};

export default DocViewer;
