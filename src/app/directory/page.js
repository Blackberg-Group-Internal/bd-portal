
"use client";

import React, { useEffect, useState } from 'react';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import SearchModal from '@/app/components/SearchModal';
import SearchIcon from '../../../public/images/icons/search.svg';
import axios from 'axios';
import Loader from '../components/Loader';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import MemberCards from '@/app/components/directory/MemberCards';
import BreadcrumbsDynamic from '../components/BreadcrumbsDynamic';

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

        // const hygraphEmployees = response.data;

        // for (const employee of hygraphEmployees) {
        //   try {
        //     await axios.post('/api/directory/add-employee', {
        //       firstName: employee.firstName,
        //       lastName: employee.lastName,
        //       position: employee.position,
        //       experience: employee.experience || 0,
        //       skills: employee.skills || [],
        //       certifications: employee.certifications || [],
        //       education: employee.education || [],
        //       image: employee.image?.url || "",
        //     });
        //   } catch (error) {
        //     console.error(
        //       `Error adding employee ${employee.firstName} ${employee.lastName}:`,
        //       error.response?.data || error.message
        //     );
        //   }
        // }

      } catch (error) {
        console.error('Error fetching employees:', error);
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {

    const memberCards = document.querySelectorAll(".member-card");

    gsap.fromTo(memberCards, 
        { y: 60, opacity: 0 }, 
        {
            y: 0,
            opacity: 1,
            ease: 'Power1.easeOut',
            stagger: 0.25,
            duration: .4
        }
    );

}, []);  


  return (
    <>
      <section className="container p-4 pt-lg-5 px-lg-5 pb-0">
        <div className="row">
          <div className="col-12">
          <BreadcrumbsDynamic
                first="Directory" 
                firstHref="/directory" 
                second="Team Members" 
                secondHref="#" 
              />
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
          <MemberCards employeeData={employeeData} />
        </section>
      ) : (
        <Loader />
      )}
    </>
  );
};

export default Page;