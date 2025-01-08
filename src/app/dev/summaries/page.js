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

function SummariesPage() {
  const { data } = useSession();
  const firstName = data?.user?.name?.split(" ")[0];
  const nameRef = useRef(null);
  const [summaries, setSummaries] = useState([]);

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
    const fetchSummaries = async () => {
      try {
        const response = await axios.get('/api/rfp-summary');
        const summariesData = response.data;

        // Store summaries in local storage for quick reload
        localStorage.setItem('allSummaries', JSON.stringify(summariesData));
        console.log('All Summaries: ', summariesData);

        setSummaries(summariesData);
      } catch (error) {
        console.error('Error fetching summaries:', error);
      }
    };

    // Load summaries from local storage if they exist, otherwise fetch
    const storedSummaries = JSON.parse(localStorage.getItem('allSummaries'));
    if (storedSummaries) {
      setSummaries(storedSummaries);
      fetchSummaries();
    } else {
      fetchSummaries();
    }
  }, []);

  useEffect(() => {
    if (summaries.length) {
      gsap.to(
        summaries,
        {
          opacity: 1,
          y: 0,
          stagger: 0.05,
          ease: 'power1.out',
          duration: 0.2,
        }
      );
    }
  }, [summaries]);

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
                  <span className="text-nowrap d-block text-truncate">Summaries</span>
                </Link>
              </div>
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
            </div>
          </div>

          <div className="row">
            <div className="col-12 col-md-12 mt-3">
              <h5 className="mb-3">All Summaries ({summaries.length})</h5>
              {summaries.length > 0 && <SummaryList summaries={summaries} />}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default SummariesPage;
