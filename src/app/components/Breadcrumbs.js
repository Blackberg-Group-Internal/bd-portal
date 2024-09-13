import React from 'react';
import HomeIcon from '../../../public/images/icons/home.svg';
import ChevronIcon from '../../../public/images/icons/chevron.svg';

const Breadcrumbs = ({ item, subItem }) => {
  return (
    <div className="breadcrumbs d-flex align-items-center text-figtree">
      <HomeIcon />
      <ChevronIcon />
      <span>{item}</span>
      <ChevronIcon />
      <span className="active">{subItem}</span>
    </div>
  );
};

export default Breadcrumbs;
