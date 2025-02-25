"use client";

import React, { useEffect, useRef, useState } from "react";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import SearchModal from "@/app/components/SearchModal";
import SearchIcon from '../../../../public/images/icons/search.svg';
import axios from "axios";
import Loader from "@/app/components/Loader";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import SkillsCertificationsTable from "@/app/components/directory/SkillsCertificationsTable";
import BreadcrumbsDynamic from "@/app/components/BreadcrumbsDynamic";

const SkillsCertificationsPage = () => {
  const [showModal, setShowModal] = useState(false);
  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchSkillsCertifications = async () => {
      try {
        const response = await axios.get("/api/directory/skills-certifications");
        console.log('Skills & Certs: ', response.data);
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchSkillsCertifications();
  }, []);  

  return (
    <>
      <section className="container p-4 pt-lg-5 px-lg-5 pb-0">
        <div className="row">
          <div className="col-12">
            <BreadcrumbsDynamic
                first="Directory" 
                firstHref="/directory" 
                second="Skills & Certifications" 
                secondHref="#" 
              />
          </div>
          <div className="col-12">
            <div className="border-bottom d-flex justify-content-between align-items-center page-info">
              <h1 className="fw-bold-500 my-4 position-relative">Skills & Certifications{data.length > 0 && <span className="badge badge-count">{data.length}</span>}</h1>
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

      {!loading ? (
        <section className="container px-4 px-lg-5 mb-6">
            <SkillsCertificationsTable data={data} />
        </section>
      ) : (
        <Loader />
      )}
    </>
  );
};

export default SkillsCertificationsPage;