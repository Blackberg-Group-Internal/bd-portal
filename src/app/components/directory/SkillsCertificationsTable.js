"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";
import ArrowRight from "../../../../public/images/icons/right-arrow.svg";

const SkillsCertificationsTable = ({ data }) => {
  const tableRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortedData, setSortedData] = useState([...data]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const itemsPerPage = 8;
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    if (tableRef.current) {
      const tiles = tableRef.current.querySelectorAll(".list-row");
      gsap.set(tiles, { y: 20, opacity: 0 });

      gsap.fromTo(
        tiles,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.05,
          ease: "power1.out",
          duration: 0.25,
        }
      );
    }
  }, []);

  const sortBy = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sorted = [...sortedData].sort((a, b) => {
      if (key === "members") {
        return direction === "asc"
          ? a.members.length - b.members.length
          : b.members.length - a.members.length;
      }

      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setSortedData(sorted);
    setSortConfig({ key, direction });
  };

  const renderPageNumbers = () => {
    const pages = [];
    const visiblePages = 3;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - visiblePages && i <= currentPage + visiblePages)
      ) {
        pages.push(
          <button
            key={i}
            className={`btn mx-1 ${currentPage === i ? "bg-light btn-pagination rounded-circle d-flex align-items-center justify-content-center" : "btn-text"}`}
            onClick={() => setCurrentPage(i)}
          >
            {i}
          </button>
        );
      } else if (
        i === currentPage - visiblePages - 1 ||
        i === currentPage + visiblePages + 1
      ) {
        pages.push(<span key={i} className="mx-1">...</span>);
      }
    }

    return pages;
  };

  return (
    <div className="container table-responsive skill-certification-table bg-white rounded" ref={tableRef}>
          <div className="row border-bottom">
              <div className="col-12 px-4 py-2 bg-light table-header">
                <div className="d-flex align-items-start py-1">
                  <div className="col-6 col-lg-7 pointer align-items-center" onClick={() => sortBy("title")} >
                    Title{" "}
                    {sortConfig.key === "title" && (
                      <Image
                        src={sortConfig.direction === "asc" ? "/images/icons/arrow-up.svg" : "/images/icons/arrow-down.svg"}
                        alt="Sort"
                        width={12}
                        height={12}
                        className="ms-1"
                      />
                    )}
                  </div>
                  <div className="col-2 col-lg-2 pointer d-none d-md-flex align-items-center" onClick={() => sortBy("type")}>
                    Type{" "}
                    {sortConfig.key === "type" && (
                      <Image
                        src={sortConfig.direction === "asc" ? "/images/icons/arrow-up.svg" : "/images/icons/arrow-down.svg"}
                        alt="Sort"
                        width={12}
                        height={12}
                        className="ms-1"
                      />
                    )}
                  </div>
                  <div className="col-3 col-lg-2 pointer align-items-center" onClick={() => sortBy("members")}>
                    <span class="d-none d-xl-inline-flex">Team</span> Members{" "}
                    {sortConfig.key === "members" && (
                      <Image
                        src={sortConfig.direction === "asc" ? "/images/icons/arrow-up.svg" : "/images/icons/arrow-down.svg"}
                        alt="Sort"
                        width={12}
                        height={12}
                        className="ms-1"
                      />
                    )}
                  </div>
                  <div className="col-1">Action</div>
                </div>
              </div>
  
              {currentItems.map((item, index) => (
                <div className="col-12 px-0">
                  <div className="d-flex align-items-center px-4 py-3 border-top">
                    <div className="col-6 col-lg-7 small text-nowrap text-truncate text-inter">
                      {item.title}
                    </div>
                    <div className="col-2 col-lg-2 small text-nowrap text-truncate text-inter d-none d-md-flex">
                      {item.type}
                     </div>
                     <div className="col-3 col-lg-2 small text-nowrap text-truncate">
                      <div className="d-flex images">
                          {item.members.slice(0, 5).map((member, i) => (
                            <Image
                              key={i}
                              src={member.image || "/images/default-avatar.png"}
                              alt={member.fullName}
                              width={30}
                              height={30}
                              className="rounded-circle me-1"
                            />
                          ))}
                          {item.members.length > 5 && (
                            <span className="badge bg-secondary">
                              +{item.members.length - 5}
                            </span>
                          )}
                        </div>
                     </div>
                     <div className="col-1 small text-nowrap">
                     <Link
                        href={`/directory/skills-certifications/${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                        className="text-decoration-none fw-bold-600">
                        View
                      </Link>
                     </div>
                  </div>
                </div>
              ))}
            </div>

          <div className="d-flex justify-content-between align-items-center px-2 py-3">
            <button
              className="btn btn-white border px-3 py-2"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            <div className="d-flex">{renderPageNumbers()}</div>

            <button
              className="btn btn-white border px-3 py-2 d-flex align-items-center"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <ArrowRight className="ms-1" />
            </button>
          </div>
    </div>
  );
};

export default SkillsCertificationsTable;