
"use client";

import React from 'react';
import { signOut, useSession, signIn } from 'next-auth/react';
import Link from 'next/link';

const DamPage = () => {
  

  return (
    <section className="container py-11">
        <div className="row">
            <div className="col-12 col-md-6 text-center">
              <h1 className="fs-4 mb-5">Digital Asset Manager</h1>
          </div>
        </div>
    </section>
  )

};

export default DamPage;