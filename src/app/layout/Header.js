"use client";

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { getUserProfile } from "@/app/lib/microsoft/graph";
import gsap from 'gsap';
import { useSession } from 'next-auth/react';
import { fetchEmployeeHygraph } from '@/app/lib/hygraph/employees';
import { signOut } from 'next-auth/react';

const Header = () => {
    const [activeLink, setActiveLink] = useState('/');
    const [activeSubLink, setActiveSubLink] = useState('/'); 
    const submenuRef = useRef(null); 
    const { data: session, status } = useSession();
    const [user, setUser] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [profile, setProfile] = useState(null);

    const handleLogout = () => {
        signOut();
    };

    useEffect(() => {
        if (status === "authenticated" && session?.accessToken) {
            const fetchData = async () => {
                try {
                    const userProfile = await getUserProfile(session.accessToken);

                    const firstName = session.user.name.split(' ')[0];
                    const lastName = session.user.name.split(' ')[1];
                  
                    const hygraphUser = await fetchEmployeeHygraph(firstName, lastName);

                    setProfile(userProfile);
                    setPhoto(hygraphUser[0].image.url);
                } catch (error) {
                    console.error("Failed to fetch user data:", error);
                }
            };
            fetchData();
        }
    }, [session, status]);

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
    }, [activeLink]);

    useEffect(() => {
        if (submenuRef.current) {
            gsap.fromTo(submenuRef.current.children, {
                opacity: 0,
                y: 20,
            }, {
                opacity: 1,
                y: 0,
                stagger: 0.1,
                ease: 'power1.out',
                duration: 0.5,
            });
        }
    }, [activeLink]);

    useEffect(() => {
        const bootstrap = require('bootstrap');
        const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.forEach(tooltipTriggerEl => {
            new bootstrap.Tooltip(tooltipTriggerEl, {
                trigger: "hover",
                delay: { show: 1000, hide: 100 }, 
            });
        });
    }, []);


    const handleClick = (path) => {
        setActiveLink(path);
    };

    const handleSubLinkClick = (path) => {
        setActiveSubLink(path);
    };

    const renderSubMenu = () => {
        switch (activeLink) {
            case '/':
                return (
                    <div className="d-flex flex-column" ref={submenuRef}>
                        <span className="submenu-title mb-3 d-none d-lg-flex">Dashboard</span>
                        <div className="d-flex flex-column submenu-list">
                            <Link href="/" className={`d-flex ${activeSubLink === '/' ? 'active' : ''}`} onClick={() => handleSubLinkClick('/')} data-bs-toggle="tooltip" data-bs-placement="right" title="Overview">
                                <img src="images/overview-icon.svg" alt="" width="24" height="24" />
                                <span className="d-none d-lg-flex">
                                Overview
                                </span>
                            </Link>
                            <Link href="/activity" className={`d-flex ${activeSubLink === '/activity' ? 'active' : ''}`} onClick={() => handleSubLinkClick('/activity')} data-bs-toggle="tooltip" data-bs-placement="right" title="Recent Activity">
                                <img src="images/recent-activity-icon.svg" alt="" width="24" height="24" />
                                <span className="d-none d-lg-flex">
                                Recent Activity
                                </span>
                            </Link>
                            <Link href="/submissions" className={`d-flex ${activeSubLink === '/submissions' ? 'active' : ''}`} onClick={() => handleSubLinkClick('/submissions')} data-bs-toggle="tooltip" data-bs-placement="right" title="Submission Deadlines">
                                <img src="images/submission-deadline-icon.svg" alt="" width="24" height="24" />
                                <span className="d-none d-lg-flex">
                                Submission Deadlines
                                </span>
                            </Link>
                        </div>
                    </div>
                );
            case '/pipeline':
                return (
                    <div className="d-flex flex-column" ref={submenuRef}>
                        <span className="submenu-title d-none d-lg-flex">Pipeline</span>
                    </div>
                );
            case '/dam':
                return (
                    <div className="d-flex flex-column" ref={submenuRef}>
                        <span className="submenu-title mb-3 d-none d-lg-flex">Digital Asset Manager</span>
                        <div className="d-flex flex-column submenu-list">
                            <Link href="/dam/collections" className={`d-flex ${activeSubLink === '/dam/collections' ? 'active' : ''}`} onClick={() => handleSubLinkClick('/dam/collections')} data-bs-toggle="tooltip" data-bs-placement="right" title="Collections">
                                <img src="images/collections-icon.svg" alt="" width="24" height="24" />
                                <span className="d-none d-lg-flex">
                                Collections
                                </span>
                            </Link>
                            <Link href="/dam/files" className={`d-flex ${activeSubLink === '/dam/files' ? 'active' : ''}`} onClick={() => handleSubLinkClick('/dam/files')} data-bs-toggle="tooltip" data-bs-placement="right" title="Files">
                                <img src="images/files-icon.svg" alt="" width="24" height="24" />
                                <span className="d-none d-lg-flex">
                                Files
                                </span>
                            </Link>
                            <Link href="/dam/favorites" className={`d-flex ${activeSubLink === '/dam/favorites' ? 'active' : ''}`} onClick={() => handleSubLinkClick('/dam/favorites')} data-bs-toggle="tooltip" data-bs-placement="right" title="Favorites">
                                <img src="images/favorites-icon.svg" alt="" width="24" height="24" />
                                <span className="d-none d-lg-flex">
                                Favorites
                                </span>
                            </Link>
                        </div>
                    </div>
                );
            case '/org':
                return (
                    <div className="d-flex flex-column text-nowrap" ref={submenuRef}>
                        <span className="submenu-title d-none d-lg-flex">Organization</span>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <header>
            <div className="d-flex flex-column flex-shrink-0 align-items-center py-5 h-100 position-relative z-2 bg-white">
                <div className="d-flex align-items-center mb-4">
                    <span className="fs-4">
                        <img src="images/bg-logo.svg" alt="" width="32" height="32" />
                    </span>
                </div>
                <ul className="nav nav-pills flex-column mb-5 position-relative">
                    <li className="nav-item">
                        <Link href="/" className={`nav-link ${activeLink === '/' ? 'active' : ''}`} onClick={() => handleClick('/')} data-bs-toggle="tooltip" data-bs-placement="right" title="Dashboard">
                            <img src="images/bd-portal-dashboard-icon.svg" alt="" width="24" height="24" />
                        </Link> 
                    </li>
                    <li>
                        <Link href="/pipeline" className={`nav-link ${activeLink === '/pipeline' ? 'active' : ''}`} onClick={() => handleClick('/pipeline')} data-bs-toggle="tooltip" data-bs-placement="right" title="Pipeline">
                            <img src="images/bd-portal-pipeline-icon.svg" alt="" width="24" height="24" />
                        </Link> 
                    </li>
                    <li>
                        <Link href="/dam" className={`nav-link ${activeLink === '/dam' ? 'active' : ''}`} onClick={() => handleClick('/dam')} data-bs-toggle="tooltip" data-bs-placement="right" title="Digital Asset Manager">
                            <img src="images/bd-portal-dam-icon.svg" alt="" width="24" height="24" />
                        </Link> 
                    </li>
                    <li>
                        <Link href="/org" className={`nav-link ${activeLink === '/org' ? 'active' : ''}`} onClick={() => handleClick('/org')} data-bs-toggle="tooltip" data-bs-placement="right" title="Organization">
                            <img src="images/bd-portal-org-icon.svg" alt="" width="24" height="24" />
                        </Link> 
                    </li>
                </ul>
                <div className="highlight" style={{position: 'absolute', top: 0, left: 0, width: '48px', height: '48px', backgroundColor: '#E2F7F3', borderRadius: '8px', zIndex: -1}}></div>
                <div className="dropdown mt-auto menu-user position-relative align-items-center px-3 d-flex flex-column">
                    <Link href="/notifications" className={`p-2 ${activeLink === '/notifications' ? 'active' : ''}`}  onClick={() => handleClick('/notifications')} data-bs-toggle="tooltip" data-bs-placement="right" title="Notifications">
                        <img src="images/notifications-icon.svg" alt="" width="24" height="24" />
                    </Link> 
                    <Link href="/settings" className={`mt-2 p-2 ${activeLink === '/settings' ? 'active' : ''}`}  onClick={() => handleClick('/settings')} data-bs-toggle="tooltip" data-bs-placement="right" title="Settings">
                        <img src="images/settings-icon.svg" alt="" width="24" height="24" />
                    </Link> 
                    <a href="#" className="d-flex align-items-center link-dark text-decoration-none dropdown-toggle mt-4" id="dropdownUser2" data-bs-toggle="dropdown" aria-expanded="false">
                        {photo ? (
                            <div className="px-1">
                                <img src={photo} alt="User Profile" className="img-fluid" />
                            </div>
                        ) : (
                            <div className="avatar-placeholder"></div>
                        )}
                    </a>

                </div>
            </div>

            <div className="submenu px-lg-3 py-5 position-absolute top-0 d-flex flex-column text-figtree">
                {renderSubMenu()}

                <div className="menu-user-text position-relative mt-auto">
                    {profile && (
                        <div className="user-info d-flex text-figtree justify-content-center">
                            <div className="flex-column d-none d-lg-flex">
                                <span className="fw-bold">{profile.displayName}</span>
                                <span className="email text-lowercase">{profile.mail}</span>
                            </div>
                            <button className="d-flex border-0 bg-transparent ms-lg-auto" onClick={handleLogout}>
                                <img src="images/logout-icon.svg" alt="" width="20" height="20" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
