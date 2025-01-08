'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import SearchModal from '@/app/components/SearchModal';
import MagicWandIcon from '../../../../../public/images/icons/magic-wand.svg';
import CoverLetterIcon from '../../../../../public/images/icons/cover-letter.svg';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import ReactMarkdown from 'react-markdown';
import SearchIcon from '../../../../../public/images/icons/search.svg';
import CopyIcon from '../../../../../public/images/icons/copy.svg';
import AnalyzeIcon from '../../../../../public/images/icons/analyze.svg';
import Link from 'next/link';
import HomeIcon from '../../../../../public/images/icons/home.svg';
import ChevronIcon from '../../../../../public/images/icons/chevron.svg';

function CoverLetterPage() {
  const { data } = useSession();
  const searchRef = useRef(null);
  const cardsRef = useRef([]); 
  const [showModal, setShowModal] = useState(false);
  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);
  const [rfpText, setRfpText] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(analysisResult).then(() => {

    }).catch(err => {
      console.error('Error copying text: ', err);
    });
  };

  const sanitizeText = (text) => {
    return text
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') 
      .replace(/[\\]/g, '\\\\') 
      .replace(/[\"]/g, '\\\"') 
      .replace(/[\']/g, '\\\''); 
  };

  const handleGenerateClick = async () => {
    setLoading(true);
    setAnalysisResult('');

    const sanitizedRfpText = sanitizeText(rfpText);
  
    const response = await fetch('/api/rfp-analyzer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: sanitizedRfpText }),
    });
  
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
  
    let fullText = '';
    let firstResponseReceived = false; 
  
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
  
      const decodedChunk = decoder.decode(value, { stream: true });
      const lines = decodedChunk
        .split('\n')
        .filter(line => line.trim() !== ''); 

      for (const line of lines) {
        if (line === 'data: [DONE]') {
          done = true;
          break;
        }
  
        if (line.startsWith('data:')) {
          try {
            const jsonResponse = JSON.parse(line.substring(5));

            if (jsonResponse.choices && jsonResponse.choices[0].delta.content) {
              const newText = jsonResponse.choices[0].delta.content;
              fullText += newText;
  
              if (!firstResponseReceived) {
                firstResponseReceived = true;
                setTimeout(() => {
                  setAnalysisResult(prev => prev + newText);
                }, 1500);
              } else {
                setAnalysisResult(prev => prev + newText);
              }
            }
          } catch (error) {
            console.warn('Skipping invalid JSON chunk:', line);
          }
        }
      }
    }
  
    setLoading(false);
  };


  return (
    <>
        <section className="px-4 px-lg-5 pt-5 pb-6 mb-8">
        <div className="container position-relative">
            <div className="row">
            <div className="col-12 mb-4">
              <div className="breadcrumbs d-flex align-items-center text-figtree">
                <Link href="/dam"><HomeIcon /></Link>
                <ChevronIcon />
                <Link href="/dev/" className="text-decoration-none overflow-hidden">
                  <span className="text-nowrap d-block text-truncate">SamSmart</span>
                </Link>
                <ChevronIcon />
                <Link href="/dev/tools" className="text-decoration-none overflow-hidden">
                  <span className="text-nowrap d-block text-truncate">Tools</span>
                </Link>
                <ChevronIcon />
                <Link href="/dev/tools/analyzer" className="text-decoration-none overflow-hidden">
                  <span className="text-nowrap d-block text-truncate">RFP Analyzer</span>
                </Link>
              </div>
              </div>
              <div className="col-12 d-flex justify-content-between align-items-center page-info">
                <h1 className="fw-bold-500 my-4">RFP Analyzer</h1>
                  <div className="search">
                    <button className="border-0 bg-transparent" onClick={handleShow} ref={searchRef}>
                      <SearchIcon />
                    </button>
                  </div>
              </div>
            </div>

            <div className="row">
            <div className="col-12 col-md-4">
                <div className="card card-tool card-tool--no-hover rounded shadow-sm bg-white py-3 pointer">
                <div className="card-body text-left d-flex flex-column">
                    <div className="tool-icon rounded-3 mb-2 align-self-start p-2">
                      <AnalyzeIcon />
                    </div>
                    <p className="card-text mb-0">Get a detailed analysis of an RFP’s key points like deadlines, required documents, and evaluation criteria.</p>
                    <textarea
                    className="form-control my-3"
                    placeholder="Add RFP details here..."
                    rows="6"
                    value={rfpText}
                    onChange={(e) => setRfpText(e.target.value)}
                  />
                  <button className="btn btn-primary d-flex align-items-center align-self-start ms-auto" onClick={handleGenerateClick}>
                    Analyze
                    <MagicWandIcon className="ms-2 icon icon-white" />
                  </button>
                </div>
                </div>
            </div>

            
            <div className="col-12 col-md-8">
                <div className="card  card-tool card-tool--no-hover rounded shadow-sm bg-white py-3 pointer">
                <div className="card-body text-left d-flex flex-column">
                    <div className="d-flex justify-content-between w-100">
                        <div className="tool-icon rounded-3 mb-2 align-self-start p-2">
                            <CoverLetterIcon />
                        </div>
                    <button className="btn btn-text opacity-50 pe-0 pt-0" onClick={copyToClipboard}>
                      <CopyIcon />
                    </button>
                    </div>
                    <p className="card-text small mb-1 fw-bold text-uppercase my-2">Output</p>
                        {!analysisResult && loading ? (
                                <div className="sphere-container d-flex align-items-center justify-content-center w-100 py-5">
                                <div className="sphere sphere-animate"></div>
                            </div>
                        ) : (
                            analysisResult && (
                            <div className="mt-4">
                                <ReactMarkdown>{analysisResult}</ReactMarkdown>
                            </div>
                            )
                        )} 
                </div>
                </div>
            </div>

            </div>
            <SearchModal show={showModal} handleClose={handleClose} />
        </div>
        </section>

    </>
  );
}

export default CoverLetterPage;
