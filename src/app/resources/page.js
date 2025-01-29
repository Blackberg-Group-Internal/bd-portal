"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import SearchModal from '@/app/components/SearchModal';
import gsap from 'gsap';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import Link from 'next/link';
import SearchIcon from '../../../public/images/icons/search.svg';
import BreadcrumbsDynamic from '../components/BreadcrumbsDynamic';

function ResourcesPage() {
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
                <BreadcrumbsDynamic
                  first="Resources" 
                  firstHref="/resources" 
                  second="Overview" 
                  secondHref="#" 
                />
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

            <div className="col-12 col-md-6 col-lg-6 mb-4">
            <div className="card card-tool h-100 rounded shadow-sm bg-white  pointer">
                    <Link href="/resources/states-registered" className="text-decoration-none text-black" prefetch={true}>
                        <div className="card-body text-left d-flex flex-column px-0">
                            <h5 className="card-title pt-2 pt-2 px-4 fw-normal mb-4">States Registered</h5>
                            <p className="card-text px-4">View where Blackberg Group is registered to do work in.</p>
                            <hr />
                            <p className="mb-0 text-primary ms-auto px-4">Learn More</p>
                        </div>
                    </Link>
                </div>
                </div>

            <div className="col-12 col-md-6 col-lg-6 mb-4">
                <div className="card card-tool h-100 rounded shadow-sm bg-white  pointer">
                    <Link href="/resources/naics-sins-pscs" className="text-decoration-none text-black" prefetch={true}>
                        <div className="card-body text-left d-flex flex-column px-0">
                            <h5 className="card-title pt-2 pt-2 px-4 fw-normal mb-4">NAICS, SINs, & PSCs Codes</h5>
                            <p className="card-text px-4">View NAICS and SINs codes.</p>
                            <hr />
                            <p className="mb-0 text-primary ms-auto px-4">Learn More</p>
                        </div>
                    </Link>
                </div>
            </div>

            </div>
            <SearchModal show={showModal} handleClose={handleClose} />
        </div>
        </section>

    </>
  );
}

export default ResourcesPage;
