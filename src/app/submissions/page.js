
"use client";

import React from 'react';
import Breadcrumbs from '../components/Breadcrumbs';

const SubmissionsPage = () => {

  return (
    <section className="p-4 py-lg-5 px-lg-5">
      <div className="container">
          <div className="row">
              <div className="col-12">
                <Breadcrumbs first="Dashboard" second="Submission Deadlines" />
              </div>
              <div className="col-12 d-flex justify-content-between align-items-center page-info">
                <h1 className="fw-bold-500 my-4">Submission Deadlines</h1>
              </div>
          </div>
        </div>
    </section>
  )

};

export default SubmissionsPage;