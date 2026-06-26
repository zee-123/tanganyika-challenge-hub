import { useEffect, useRef } from 'react';

export default function StarField() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const stars = [];
    for (let i = 0; i < 80; i++) {
      const star = document.createElement('div');
      const size = Math.random() * 3 + 1;
      star.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        background: white;
        border-radius: 50%;
        left: ${Math.random() * 100}vw;
        top: ${Math.random() * 100}vh;
        opacity: ${Math.random() * 0.7 + 0.3};
        animation: twinkle ${Math.random() * 3 + 2}s ease-in-out infinite;
        animation-delay: ${Math.random() * 3}s;
        pointer-events: none;
        z-index: 0;
      `;
      container.appendChild(star);
      stars.push(star);
    }
    return () => stars.forEach(s => s.remove());
  }, []);

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none" />;
}
