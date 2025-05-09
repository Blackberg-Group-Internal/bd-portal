"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import React, { useState, useRef, useEffect } from 'react';
import SearchModal from '@/app/components/SearchModal';
import SearchIcon from '../../../../public/images/icons/search.svg';
import Link from 'next/link';
import HomeIcon from '../../../../public/images/icons/home.svg';
import ChevronIcon from '../../../../public/images/icons/chevron.svg';

function DashboardPage() {
  const [firstName, setFirstName] = useState('Ross');
  const nameRef = useRef(null);
  const searchRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);
  const [winPercentage, setWinPercentage] = useState(10);
  const [total, setTotal] = useState(0);
  const [submitted, setSubmitted] = useState(0);
  const [active, setActive] = useState(0);
  const [statusData, setStatusData] = useState([]);
  const [stageData, setStageData] = useState([]);
  const [branchData, setBranchData] = useState([]);
  const [stateData, setStateData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const { all, watchlist, proposals, proposalsByStage } = departmentBreakdown;

  const [totalProposalValue, setTotalProposalValue] = useState(0);
  const potentialRevenue = totalProposalValue * (winPercentage / 100);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await fetch('/api/dashboard');
        const data = await res.json();

        console.log('Dashboard States', data);
  
        if (res.ok) {
            setTotal(data.totalOpportunities);
            setSubmitted(data.proposalsSubmitted);
            setActive(data.proposalsActive);
            //setStatusData(data.byStatus);
            //setStageData(data.byStage);
            //setBranchData(data.byBranch);
            setStateData(data.byState);
            //setDepartmentData(data.byDepartment);
            setTotalProposalValue(data.totalProposalValue);

            setStatusData(data.byStatus.map(s => ({
                name: formatText(s.name),
                value: s.value
              })));
              
              setStageData(data.byStage.map(s => ({
                name: formatText(s.name),
                value: s.value
              })));
              
              setBranchData(data.byBranch.map(b => ({
                name: formatText(b.name),
                value: b.value
              })));
              
              setDepartmentData(data.byDepartment.map(d => ({
                name: formatText(d.name),
                value: d.value
              })));
              
        } else {
          console.error('Failed to fetch stats:', data.error);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
  
    fetchDashboardStats();
  }, []);
  
  const formatText = (value) => {
    if (!value) return '';
    return value
      .toString()
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const renderDeptBreakdown = (deptMap) => (
    <ul className="mt-2 mb-0 ps-3 small">
      {Object.entries(deptMap).map(([dept, count]) => (
        <li key={dept}>
          {formatText(dept)} ({count})
        </li>
      ))}
    </ul>
  );

  
  return (
    <>
      <section className="px-4 px-lg-5 pt-5 pb-6 mb-8">
        <div className="container position-relative">
          <div className="row">
            <div className="col-12">
              <div className="breadcrumbs d-flex align-items-center text-figtree">
                <Link href="/dam"><HomeIcon /></Link>
                <ChevronIcon />
                <Link href="/dev/" className="text-decoration-none overflow-hidden">
                  <span className="text-nowrap d-block text-truncate">SamSmart</span>
                </Link>
                <ChevronIcon />
                <Link href="#" className="text-decoration-none overflow-hidden">
                  <span className="text-nowrap d-block text-truncate">Opportunities</span>
                </Link>
              </div>
            </div>
            <div className="col-12 d-flex justify-content-between align-items-center page-info">
              <h1 className="fw-bold-500 my-4">
                Welcome back,{' '}
                <span ref={nameRef}>
                  {firstName && [...firstName].map((char, index) => (
                    <span key={index} className="character">{char}</span>
                  ))}
                </span>
              </h1>
              <div className="search">
                <button className="border-0 bg-transparent" onClick={handleShow} ref={searchRef}>
                  <SearchIcon className="icon" />
                </button>
              </div>
            </div>
          </div>

          <SearchModal show={showModal} handleClose={handleClose} />

          <div className="row g-4 mt-3">
            <div className="col-12 col-md-4">
              <div className="card card-animate shadow-sm p-4">
                <h5>Proposals</h5>
                <ul className="ps-3 mb-1 small">
                  <li>Submitted ({proposalsByStage.submitted})</li>
                  <li>Active ({proposalsByStage.active})</li>
                </ul>
                <p className="display-6 fw-bold mb-0">{renderDeptBreakdown(proposalsActive)}</p>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="card card-animate shadow-sm p-4">
                <h5>Watchlist</h5>
                <p className="display-6 fw-bold mb-0">{renderDeptBreakdown(watchlist)}</p>
              </div>
            </div>

            <div className="col-12 col-lg-4">
              <div className="card card-animate shadow-sm p-4">
                <h5>Opportunities</h5>
                <p className="display-6 fw-bold mb-0">{renderDeptBreakdown(all)}</p>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="card card-animate shadow-sm p-4 h-100">
                <h5>Forecast</h5>
                <p className="display-6 fw-bold mb-0">${potentialRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <label className="form-label mt-4">Win Probability: {winPercentage}%</label>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={winPercentage}
                    onChange={(e) => setWinPercentage(parseInt(e.target.value))}
                    className="form-range mb-2"
                    />
                    <div className="d-flex justify-content-between small text-muted">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                    </div>
                    <p className="mb-0 mt-4 small">Potential revenue based on win %</p>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="card card-animate shadow-sm p-4">
                <h5>By Department</h5>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={departmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#006154" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="col-12 col-md-4 d-none">
              <div className="card card-animate shadow-sm p-4">
                <h5>By Status</h5>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#006154" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="card card-animate shadow-sm p-4">
                <h5>By Branch</h5>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={branchData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#006154" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="card card-animate shadow-sm p-4">
                <h5>By State</h5>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stateData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#006154" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}

export default DashboardPage;
