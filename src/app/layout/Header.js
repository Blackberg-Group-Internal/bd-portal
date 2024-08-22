"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { DirectiveLocation } from 'graphql';

const Header = () => {
    const [activeLink, setActiveLink] = useState('/dashboard');
    const [user, setUser] = useState(null);
    const [photo, setPhoto] = useState(null);

    useEffect(() => {
        const highlight = document.querySelector('.highlight');
        const activeNavItem = document.querySelector(`.nav-link[href="${activeLink}"]`);
        
        if (activeNavItem) {
            const { top, left, width, height } = activeNavItem.getBoundingClientRect();

            gsap.to(highlight, {
                top: top + window.scrollY, 
                left: left + window.scrollX, 
                width,
                height,
                ease: 'power1.out',
                duration: 0.5,
            });
        }

        async function fetchUserProfile() {
            const response = await fetch('/api/graph/user');
            const data = await response.json();
            
            if (data.userProfile) {
                setUser(data.userProfile);
            }

            if (data.userPhoto) {
                setPhoto(data.userPhoto);
            }
        }

        //fetchUserProfile();

    }, [activeLink]);

    const handleClick = (path) => {
        setActiveLink(path);
    };

    return (
        <header>
            <div className="d-flex flex-column flex-shrink-0 align-items-center py-5 h-100">
                <div className="d-flex align-items-center mb-4">
                    <span className="fs-4">
                        <img src="images/bg-logo.svg" alt="" width="32" height="32" className="" />
                    </span>
                </div>
                <ul className="nav nav-pills flex-column mb-auto position-relative">
                    <li className="nav-item">
                        <Link href="/dashboard" className={`nav-link ${activeLink === '/dashboard' ? 'active' : ''} d-flex justify-content-center align-items-center`} aria-current={activeLink === '/dashboard' ? "page" : undefined} onClick={() => handleClick('/dashboard')}>
                            <img src="images/bd-portal-dashboard-icon.svg" alt="" width="24" height="24" className="" />
                        </Link> 
                    </li>
                    <li>
                        <Link href="/pipeline" className={`nav-link ${activeLink === '/pipeline' ? 'active' : ''} d-flex justify-content-center align-items-center`} aria-current={activeLink === '/pipeline' ? "page" : undefined} onClick={() => handleClick('/pipeline')}>
                            <img src="images/bd-portal-pipeline-icon.svg" alt="" width="24" height="24" className="" />
                        </Link> 
                    </li>
                    <li>
                        <Link href="/dam" className={`nav-link ${activeLink === '/dam' ? 'active' : ''} d-flex justify-content-center align-items-center`} aria-current={activeLink === '/dam' ? "page" : undefined} onClick={() => handleClick('/dam')}>
                            <img src="images/bd-portal-dam-icon.svg" alt="" width="24" height="24" className="" />
                        </Link> 
                    </li>
                    <li>
                        <Link href="/org" className={`nav-link ${activeLink === '/org' ? 'active' : ''} d-flex justify-content-center align-items-center`} aria-current={activeLink === '/org' ? "page" : undefined} onClick={() => handleClick('/org')}>
                            <img src="images/bd-portal-org-icon.svg" alt="" width="24" height="24" className="" />
                        </Link> 
                    </li>
                </ul>
                <div className="highlight" style={{position: 'absolute', top: 0, left: 0, width: '48px', height: '48px', backgroundColor: '#E2F7F3', borderRadius: '8px', zIndex: -1}}></div>
                <div className="dropdown mt-auto">
                    <a href="#" className="d-flex align-items-center link-dark text-decoration-none dropdown-toggle" id="dropdownUser2" data-bs-toggle="dropdown" aria-expanded="false">
                        <img src="images/avatar.png" alt="" width="32" height="32" className="rounded-circle me-2" />
                    </a>
                    <ul className="dropdown-menu text-small shadow" aria-labelledby="dropdownUser2">
                        <li><a className="dropdown-item" href="#">Action 1</a></li>
                        <li><a className="dropdown-item" href="#">Action 2</a></li>
                        <li><a className="dropdown-item" href="#">Action 3</a></li>
                        <li><hr className="dropdown-divider"/></li>
                        <li><a className="dropdown-item" href="#">Sign out</a></li>
                    </ul>
                </div>
            </div>
        </header>
    )
}

export default Header;