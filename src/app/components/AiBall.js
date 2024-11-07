import * as THREE from 'three';
import gsap from 'gsap';
import { useEffect, useRef } from 'react';

const AiBall = () => {
  const mountRef = useRef(null);

  useEffect(() => {

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      color: 0x00ffe4,
      emissive: 0x002a59,  
      shininess: 100
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);


    const ambientLight = new THREE.AmbientLight(0x404040, 2);  
    const pointLight = new THREE.PointLight(0x00ffff, 1.5, 50);
    pointLight.position.set(5, 5, 5);
    scene.add(ambientLight, pointLight);

    const rotateSphere = gsap.to(sphere.rotation, {
      y: 2 * Math.PI,
      repeat: -1,
      ease: 'linear',
      duration: 5
    });

    const pulseEffect = gsap.to(sphere.scale, {
      x: 1.1,
      y: 1.1,
      z: 1.1,
      yoyo: true,
      repeat: -1,
      duration: 0.6,
      ease: 'power1.inOut'
    });


    const toggleLoading = (isLoading) => {
      if (isLoading) {
        pulseEffect.play(); 
      } else {
        pulseEffect.pause(); 
        gsap.to(sphere.scale, { x: 1, y: 1, z: 1, duration: 0.3 }); 
      }
    };


    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      rotateSphere.kill();
      pulseEffect.kill();
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} />;
};

export default AiBall;
