"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getUserProfile, getUserPhoto } from "@/app/lib/microsoft/graph";
import gsap from 'gsap';
import { useSession } from 'next-auth/react';
import { fetchEmployeeHygraph } from '@/app/lib/hygraph/employees';

const Header = () => {
    const [activeLink, setActiveLink] = useState('/dashboard');
    const { data: session, status } = useSession();
    const [user, setUser] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        if (status === "authenticated" && session?.accessToken) {
            const fetchData = async () => {
                try {
                    const userProfile = await getUserProfile(session.accessToken);

                    const firstName = session.user.name.split(' ')[0];
                    const lastName = session.user.name.split(' ')[1];
                  
                    const hygraphUser = await fetchEmployeeHygraph(firstName, lastName);

                    //console.log('Hyraph Useer: ', hygraphUser);
                    setProfile(userProfile);

                    //const userPhoto = await getUserPhoto(session.accessToken);
                    setPhoto(hygraphUser[0].image.url);
                } catch (error) {
                    console.error("Failed to fetch user data:", error);
                }
            };
            fetchData();
        }
    }, [session, status]);

    // GSAP animation for active link highlighting
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

    const handleClick = (path) => {
        setActiveLink(path);
    };

    // Render submenu based on active link
    const renderSubMenu = () => {
        switch (activeLink) {
            case '/dashboard':
                return (
                    <div className="d-flex flex-column">
                        <span className="submenu-title mb-3">Dashboard</span>
                        <div className="d-flex flex-column submenu-list">
                            <Link href="/dashboard/overview" className="d-flex">
                                <img src="images/overview-icon.svg" alt="" width="24" height="24" />
                                Overview
                            </Link>
                            <Link href="/dashboard/activity" className="d-flex">
                                <img src="images/recent-activity-icon.svg" alt="" width="24" height="24" />
                                Recent Activty
                            </Link>
                            <Link href="/dashboard/submission-deadlines" className="d-flex">
                                <img src="images/submission-deadline-icon.svg" alt="" width="24" height="24" />
                                Submission Deadlines
                            </Link>
                        </div>
                    </div>
                );
            case '/pipeline':
                return (
                    <div className="d-flex flex-column">
                        <span className="submenu-title">Pipeline</span>
                    </div>
                );
            case '/dam':
                return (
                    <div className="d-flex flex-column">
                        <span className="submenu-title mb-3">Digital Asset Manager</span>
                        <div className="d-flex flex-column submenu-list">
                            <Link href="/dam/collections" className="d-flex">
                                <img src="images/collections-icon.svg" alt="" width="24" height="24" />
                                Collections
                            </Link>
                            <Link href="/dam/files" className="d-flex">
                                <img src="images/files-icon.svg" alt="" width="24" height="24" />
                                Files
                            </Link>
                            <Link href="/dam/favorites" className="d-flex">
                                <img src="images/favorites-icon.svg" alt="" width="24" height="24" />
                                Favorites
                            </Link>
                        </div>
                    </div>
                );
            case '/org':
                return (
                    <div className="d-flex flex-column text-nowrap">
                        <span className="submenu-title">Organization</span>
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
                <ul className="nav nav-pills flex-column mb-auto position-relative">
                    <li className="nav-item">
                        <Link href="/dashboard" className={`nav-link ${activeLink === '/dashboard' ? 'active' : ''}`} onClick={() => handleClick('/dashboard')}>
                            <img src="images/bd-portal-dashboard-icon.svg" alt="" width="24" height="24" />
                        </Link> 
                    </li>
                    <li>
                        <Link href="/pipeline" className={`nav-link ${activeLink === '/pipeline' ? 'active' : ''}`} onClick={() => handleClick('/pipeline')}>
                            <img src="images/bd-portal-pipeline-icon.svg" alt="" width="24" height="24" />
                        </Link> 
                    </li>
                    <li>
                        <Link href="/dam" className={`nav-link ${activeLink === '/dam' ? 'active' : ''}`} onClick={() => handleClick('/dam')}>
                            <img src="images/bd-portal-dam-icon.svg" alt="" width="24" height="24" />
                        </Link> 
                    </li>
                    <li>
                        <Link href="/org" className={`nav-link ${activeLink === '/org' ? 'active' : ''}`} onClick={() => handleClick('/org')}>
                            <img src="images/bd-portal-org-icon.svg" alt="" width="24" height="24" />
                        </Link> 
                    </li>
                </ul>
                <div className="highlight" style={{position: 'absolute', top: 0, left: 0, width: '48px', height: '48px', backgroundColor: '#E2F7F3', borderRadius: '8px', zIndex: -1}}></div>

                {/* User profile */}
                <div className="dropdown mt-auto menu-user position-relative">
                    <a href="#" className="d-flex align-items-center link-dark text-decoration-none dropdown-toggle" id="dropdownUser2" data-bs-toggle="dropdown" aria-expanded="false">
                        {photo ? (
                            <img src={photo} alt="User Profile" width="32" height="32" className="rounded-circle me-2" />
                        ) : (
                            <div className="avatar-placeholder"></div>
                        )}
                    </a>

                </div>
            </div>
            {/* Submenu rendering */}
            <div className="submenu px-3 py-5 position-absolute top-0 d-flex flex-column text-figtree">
                    {renderSubMenu()}

                    <div className="menu-user-text position-relative mt-auto">
                        {profile && (
                            <div className="user-info d-flex flex-column text-figtree">
                                <span className="fw-bold">{profile.displayName}</span>
                                <span className="email">{profile.mail}</span>
                            </div>
                        )}
                    </div>

                </div>
        </header>
    );
}

export default Header;