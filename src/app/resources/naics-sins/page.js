"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import SearchModal from "@/app/components/SearchModal";
import gsap from "gsap";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import AddCodeButton from "@/app/components/resources/AddCodeButton";
import CopyIcon from '../../../../public/images/icons/copy.svg';
import { useToast } from '@/app/context/ToastContext';
import BreadcrumbsDynamic from "@/app/components/BreadcrumbsDynamic";

function NaicsSinsPage() {
  const { data } = useSession();
  const searchRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const [view, setView] = useState("NAICS");
  const [naicsCodes, setNaicsCodes] = useState(
    () => JSON.parse(localStorage.getItem("naicsCodes")) || []
  );
  const [sinsCodes, setSinsCodes] = useState(
    () => JSON.parse(localStorage.getItem("sinsCodes")) || []
  );
  const { addToast } = useToast();

  useEffect(() => {
    // Fetch NAICS codes
    const fetchNaicsCodes = async () => {
      try {
        const response = await fetch("/api/naics");
        const data = await response.json();
        setNaicsCodes(data);
        localStorage.setItem("naicsCodes", JSON.stringify(data));
      } catch (error) {
        console.error("Error fetching NAICS codes:", error);
      }
    };

    // Fetch SINs codes
    const fetchSinsCodes = async () => {
      try {
        const response = await fetch("/api/sin");
        const data = await response.json();
        setSinsCodes(data);
        localStorage.setItem("sinsCodes", JSON.stringify(data));
      } catch (error) {
        console.error("Error fetching SINs codes:", error);
      }
    };

    fetchNaicsCodes();
    fetchSinsCodes();
  }, []);

  useEffect(() => {
    gsap.fromTo(
      ".code-card",
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.05,
        ease: "power1.out",
        duration: 0.25,
      }
    );
  }, [view]);

  const handleCopyToClipboard = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      addToast(`Copied "${code}" to clipboard!`, "success");
    });
  };

  const handleCodeAdded = async () => {
    try {
      const [naicsResponse, sinsResponse] = await Promise.all([
        fetch("/api/naics"),
        fetch("/api/sin"),
      ]);

      const [naicsData, sinsData] = await Promise.all([
        naicsResponse.json(),
        sinsResponse.json(),
      ]);

      setNaicsCodes(naicsData);
      setSinsCodes(sinsData);
      localStorage.setItem("naicsCodes", JSON.stringify(naicsData));
      localStorage.setItem("sinsCodes", JSON.stringify(sinsData));
    } catch (error) {
      console.error("Error updating codes:", error);
    }
  };

  return (
    <>
      <section className="px-4 px-lg-5 pt-5 pb-6 mb-8">
        <div className="container position-relative">
          <div className="row border-bottom mb-5">
            <div className="col-12">
              <BreadcrumbsDynamic
                first="Resources" 
                firstHref="/resources" 
                second="NAICS & SINs" 
                secondHref="#" 
              />
            </div>
            <div className="col-12 d-flex justify-content-between align-items-center page-info">
              <h1 className="fw-bold-500 my-4">NAICS & SINs</h1>
              <div className="d-flex align-items-center">
                <div className="search">
                  <button
                    className="border-0 bg-transparent"
                    onClick={handleShow}
                    ref={searchRef}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="icon"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="row mb-4 bg-white border code-table mt-7">
            <div className="col-12 d-flex gap-3 py-4">
              <button
                className={`btn ${view === "NAICS" ? "btn--jade-green" : "btn-white"}`}
                onClick={() => setView("NAICS")}
              >
                NAICS
              </button>
              <button
                className={`btn ${view === "SINs" ? "btn--jade-green" : "btn-white"}`}
                onClick={() => setView("SINs")}
              >
                SINs
              </button>
              <div className="ms-auto">
                <AddCodeButton onCodeAdded={handleCodeAdded} />
              </div>
            </div>
            <div className="col-12 px-0 code-header">
              <div className="d-flex align-items-start code-card p-3 border-top">
                <span className="col-1">Code</span>
                <span className="">Title</span>
                <span className="ms-auto">Action</span>
              </div>
            </div>

            {(view === "NAICS" ? naicsCodes : sinsCodes).map((code) => (
              <div className="col-12 px-0 code-row" key={code.id}>
                <div className="d-flex align-items-center code-card p-3 border-top">
                  <span
                    className="col-1 small"
                    onDoubleClick={() => handleCopyToClipboard(code.code)}
                  >
                    {code.code}
                  </span>
                  <span className="text-muted small">{code.title}</span>
                  <button
                    className="btn btn-sm ms-auto"
                    onClick={() => handleCopyToClipboard(code.code)}
                  >
                    <CopyIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <SearchModal show={showModal} handleClose={handleClose} />
        </div>
      </section>
    </>
  );
}

export default NaicsSinsPage;
