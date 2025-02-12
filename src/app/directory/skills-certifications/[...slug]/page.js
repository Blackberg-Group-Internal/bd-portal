"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Loader from "@/app/components/Loader";
import gsap from "gsap";
import MemberCards from "@/app/components/directory/MemberCards";
import BreadcrumbsDynamic from "@/app/components/BreadcrumbsDynamic";

const SkillCertificationDetailPage = () => {
  const { slug } = useParams();
  const formattedSlug = Array.isArray(slug) ? slug.join("-") : slug;

  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(`/api/directory/get-by-skill-certification/${formattedSlug}`);
        console.log('skills employees', response.data);
        setEmployees(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching employees:", error);
        setNotFound(true);
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [formattedSlug]);

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

  if (loading) return <Loader />;
  if (notFound) return <p className="text-center mt-5">No team members found.</p>;

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
              <h1 className="fw-bold-500 my-4 text-capitalize">{formattedSlug.replace(/-/g, " ")}</h1>
            </div>
          </div>
        </div>
      </section>

      <section className="container px-4 px-lg-5 mb-6">
        <div className="row">
        {employees.length > 0 && 
            <MemberCards employeeData={employees} />
        }
        </div>
      </section>
    </>
  );
};

export default SkillCertificationDetailPage;