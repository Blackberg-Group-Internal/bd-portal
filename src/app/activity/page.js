
"use client";

import React from 'react';
import Breadcrumbs from '../components/Breadcrumbs';

const ActivityPage = () => {

  return (
    <section className="p-4 py-lg-5 px-lg-5">
      <div className="container">
          <div className="row">
              <div className="col-12">
                <Breadcrumbs first="Dashboard" second="Recent Activity" />
              </div>
              <div className="col-12 d-flex justify-content-between align-items-center page-info">
                <h1 className="fw-bold-600 my-4">Recent Activity</h1>
              </div>
          </div>
        </div>
    </section>
  )

};

export default ActivityPage;