"use client";

import { useEffect, useState } from 'react';
import { getUserProfile } from "@/app/lib/microsoft/graph";
import { useSession } from 'next-auth/react';
import { fetchEmployeeHygraph } from '@/app/lib/hygraph/employees';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import DamSubMenu from '@/app/components/layout/header/DamSubMenu';
import DashboardIcon from '../../../../../public/images/icons/dashboard.svg';
import DamIcon from '../../../../../public/images/icons/dam.svg';
import ResourcesIcon from '../../../../../public/images/icons/resources.svg';
import OrgIcon from '../../../../../public/images/icons/directory.svg';
import AiIcon from '../../../../../public/images/icons/ai.svg';
import DashboardSubMenu from './DashboardSubMenu';
import PipelineSubMenu from './PipelineSubMenu';
import OrgSubMenu from './OrgSubMenu';
import UserLogout from './UserLogout';
import UserMenu from './UserMenu';
import DevSubMenu from './DevSubMenu';
import ResourcesSubMenu from './ResourcesSubMenu';
import useBootstrapTooltips from "@/app/hooks/useBootstrapTooltips";

const Header = () => {

    const { data: session, status } = useSession();
    const [userPhoto, setUserPhoto] = useState(null);
    const [profile, setProfile] = useState(null);
    const [activeLink, setActiveLink] = useState('/');
    const [activeSubLink, setActiveSubLink] = useState('/');
    const pathname = usePathname();

    useBootstrapTooltips();

    useEffect(() => {
        if (status === "authenticated" && session?.accessToken) {
            const fetchData = async () => {
                try {
                    const userProfile = await getUserProfile(session.accessToken);
                    const firstName = session.user.name.split(' ')[0];
                    const lastName = session.user.name.split(' ')[1];
                    const hygraphUser = await fetchEmployeeHygraph(firstName, lastName);

                    setProfile(userProfile);
                    setUserPhoto(hygraphUser[0].image.url);
                    localStorage.setItem('userProfilePhoto', hygraphUser[0].image.url)
                } catch (error) {
                    console.error("Failed to fetch user data:", error);
                }
            };
            fetchData();
        }
    }, [session, status]);

  useEffect(() => {
    setActiveLink(pathname);
  }, [pathname]);

    useEffect(() => {
        setActiveLink(pathname); 

        const highlight = document.querySelector('.highlight');
        const activeNavItem = document.querySelector(`.nav-link[href="${pathname}"]`);

        if (activeNavItem) {
            const { top, left, width, height } = activeNavItem.getBoundingClientRect();

            gsap.to(highlight, {
                top: top + window.scrollY, 
                left: left + window.scrollX, 
                opacity: 1,
                width,
                height,
                ease: 'power1.out',
                duration: 0.5,
            });
        }
    }, [pathname]);    

  return (
    <header>
        <div className="d-flex flex-column flex-shrink-0 align-items-center py-5 h-100 position-relative z-2 bg-white">
        <div className="d-flex align-items-center mb-4">
            <span className="fs-4">
                <img src="/images/logos/bg-logo.svg" alt="" width="32" height="32" />
            </span>
        </div>

        <ul className="nav nav-pills flex-column mb-5">
            {/* <li className="nav-item">
                <Link href="/" className={`nav-link ${activeLink === '/' || activeLink === '/activity' || activeLink === '/submissions' ? 'active' : ''}`} data-bs-toggle="tooltip" data-bs-placement="right" title="Dashboard">
                    <DashboardIcon className="icon" />
                </Link> 
            </li>
            <li>
                <Link href="/pipeline" className={`nav-link ${activeLink.startsWith('/pipeline') ? 'active' : ''}`} data-bs-toggle="tooltip" data-bs-placement="right" title="Pipeline">
                    <PipelineIcon className="icon" />
                </Link> 
            </li> */}
            <li>
                <Link href="/dam" className={`nav-link ${activeLink.startsWith('/dam') ? 'active' : ''}`} data-bs-toggle="tooltip" data-bs-placement="right" title="Digital Asset Manager" prefetch={true}>
                    <DamIcon className="icon" />
                </Link> 
            </li>
            <li className={`nav-item ${activeLink.startsWith('/directory') ? 'active' : ''}`}>
                <Link href="/directory" className="nav-link" data-bs-toggle="tooltip" data-bs-placement="right" title="Directory" prefetch={true}>
                    <OrgIcon className="icon" />
                </Link> 
            </li>
            <li className={`nav-item ${activeLink.startsWith('/resources') ? 'active' : ''}`}>
                <Link href="/resources" className="nav-link" data-bs-toggle="tooltip" data-bs-placement="right" title="Resources" prefetch={true}>
                    <ResourcesIcon className="icon" />
                </Link> 
            </li>
            <li className={`nav-item ${activeLink.startsWith('/dev') ? 'active' : ''}`}>
                <Link href="/dev" className="nav-link" data-bs-toggle="tooltip" data-bs-placement="right" title="SamSmart" prefetch={true}>
                    <AiIcon className="icon" />
                </Link> 
            </li>
        </ul>
        <div className="highlight"></div>
        <UserMenu photo={userPhoto} profile={profile} />
       </div>
       <div className="submenu px-lg-3 py-5 position-absolute top-0 d-flex flex-column text-figtree">
            {(activeLink === '/' || activeLink === '/activity' || activeLink === '/submissions') && (
            // <DashboardSubMenu />
            <></>
            )}
            {activeLink.startsWith('/pipeline') && (
            <PipelineSubMenu />
            )}
            {activeLink.startsWith('/dam') && (
            <DamSubMenu />
            )}
            {activeLink.startsWith('/directory') && (
            <OrgSubMenu />
            )}
            {activeLink.startsWith('/resources') && (
            <ResourcesSubMenu />
            )}
            {activeLink.startsWith('/dev') && (
            <DevSubMenu />
            )}
        <UserLogout profile={profile} />
        </div>
    </header>
  );
};

export default Header;