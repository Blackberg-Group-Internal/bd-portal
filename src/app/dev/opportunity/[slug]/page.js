"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import SearchModal from '@/app/components/SearchModal';
import gsap from 'gsap';
import SearchIcon from '../../../../../public/images/icons/search.svg';
import MagicWandIcon from '../../../../../public/images/icons/magic-wand.svg';
import AiSummaryIcon from '../../../../../public/images/icons/ai-summary.svg';
import PerformanceIcon from '../../../../../public/images/icons/performance.svg';
import AnalyzeIcon from '../../../../../public/images/icons/analyze.svg';
import SummaryIcon from '../../../../../public/images/icons/summary.svg';
import NaicsIcon from '../../../../../public/images/icons/naics.svg';
import ProbabilityIcon from '../../../../../public/images/icons/probability.svg';
import DollarIcon from '../../../../../public/images/icons/dollar.svg';
import CalendarIcon from '../../../../../public/images/icons/calendar.svg';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import Link from 'next/link';
import axios from 'axios';
import { useOpportunity } from '@/app/context/OpportunityContext';
import ReactMarkdown from 'react-markdown';

function OpportunityPage() {
  const { data } = useSession();
  const searchRef = useRef(null);
  const cardsRef = useRef([]);
  const [showModal, setShowModal] = useState(false);
  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);
  const { selectedOpportunity } = useOpportunity();
  const [analysis, setAnalysis] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log('Selected Opportunity: ', selectedOpportunity);


  function decodeHtmlEntities(text) {
    const txt = document.createElement('textarea');
    txt.innerHTML = text;
    return txt.value;
  }

  useEffect(() => {

    const getAnalysis = async () => {
        try {
          if (selectedOpportunity && selectedOpportunity.description[0]) {

            const response = await axios.post('/api/analyze', {
              description: selectedOpportunity.description[0],
            });
    

            const analysisData = response.data.analysis;
            console.log('Anaylsis data: ', analysisData);

            setAnalysis(analysisData);
            setLoading(false);
          }
        } catch (error) {
          console.error('Error getting analysis:', error);
          setLoading(false);
        }
    }

    getAnalysis();

    gsap.fromTo(
      ".card",
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.1,
        ease: 'power1.out',
        duration: 0.5,
      }
    );
  }, []);

  return (
    <>
      <section className="px-4 px-lg-5 pt-5 pb-6 mb-8">
        <div className="container position-relative">
          <div className="row">
            <div className="col-12">
              <Breadcrumbs first="SamSmart" second="Dashboard" third="Tools" />
            </div>
            <div className="col-12 d-flex justify-content-between align-items-center page-info">
              <h1 className="fw-bold-500 my-4">Opportunity</h1>
              <div className="search">
                <button className="border-0 bg-transparent" onClick={handleShow} ref={searchRef}>
                  <SearchIcon className="icon" />
                </button>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12 col-md-9 col-lg-9 mb-4">
              <div className="card card-tool card-tool--no-hover  rounded shadow-sm bg-white py-3 pointer">
                <div className="card-body text-left d-flex flex-column">
                  <div className="tool-icon rounded-3 mb-2 align-self-start p-2">
                    <AnalyzeIcon />
                  </div>
                  <span className="card-title small mb-1 fw-bold text-uppercase mb-3">Summary</span>
                  <h5 className="card-title pt-2">{selectedOpportunity ? selectedOpportunity.title : "Title N/A"}</h5>
                  <p className="card-text">{selectedOpportunity ? decodeHtmlEntities(selectedOpportunity.description[0]) : "Description N/A"}</p>
                </div>
              </div>

        

              <div className="card  card-tool card-tool--no-hover rounded shadow-sm bg-white py-3 pointer mt-4">
                <div className="card-body text-left d-flex flex-column">
                  <div className="tool-icon rounded-3 mb-2 align-self-start p-2">
                    <PerformanceIcon />
                  </div>
                  <span className="card-title small mb-1 fw-bold text-uppercase mb-3">Match</span>

                  {loading ? (
                        <div className="sphere-container d-flex align-items-center justify-content-center w-100 py-5">
                        <div className="sphere sphere-animate"></div>
                      </div>
                  ) : (
                    analysis && (
                      <>
                    <div className="card-text ai-rich-text" dangerouslySetInnerHTML={{ __html: analysis['Match Summary'] }} /></>
                        )
                  )}

                </div>
              </div>
           
              <div className="card  card-tool card-tool--no-hoverrounded shadow-sm bg-white py-3 pointer mt-4">
                <div className="card-body text-left d-flex flex-column">
                  <div className="tool-icon rounded-3 mb-2 align-self-start p-2">
                    <ProbabilityIcon />
                  </div>
                  <span className="card-title small mb-1 fw-bold text-uppercase mb-3">Risk</span>

                  {loading ? (
                        <div className="sphere-container d-flex align-items-center justify-content-center w-100 py-5">
                        <div className="sphere sphere-animate"></div>
                      </div>
                  ) : (
                    analysis && (
                      <>
                  <div className="card-text ai-rich-text" dangerouslySetInnerHTML={{ __html: analysis['Risk Analysis'] }} />
                    </>
                        )
                  )}

                </div>
              </div>    


            </div>

            <div className="col-12 col-md-6 col-lg-3 mb-4">
              <div className="card  card-tool card-tool--no-hover rounded shadow-sm bg-white py-3 pointer">
                <div className="card-body text-left d-flex flex-column">
                  <div className="tool-icon rounded-3 mb-2 align-self-start p-2">
                    <CalendarIcon />
                  </div>
                  <span className="card-title small mb-1 fw-bold text-uppercase my-2">Deadline</span>
                  <span className="card-text fw-bold">{selectedOpportunity ? selectedOpportunity.deadline : "Deadline N/A"}</span>
                </div>
              </div>

              {countdown && !loading && (

                <div className="card  card-tool card-tool--no-hover rounded shadow-sm bg-white py-3 pointer mt-4">
                    <div className="card-body text-left d-flex flex-column">
                    <div className="tool-icon rounded-3 mb-2 align-self-start p-2">
                        <MagicWandIcon />
                    </div>
                    <span className="card-title small mb-1 fw-bold text-uppercase my-2">Dates To Deadline</span>
                    <span className="card-text fw-bold">{countdown|| "N/A"}</span>
                    </div>
                </div>
                )}


              <div className="card  card-tool card-tool--no-hover rounded shadow-sm bg-white py-3 pointer mt-4">
                <div className="card-body text-left d-flex flex-column">
                  <div className="tool-icon rounded-3 mb-2 align-self-start p-2">
                    <MagicWandIcon />
                  </div>
                  <span className="card-title small mb-1 fw-bold text-uppercase my-2">Match Rating</span>
                  {loading ? (
                        <div className="sphere-container d-flex align-items-center justify-content-center w-100 py-5">
                        <div className="sphere sphere-animate"></div>
                      </div>
                  ) : (
                    analysis && (
                      <>
                  <span className="card-text fw-bold h2">{analysis['Total Match Score'] || "N/A"}</span>
                    </>
                        )
                  )}

                </div>
              </div>
        

   

              <div className="card  card-tool card-tool--no-hover rounded shadow-sm bg-white py-3 pointer mt-4">
                <div className="card-body text-left d-flex flex-column">
                  <div className="tool-icon rounded-3 mb-2 align-self-start p-2">
                    <NaicsIcon />
                  </div>
                  <span className="card-title small mb-1 fw-bold text-uppercase my-2">NAICS</span>
                  {loading ? (
                        <div className="sphere-container d-flex align-items-center justify-content-center w-100 py-5">
                        <div className="sphere sphere-animate"></div>
                      </div>
                  ) : (
                    analysis && (
                      <>
                                    <span className="card-text fw-bold h2">{analysis.NAICS|| "N/A"}</span>
                    </>
                        )
                  )}

                </div>
              </div>

        


            </div>


          </div>
        </div>
      </section>
    </>
  );
}

export default OpportunityPage;