
import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  element: HTMLDivElement;
}

const ParticleBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const particles: Particle[] = [];
    const particleCount = 20;
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      container.appendChild(particle);
      
      const size = Math.random() * 4 + 2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      const newParticle: Particle = {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        element: particle
      };
      
      particle.style.opacity = newParticle.opacity.toString();
      particles.push(newParticle);
    }
    
    particlesRef.current = particles;
    
    // Animation function
    const animateParticles = () => {
      const containerRect = container.getBoundingClientRect();
      
      particlesRef.current.forEach(particle => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Boundary check
        if (particle.x < 0 || particle.x > containerRect.width) {
          particle.speedX *= -1;
        }
        
        if (particle.y < 0 || particle.y > containerRect.height) {
          particle.speedY *= -1;
        }
        
        // Apply new position
        particle.element.style.transform = `translate(${particle.x}px, ${particle.y}px)`;
      });
      
      animationFrameRef.current = requestAnimationFrame(animateParticles);
    };
    
    animationFrameRef.current = requestAnimationFrame(animateParticles);
    
    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      particlesRef.current.forEach(particle => {
        particle.element.remove();
      });
      
      particlesRef.current = [];
    };
  }, []);
  
  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    />
  );
};

export default ParticleBackground;
