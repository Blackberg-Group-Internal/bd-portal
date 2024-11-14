'use client';

import React from 'react';
import HomeIcon from '../../../public/images/icons/home.svg';
import ChevronIcon from '../../../public/images/icons/chevron.svg';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Breadcrumbs = () => {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(segment => segment && segment !== 'dam' && segment !== 'collections');
  
  return (
    <div className="breadcrumbs d-flex align-items-center text-figtree">
      <Link href="/dam"><HomeIcon /></Link>
      <ChevronIcon />
      <Link href="/dam/" className="text-decoration-none">
        <span>Digital Asset Manager</span>
      </Link>
      <ChevronIcon />
      <Link href="/dam/" className="text-decoration-none">
        <span>Collections</span>
      </Link>
      {pathSegments.map((segment, index) => {
        const href = `/dam/collections/${pathSegments.slice(0, index + 1).join('/')}`;
        const formattedSegment = segment.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());

        return (
          <React.Fragment key={index}>
            <ChevronIcon />
            <Link href={href} className="text-decoration-none">
              <span>{formattedSegment}</span>
            </Link>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Breadcrumbs;