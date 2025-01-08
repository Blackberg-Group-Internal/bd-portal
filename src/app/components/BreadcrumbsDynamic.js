'use client';

import React from 'react';
import HomeIcon from '../../../public/images/icons/home.svg';
import ChevronIcon from '../../../public/images/icons/chevron.svg';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const BreadcrumbsDynamic = () => {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(segment => segment);

  return (
    <div className="breadcrumbs d-flex align-items-center text-figtree">
      <Link href="/" className="text-decoration-none">
        <HomeIcon />
      </Link>
      {pathSegments.map((segment, index) => {
        const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
        const formattedSegment = segment
          .replace(/-/g, ' ')
          .replace(/\b\w/g, char => char.toUpperCase()); 

        return (
          <React.Fragment key={index}>
            <ChevronIcon />
            <Link href={href} className="text-decoration-none">
              <span className="text-nowrap">{formattedSegment}</span>
            </Link>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default BreadcrumbsDynamic;
