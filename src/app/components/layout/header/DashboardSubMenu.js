'use client';

import Link from 'next/link';
import OverviewIcon from '../../../../../public/images/icons/overview.svg';
import ActivityIcon from '../../../../../public/images/icons/recent-activity.svg';
import SubmissionsIcon from '../../../../../public/images/icons/submission-deadlines.svg';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { usePathname } from 'next/navigation';

const DashboardSubMenu = () => {

    const submenuRef = useRef(null); 
    const pathname = usePathname(); 
    
    useEffect(() => {

        if (submenuRef.current) {
            const submenuItems = submenuRef.current.querySelectorAll('.submenu-list a');
            gsap.fromTo(
                submenuItems,
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    stagger: 0.1,
                    ease: 'power1.out',
                    duration: 0.5,
                }
            );
        }
        
    }, []);

  return (
    <div ref={submenuRef}>
        <span className="submenu-title mb-3 d-none d-lg-flex">Dashboard</span>
        <div className="d-flex flex-column submenu-list">
            <Link href="/" className={`d-flex ${pathname === '/' ? 'active' : ''}`} data-bs-toggle="tooltip" data-bs-placement="right" title="Overview">
                <OverviewIcon />
                <span className="d-none d-lg-flex ms-2 ps-1">Overview</span>
            </Link>
            <Link href="/activity" className={`d-flex ${pathname === '/activity' ? 'active' : ''}`} data-bs-toggle="tooltip" data-bs-placement="right" title="Recent Activity">
                <ActivityIcon />
                <span className="d-none d-lg-flex ms-2 ps-1">Recent Activity</span>
            </Link>
            <Link href="/submissions" className={`d-flex ${pathname === '/submissions' ? 'active' : ''}`} data-bs-toggle="tooltip" data-bs-placement="right" title="Submission Deadlines">
                <SubmissionsIcon />
                <span className="d-none d-lg-flex ms-2 ps-1">Submission Deadlines</span>
            </Link>
        </div>
    </div>
  );
};

export default DashboardSubMenu;