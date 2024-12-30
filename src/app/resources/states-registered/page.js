"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import SearchModal from "@/app/components/SearchModal";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import { useToast } from "@/app/context/ToastContext";
import AddStateButton from "@/app/components/resources/AddStateButton";
import USAMap from "react-usa-map";

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
    // Fetch states from API
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

  // Define state customization for the map
  const mapCustomization = () => {
    const states = {};
    registeredStates.forEach((state) => {
      states[state.code] = { fill: "#1e7a56" }; // Registered states in green
    });
    return states;
  };

  const handleStateClick = (stateAbbreviation) => {
    const selectedState = registeredStates.find(
      (state) => state.code === stateAbbreviation
    );
    if (selectedState) {
      router.push(`/states/${selectedState.code.toLowerCase()}`);
    } else {
      addToast("This state is not registered.", "warning");
    }
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
                <USAMap customize={mapCustomization()} onClick={handleStateClick} />
              </div>
            </div>
          </div>

          <SearchModal show={showModal} handleClose={handleClose} />
        </div>
      </section>
    </>
  );
}

export default StatesRegisteredPage;