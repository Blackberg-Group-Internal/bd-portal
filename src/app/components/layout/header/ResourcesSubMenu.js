import Link from 'next/link';
import OrgIcon from '../../../../../public/images/icons/org.svg';
import ListIcon from '../../../../../public/images/icons/list.svg';
import CompassIcon from '../../../../../public/images/icons/compass.svg';
import MessageIcon from '../../../../../public/images/icons/message.svg';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { usePathname } from 'next/navigation';

const ResourcesSubMenu = () => {
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
        <span className="submenu-title mb-3 d-none d-lg-flex">Resources</span>
        <div className="d-flex flex-column submenu-list">
            <Link href="/resources" className={`d-flex ${pathname === 'resources' ? 'active' : ''}`}>
                <ListIcon />
                <span className="d-none d-lg-flex ms-2 ps-1">Overview</span>
            </Link>
            <Link href="/resources/states-registered" className={`d-flex ${pathname.includes('states') ? 'active' : ''}`}>
                <CompassIcon />
                <span className="d-none d-lg-flex ms-2 ps-1">States Registered</span>
            </Link>
            <Link href="/resources/naics-sins-pscs" className={`d-flex ${pathname.includes('naics-sins-pscs') ? 'active' : ''}`}>
                <MessageIcon />
                <span className="d-none d-lg-flex ms-2 ps-1">NAICS, SINs, & PSCs</span>
            </Link>
        </div>
    </div>
  );
};

export default ResourcesSubMenu;