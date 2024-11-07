'use client';

import React from 'react';
import { OpportunityProvider } from '@/app/context/OpportunityContext';

export default function DevLayout({ children }) {
  return (
    <OpportunityProvider>
      <div className="dev-layout">
        <main>{children}</main>
      </div>
    </OpportunityProvider>
  );
}
