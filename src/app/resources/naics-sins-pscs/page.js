"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import SearchModal from "@/app/components/SearchModal";
import gsap from "gsap";
import AddCodeButton from "@/app/components/resources/AddCodeButton";
import CopyIcon from '../../../../public/images/icons/copy.svg';
import { useToast } from '@/app/context/ToastContext';
import BreadcrumbsDynamic from "@/app/components/BreadcrumbsDynamic";
import useBootstrapTooltips from "@/app/hooks/useBootstrapTooltips";

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
  const [pscsCodes, setPscsCodes] = useState(
    () => JSON.parse(localStorage.getItem("pscsCodes")) || []
  );
  const { addToast } = useToast();

  useBootstrapTooltips(naicsCodes);
  useBootstrapTooltips(sinsCodes);
  useBootstrapTooltips(pscsCodes);

  useEffect(() => {

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

    const fetchPscsCodes = async () => {
      try {
        const response = await fetch("/api/pscs");
        const data = await response.json();
        setPscsCodes(data);
        localStorage.setItem("pscsCodes", JSON.stringify(data));
      } catch (error) {
        console.error("Error fetching PSCs codes:", error);
      }
    };
  
    fetchPscsCodes();
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

  const handleCodeAdded = async (newCode, type) => {
    try {
      if (type === "NAICS") {
        setNaicsCodes((prev) => [...prev, newCode]);
      } else if (type === "SINs") {
        setSinsCodes((prev) => [...prev, newCode]);
      } else if (type === "PSCs") {
        setPscsCodes((prev) => [...prev, newCode]);
      }
    } catch (error) {
      console.error("Error adding code:", error);
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
                second="NAICS, SINs, & PSCs" 
                secondHref="#" 
              />
            </div>
            <div className="col-12 d-flex justify-content-between align-items-start page-info">
              <div className="d-flex flex-column col-12 col-md-9">
              <h1 className="fw-bold-500 my-4">NAICS, SINs, & PSCs</h1>
              <p class="small">The NAICS, SINs, and PSCs Management Tool provides a centralized repository to store and manage the classification codes our organization actively uses to target opportunities across various industries and government contracts.</p>
              <ul>
                <li class="small"><span class="fw-bold">NAICS Codes:</span> A universally recognized standard used across industries to classify business activities and determine eligibility for federal contracts.</li>
                <li class="small"><span class="fw-bold">SINs Codes:</span> Specialized identifiers tied to the GSA MAS (Multiple Award Schedule) contract, helping streamline opportunities under specific categories.</li>
                <li class="small"><span class="fw-bold">PSCs Codes:</span> Product and Service Codes primarily used on SAM.gov to classify goods and services for federal procurement.</li>
              </ul>
              <p className="small pb-1">If you do not find the code you're looking for, it doesn’t mean we can’t pursue it. Please reach out to your team lead or manager, as new codes can often be acquired upon request.</p>
              </div>
              <div className="d-flex align-items-center mt-4">
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
            <div className="col-12 d-flex flex-column flex-md-row gap-3 py-4">
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
              <button
                className={`btn ${view === "PSCs" ? "btn--jade-green" : "btn-white"}`}
                onClick={() => setView("PSCs")}
              >
                PSCs
              </button>
              <div className="mx-auto ms-md-auto me-md-0">
                <AddCodeButton onCodeAdded={handleCodeAdded} />
              </div>
            </div>
            <div className="col-12 px-0 code-header">
              <div className="d-flex align-items-start code-card p-3 border-top gap-4">
                <span className="col-2 col-xl-1">Code</span>
                <span className="">Title</span>
                <span className="ms-auto">Action</span>
              </div>
            </div>

            {(view === "NAICS" ? naicsCodes : view === "SINs" ? sinsCodes : pscsCodes).map((code) => (
              <div className="col-12 px-0 code-row" key={code.id}>
                <div className="d-flex align-items-center code-card p-3 border-top gap-4">
                  <span
                    className="col-2 col-xl-1 small"
                    onDoubleClick={() => handleCopyToClipboard(code.code)}
                  >
                    {code.code}
                  </span>
                  <span className="text-muted small text-nowrap text-truncate" data-bs-toggle="tooltip" data-bs-placement="right" title={code.title}>{code.title}</span>
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
