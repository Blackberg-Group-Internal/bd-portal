import Link from 'next/link';
import NaicsIcon from '../../../../../public/images/icons/naics.svg';
import DashboardIcon from '../../../../../public/images/icons/tiles.svg';
import PipelineIcon from '../../../../../public/images/icons/pipeline-2.svg';
import WatchlistIcon from '../../../../../public/images/icons/glasses.svg';
import ToolsIcon from '../../../../../public/images/icons/tools.svg';
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
        <Link href="/dev" className={`d-flex ${pathname === '/dev' ? 'active' : ''}`}>
            <DashboardIcon />
            <span className="d-none d-lg-flex ms-2 ps-1">Dashboard</span>
        </Link>
        <Link href="/dev/opportunities" className={`d-flex ${pathname === '/dev/opportunities' ? 'active' : ''}`} prefetch={true}>
            <QualifiedOpportunities />
            <span className="d-none d-lg-flex ms-2 ps-1">Opportunities</span>
        </Link>
        {/* <Link href="/dev" className={`d-flex ${pathname === '/dev/opportunities' ? 'active' : ''}`}>
            <OpportunitiesIcon />
            <span className="d-none d-lg-flex ms-2 ps-1">Opportunities</span>
        </Link> */}
        <Link href="/dev/watchlist" className={`d-flex ${pathname === '/dev/watchlist' ? 'active' : ''}`} prefetch={true}>
            <WatchlistIcon />
            <span className="d-none d-lg-flex ms-2 ps-1">Watchlist</span>
        </Link>
        <Link href="/dev/pipeline" className={`d-flex ${pathname === '/dev/pipeline' ? 'active' : ''}`} prefetch={true}>
            <PipelineIcon />
            <span className="d-none d-lg-flex ms-2 ps-1">Pipeline</span>
        </Link>
        {/* <Link href="/dev/tools" className={`d-flex ${pathname === '/dev/tools' ? 'active' : ''}`} prefetch={true}>
            <ToolsIcon />
            <span className="d-none d-lg-flex ms-2 ps-1">Tools</span>
        </Link> */}
        </div>
    </div>
  );
};

export default DevSubMenu;