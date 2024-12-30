'use client';

import React from 'react';
import HomeIcon from '../../../public/images/icons/home.svg';
import ChevronIcon from '../../../public/images/icons/chevron.svg';
import Link from 'next/link';

const BreadcrumbsDynamic = ({ first, firstHref = '/', second, secondHref, third, thirdHref }) => {
  return (
    <>
    <div className="breadcrumbs d-flex align-items-center text-figtree">
    <Link href="/"><HomeIcon /></Link>
    <ChevronIcon />
      {first && (
        <>
          <Link href={firstHref} className="text-decoration-none">
            {first === 'Home' ? <HomeIcon /> : <span className="text-nowrap">{first}</span>}
          </Link>
          {second && <ChevronIcon />}
        </>
      )}
      {second && (
        <>
          <Link href={secondHref || '#'} className="text-decoration-none">
            <span className="text-nowrap">{second}</span>
          </Link>
          {third && <ChevronIcon />}
        </>
      )}
      {third && (
        <Link href={thirdHref || '#'} className="text-decoration-none">
          <span className="text-nowrap">{third}</span>
        </Link>
      )}
    </div>
    </>
  );
};

export default BreadcrumbsDynamic;