import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

const XlsxViewer = ({ fileUrl }) => {
  const [sheetData, setSheetData] = useState([]);

  useEffect(() => {
    fetch(fileUrl)
      .then(response => response.arrayBuffer())
      .then(buffer => {
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        setSheetData(jsonData);
      })
      .catch(err => console.error('Error rendering xlsx file:', err));
  }, [fileUrl]);

  return (
    <div className="xlsx-viewer text-figtree">
      <h3>XLSX Viewer</h3>
      <div className="table-wrap border">
        <table className="shadow mt-4">
            <thead className="border">
            <tr>
                {sheetData.length > 0 && Object.keys(sheetData[0]).map((key) => (
                <th key={key} className="border p-2">{key}</th>
                ))}
            </tr>
            </thead>
            <tbody>
            {sheetData.map((row, rowIndex) => (
                <tr key={rowIndex} className="border">
                {Object.values(row).map((cell, cellIndex) => (
                    <td key={cellIndex} className="border p-2">{cell}</td>
                ))}
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    </div>
  );
};

export default XlsxViewer;
