'use client';

import React, { useState, useEffect } from 'react';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import SearchIcon from '../../../../public/images/icons/search.svg';
import SearchModal from '@/app/components/SearchModal';
import Loader from '@/app/components/Loader';

const MemberDetailPage = ({ params }) => {
  const { slug } = params;

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [memberData, setMemberData] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // Editing state

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  useEffect(() => {
    setLoading(true);
    if (slug && slug.length > 0) {
      fetchMemberData(slug);
    }
  }, [slug]);

  const fetchMemberData = async (slug) => {
    try {
      const response = await fetch(`/api/members?slug=${slug}`);
      const data = await response.json();

      if (response.ok) {
        setMemberData(data);
      } else {
        setMemberData(null);
      }
    } catch (error) {
      console.error('Error fetching member data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleEditMode = () => setIsEditing((prev) => !prev);

  const handleInputChange = (field, value) => {
    setMemberData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Simulate saving data via API
    console.log('Saving data:', memberData);
    setIsEditing(false);
  };

  return (
    <>
      <section className="container p-4 pt-lg-5 px-lg-5 pb-0">
        <div className="row">
          <div className="col-12">
            <Breadcrumbs first="Team Members" second="Profile" />
          </div>
          <div className="col-12">
            <div className="border-bottom d-flex justify-content-between align-items-center page-info">
              <h1 className="fw-bold-500 my-4">
                {memberData ? `${memberData.firstName} ${memberData.lastName}` : 'Member Data'}
              </h1>
              <div className="d-flex text-nowrap">
                {!loading && memberData && (
                  <button onClick={isEditing ? handleSave : toggleEditMode} className="btn btn-primary me-3">
                    {isEditing ? 'Save Changes' : 'Edit Profile'}
                  </button>
                )}
                <button className="border-0 bg-transparent" onClick={handleShow}>
                  <SearchIcon className="icon" />
                </button>
              </div>
              <SearchModal show={showModal} handleClose={handleClose} />
            </div>
          </div>
        </div>
      </section>

      <section className="container px-4 px-lg-5 mb-6">
        <div className="row">
          {loading ? (
            <Loader />
          ) : memberData ? (
            <div className="col-12">
              <div className="profile-container">
                <div className="row">
                  {/* Education Section */}
                  <div className="col-6">
                    <h3>Education</h3>
                    {['degree1', 'degree2', 'degree3'].map((degree, index) => (
                      <div key={index}>
                        {isEditing ? (
                          <div className="mb-2">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Degree Level"
                              value={memberData[degree]?.level || ''}
                              onChange={(e) =>
                                handleInputChange(degree, {
                                  ...memberData[degree],
                                  level: e.target.value,
                                })
                              }
                            />
                            <input
                              type="text"
                              className="form-control mt-1"
                              placeholder="Degree Name"
                              value={memberData[degree]?.name || ''}
                              onChange={(e) =>
                                handleInputChange(degree, {
                                  ...memberData[degree],
                                  name: e.target.value,
                                })
                              }
                            />
                          </div>
                        ) : (
                          <p>
                            <strong>{memberData[degree]?.level}</strong> {memberData[degree]?.name}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Experience Section */}
                  <div className="col-6">
                    <h3>Experience</h3>
                    {isEditing ? (
                      <input
                        type="number"
                        className="form-control"
                        value={memberData.experience || ''}
                        onChange={(e) => handleInputChange('experience', e.target.value)}
                      />
                    ) : (
                      <p>{memberData.experience} years of professional experience</p>
                    )}
                  </div>
                </div>

                {/* Skillsets Section */}
                <div className="mt-4">
                  <h3>Skillsets</h3>
                  {isEditing ? (
                    <input
                      type="text"
                      className="form-control"
                      value={memberData.skills || ''}
                      onChange={(e) => handleInputChange('skills', e.target.value)}
                      placeholder="Comma-separated skills"
                    />
                  ) : (
                    <p>{memberData.skills?.join(', ')}</p>
                  )}
                </div>

                {/* Certifications Section */}
                <div className="mt-4">
                  <h3>Certifications</h3>
                  {isEditing ? (
                    <input
                      type="text"
                      className="form-control"
                      value={memberData.certifications || ''}
                      onChange={(e) => handleInputChange('certifications', e.target.value)}
                      placeholder="Comma-separated certifications"
                    />
                  ) : (
                    <p>{memberData.certifications?.join(', ')}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="d-flex flex-column w-100 py-7 align-items-center justify-content-center">
              <h4>We could not find this team member.</h4>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default MemberDetailPage;