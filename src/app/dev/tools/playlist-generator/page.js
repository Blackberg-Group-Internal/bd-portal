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
import Link from 'next/link';
import HomeIcon from '../../../../../public/images/icons/home.svg';
import ChevronIcon from '../../../../../public/images/icons/chevron.svg';
import MusicIcon from '../../../../../public/images/icons/music.svg';
import SongList from '@/app/components/dev/SongPlaylist';

function PlaylistGeneratorPage() {
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

  const handleGenerateClick = async () => {
    setLoading(true);
    setAnalysisResult('');
  
    try {
      const response = await fetch('/api/playlist-curator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: rfpText }),
      });
  
      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }
  
      const playlist = await response.json(); // Directly parse JSON response
      setAnalysisResult(playlist.analysis);
    } catch (error) {
      console.error('Error generating playlist:', error);
      setAnalysisResult(null);
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
                <Link href="/dev/tools/cover-letter" className="text-decoration-none overflow-hidden">
                  <span className="text-nowrap d-block text-truncate">Playlist Generator</span>
                </Link>
              </div>
              </div>
              <div className="col-12 d-flex justify-content-between align-items-center page-info">
                <h1 className="fw-bold-500 my-4">Playlist Generator</h1>
                  <div className="search">
                    <button className="border-0 bg-transparent" onClick={handleShow} ref={searchRef}>
                      <SearchIcon />
                    </button>
                  </div>
              </div>
            </div>

            <div className="row">
            <div className="col-12 col-md-6 col-xl-5">
                <div className="card card-tool card-tool--no-hover rounded shadow-sm bg-white py-3 pointer">
                <div className="card-body text-left d-flex flex-column">
                    <div className="tool-icon rounded-3 mb-2 align-self-start p-2">
                        <MusicIcon />
                    </div>
                    <p className="card-text mb-0">Generate a curated playlist to kickoff your project.</p>
                    <textarea
                    className="form-control my-3"
                    placeholder="Add any details about specific songs, mood, genre, tempo, era, etc..."
                    rows="2"
                    value={rfpText}
                    onChange={(e) => setRfpText(e.target.value)}
                  />
                  <button className="btn btn-primary d-flex align-items-center align-self-start ms-auto" onClick={handleGenerateClick}>
                    Generate
                    <MagicWandIcon className="ms-2 icon icon-white" />
                  </button>
                </div>
                </div>
            </div>

            { loading &&
                <div className="col-12 col-md-6 col-xl-7 mt-4 mt-md-0">
                    <div className="sphere-container d-flex align-items-center justify-content-center w-100 py-5">
                        <div className="sphere sphere-animate"></div>
                    </div>
                </div>
            }
            {analysisResult && 
                <div className="col-12 col-md-6 col-xl-7 mt-4 mt-md-0">
                    <div className="card  card-tool card-tool--no-hover rounded shadow-sm bg-white py-3 pointer">
                    <div className="card-body text-left d-flex flex-column">
                        <div className="d-flex justify-content-between w-100">
                            <div className="tool-icon rounded-3 mb-2 align-self-start p-2">
                                <CoverLetterIcon />
                            </div>
                        </div>
                        <p className="card-text small mb-1 fw-bold text-uppercase my-2">Playlist</p>                
                        <div className="mt-4">
                            <SongList songs={analysisResult} />
                        </div>
                    </div>
                    </div>
                </div>  
            }

            </div>
            <SearchModal show={showModal} handleClose={handleClose} />
        </div>
        </section>

    </>
  );
}

export default PlaylistGeneratorPage;
