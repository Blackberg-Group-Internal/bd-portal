
"use client";

import React from 'react';
import { signOut, useSession, signIn } from 'next-auth/react';
import Link from 'next/link';

function DashboardPage ({ page }) {
  const { data, status } = useSession();

  return status === 'authenticated' ? (
    <section className="py-8 py-md-11">
      <div className="container">
          <div className="row">
              <div className="col-10 mx-auto">
                  <h1>Dashboard</h1>
                  {data && (
                    <>
                      <div>{`Name : ${data.user?.name}`}</div>
                      <div>{`Email : ${data.user?.email}`}</div>
                      {/* <div>{`Token: ${data.accessToken}`}</div> */}
                    </>
                  )}
                  <button className="btn btn-primary mt-4" onClick={() => signOut({ callbackUrl: '/' })}>
                    Log out
                  </button>
                </div>
        </div>
      </div>
    </section>
  ) : (
    <section className="py-8 py-md-11">
      <div className="container">
          <div className="row">
              <div className="col-12 text-center">
                <button className="btn btn-primary" onClick={() => {
                        signIn( 'azure-ad',
                        { callbackUrl: '/dashboard' },
                        { prompt: 'login' } )}}>
                    Sign in
                  </button>
            </div>
        </div>
      </div>
    </section>
);
}

export default DashboardPage;