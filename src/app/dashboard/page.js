
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
                  {/* {data && (
                    <>
                      <div>{`Name : ${data.user?.name}`}</div>
                      <div>{`Email : ${data.user?.email}`}</div>
                      <div>{`Token: ${data.accessToken}`}</div>
                    </>
                  )}
                  <button className="btn btn-primary mt-4" onClick={() => signOut({ callbackUrl: '/login' })}>
                    Log out
                  </button> */}
                </div>
        </div>
      </div>
    </section>
  )
}

export default DashboardPage;