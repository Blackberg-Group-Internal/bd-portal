
"use client";

import React from 'react';
import { signIn } from 'next-auth/react';

const Login = () => {
  
  return (
    <section className="login-container">
    <div className="container-fluid h-100">
        <div className="row h-100">
            <div className="col-12 col-md-6 text-center d-flex flex-column align-items-center justify-content-center position-relative">
              <div className="d-flex flex-column align-items-center mt-auto">
              <img src="images/bg-logo-full.svg" alt="" width="124" height="50" className="mb-4" />
              <h1 className="fs-4 mb-5">Business Development Portal</h1>
                <button className="btn btn-primary w-100" onClick={() => {
                        signIn( 'azure-ad',
                        { callbackUrl: '/dashboard' },
                        { prompt: 'login' } )}}>
                    Sign in
                  </button>
              </div>
            <p className="d-flex mt-auto p-5 text-center text-md-start w-100">© Blackberg Group, LLC. 2024</p>
          </div>
          <div className="col-12 col-md-6 text-center bg-dark p-0 login-img d-none d-md-flex">

          </div>
      </div>
    </div>
  </section>
  )

};

export default Login;