"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import SearchModal from '@/app/components/SearchModal';
import gsap from 'gsap';
import SearchIcon from '../../../public/images/icons/search.svg';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import axios from 'axios';
import Link from 'next/link';
import { OpportunityProvider } from '@/app/context/OpportunityContext';
import SamOpportunitiesList from '../components/dev/SamOpportunitiesList';
import OpportunitiesList from '../components/dev/OpportunitiesList';

function DevPage() {
  const { data } = useSession();
  const firstName = data?.user?.name?.split(" ")[0];
  const nameRef = useRef(null);
  const searchRef = useRef(null);
  const cardsRef = useRef([]);
  const opportunityItemsRef = useRef([]); 
  const samOpportunityItemsRef = useRef([]); 
  const [showModal, setShowModal] = useState(false);
  const [opportunities, setOpportunities] = useState([]);
  const [samOpportunities, setSamOpportunities] = useState([]);
  const [count, setCount] = useState(250);

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);


  const transformTitleAndDeadline = (title) => {
    const titleParts = title.split(' - ');
    const transformedTitle = titleParts[2];

    const deadlineMatch = title.match(/Deadline\s([A-Za-z]+\s\d{1,2},\d{4})/);
    let deadline = deadlineMatch ? new Date(deadlineMatch[1]) : null;

    if (deadline) {
      const formattedDeadline = `${(deadline.getMonth() + 1)
        .toString()
        .padStart(2, '0')}/${deadline
        .getDate()
        .toString()
        .padStart(2, '0')}/${deadline.getFullYear()}`;
      return { transformedTitle, deadline: formattedDeadline };
    }

    return { transformedTitle, deadline: null };
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
          duration: 0.3,
          delay: 0.15,
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
    }
    
    const fetchOpportunities = async () => {
      try {
        const response = await axios.get(`/api/feeds?count=${count || ''}`);
        const feedItems = response.data;
    
        const today = new Date();
    
        const transformedItems = feedItems
          .map((item) => {
            const { transformedTitle, deadline } = transformTitleAndDeadline(item.title[0]);
            return {
              ...item,
              title: transformedTitle,
              deadline,
            };
          })
          .filter((item) => {
            const deadlineDate = new Date(item.deadline);
            return deadlineDate >= today;
          })
          .sort((a, b) => {
            if (!a.deadline || !b.deadline) return 0;
            const dateA = new Date(a.deadline);
            const dateB = new Date(b.deadline);
            return dateA - dateB;
          });

          localStorage.setItem('allOpportunities', JSON.stringify(transformedItems));
          console.log('All Opportunities: ', transformedItems);
    
        setOpportunities(transformedItems);
      } catch (error) {
        console.error('Error fetching opportunities:', error);
      }
    };
    
    const storedOpportunities = JSON.parse(localStorage.getItem('allOpportunities'));
    if(storedOpportunities) {
      setOpportunities(storedOpportunities);
    } else {
      fetchOpportunities();
    }
  }, [count]);

  useEffect(() => {
  
    const fetchSamOpportunities = async () => {
      try {
        const response = await axios.get(`/api/feedsam`);
        const feedItems = response.data.opportunitiesData;
        console.log('Sam Opportunities: ', feedItems);
        setSamOpportunities(feedItems);
      } catch (error) {
        console.error('Error fetching opportunities:', error);
      }
    };
  
    //fetchSamOpportunities();

  }, [count]);

  useEffect(() => {
    if (opportunities.length) {
      gsap.to(
        opportunityItemsRef.current,
        {
          opacity: 1,
          y: 0,
          stagger: 0.05,
          ease: 'power1.out',
          duration: 0.2,
        }
      );
    }
  }, [opportunities]);

  useEffect(() => {
    if (samOpportunities.length) {
      gsap.to(
        samOpportunityItemsRef.current,
        {
          opacity: 1,
          y: 0,
          stagger: 0.025,
          ease: 'power1.out',
          duration: 0.2,
        }
      );
    }
  }, [samOpportunities]);

  return (
    <>
      <section className="px-4 px-lg-5 pt-5 pb-6 mb-8">
        <div className="container position-relative">
          <div className="row">
            <div className="col-12">
              <Breadcrumbs first="SamSmart" second="Dashboard" />
            </div>
            <div className="col-12 d-flex justify-content-between align-items-center page-info">
              <h1 className="fw-bold-500 my-4">
                Welcome back,{' '}
                <span ref={nameRef}>
                  {firstName &&
                    [...firstName].map((char, index) => (
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

          <div className="row">
            <div className="col-12 col-md-12 mt-0">
              <h5 className="mb-3">Recent Opportunities ({opportunities.length})</h5>
               {opportunities.length > 0 && 
               <OpportunitiesList opportunities={opportunities} />
               }
            </div>
            <div className="col-12 col-md-5 mt-0 d-none">
              <h5 className="mb-3">SAM Opportunities ({samOpportunities.length})</h5>
               {samOpportunities.length > 0 && 
               <SamOpportunitiesList samOpportunities={samOpportunities} />
               }
            </div>

          </div>
        </div>
      </section>
      </>
  );
}

export default DevPage;
