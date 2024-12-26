
"use client";

import React, { useEffect, useState } from 'react';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import SearchModal from '@/app/components/SearchModal';
import SearchIcon from '../../../public/images/icons/search.svg';
import axios from 'axios';
import Loader from '../components/Loader';
import Image from 'next/image';
import Link from 'next/link';

const Page = () => {
  
  const [showModal, setShowModal] = useState(false);
  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);
  const [loading, setLoading] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('/api/hygraph/all-employees');
        const data = response.data;

        setEmployeeData((prevData) => {
          const updatedData = [...data];

          if (prevData) {
            const existingIds = new Set(prevData.map((item) => item.id));
            prevData.forEach((item) => {
              if (!existingIds.has(item.id)) {
                updatedData.push(item);
              }
            });
          }

          return updatedData;
        });

        localStorage.setItem('employeeData', JSON.stringify(data));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching employees:', error);
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  return (
    <>
      <section className="container p-4 pt-lg-5 px-lg-5 pb-0">
        <div className="row">
          <div className="col-12">
            <Breadcrumbs first="Directory" second="Team Members" />
          </div>
          <div className="col-12">
            <div className="border-bottom d-flex justify-content-between align-items-center page-info">
              <h1 className="fw-bold-500 my-4">Team Members</h1>
              <div>
                <button className="border-0 bg-transparent" onClick={handleShow}>
                  <SearchIcon className="icon" />
                </button>
              </div>
              <SearchModal show={showModal} handleClose={handleClose} />
            </div>
          </div>
        </div>
      </section>
      {!loading && employeeData ? (
        <section className="container px-4 px-lg-5 mb-6">
             <div className="row d-flex align-items-stretch gx-4 member-row">
                    {employeeData.map((employee, index) => (
                        <div className="member-col col-12 col-sm-6 col-lg-4 col-xl-3 mb-4" key={index}>
                            <div className="member-card d-flex flex-column align-items-center h-100 bg-white p-4 rounded-3">
                              <Link href={`/directory/${employee.firstName.toLowerCase()}-${employee.lastName.toLowerCase()}`} className="text-decoration-none d-flex flex-column text-dark align-items-center">
                                <div className="member-image w-50 mb-4 d-flex justify-content-center position-relative z-1">
                                    <Image src={employee.image.url}
                                    className="img-fluid w-100 h-auto position-relative" 
                                    alt={`${employee.firstName} ${employee.lastName}`}
                                    fill={true}
                                    loading="lazy" />
                                </div>
                                <span className="member-name mt-auto text-figtree fw-bold">{employee.firstName} {employee.lastName}</span>
                                <span className="member-position text-figtree text-center">{employee.position}</span>
                              </Link>
                            </div>
                        </div>
                    ))}
                </div>
        </section>
      ) : (
        <Loader />
      )}
    </>
  );
};

export default Page;