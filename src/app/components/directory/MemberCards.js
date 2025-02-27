'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import Link from 'next/link';
import Image from 'next/image';

const MemberCards = ({ employeeData }) => {
  const tileViewRef = useRef(null);

  useEffect(() => {
    if (tileViewRef.current) {
      const tiles = tileViewRef.current.querySelectorAll('.member-card');
      gsap.set(tiles, { y: 20, opacity: 0 });

      gsap.fromTo(
        tiles,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.05,
          ease: 'power1.out',
          duration: 0.25,
        }
      );
    }
  }, []);

  return (
    <div className="row d-flex align-items-stretch gx-4 member-row" ref={tileViewRef}>
      {employeeData.map((employee, index) => (
        <div className="member-col col-12 col-sm-6 col-lg-4 col-xl-3 mb-4" key={index}>
          <div className="member-card d-flex flex-column align-items-center h-100 bg-white rounded-3">
            <Link
              href={`/directory/${employee.firstName.toLowerCase()}-${employee.lastName.toLowerCase()}`}
              className="text-decoration-none d-flex flex-column text-dark align-items-center p-4"
            >
              <div className="member-image w-50 mb-4 d-flex justify-content-center position-relative z-1">
                <Image
                  src={employee.image?.url || employee.image || ""}
                  className="img-fluid w-100 h-auto position-relative"
                  alt={`${employee.firstName} ${employee.lastName}`}
                  fill={true}
                  loading="lazy"
                />
              </div>
              <span className="member-name mt-auto text-figtree fw-bold">
                {employee.firstName} {employee.lastName}
              </span>
              <span className="member-position text-figtree text-center">
                {employee.position}
              </span>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MemberCards;