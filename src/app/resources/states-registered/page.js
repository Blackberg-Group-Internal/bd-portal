"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import SearchModal from "@/app/components/SearchModal";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import { useToast } from "@/app/context/ToastContext";
import AddStateButton from "@/app/components/resources/AddStateButton";
import USAMap from "react-usa-map";
import CopyIcon from '../../../../public/images/icons/copy.svg';
import BreadcrumbsDynamic from "@/app/components/BreadcrumbsDynamic";

function StatesRegisteredPage() {
  const { data } = useSession();
  const router = useRouter();
  const searchRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [registeredStates, setRegisteredStates] = useState([]);
  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);
  const { addToast } = useToast();
  const [hoveredState, setHoveredState] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const handleMouseEnter = (event, stateAbbreviation) => {
    const rect = event.target.getBoundingClientRect();
    setHoveredState(stateAbbreviation);
    setTooltipPosition({
      top: rect.top + window.scrollY - 30, // Adjust tooltip above the state
      left: rect.left + rect.width / 2,   // Center tooltip horizontally
    });
  };

  const handleMouseLeave = () => {
    setHoveredState(null);
  };

  useEffect(() => {
    const localData = localStorage.getItem("registeredStates");
    if (localData) {
      setRegisteredStates(JSON.parse(localData));
    }

    const fetchStates = async () => {
      try {
        const response = await fetch("/api/states");
        const data = await response.json();
        setRegisteredStates(data);
        localStorage.setItem("registeredStates", JSON.stringify(data));
      } catch (error) {
        console.error("Error fetching registered states:", error);
        addToast("Error fetching states.", "danger");
      }
    };

    fetchStates();
  }, [addToast]);

  const mapCustomization = () => {
    const states = {};
    if (registeredStates) {
      registeredStates.forEach((state) => {
        states[state.code] = { fill: "#006154" };
      });
    }
    return states;
  };

  const handleStateClick = (stateAbbreviation) => {
    const selectedState = registeredStates.find(
      (state) => state.code.toLowerCase() === stateAbbreviation.toLowerCase()
    );
    if (selectedState) {
      router.push(`/resources/states-registered/${selectedState.name}`);
    } else {
      addToast("This state is not registered.", "warning");
    }
  };

  const handleCopyToClipboard = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      addToast(`Copied "${code}" to clipboard!`, "success");
    });
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
                second="States Registered" 
                secondHref="#" 
              />
            </div>
            <div className="col-12 d-flex justify-content-between align-items-start page-info">
            <div className="d-flex flex-column col-12 col-md-9">
                <h1 className="fw-bold-500 my-4">States Registered</h1>
                <p class="small">This tool provides an overview of the states where we are officially registered to conduct business, presented through an interactive map and a detailed table. Users can explore specific state information by navigating to individual state detail pages.</p>
                <p className="small">It is important to note that this list is not restrictive and should not limit the scope of opportunities we pursue, as registering in additional states is a streamlined and efficient process.</p>
              </div>
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

          <div className="row">
            <div className="col-12 map-container d-flex flex-column align-items-center">
              <div className="ms-auto">
                <AddStateButton onStateAdded={(newState) => setRegisteredStates((prevStates) => [...prevStates, newState])} />
              </div>
              <div className="ratio ratio-16x9 position-relative">
                <USAMap customize={mapCustomization()} 
                  onClick={(event) => handleStateClick(event.currentTarget.dataset.name)}
                  onMouseOver={(event) => handleMouseEnter(event, event.currentTarget.dataset.name)}
                  onMouseOut={handleMouseLeave} />
                  {hoveredState && (
                  <div
                    style={{
                      position: "absolute",
                      top: tooltipPosition.top,
                      left: tooltipPosition.left,
                      backgroundColor: "rgba(0, 0, 0, 0.7)",
                      color: "white",
                      padding: "5px 10px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      pointerEvents: "none",
                      transform: "translateX(-50%)",
                    }}
                  >
                    {hoveredState}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="row mb-4 bg-white border code-table mt-7">

            <div className="col-12 px-0 code-header">
              <div className="d-flex align-items-start code-card p-3 border-top">
                <span className="col-2">State</span>
                <span className="">License</span>
                <span className="ms-auto">Action</span>
              </div>
            </div>

            {registeredStates.map((state) => (
              <div className="col-12 px-0 code-row pointer" key={state.id} onClick={(event) => handleStateClick(state.code)}>
                <div className="d-flex align-items-center code-card p-3 border-top">
                  <span className="col-2 small">
                    {state.name}
                  </span>
                  <span className="text-muted small" onDoubleClick={() => handleCopyToClipboard(state.businessLicense)}>{state.businessLicense}</span>
                  <button
                    className="btn btn-sm ms-auto"
                    onClick={() => handleCopyToClipboard(state.businessLicense)}
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

export default StatesRegisteredPage;