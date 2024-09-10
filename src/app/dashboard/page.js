
"use client";

import React from 'react';
import { signOut, useSession } from 'next-auth/react';

function DashboardPage () {
  const { data } = useSession();

  return (
    <section className="p-4 py-lg-6 px-lg-5">
      <div className="container">
          <div className="row">
              <div className="col-12">
                  <h1>Dashboard</h1>
              </div>
          </div>
      </div>
    </section>
  )
}

export default DashboardPage;