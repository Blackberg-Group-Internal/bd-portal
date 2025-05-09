"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import SummaryList from '@/app/components/dev/SummaryList';
import gsap from 'gsap';
import Link from 'next/link';
import HomeIcon from '../../../../public/images/icons/home.svg';
import ChevronIcon from '../../../../public/images/icons/chevron.svg';
import AddOpportunityButton from '@/app/components/dev/AddOpportunityButton';
import WatchlistTable from '@/app/components/dev/WatchlistTable';
import PlusIcon from '../../../../public/images/icons/plus.svg';

function WatchlistPage() {
  const { data } = useSession();
  const firstName = data?.user?.name?.split(" ")[0];
  const nameRef = useRef(null);
  const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] =useState(true);

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
    }

    // Fetch all summaries from the API
    const fetchOpportunities = async () => {
      try {
        const response = await axios.get('/api/opportunity/watchlist');
        const summariesData = response.data;

        // Store summaries in local storage for quick reload
        localStorage.setItem('watchlist', JSON.stringify(summariesData));
        console.log('All Summaries: ', summariesData);

        setOpportunities(summariesData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching summaries:', error);
        setLoading(false);
      }
    };

    // Load summaries from local storage if they exist, otherwise fetch
    // const storedOpportunities = JSON.parse(localStorage.getItem('watchlist'));
    // if (storedOpportunities) {
    //   setOpportunities(storedOpportunities);
    //   fetchOpportunities();
    // } else {
    //     fetchOpportunities();
    // }
    fetchOpportunities();

    
  }, []);

  const handleOpportunityAdded = (newOpportunity) => {
    setOpportunities(prev => [newOpportunity, ...prev]);
  };

  useEffect(() => {
    if (opportunities.length) {
      gsap.to(
        opportunities,
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
                <Link href="/dev/summaries" className="text-decoration-none overflow-hidden">
                  <span className="text-nowrap d-block text-truncate">Watchlist</span>
                </Link>
              </div>
            </div>
            <div className="col-12 d-flex justify-content-between align-items-center page-info">
              <h1 className="fw-bold-500 my-4">
              Watchlist {opportunities.length > 0 && <>({opportunities.length})</>}
              </h1>
              <AddOpportunityButton onOpportunityAdded={handleOpportunityAdded} />
            </div>
          </div>
          {loading ? (
              <div className="sphere-container sphere-fullscreen d-flex align-items-center justify-content-center w-100 py-5 mt-5">
                <div className="sphere sphere-animate"></div>
              </div>
        ) : (

          <div className="row">
            <div className="col-12 col-md-12 mt-3">
              {opportunities.length > 0 && <WatchlistTable data={opportunities} /> }
            </div>
          </div>
        )}
        </div>
      </section>
    </>
  );
}

export default WatchlistPage;
