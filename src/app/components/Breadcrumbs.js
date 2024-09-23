import React from 'react';
import HomeIcon from '../../../public/images/icons/home.svg';
import ChevronIcon from '../../../public/images/icons/chevron.svg';

const Breadcrumbs = ({ first, second, third }) => {
  return (
    <div className="breadcrumbs d-flex align-items-center text-figtree">
      <HomeIcon />
      <ChevronIcon />
      <span>{first}</span>
      <ChevronIcon />
      <span>{second}</span>
      {third &&
        <>
        <ChevronIcon />
        <span>{third}</span>
        </>
      }
    </div>
  );
};

export default Breadcrumbs;
