import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import Link from 'next/link';

const SummaryList = ({ summaries }) => {
  const [sortedSummaries, setSortedSummaries] = useState([...summaries]);
  const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'asc' });

  const summaryItemsRef = useRef([]);

  useEffect(() => {
    if (sortedSummaries.length) {
      gsap.to(summaryItemsRef.current, {
        opacity: 1,
        y: 0,
        stagger: 0.05,
        ease: 'power1.out',
        duration: 0.3,
      });
    }
  }, [sortedSummaries]);

  useEffect(() => {
    setSortedSummaries([...summaries]);
  }, [summaries]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    const sortedData = [...sortedSummaries].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setSortedSummaries(sortedData);
    setSortConfig({ key, direction });
  };

  return (
    <div className="card card-summary bg-white p-0 rounded shadow-sm position-relative">
      <div className="col-12 card-summary-item card-summary-header bg-white d-flex align-items-center position-sticky top-0 w-100 z-2">
        <div className="px-2 py-2 border d-flex justify-content-between align-items-center w-100 fw-bold">
          <span className="title text-nowrap d-block col-7 text-truncate" onClick={() => handleSort('title')}>Title</span>
          <span className="text-nowrap d-block col-1" onClick={() => handleSort('matchScore')}>Match</span>
          <span className="small m-0 d-block col-2" onClick={() => handleSort('deadline')}>Days Left</span>
          <span className="small m-0 d-block col-1" onClick={() => handleSort('likes')}>Like</span>
          <span className="small m-0 d-block col-1" onClick={() => handleSort('dislikes')}>Dislike</span>
        </div>
      </div>

      {sortedSummaries.map((summary, index) => {
        const deadlineDate = new Date(summary.deadline);
        const today = new Date();
        const timeDifference = deadlineDate.getTime() - today.getTime();
        const daysRemaining = Math.ceil(timeDifference / (1000 * 3600 * 24));

        let deadlineClass = '';
        if (daysRemaining <= 7) {
          deadlineClass = 'danger';
        } else if (daysRemaining <= 14) {
          deadlineClass = 'warning';
        } else {
          deadlineClass = 'safe';
        }

        return (
          <div
            className={`col-12 dev-list-item d-flex align-items-center ${deadlineClass}`}
            key={index}
            ref={(el) => (summaryItemsRef.current[index] = el)}
          >
            <Link href={`/dev/tools/summarizer?slug=${summary.slug}`} className="text-decoration-none w-100 text-dark">
              <div className="px-2 py-2 border d-flex justify-content-between align-items-center w-100">
                <span className="title text-nowrap d-block col-7 text-truncate">{summary.title}</span>
                <span className="text-nowrap d-block col-1">{summary.matchScore}</span>
                <span className="small m-0 d-block col-2">
                  {daysRemaining > 0 ? `${daysRemaining} days` : 'Expired'}
                </span>
                <span className="small m-0 d-block col-1">{summary.likes}</span>
                <span className="small m-0 d-block col-1">{summary.dislikes}</span>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default SummaryList;