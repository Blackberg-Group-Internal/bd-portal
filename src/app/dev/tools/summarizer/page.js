'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import MagicWandIcon from '../../../../../public/images/icons/magic-wand.svg';
import ReactMarkdown from 'react-markdown';
import ChatBot from '@/app/components/Chat';
import { track } from '@vercel/analytics';

import SearchModal from '@/app/components/SearchModal';
import gsap from 'gsap';
import SearchIcon from '../../../../../public/images/icons/search.svg';
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



function RfpSummarizer() {
  const { data: session, status } = useSession();
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [showUpload, setShowUpload] = useState(true);
  const [threadId, setThreadId] = useState(null);
  const [assistantId, setAssistantId] = useState(null);
  const { selectedOpportunity } = useOpportunity();
  const [countdown, setCountdown] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleGenerateClick = async () => {
    setLoading(true);
    setAnalysisResult('');
    setShowUpload(false);
  
    try {
      if (selectedFile) {
        track('RFP Summarizer', { file: selectedFile.name, user: session.user.id });

        const formData = new FormData();
        formData.append('file', selectedFile);
  
        const response = await fetch('/api/rfp-summarizer-file', {
          method: 'POST',
          body: formData,
        });
  
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let fullMessage = '';
  
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
  
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.trim() !== '');
  
            for (const line of lines) {

              if (line.startsWith('data:')) {
                const jsonResponse = line.substring(5).trim();
        
                try {
                  const parsedEvent = JSON.parse(jsonResponse);
        
                  // Check for 'thread.message.delta' event
                  if (parsedEvent?.event === 'thread.message.delta') {
                    const contentDelta = parsedEvent.data?.delta?.content;
        
                    if (Array.isArray(contentDelta)) {
                      for (const content of contentDelta) {
                        if (content.type === 'text' && content.text?.value) {
                          fullMessage += content.text.value;
                        }
                      }
                      setAnalysisResult(fullMessage);
                      setLoading(false);
                    }
                  }
                  // Capture threadId and assistantId for chat bot use
                  if (parsedEvent?.data?.threadId) {
                    setThreadId(parsedEvent.data.threadId);
                  }
                  if (parsedEvent?.data?.assistantId) {
                    setAssistantId(parsedEvent.data.assistantId);
                  }

                  if (parsedEvent?.event === 'thread.message.completed') {
                    console.log('done');
                    setLoading(false);
                    getAnalysis(fullMessage);
                  }
        
                } catch (err) {
                  console.error('Error parsing JSON:', err);
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAnalysis = async () => {
    try {


        const response = await axios.post('/api/analyze', {
          description: analysisResult,
        });


        const analysisData = response.data.analysis;
        console.log('Anaylsis data: ', analysisData);

        setAnalysis(analysisData);
        setLoading(false);
      
    } catch (error) {
      console.error('Error getting analysis:', error);
      setLoading(false);
    }
}

  return (
    <>
      <section className="px-4 px-lg-5 pt-5 pb-6 mb-8">
        <div className="container position-relative">
          <div className="row">
            <div className="col-12">
              <h1 className="fw-bold-500 my-4">RFP Summarizer</h1>
            </div>
          </div>

          {showUpload ? (
            <div className="row">
              <div className="col-12 col-md-6">
                <div className="card card-tool card-tool--no-hover rounded shadow-sm bg-white py-3 pointer">
                  <div className="card-body text-left d-flex flex-column">
                    <p className="card-text mb-0">
                      Upload an RFP document to get a concise summary of key points like deadlines, required documents, and evaluation criteria.
                    </p>
                    <input
                      type="file"
                      className="form-control my-3"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.txt"
                    />
                    <button
                      className="btn btn-primary d-flex align-items-center align-self-start ms-auto"
                      onClick={handleGenerateClick}
                      disabled={!selectedFile}
                    >
                      Generate
                      <MagicWandIcon className="ms-2 icon icon-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : loading ? (
            <div className="sphere-container d-flex align-items-center justify-content-center w-100 py-5">
              <div className="sphere sphere-animate"></div>
            </div>
          ) : (
            <div className="row">
              <div className="col-12 col-md-6">
                <div className="card card-tool card-tool--no-hover rounded shadow-sm bg-white py-3 pointer">
                  <div className="card-body text-left d-flex flex-column">
                    <p className="card-text small mb-1 fw-bold text-uppercase my-2">Output</p>
                    <div className="mt-4">
                      <ReactMarkdown>{analysisResult}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && analysisResult && threadId && assistantId && (
            <div className="row mt-4">
              <div className="col-12">
                <ChatBot threadId={threadId} assistantId={assistantId} />
              </div>
            </div>
          )}
        </div>
      </section>
      <>
      <section className="px-4 px-lg-5 pt-5 pb-6 mb-8">
        <div className="container position-relative">
          {/* <div className="row">
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
          </div> */}

          <div className="row">
            <div className="col-12 col-md-9 col-lg-9 mb-4">
              <div className="card card-tool card-tool--no-hover  rounded shadow-sm bg-white py-3 pointer">
                <div className="card-body text-left d-flex flex-column">
                  <div className="tool-icon rounded-3 mb-2 align-self-start p-2">
                    <AnalyzeIcon />
                  </div>
                  <ReactMarkdown>{analysisResult}</ReactMarkdown>
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
            {/* <a href={selectedOpportunity?.link[0]} target="_blank" className="btn btn-primary mb-4 w-100">View Source</a> */}

              <div className="card  card-tool card-tool--no-hover rounded shadow-sm bg-white py-3 pointer">
                <div className="card-body text-left d-flex flex-column">
                  <div className="tool-icon rounded-3 mb-2 align-self-start p-2">
                    <CalendarIcon />
                  </div>
                  <span className="card-title small mb-1 fw-bold text-uppercase my-2">Deadline</span>
                  {/* <span className="card-text fw-bold">{selectedOpportunity ? selectedOpportunity.deadline : "Deadline N/A"}</span> */}
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
    </>
  );
}

export default RfpSummarizer;
