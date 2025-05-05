
import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  element: HTMLDivElement;
  drift: number;
  phase: number;
}

const ParticleBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const particles: Particle[] = [];
    const particleCount = 25;
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'quantum-particle';
      container.appendChild(particle);
      
      const size = Math.random() * 15 + 5;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      const newParticle: Particle = {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.7 + 0.1,
        element: particle,
        drift: Math.random() * 5 + 2,
        phase: Math.random() * Math.PI * 2
      };
      
      particle.style.opacity = newParticle.opacity.toString();
      particles.push(newParticle);
    }
    
    particlesRef.current = particles;
    
    // Animation function
    const animateParticles = () => {
      const containerRect = container.getBoundingClientRect();
      const time = Date.now() / 1000;
      
      particlesRef.current.forEach((particle, index) => {
        // Add wave motion
        const waveX = Math.sin(time * 0.5 + particle.phase) * particle.drift;
        const waveY = Math.cos(time * 0.3 + particle.phase) * particle.drift;
        
        // Update position
        particle.x += particle.speedX + waveX * 0.03;
        particle.y += particle.speedY + waveY * 0.03;
        
        // Boundary check
        if (particle.x < 0) {
          particle.x = containerRect.width;
        } else if (particle.x > containerRect.width) {
          particle.x = 0;
        }
        
        if (particle.y < 0) {
          particle.y = containerRect.height;
        } else if (particle.y > containerRect.height) {
          particle.y = 0;
        }
        
        // Pulse effect
        const pulseOpacity = 0.3 + Math.sin(time * 1.5 + index) * 0.2;
        particle.element.style.opacity = pulseOpacity.toString();
        
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
