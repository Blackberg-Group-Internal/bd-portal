import React, { useEffect } from 'react';
import gsap from 'gsap';

const Loader = () => {
  useEffect(() => {
    const circles = document.querySelectorAll('.loader-circle');
    gsap.timeline({ repeat: -1, repeatDelay: 0.25 })
      .to(circles, {
        scale: 1.3,
        duration: 0.25,
        ease: 'power1.inOut',
        stagger: {
          each: 0.1,
          yoyo: true,
          repeat: 1,
        }
      });
  }, []);

  return (
    <div className="loader">
      <div className="loader-circle"></div>
      <div className="loader-circle"></div>
      <div className="loader-circle"></div>
    </div>
  );
};

export default Loader;
