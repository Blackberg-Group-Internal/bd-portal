
"use client";

import React, { useState, useRef, useEffect} from 'react';
import { useSession } from 'next-auth/react';
import SearchModal from '@/app/components/SearchModal';
import gsap from 'gsap';
import SearchIcon from '../../public/images/icons/search.svg';
import Breadcrumbs from './components/Breadcrumbs';

function OverviewPage () {
  const { data } = useSession();
  const firstName = data?.user?.name?.split(" ")[0];
  const nameRef = useRef(null);
  const searchRef = useRef(null);
  const cardsRef = useRef([]);
  const [showModal, setShowModal] = useState(false);
  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

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
                <Breadcrumbs item="Dashboard" subItem="Overview" />
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
            <div className="card bg-white p-6 rounded" ref={el => cardsRef.current[0] = el}>
                <div className="p-6"></div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-4 mt-4 mt-md-0">
              <div className="card bg-white p-6 rounded" ref={el => cardsRef.current[1] = el}>
                <div className="p-6"></div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-4 mt-4 mt-lg-0">
            <div className="card bg-white p-6 rounded" ref={el => cardsRef.current[2] = el}>
                <div className="p-6"></div>
              </div>
            </div>
            <div className="col-12 col-md-6 mt-4">
            <div className="card bg-white p-6 rounded" ref={el => cardsRef.current[3] = el}>
                <div className="p-6"></div>
              </div>
            </div>
            <div className="col-12 col-md-6 mt-4">
            <div className="card bg-white p-6 rounded" ref={el => cardsRef.current[4] = el}>
                <div className="p-6"></div>
              </div>
            </div>
          </div>
      </div>
    </section>
  )
}

export default OverviewPage;