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

function StatesRegisteredPage() {
  const { data } = useSession();
  const router = useRouter();
  const searchRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [registeredStates, setRegisteredStates] = useState([]);
  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await fetch("/api/states");
        const data = await response.json();
        setRegisteredStates(data);
      } catch (error) {
        console.error("Error fetching registered states:", error);
        addToast("Error fetching states.", "danger");
      }
    };

    fetchStates();
  }, [addToast]);

  const mapCustomization = () => {
    const states = {};
    if(registeredStates){
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
      router.push(`/resources/states-registered/${selectedState.code.toLowerCase()}`);
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
              <Breadcrumbs first="SamSmart" second="Dashboard" third="Tools" />
            </div>
            <div className="col-12 d-flex justify-content-between align-items-center page-info">
              <h1 className="fw-bold-500 my-4">States Registered</h1>
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
                <AddStateButton />
              </div>
              <div className="ratio ratio-16x9">
                <USAMap customize={mapCustomization()} onClick={(event) => handleStateClick(event.currentTarget.dataset.name)} />
              </div>
            </div>
          </div>

          <div className="row mb-4 bg-white border code-table mt-7">

            <div className="col-12 px-0 code-header">
              <div className="d-flex align-items-start code-card p-3 border-top">
                <span className="col-1">State</span>
                <span className="">License</span>
                <span className="ms-auto">Action</span>
              </div>
            </div>

            {registeredStates.map((state) => (
              <div className="col-12 px-0 code-row" key={state.id}>
                <div className="d-flex align-items-center code-card p-3 border-top">
                  <span className="col-1 small">
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