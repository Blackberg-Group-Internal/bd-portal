'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';

const HeaderInteractive = () => {
  const router = useRouter();

  useEffect(() => {

    const navItems = document.querySelectorAll('.navbar .nav-item');
    const navLinks = document.querySelectorAll('.navbar .nav-link, .navbar .dropdown-item');
    const navButton = document.querySelector('.navbar-toggler');
    const nav = document.querySelector('.navbar');

    // Override Bootstrap default behavior
    // Allows parent of dropdown to be clickable 
    const handleClick = (e) => {
      const elLink = e.currentTarget.querySelector('a[data-bs-toggle]');
      if (elLink && !e.target.closest('.dropdown-menu')) {
        e.preventDefault();
        if (window.innerWidth < 992) {
          if(e.currentTarget.classList.contains('clicked')){
            router.replace(elLink.href);
          } else {
            e.currentTarget.classList.add('clicked');
            e.target.nextSibling.classList.add('d-block');
          }
        } else {
          router.replace(elLink.href);
        }
      }
    };

    // Attach event listener for all nav items 
    // Required click & touchstart for iOS safari bug 
    navItems.forEach((item) => {
      item.addEventListener('click', handleClick);
      item.addEventListener('touchstart', handleClick)
    });

    // Add indicator in menu to show active page
    const setActiveLink = () => {
        const currentPath = router.asPath.split('/').pop();

        navLinks.forEach((item) => {
        const itemPath = item.getAttribute('href').split('/').pop();
        if (itemPath === currentPath) {
            item.classList.add('active');
            item.setAttribute('aria-current', 'page');
        } else {
            item.classList.remove('active');
            item.removeAttribute('aria-current');
        }
        });
    };

    setActiveLink();

    // Toggle class on nav when navButton is clicked, only if it doesn't already have the class
    const handleNavToggle = () => {
      if (!nav.classList.contains('is-stuck')) {
        nav.classList.toggle('is-shadow');
      }
    };

    // Attach event listener to navButton
    navButton.addEventListener('click', handleNavToggle);
  

    // Clean up function 
    return () => {
      const navButton = document.querySelector('.navbar-toggler');
      navButton.classList.add('collapsed');
      navButton.removeEventListener('click', handleNavToggle);

      const nav = document.querySelector('.navbar-collapse');
      nav.classList.remove('show');

      const dropdowns = document.querySelectorAll('.dropdown-menu');
      dropdowns.forEach((dropdown) => {
        dropdown.classList.remove('d-block');
      });

      navItems.forEach((item) => {
        item.removeEventListener('click', handleClick);
        item.removeEventListener('touchstart', handleClick)
        item.classList.remove('clicked');
      });

    };
  }, [router]);

  return null; 
};

export default HeaderInteractive;