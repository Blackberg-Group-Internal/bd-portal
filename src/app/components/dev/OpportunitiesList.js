import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import Link from 'next/link';
import { useOpportunity } from '@/app/context/OpportunityContext';
import { format } from 'date-fns';

const OpportunitiesList = ({ opportunities }) => {
  const opportunityItemsRef = useRef([]);
  const { setSelectedOpportunity } = useOpportunity();

  // Sorting state
  const [sortedOpportunities, setSortedOpportunities] = useState(opportunities);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    if (sortedOpportunities.length) {
      gsap.to(opportunityItemsRef.current, {
        opacity: 1,
        y: 0,
        stagger: 0.02,
        ease: 'power1.out',
        duration: 0.05,
      });
    }
  }, [sortedOpportunities]);

  const handleOpportunityClick = (opportunity) => {
    setSelectedOpportunity(opportunity);
  };

  const formatModifiedDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'MM/dd/yyyy');
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    const sortedData = [...sortedOpportunities].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      if (key === 'pubDate') {
        aValue = new Date(a.pubDate[0]);
        bValue = new Date(b.pubDate[0]);
      } else if (key === 'deadline') {
        aValue = new Date(a.deadline);
        bValue = new Date(b.deadline);
      } else {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setSortedOpportunities(sortedData);
    setSortConfig({ key, direction });
  };

  return (
    <div className="card card-opportunity bg-white p-0 rounded shadow-sm position-relative">
      <div className="col-12 card-opportunity-item card-opportunity-header bg-white d-flex align-items-center position-sticky top-0 w-100 z-2">
        <div className="px-2 py-2 border d-flex justify-content-between align-items-center w-100">
          <span 
            className="col-8 title text-nowrap d-block cursor-pointer"
            onClick={() => handleSort('title')}
          >
            Title {sortConfig.key === 'title' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
          </span>
          <span 
            className="col-2 small m-0 d-block cursor-pointer"
            onClick={() => handleSort('deadline')}
          >
            Deadline {sortConfig.key === 'deadline' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
          </span>
          <span 
            className="col-2 small m-0 d-block cursor-pointer"
            onClick={() => handleSort('pubDate')}
          >
            Added {sortConfig.key === 'pubDate' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
          </span>
        </div>
      </div>

      {/* List of Opportunities */}
      {sortedOpportunities.map((opportunity, index) => {
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
            ref={(el) => (opportunityItemsRef.current[index] = el)}
          >
            <Link
              onClick={() => handleOpportunityClick(opportunity)}
              href={`/dev/opportunity/${opportunity.title}`}
              className="text-decoration-none w-100 text-dark"
            >
              <div className="px-2 py-2 border d-flex justify-content-between align-items-center w-100">
                <span className="col-8 title text-nowrap d-block">{opportunity.title}</span>
                <span className="col-2 small m-0 d-block">{opportunity.deadline}</span>
                <span className="col-2 small m-0 d-block">{formatModifiedDate(opportunity.pubDate[0])}</span>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default OpportunitiesList;