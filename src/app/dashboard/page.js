
"use client";

import React, { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import SearchModal from '../components/SearchModal';

function DashboardPage () {
  const { data } = useSession();
  const firstName = data?.user?.name?.split(" ")[0];
  const [showModal, setShowModal] = useState(false);
  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  return (
    <section className="p-4 py-lg-5 px-lg-5">
      <div className="container">
          <div className="row">
              <div className="col-12">
                <div className="breadcrumbs d-flex align-items-center text-figtree">
                  <img src="images/home-icon.svg" alt="" width="20" height="20" />
                  <img src="images/chevron-right.svg" alt="" width="16" height="16" />
                  <span>Dashboard</span>
                  <img src="images/chevron-right.svg" alt="" width="16" height="16" />
                  <span>Overview</span>
                </div>
              </div>
              <div className="col-12 d-flex justify-content-between align-items-center page-info">
                  <h1 className="fw-bold-600 my-4">Welcome back, {firstName}</h1>
                  <div className="search">
                    <button className="border-0 bg-transparent" onClick={handleShow}>
                      <img src="images/search-icon.svg" alt="" width="20" height="20" />
                    </button>
                  </div>
              </div>
          </div>

          <SearchModal show={showModal} handleClose={handleClose} />

          {/* Card placeholders */}
          <div className="row mt-4 mt-lg-7">
            <div className="col-12 col-md-6 col-lg-4">
            <div className="card bg-white p-6 rounded">
                <div className="p-6"></div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-4 mt-4 mt-md-0">
              <div className="card bg-white p-6 rounded">
                <div className="p-6"></div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-4 mt-4 mt-lg-0">
            <div className="card bg-white p-6 rounded">
                <div className="p-6"></div>
              </div>
            </div>
            <div className="col-12 col-md-6 mt-4">
            <div className="card bg-white p-6 rounded">
                <div className="p-6"></div>
              </div>
            </div>
            <div className="col-12 col-md-6 mt-4">
            <div className="card bg-white p-6 rounded">
                <div className="p-6"></div>
              </div>
            </div>
          </div>
      </div>
    </section>
  )
}

export default DashboardPage;