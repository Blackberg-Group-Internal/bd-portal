import Link from 'next/link';
import OrgIcon from '../../../../../public/images/icons/org.svg';
import FilesIcon from '../../../../../public/images/icons/files.svg';
import FavoritesIcon from '../../../../../public/images/icons/favorites.svg';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { usePathname } from 'next/navigation';

const OrgSubMenu = () => {
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
        <span className="submenu-title mb-3 d-none d-lg-flex">Directory</span>
        <div className="d-flex flex-column submenu-list">
            <Link href="/directory" className={`d-flex ${pathname.includes('directory') ? 'active' : ''}`}>
                <OrgIcon />
                <span className="d-none d-lg-flex ms-2 ps-1">Team Members</span>
            </Link>
        </div>
    </div>
  );
};

export default OrgSubMenu;