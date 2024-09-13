import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form } from 'react-bootstrap';
import { searchEmployeesHygraph } from '../lib/hygraph/employees';
import gsap from 'gsap';
import SettingsIcon from '../../../public/images/icons/settings.svg';
import SearchIcon from '../../../public/images/icons/search.svg';
import ArrowUpIcon from '../../../public/images/icons/arrow-up.svg';
import ArrowDownIcon from '../../../public/images/icons/arrow-down.svg';
import ArrowLeftIcon from '../../../public/images/icons/arrow-left.svg';
import CornerDownLeftIcon from '../../../public/images/icons/corner-down-left.svg';
import ShortcutIcon from '../../../public/images/icons/command-shortcut.svg';

const SearchModal = ({ show, handleClose }) => {

  const usersRef = useRef(null);
  const resumesRef = useRef(null);
  const proposalsRef = useRef(null);
  const previousResultsRef = useRef({ users: [] });
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
    const previousUsers = previousResultsRef.current.users;
    const currentUsers = results.users;

    const newUsers = currentUsers.filter(
      (newUser) => !previousUsers.some((oldUser) => oldUser.id === newUser.id)
    );

    if (newUsers.length > 0 && usersRef.current) {

      const newElements = usersRef.current.children;
      gsap.from(newElements, {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        ease: 'power1.out',
        duration: 0.5,
      });
    }
    
    previousResultsRef.current = { users: currentUsers };
  }, [results.users]);

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered className="search-modal text-figtree">
      <Modal.Body className="p-0">
        <Form className="search-bar d-flex align-items-center p-3">
          <SearchIcon />
          <Form.Control
            type="text"
            placeholder="Search..."
            className="border-0"
            value={searchInput}
            onChange={handleSearchInput}
            autoFocus
          />
          <div className="btn-shortcut">
            <ShortcutIcon />
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
                    <ArrowDownIcon />
                </div>
                <div className="btn-shortcut">
                    <ArrowUpIcon />
                </div>
                <span className="me-3">to navigate</span>
                <div className="btn-shortcut">
                    <CornerDownLeftIcon />
                </div>
                <span className="me-3">to select</span>
                <div className="btn-shortcut">
                    <span>esc</span>
                </div>
                <span className="me-3">to close</span>
                <div className="btn-shortcut">
                    <ArrowLeftIcon />
                </div>
                <span>return to parent</span>
            </div>
            <div className="search-settings d-flex align-items-center ms-auto">
                <button className="border-0 bg-transparent">
                    <SettingsIcon />
                </button>
            </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default SearchModal;
