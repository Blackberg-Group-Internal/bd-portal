"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import SearchModal from '@/app/components/SearchModal';
import gsap from 'gsap';
import SearchIcon from '../../../../public/images/icons/search.svg';
import MagicWandIcon from '../../../../public/images/icons/magic-wand.svg';
import AiSummaryIcon from '../../../../public/images/icons/ai-summary.svg';
import PerformanceIcon from '../../../../public/images/icons/performance.svg';
import AnalyzeIcon from '../../../../public/images/icons/analyze.svg';
import SummaryIcon from '../../../../public/images/icons/summary.svg';
import NaicsIcon from '../../../../public/images/icons/naics.svg';
import ProbabilityIcon from '../../../../public/images/icons/probability.svg';
import DollarIcon from '../../../../public/images/icons/dollar.svg';
import CalendarIcon from '../../../../public/images/icons/calendar.svg';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import Link from 'next/link';
import HomeIcon from '../../../../public/images/icons/home.svg';
import ChevronIcon from '../../../../public/images/icons/chevron.svg';

function DevPage() {
  const { data } = useSession();
  const searchRef = useRef(null);
  const cardsRef = useRef([]); 
  const [showModal, setShowModal] = useState(false);
  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  useEffect(() => {

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
              </div>
              </div>
              <div className="col-12 d-flex justify-content-between align-items-center page-info">
                <h1 className="fw-bold-500 my-4">Tools</h1>
                  <div className="search">
                    <button className="border-0 bg-transparent" onClick={handleShow} ref={searchRef}>
                      <SearchIcon className="icon" />
                    </button>
                  </div>
              </div>
            </div>

            <div className="row">

            <div className="col-12 col-md-6 col-lg-4 mb-4">
                <div className="card card-tool h-100 rounded shadow-sm bg-white py-3 pointer">
                    <Link href="/dev/tools/summarizer" className="text-decoration-none text-black">
                        <div className="card-body text-left d-flex flex-column">
                            <div className="tool-icon rounded-3 mb-2 align-self-start p-2">
                                <SummaryIcon />
                            </div>
                            <h5 className="card-title pt-2">RFP Summarizer</h5>
                            <p className="card-text">Get a concise summary of an RFP’s key points like deadlines, required documents, and evaluation criteria.</p>
                        </div>
                    </Link>
                </div>
            </div>

            <div className="col-12 col-md-6 col-lg-4 mb-4">
                <div className="card card-tool h-100 rounded shadow-sm bg-white py-3 pointer">
                    <Link href="/dev/tools/analyzer" className="text-decoration-none text-black">
                        <div className="card-body text-left d-flex flex-column">
                            <div className="tool-icon rounded-3 mb-2 align-self-start p-2">
                                <AnalyzeIcon />
                            </div>
                            <h5 className="card-title pt-2 pt-2">RFP Analyzer</h5>
                            <p className="card-text">Analyze an RFP and receive insights based on our services, NAICS codes, and qualifications.</p>
                        </div>
                    </Link>
                </div>
            </div>

            <div className="col-12 col-md-6 col-lg-4 mb-4">
                <div className="card card-tool h-100 rounded shadow-sm bg-white py-3 pointer">
                    <Link href="/dev/tools/cover-letter" className="text-decoration-none text-black">
                        <div className="card-body text-left d-flex flex-column">
                            <div className="tool-icon rounded-3 mb-2 align-self-start p-2">
                                <MagicWandIcon />
                            </div>
                            <h5 className="card-title pt-2 pt-2">Cover Letter Generator</h5>
                            <p className="card-text">Generate a tailored cover letter to accompany your proposal.</p>
                        </div>
                    </Link>
                </div>
            </div>

            <div className="col-12 col-md-6 col-lg-4 mb-4">
                <div className="card card-tool h-100 rounded shadow-sm bg-white py-3 pointer">
                <div className="card-body text-left d-flex flex-column">
                    <div className="tool-icon rounded-3 mb-2 align-self-start p-2">
                        <NaicsIcon />
                    </div>
                    <h5 className="card-title pt-2 pt-2">NAICS Code Tool</h5>
                    <p className="card-text">View and learn about NAICS codes relevant to our company.</p>
                </div>
                </div>
            </div>


            <div className="col-12 col-md-6 col-lg-4 mb-4">
                <div className="card card-tool h-100 rounded shadow-sm bg-white py-3 pointer">
                <div className="card-body text-left d-flex flex-column">
                    <div className="tool-icon rounded-3 mb-2 align-self-start p-2">
                        <PerformanceIcon />
                    </div>
                    <h5 className="card-title pt-2">Past Performance Summary Generator</h5>
                    <p className="card-text">Generate a professional past performance summary for similar contracts.</p>
                </div>
                </div>
            </div>

            <div className="col-12 col-md-6 col-lg-4 mb-4">
                <div className="card card-tool h-100 rounded shadow-sm bg-white py-3 pointer">
                <div className="card-body text-left d-flex flex-column">
                    <div className="tool-icon rounded-3 mb-2 align-self-start p-2">
                        <AiSummaryIcon />
                    </div>
                    <h5 className="card-title pt-2">Teaming Agreement Draft</h5>
                    <p className="card-text">Draft a teaming agreement for joint bidding on government contracts.</p>
                </div>
                </div>
            </div>

            <div className="col-12 col-md-6 col-lg-4 mb-4">
                <div className="card card-tool h-100 rounded shadow-sm bg-white py-3 pointer">
                <div className="card-body text-left d-flex flex-column">
                    <div className="tool-icon rounded-3 mb-2 align-self-start p-2">
                        <CalendarIcon />
                    </div>
                    <h5 className="card-title pt-2">RFP Deadline Reminder</h5>
                    <p className="card-text">Stay on top of deadlines with calendar reminders and task breakdowns.</p>
                </div>
                </div>
            </div>

            <div className="col-12 col-md-6 col-lg-4 mb-4">
                <div className="card card-tool h-100 rounded shadow-sm bg-white py-3 pointer">
                <div className="card-body text-left d-flex flex-column">
                    <div className="tool-icon rounded-3 mb-2 align-self-start p-2">
                        <DollarIcon />
                    </div>
                    <h5 className="card-title pt-2">Cost Estimate Calculator</h5>
                    <p className="card-text">Create a cost estimate breakdown aligned with RFP budget guidelines.</p>
                </div>
                </div>
            </div>

            <div className="col-12 col-md-6 col-lg-4 mb-4">
                <div className="card card-tool h-100 rounded shadow-sm bg-white py-3 pointer">
                <div className="card-body text-left d-flex flex-column">
                    <div className="tool-icon rounded-3 mb-2 align-self-start p-2">
                        <ProbabilityIcon />
                    </div>
                    <h5 className="card-title pt-2">Win Probability Analyzer</h5>
                    <p className="card-text">Estimate your chances of winning the bid based on qualifications.</p>
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

export default DevPage;
