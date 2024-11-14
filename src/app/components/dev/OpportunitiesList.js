import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import Link from 'next/link';
import { useOpportunity } from '@/app/context/OpportunityContext';

const OpportunitiesList = ({ opportunities }) => {
  const opportunityItemsRef = useRef([]);
  const { setSelectedOpportunity } = useOpportunity(); 

  useEffect(() => {
    if (opportunities.length) {
      gsap.to(
        opportunityItemsRef.current,
        {
          opacity: 1,
          y: 0,
          stagger: 0.05,
          ease: 'power1.out',
          duration: 0.3,
        }
      );
    }
  }, [opportunities]);

  const handleOpportunityClick = (opportunity) => {
    setSelectedOpportunity(opportunity);
  };

  return (
    <div className="card card-opportunity bg-white p-0 rounded shadow-sm position-relative">
      <div className="col-12 card-opportunity-item card-opportunity-header bg-white d-flex align-items-center position-sticky top-0 w-100 z-2">
        <div className="px-2 py-2 border d-flex justify-content-between align-items-center w-100">
          <span className="title text-nowrap d-block">Title</span>
          <span className="small m-0 d-block">Deadline</span>
        </div>
      </div>

      {opportunities.map((opportunity, index) => {
        const deadlineDate = new Date(opportunity.deadline);
        const today = new Date();
        const timeDifference = deadlineDate.getTime() - today.getTime();
        const daysRemaining = Math.ceil(timeDifference / (1000 * 3600 * 24));

        let deadlineClass = '';
        if (daysRemaining <= 7) {
          deadlineClass = 'danger';
        } else if (daysRemaining <= 14) {
          deadlineClass = 'warning';
        }

        return (
          <div
            className={`col-12 card-opportunity-item d-flex align-items-center ${deadlineClass}`}
            key={index}
            ref={el => opportunityItemsRef.current[index] = el} 
          >
            <Link  onClick={() => handleOpportunityClick(opportunity)} href={`/dev/opportunity/${opportunity.title}`} className="text-decoration-none w-100 text-dark">
              <div className="px-2 py-2 border d-flex justify-content-between align-items-center w-100">
                <span className="title text-nowrap d-block">{opportunity.title}</span>
                <span className="small m-0 d-block">{opportunity.deadline}</span>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default OpportunitiesList;
