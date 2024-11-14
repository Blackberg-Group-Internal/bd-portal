import { ReactLenis } from "@studio-freight/react-lenis";
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

function SmoothScrolling({ children }) {

  const lenisRef = useRef()

  useEffect(() => {
    function update(time) {
      lenisRef.current?.lenis?.raf(time * 1000)
    }

    gsap.ticker.add(update)

    const chatWindow = document.querySelector('.chat-window');

    const handleChatScroll = () => {
      lenisRef.current?.lenis?.stop();  
    };

    const handleChatScrollEnd = () => {
      lenisRef.current?.lenis?.start();  
    };

    chatWindow?.addEventListener('mouseenter', handleChatScroll);  
    chatWindow?.addEventListener('mouseleave', handleChatScrollEnd);  

    return () => {
      gsap.ticker.remove(update);
      chatWindow?.removeEventListener('mouseenter', handleChatScroll);
      chatWindow?.removeEventListener('mouseleave', handleChatScrollEnd);
    }
  }, []);

  return (
    <ReactLenis root options={{ lerp: 0.3, smoothTouch: false, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}

export default SmoothScrolling;