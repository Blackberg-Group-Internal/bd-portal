import Link from 'next/link';
import NaicsIcon from '../../../../../public/images/icons/naics.svg';
import AnalyzeIcon from '../../../../../public/images/icons/analyze.svg';
import SummaryIcon from '../../../../../public/images/icons/summary.svg';
import OpportunitiesIcon from '../../../../../public/images/icons/opportunities.svg';
import QualifiedOpportunities from '../../../../../public/images/icons/qualified-opportunities.svg';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { usePathname } from 'next/navigation';

const DevSubMenu = () => {

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
        <span className="submenu-title mb-3 d-none d-lg-flex">SamSmart</span>
        <div className="d-flex flex-column submenu-list">
        <Link href="/dam" className={`d-flex ${pathname === '/dam' ? 'active' : ''}`}>
            <QualifiedOpportunities />
            <span className="d-none d-lg-flex ms-2 ps-1">Top Opportunities</span>
        </Link>
        <Link href="/dam/files" className={`d-flex ${pathname === '/dam/files' ? 'active' : ''}`}>
            <AnalyzeIcon />
            <span className="d-none d-lg-flex ms-2 ps-1">Analyzer</span>
        </Link>
        <Link href="/dam" className={`d-flex ${pathname === '/dam' ? 'active' : ''}`}>
            <OpportunitiesIcon />
            <span className="d-none d-lg-flex ms-2 ps-1">Opportunities</span>
        </Link>
        <Link href="/dam/files" className={`d-flex ${pathname === '/dam/files' ? 'active' : ''}`}>
            <SummaryIcon />
            <span className="d-none d-lg-flex ms-2 ps-1">Summarizer</span>
        </Link>
        <Link href="/dam/favorites" className={`d-flex ${pathname === '/dam/favorites' ? 'active' : ''}`}>
            <NaicsIcon />
            <span className="d-none d-lg-flex ms-2 ps-1">NAICS</span>
        </Link>
        </div>
    </div>
  );
};

export default DevSubMenu;