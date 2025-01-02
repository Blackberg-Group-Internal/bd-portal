"use client";

import React, { useEffect, useState } from "react";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import Loader from "@/app/components/Loader";
import Image from "next/image";
import axios from "axios";
import { useSession } from "next-auth/react";
import CopyIcon from '../../../../../public/images/icons/copy.svg';
import { useToast } from '@/app/context/ToastContext';
import BreadcrumbsDynamic from "@/app/components/BreadcrumbsDynamic";

const StateRegisteredPage = ({ params }) => {
  const slug = Array.isArray(params.slug) ? params.slug.join("-") : params.slug;
  const { data: session, status } = useSession();
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchState = async () => {
      try {
        const response = await axios.get(`/api/states/get-state/${slug}`);
        setState(response.data);
      } catch (error) {
        console.error(
          "Error fetching state data:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchState();
  }, [slug]);

  const handleCopyToClipboard = (state) => {
    navigator.clipboard.writeText(state).then(() => {
      addToast(`Copied "${state.businessLicense}" to clipboard!`, "success");
    });
  };

  if (loading) return <Loader />;

  if (!state) {
    return (
      <section className="container p-4 pt-lg-5 px-lg-5">
        <div className="row">
          <div className="col-12">
            <Breadcrumbs first="States Registered" second="State Not Found" />
            <h1 className="fw-bold-500 my-4">State Not Found</h1>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="container p-4 pt-lg-5 px-lg-5 pb-0 position-absolute start-4 top-4 z-2">
        <div className="row">
          <div className="col-12">
              <BreadcrumbsDynamic />
          </div>
        </div>
      </section>
      <section className="container pb-5">
        <div className="row">
          <div className="col-12 mb-0 px-0">
            <div className="profile-header p-4 position-relative"></div>
            <div className="profile-container d-flex px-4 position-relative z-2">
              <div className="profile-image-container d-inline-block mb-0">
                <Image
                  src={`/images/state-flags/${state.code.toLowerCase()}.svg`}
                  alt={`${state.name} Flag`}
                  width={160}
                  height={160}
                  className="img-fluid rounded-circle"
                />
              </div>
              <div className="profile-name-title d-flex flex-column mt-auto ps-4">
                <h1 className="fw-bold-500 mb-0">{state.name}</h1>
                <a
                  href={state.bidWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-decoration-none"
                >
                  {state.bidWebsite}
                </a>
              </div>
            </div>
          </div>
          <div className="col-12 px-4 mt-4">
            <div className="row">
              <div className="col-12 col-md-4 mb-4">
                <label className="form-label fw-bold">Business License Number</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    value={state.businessLicense}
                    readOnly
                  />
                  <button
                    className="btn btn--white"
                    onClick={() => handleCopyToClipboard(state)}
                  >
                    <CopyIcon className="icon me-2" />
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default StateRegisteredPage;