"use client";

import React, { useEffect, useState } from "react";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import Loader from "@/app/components/Loader";
import Image from "next/image";
import axios from "axios";
import { useSession } from 'next-auth/react';
import BreadcrumbsDynamic from "@/app/components/BreadcrumbsDynamic";

const EmployeeProfile = ({ params }) => {
  const slug = Array.isArray(params.slug) ? params.slug.join("-") : params.slug;
  const { data: session, status } = useSession();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    position: "",
    experience: "",
    skills: "",
    certifications: "",
    education: [], 
  });

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await axios.get(`/api/directory/get-employee/${slug}`);
        setEmployee(response.data);

        let parsedEducation = [];
        if (response.data.education) {
          try {
            parsedEducation = JSON.parse(response.data.education);
          } catch (err) {
            console.error("Error parsing education JSON:", err);
          }
        }

        setFormData({
          position: response.data.position || "",
          experience: response.data.experience || "",
          skills: response.data.skills || "",
          certifications: response.data.certifications || "",
          education: Array.isArray(parsedEducation) ? parsedEducation : [],
        });
      } catch (error) {
        console.error(
          "Error fetching employee data:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [slug]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("education[")) {
      const [index, field] = name.match(/education\[(\d+)\]\.(.+)/).slice(1);

      const updatedEducation = [...formData.education];

      if (!updatedEducation[index]) {
        updatedEducation[index] = { level: "", name: "" };
      }

      updatedEducation[index][field] = value;

      setFormData((prev) => ({
        ...prev,
        education: updatedEducation,
      }));
    } else {

      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSaveChanges = async () => {
    try {
      const updatedFormData = {
        ...formData,
        slug,
        education: JSON.stringify(formData.education),
      };

      await axios.put(`/api/directory/add-employee/`, updatedFormData);

      setEmployee((prev) => ({
        ...prev,
        ...updatedFormData,
        education: updatedFormData.education,
      }));

      setIsEditing(false);
    } catch (error) {
      console.error(
        "Error updating employee profile:",
        error.response?.data || error.message
      );
    }
  };

  if (loading) return <Loader />;

  if (!employee) {
    return (
      <section className="container p-4 pt-lg-5 px-lg-5">
        <div className="row">
          <div className="col-12">
            <Breadcrumbs first="Directory" second="Employee Not Found" />
            <h1 className="fw-bold-500 my-4">Employee Not Found</h1>
          </div>
        </div>
      </section>
    );
  }

  const isUserProfile = session?.user?.name
    ? session.user.name.toLowerCase().replace(" ", "-") === employee.slug
    : false;

  return (
    <>
      <section className="container p-4 pt-lg-5 px-lg-5 pb-0 position-absolute start-4 top-4 z-2">
        <div className="row">
          <div className="col-12">
              <BreadcrumbsDynamic
                first="Directory" 
                firstHref="/directory" 
                second="Team Members" 
                secondHref="/directory" 
                third={`${employee.firstName} ${employee.lastName}`}
                thirdHref="#"
              />
          </div>
        </div>
      </section>
      <section className="container-fluid pb-5">
        <div className="row">
          <div className="col-12 mb-0 px-0">
            <div className="profile-header p-4 position-relative"></div>
            <div className="profile-container d-flex px-4 position-relative z-2 pt-5 pt-lg-0">
              <div className="profile-image-container d-inline-block mb-0">
                <Image
                  src={employee.image || "/placeholder-image.jpg"}
                  alt={`${employee.firstName} ${employee.lastName}`}
                  width={160}
                  height={160}
                  className="img-fluid rounded-circle"
                />
              </div>
              <div className="profile-name-title d-flex flex-column mt-auto ps-4 pt-7 pt-lg-0">
                <h1 className="fw-bold-500 mb-0">
                  {employee.firstName} {employee.lastName}
                </h1>
                <p>{employee.position || "Position not specified"}</p>
              </div>
              {isUserProfile && (
                <button
                  className="btn btn--white text-dark mt-3 ms-auto align-self-start mb-5 mt-auto text-nowrap"
                  onClick={handleEditToggle}
                >
                  {isEditing ? "Cancel" : "Edit Profile"}
                </button>
              )}
            </div>
          </div>
          <div className="col-12 px-4">
            <div className="row">
              <div className="col-12 mb-5 mt-0 mt-lg-5 pt-2">
                <hr />
              </div>
              <div className="col-12 col-lg-6">
                <div className="mb-5">
                <p className="h5 fw-bolder">Education</p>
                {!isEditing ? (
                  <ul className="list-unstyled">
                    {employee.education && typeof employee.education === "string"
                      ? (() => {
                          try {
                            const educationArray = JSON.parse(employee.education);
                            return Array.isArray(educationArray) &&
                              educationArray.length > 0 ? (
                              educationArray.map((edu, index) => (
                                <li key={index} className="d-flex flex-column mb-3">
                                  <strong>{edu.level}</strong> {edu.name}
                                </li>
                              ))
                            ) : (
                              <li>N/A</li>
                            );
                          } catch (err) {
                            console.error("Error parsing education JSON:", err);
                            return <li>N/A</li>;
                          }
                        })()
                      : (
                        <li>N/A</li>
                      )}
                  </ul>
                ) : (
                  <>
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="d-flex mb-3">
                        <input
                          type="text"
                          name={`education[${index}].level`}
                          placeholder="Degree Level"
                          className="form-control me-2"
                          value={formData.education?.[index]?.level || ""}
                          onChange={handleInputChange}
                        />
                        <input
                          type="text"
                          name={`education[${index}].name`}
                          placeholder="Degree Name"
                          className="form-control"
                          value={formData.education?.[index]?.name || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                    ))}
                  </>
                )}
                </div>
                <div className="mb-5">
                <p className="h5 fw-bolder">Skillsets</p>
                {!isEditing ? (
                  <div className="d-flex flex-wrap gap-1">
                    {employee.skills && typeof employee.skills === "string"
                      ? employee.skills
                          .split(",")
                          .map((skill, index) => (
                            <span
                              key={index}
                              className="badge badge-light rounded me-1 py-1 px-2 text-dark fw-normal">
                              {skill.trim()}
                            </span>
                          ))
                      : "N/A"}
                  </div>
                ) : (
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Comma-separated skills"
                  />
                )}
              </div>
              <div className="">
                <p className="h5 fw-bolder">Certifications</p>
                {!isEditing ? (
                  <div className="d-flex flex-wrap gap-1">
                    {employee.certifications && typeof employee.certifications === "string"
                      ? employee.certifications
                          .split(",")
                          .map((cert, index) => (
                            <span
                              key={index}
                              className="badge badge-light rounded me-1 py-1 px-2 text-dark fw-normal">
                              {cert.trim()}
                            </span>
                          ))
                      : "N/A"}
                  </div>
                ) : (
                  <input
                    type="text"
                    name="certifications"
                    value={formData.certifications}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Comma-separated certifications"
                  />
                )}
              </div>
              </div>
              <div className="col-12 col-lg-6">
                <p className="h5 fw-bolder">Experience</p>
                {!isEditing ? (
                  <p>{employee.experience || "N/A"} years of professional experience</p>
                ) : (
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Years of experience"
                  />
                )}
              </div>
            </div>
            {isEditing && (
              <div className="text-end mt-4">
                <button className="btn btn-primary" onClick={handleSaveChanges}>
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default EmployeeProfile;