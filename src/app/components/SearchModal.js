import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form } from 'react-bootstrap';
import { searchEmployeesHygraph } from '../lib/hygraph/employees';
import gsap from 'gsap';

const SearchModal = ({ show, handleClose }) => {

  const usersRef = useRef(null);
  const resumesRef = useRef(null);
  const proposalsRef = useRef(null);
  const [searchInput, setSearchInput] = useState('');
  const [results, setResults] = useState({
    users: [],
    resumes: [],
    proposals: []
  });

  const [debouncedSearchInput, setDebouncedSearchInput] = useState('');

  const handleSearchInput = (e) => {
    setSearchInput(e.target.value);
  };

 useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setDebouncedSearchInput(searchInput);
    }, 300); 

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  useEffect(() => {
    if (debouncedSearchInput.length > 1) {
      (async () => {
        const employees = await searchEmployeesHygraph({ searchString: debouncedSearchInput });
        
        setResults({
          users: employees || [], 
          resumes: [],
          proposals: [], 
        });
      })();
    } else {
      setResults({ users: [], resumes: [], proposals: [] });
    }
  }, [debouncedSearchInput]);

  useEffect(() => {
    if (results.users.length > 0) {
      gsap.from(usersRef.current.children, {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        ease: 'power1.out',
        duration: 0.5
      });
    }
    if (results.resumes.length > 0) {
      gsap.from(resumesRef.current.children, {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        ease: 'power1.out',
        duration: 0.5
      });
    }
    if (results.proposals.length > 0) {
      gsap.from(proposalsRef.current.children, {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        ease: 'power1.out',
        duration: 0.5
      });
    }
  }, [results]);
  

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered className="search-modal text-figtree">
      <Modal.Body className="p-0">
        <Form className="search-bar d-flex align-items-center p-3">
            <img src="images/search-icon.svg" alt="" width="20" height="20" className="d-flex mr-2"/>
          <Form.Control
            type="text"
            placeholder="Search..."
            className="border-0"
            value={searchInput}
            onChange={handleSearchInput}
            autoFocus
          />
          <div className="btn-shortcut">
            <img src="images/command-shortcut-icon.svg" alt="" width="20" height="20" className="d-flex ms-auto"/>
          </div>
        </Form>

        <div className="search-results mt-3">
          {/* Users Section */}
          <div className="search-section">
            <div className="p-3 d-flex flex-column">
                <span className="section-title">Users</span>
                <div ref={usersRef}>
                {results.users.length > 0 ? (
                results.users.map((user, index) => (
                    <div key={index} className="search-item search-item-user d-flex align-items-center p-2">
                    <img src={user.image.url} alt="avatar" width="30" height="30" className="me-2" />
                    <span>{user.firstName} {user.lastName}</span>
                    <span className="ms-2 text-lowercase user-handle">@{user.firstName.trim()}.{user.lastName.trim()}</span>
                    </div>
                ))
                ) : (
                <span className="no-results">No users found</span>
                )}
                </div>
            </div>
            </div>

          {/* Resumes Section */}
          <div className="search-section">
            <div className="p-3 d-flex flex-column">
                <span className="section-title">Resumes</span>
                <div ref={resumesRef}>
                {results.resumes.length > 0 ? (
                results.resumes.map((resume, index) => (
                    <div key={index} className="search-item d-flex align-items-center">
                    <img src="images/resume-icon.svg" alt="resume" width="20" height="20" className="me-2" />
                    <span>{resume}</span>
                    </div>
                ))
                ) : (
                <span className="no-results">No resumes found</span>
                )}
                </div>
            </div>
          </div>

          {/* Proposals Section */}
          <div className="search-section">
            <div className="p-3 d-flex flex-column">
                <span className="section-title">Proposals</span>
                <div ref={proposalsRef}>
                {results.proposals.length > 0 ? (
                results.proposals.map((proposal, index) => (
                    <div key={index} className="search-item d-flex flex-column">
                    <span className="proposal-title">{proposal.name}</span>
                    <small className="proposal-type text-muted">{proposal.type}</small>
                    </div>
                ))
                ) : (
                <span className="no-results">No proposals found</span>
                )}
                </div>
            </div>
          </div>
        </div>
        <div className="search-shortcuts px-3 py-2 d-flex justify-content-between">
            <div className="shortcuts d-none d-md-flex align-items-center">
                <div className="btn-shortcut">
                    <img src="images/arrow-down-icon.svg" alt="" width="17" height="17" />
                </div>
                <div className="btn-shortcut">
                    <img src="images/arrow-up-icon.svg" alt="" width="17" height="17" />
                </div>
                <span className="me-3">to navigate</span>
                <div className="btn-shortcut">
                    <img src="images/corner-down-left-icon.svg" alt="" width="17" height="17" />
                </div>
                <span className="me-3">to select</span>
                <div className="btn-shortcut">
                    <span>esc</span>
                </div>
                <span className="me-3">to close</span>
                <div className="btn-shortcut">
                    <img src="images/arrow-left-icon.svg" alt="" width="17" height="17" />
                </div>
                <span>return to parent</span>
            </div>
            <div className="search-settings d-flex align-items-center ms-auto">
                <button className="border-0 bg-transparent">
                    <img src="images/search-settings-icon.svg" alt="" width="17" height="17" />
                </button>
            </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default SearchModal;
