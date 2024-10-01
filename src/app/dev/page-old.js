
"use client";

import React, { useState, useRef, useEffect} from 'react';
import { useSession } from 'next-auth/react';
import SearchModal from '@/app/components/SearchModal';
import gsap from 'gsap';
import SearchIcon from '../../../public/images/icons/search.svg';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import axios from 'axios';

function DevPage () {
  const { data } = useSession();
  const firstName = data?.user?.name?.split(" ")[0];
  const nameRef = useRef(null);
  const searchRef = useRef(null);
  const cardsRef = useRef([]);
  const [showModal, setShowModal] = useState(false);
  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);
  const [opportunities, setOpportunities] = useState([]);
  const [count, setCount] = useState(1);

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
       // setLoading(true);
        // Fetch RSS feed data from the backend
        const response = await axios.get(`/api/feeds?count=${count || ''}`);
        const feedItems = response.data;

        // Perform analysis for each item using the ChatGPT API
        // const analyzedData = await Promise.all(
        //   feedItems.map(async (item) => {
        //     const { title, description } = item;
        //     try {
        //       const analysisResponse = await axios.post('/api/analyze', {
        //         title,
        //         description,
        //       });
        //       return {
        //         title,
        //         description,
        //         analysis: analysisResponse.data,
        //       };
        //     } catch (error) {
        //       console.error('Error analyzing item:', error);
        //       return { title, description, analysis: 'Error analyzing this item' };
        //     }
        //   })
        // );
        // Update the state with fetched opportunities
        setOpportunities(feedItems);

        // Call the analyzeOpportunities function to analyze the fetched items
        const analyzedData = await analyzeOpportunities(feedItems);
        setOpportunities(analyzedData);
       // setLoading(false);
      } catch (error) {
        console.error('Error fetching opportunities:', error);
       // setLoading(false);
      }
    };

    fetchOpportunities();
  }, [count]);

  // Function to handle OpenAI API requests with a delay
const analyzeOpportunities = async (opportunities, delayTime = 1000) => {
    const analyzedItems = [];
  
    for (let i = 0; i < opportunities.length; i++) {
      try {
        // Call your OpenAI API request function here
        const analysisResponse = await fetch('/api/analyze', {
          method: 'POST',
          body: JSON.stringify({
            title: opportunities[i].title,
            description: opportunities[i].description,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        const analysis = await analysisResponse.json();
        analyzedItems.push({
          ...opportunities[i],
          analysis: analysis,
        });
  
        // Delay next API call
        await new Promise((resolve) => setTimeout(resolve, delayTime));
      } catch (error) {
        console.error('Error analyzing opportunity:', error);
      }
    }
  
    return analyzedItems;
  };
  

  useEffect(() => {
    if (firstName && nameRef.current) {

      const tl = gsap.timeline();

      tl.fromTo(
        nameRef.current.children,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.05,
          ease: 'power1.out',
          duration: 0.5,
          delay: 0.15
        }
      );

      tl.fromTo(
        searchRef.current.children,
        { opacity: 0, scale: 0 },
        {
          opacity: 1,
          scale: 1,
          stagger: 0.05,
          ease: 'power1.out',
          duration: 0.25,
        },
        "-=.25"
      );

      tl.fromTo(
        cardsRef.current,
        { opacity: 0, scale: .9 },
        {
          opacity: 1,
          scale: 1,
          stagger: 0.1,
          ease: 'power1.out',
          duration: 0.5,
        },
        "-=0.25"
      );
    }
  }, [firstName]);
  

  return (
    <section className="p-4 py-lg-5 px-lg-5">
      <div className="container">
          <div className="row">
              <div className="col-12">
                <Breadcrumbs first="SamSmart" second="Dashboard" />
              </div>
              <div className="col-12 d-flex justify-content-between align-items-center page-info">
                <h1 className="fw-bold-600 my-4">
                    Welcome back,{' '}
                    <span ref={nameRef}>
                      {firstName && [...firstName].map((char, index) => (
                        <span key={index} className="character">
                          {char}
                        </span>
                      ))}
                    </span>
                  </h1>
                  <div className="search">
                    <button className="border-0 bg-transparent" onClick={handleShow} ref={searchRef}>
                      <SearchIcon className="icon" />
                    </button>
                  </div>
              </div>
          </div>

          <SearchModal show={showModal} handleClose={handleClose} />

          <div className="row mt-4 mt-lg-7">
            <div className="col-12 col-md-6 col-lg-4">
                <h5>(3) Top Opportunities</h5>
                <div className="card bg-white p-6 rounded shadow-sm" ref={el => cardsRef.current[0] = el}>
                    <div className="p-6"></div>
                </div>
            </div>
            <div className="col-12 col-md-6 col-lg-4 mt-4 mt-md-0">
                <h5>(12) New Opportunities</h5>
                <div className="card bg-white p-6 rounded shadow-sm" ref={el => cardsRef.current[1] = el}>
                    <div className="p-6"></div>
                </div>
            </div>
            <div className="col-12 col-md-6 col-lg-4 mt-4 mt-lg-0">
                <h5>Top NAICS</h5>
                <div className="card bg-white p-6 rounded shadow-sm" ref={el => cardsRef.current[2] = el}>
                    <div className="p-6"></div>
                </div>
                </div>
            <div className="col-12 col-md-6 mt-4">
                <h5>Top Opportunities</h5>
                <div className="card bg-white p-6 rounded shadow-sm" ref={el => cardsRef.current[3] = el}>
                    <div className="p-6"></div>
                </div>
            </div>
            <div className="col-12 col-md-6 mt-4">
                <h5>Opportunities</h5>
                <div className="card card-opportunity bg-white p-0 rounded shadow-sm " ref={el => cardsRef.current[4] = el}>
                {(opportunities && opportunities.map((opportunity, index) => (
                    <div className="col-12 card-opportunity-item d-flex align-items-center" key={index}>
                        <div className="px-2 py-1 border bg-white d-flex justify-content-between align-items-center w-100">
                        <span className="title text-nowrap d-block">{opportunity.title}</span>
                        <span className="small text-muted m-0 d-block">{new Date(opportunity.pubDate).toLocaleDateString()}</span>
                        {/* <span className="small text-muted">Original</span>
                        {(opportunity.description &&
                        <p>{opportunity.description[0].replace(/&bull;/g, '•').replace(/&ndash;/g, '–')}</p>
                        )}
                        <span className="small text-muted">AI</span>
                            {(opportunity.analysis &&  <p className="mt-4">{opportunity.analysis.aiSummary}</p>)}
                        <a href={opportunity.link} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                            View Opportunity
                        </a> */}
                        </div>
                    </div>
                )))}
                </div>
            </div>
          </div>
      </div>
    </section>
  )
}

export default DevPage;