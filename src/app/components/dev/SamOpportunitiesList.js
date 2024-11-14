import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import Link from 'next/link';
import { useOpportunity } from '@/app/context/OpportunityContext';

const SamOpportunitiesList = ({ samOpportunities }) => {
  const samOpportunityItemsRef = useRef([]);
  const { setSelectedOpportunity } = useOpportunity();

  useEffect(() => {
    if (samOpportunities.length) {
      gsap.to(
        samOpportunityItemsRef.current,
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          ease: 'power1.out',
          duration: 0.5,
        }
      );
    }
  }, [samOpportunities]);

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

      {samOpportunities.map((opportunity, index) => {
        const deadlineDate = new Date(opportunity.responseDeadLine);
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
            ref={el => samOpportunityItemsRef.current[index] = el} 
          >
            <Link href={`/sam-opportunity/${opportunity.slug}`} className="text-decoration-none w-100 text-dark">
              <div className="px-2 py-2 border d-flex justify-content-between align-items-center w-100" onClick={() => handleOpportunityClick(opportunity)}>
                <span className="title text-nowrap d-block">{opportunity.title}</span>
                <span className="small m-0 d-block">{new Date(opportunity.responseDeadLine).toLocaleDateString('en-US')}</span>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default SamOpportunitiesList;
