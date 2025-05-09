'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import Image from 'next/image';
import Link from 'next/link';
import ArrowRight from '../../../../public/images/icons/right-arrow.svg';
import { format } from 'date-fns'; 
import OpportunityDetailsModal from '@/app/components/dev/OpportunityDetailsModal';

const OpportunitiesTable = ({ data }) => {
  const tableRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortedData, setSortedData] = useState([...data]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  const handleViewOpportunity = (opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowModal(true);

    const url = new URL(window.location.href);
    url.searchParams.set('opportunityId', opportunity.id);
    window.history.replaceState({}, '', url);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOpportunity(null);

    const url = new URL(window.location.href);
    url.searchParams.delete('opportunityId');
    window.history.replaceState({}, '', url);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const opportunityId = params.get('opportunityId');
  
    if (opportunityId) {
      const matched = data.find((o) => o.id === parseInt(opportunityId));
      if (matched) {
        setSelectedOpportunity(matched);
        setShowModal(true);
      }
    }
  }, [data]);

  useEffect(() => {
    const fetchEmployees = async () => {
      const res = await fetch('/api/employees');
      const data = await res.json();
      if (res.ok) setEmployees(data);
    };
    fetchEmployees();
  }, []);
  

  useEffect(() => {
    if (tableRef.current) {
      const tiles = tableRef.current.querySelectorAll('.list-row');
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

  const renderInitials = (ids) => {
    if (!Array.isArray(ids)) return null;
    return ids
      .map((id) => employees.find((e) => String(e.id) === String(id)))
      .filter(Boolean)
      .map((emp, i) => (
        <span key={i} 
        className={`rounded-circle bg-primary text-dark d-flex align-items-center justify-content-center me-1 p-3 fw-normal small ${
          i === 0 ? 'bg-light text-dark border' : 'bg-light text-dark border ms-n2'
        }`}
        style={{ width: '30px', height: '30px'}}>
          {emp.firstName?.charAt(0)}
          {emp.lastName?.charAt(0)}
        </span>
      ));
  };

  const sortBy = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    const sorted = [...sortedData].sort((a, b) => {
      const aValue = a[key] || '';
      const bValue = b[key] || '';
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setSortedData(sorted);
    setSortConfig({ key, direction });
  };

  const renderPageNumbers = () => {
    const pages = [];
    const visiblePages = 3;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - visiblePages && i <= currentPage + visiblePages)
      ) {
        pages.push(
          <button
            key={i}
            className={`btn mx-1 d-flex align-items-center ${
              currentPage === i
                ? 'bg-light btn-pagination rounded-circle d-flex align-items-center justify-content-center'
                : 'btn-text'
            }`}
            onClick={() => setCurrentPage(i)}
          >
            {i}
          </button>
        );
      } else if (
        i === currentPage - visiblePages - 1 ||
        i === currentPage + visiblePages + 1
      ) {
        pages.push(<span key={i} className="mx-1">...</span>);
      }
    }

    return pages;
  };

  const formatText = (status) => {
    return status
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatModifiedDate = (dateString) => {
    const date = new Date(dateString);
    const currentYear = new Date().getFullYear();
    return date.getFullYear() === currentYear ? format(date, 'MMM d, yyyy') : 'N/A';
  };

  return (
    <>
              <div className="category-filters mb-4">
          {['COMMUNICATIONS', 'CREATIVE', 'EVENTS', 'WEB', 'PROJECT_MANAGEMENT'].map((dept) => (
            <button
              key={dept}
              className={`btn btn-sm me-2 mb-2 rounded-pill ${
                sortConfig.department === dept ? 'badge rounded-pill bg-primary text-white' : 'badge rounded-pill bg-light text-dark'
              }`}
              onClick={() => {
                const isActive = sortConfig.department === dept;
                setSortedData(
                  isActive
                    ? [...data]
                    : data.filter((item) => item.department.includes(dept))
                );
                setSortConfig({ ...sortConfig, department: isActive ? null : dept });
              }}
            >
              {dept
                .toLowerCase()
                .split('_')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')}
            </button>
          ))}
        </div>
      <div className="container table-responsive opportunity-table bg-white rounded overflow-hidden" ref={tableRef}>
        <div className="row border-bottom position-relative overflow-scroll">
          <div className="col-12 px-0 py-0 table-header">
            <div className="d-flex align-items-start py-0">
              <div className="col-6 pointer py-3 bg-light px-3" onClick={() => sortBy('title')}>
                Title{' '}
                {sortConfig.key === 'title' && (
                  <Image
                    src={
                      sortConfig.direction === 'asc'
                        ? '/images/icons/arrow-up.svg'
                        : '/images/icons/arrow-down.svg'
                    }
                    alt="Sort"
                    width={12}
                    height={12}
                    className="ms-1"
                  />
                )}
              </div>
              <div className="col-2 pointer p-3 bg-light" onClick={() => sortBy('deadline')}>
                Deadline{' '}
                {sortConfig.key === 'deadline' && (
                  <Image
                    src={
                      sortConfig.direction === 'asc'
                        ? '/images/icons/arrow-up.svg'
                        : '/images/icons/arrow-down.svg'
                    }
                    alt="Sort"
                    width={12}
                    height={12}
                    className="ms-1"
                  />
                )}
              </div>
              <div className="col-2 pointer p-3 bg-light" onClick={() => sortBy('questionsDue')}>
                Questions Due{' '}
                {sortConfig.key === 'questionsDue' && (
                  <Image
                    src={
                      sortConfig.direction === 'asc'
                        ? '/images/icons/arrow-up.svg'
                        : '/images/icons/arrow-down.svg'
                    }
                    alt="Sort"
                    width={12}
                    height={12}
                    className="ms-1"
                  />
                )}
              </div>
              <div className="col-2 pointer p-3 bg-light" onClick={() => sortBy('branch')}>
                Branch{' '}
                {sortConfig.key === 'branch' && (
                  <Image
                    src={
                      sortConfig.direction === 'asc'
                        ? '/images/icons/arrow-up.svg'
                        : '/images/icons/arrow-down.svg'
                    }
                    alt="Sort"
                    width={12}
                    height={12}
                    className="ms-1"
                  />
                )}
              </div>
              <div className="col-2 pointer p-3 bg-light" onClick={() => sortBy('notary')}>
                Notary{' '}
                {sortConfig.key === 'notary' && (
                  <Image
                    src={
                      sortConfig.direction === 'asc'
                        ? '/images/icons/arrow-up.svg'
                        : '/images/icons/arrow-down.svg'
                    }
                    alt="Sort"
                    width={12}
                    height={12}
                    className="ms-1"
                  />
                )}
              </div>
              <div className="col-2 pointer p-3 bg-light" onClick={() => sortBy('awardDate')}>
                Award Date{' '}
                {sortConfig.key === 'awardDate' && (
                  <Image
                    src={
                      sortConfig.direction === 'asc'
                        ? '/images/icons/arrow-up.svg'
                        : '/images/icons/arrow-down.svg'
                    }
                    alt="Sort"
                    width={12}
                    height={12}
                    className="ms-1"
                  />
                )}
              </div>
              <div className="col-2 pointer p-3 bg-light" onClick={() => sortBy('state')}>
                Location{' '}
                {sortConfig.key === 'state' && (
                  <Image
                    src={
                      sortConfig.direction === 'asc'
                        ? '/images/icons/arrow-up.svg'
                        : '/images/icons/arrow-down.svg'
                    }
                    alt="Sort"
                    width={12}
                    height={12}
                    className="ms-1"
                  />
                )}
              </div>
              <div className="col-2 p-3 bg-light">Department</div>
            </div>
          </div>
          {currentItems.map((item, index) => (
            <div className="col-12 px-0 list-row pointer py-0" key={item.id || index}   onClick={() => handleViewOpportunity(item)}>
              <div className="d-flex align-items-center px-0 py-0 h-100">
                <div className="col-6 small text-truncate position-sticky start-0  py-2 px-3 bg-white border h-100 d-flex align-items-center">{item.title}</div>
                <div className="col-2 small text-truncate py-2 border h-100 px-3 d-flex align-items-center">{formatModifiedDate(item.deadline)}</div>
                <div className="col-2 small text-truncate py-2 border h-100 px-3 d-flex align-items-center">{formatModifiedDate(item.questionsDue)}</div>
                <div className="col-2 small text-truncate py-2 border h-100 px-3 d-flex align-items-center">{formatText(item.branch)}</div>
                <div className="col-2 small text-truncate py-2 border h-100 px-3 d-flex align-items-center">{item.notary ? 'Yes' : 'No'}</div>
                <div className="col-2 small text-truncate py-2 border h-100 px-3 d-flex align-items-center">{formatModifiedDate(item.awardDate)}</div>
                <div className="col-2 small text-truncate py-2 border h-100 px-3 d-flex align-items-center">{item.state}</div>
                <div className="col-2 small text-truncate py-2 border h-100 px-3 d-flex align-items-center">
                  <div className="d-flex gap-2">
                  {item.department.map((dep) => (
                    <div className="" key={dep}>
                      <span class="badge rounded-pill bg-light text-dark">{formatText(dep)}</span>
                    </div>
                  ))}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>


        {selectedOpportunity && (
            <OpportunityDetailsModal
              show={showModal}
              handleClose={handleCloseModal}
              opportunity={selectedOpportunity}
            />
          )}
        <div className="d-flex justify-content-between align-items-center px-2 py-3">
          <button
            className="btn btn-white border px-3 py-2"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          <div className="d-flex">{renderPageNumbers()}</div>

          <button
            className="btn btn-white border px-3 py-2 d-flex align-items-center"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
            <ArrowRight className="ms-1" />
          </button>
        </div>
      </div>
    </>
  );
};

export default OpportunitiesTable;
