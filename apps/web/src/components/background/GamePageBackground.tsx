'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { PageType } from '@/lib/pageType';

type PageType = 'home' | 'about' | 'skills' | 'projects' | 'blog' | 'contact' | 'checkout' | 'experience' | 'pricing';

interface Bug {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  type: string;
  color: string;
  animationPhase: number;
}

interface BackgroundProps {
  pageType: PageType;
}

type BugTypeConfig = {
  name: string;
  color: string;
  size: number;
  speed: number;
  count: number;
};

type PageConfig = {
  bgColor: string;
  bugTypes: BugTypeConfig[];
  gridColor: string;
  particleColor: string;
};



const GamePageBackground: React.FC<BackgroundProps> = ({ pageType }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const bugsRef = useRef<Bug[]>([]);
  const animationFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Page-specific configurations
  const getPageConfig = useCallback((type: PageType): PageConfig => {
    switch (type) {
      case 'home':
        return {
          bgColor: 'rgba(10, 10, 30, 0.85)',
          bugTypes: [
            { name: 'beetle', color: '#8B4513', size: 15, speed: 0.5, count: 8 }, // Brown beetle
            { name: 'spider', color: '#2F4F4F', size: 12, speed: 0.8, count: 6 }, // Dark spider
            { name: 'bug', color: '#32CD32', size: 10, speed: 0.7, count: 10 }, // Green bug
          ],
          gridColor: 'rgba(50, 50, 80, 0.3)',
          particleColor: '#4FC3F7',
        };
      case 'about':
        return {
          bgColor: 'rgba(20, 10, 30, 0.85)',
          bugTypes: [
            { name: 'ant', color: '#000000', size: 8, speed: 1.2, count: 12 }, // Black ant
            { name: 'ladybug', color: '#E53935', size: 10, speed: 0.6, count: 6 }, // Red ladybug
            { name: 'beetle', color: '#8B0000', size: 14, speed: 0.4, count: 5 }, // Dark red beetle
          ],
          gridColor: 'rgba(80, 50, 80, 0.3)',
          particleColor: '#E53935',
        };
      case 'skills':
        return {
          bgColor: 'rgba(10, 20, 30, 0.85)',
          bugTypes: [
            { name: 'fly', color: '#696969', size: 6, speed: 1.5, count: 15 }, // Gray fly
            { name: 'mosquito', color: '#4A4A4A', size: 7, speed: 1.8, count: 8 }, // Dark mosquito
            { name: 'wasp', color: '#FFD700', size: 9, speed: 1.0, count: 5 }, // Yellow wasp
          ],
          gridColor: 'rgba(50, 80, 100, 0.3)',
          particleColor: '#FFD700',
        };
      case 'projects':
        return {
          bgColor: 'rgba(20, 20, 10, 0.85)',
          bugTypes: [
            { name: 'grasshopper', color: '#7CFC00', size: 12, speed: 0.9, count: 7 }, // Green grasshopper
            { name: 'caterpillar', color: '#32CD32', size: 10, speed: 0.5, count: 6 }, // Green caterpillar
            { name: 'beetle', color: '#9ACD32', size: 13, speed: 0.6, count: 8 }, // Yellow-green beetle
          ],
          gridColor: 'rgba(80, 100, 50, 0.3)',
          particleColor: '#7CFC00',
        };
      case 'blog':
        return {
          bgColor: 'rgba(30, 10, 30, 0.85)',
          bugTypes: [
            { name: 'moth', color: '#E6E6FA', size: 11, speed: 0.7, count: 9 }, // Light moth
            { name: 'butterfly', color: '#DA70D6', size: 10, speed: 1.0, count: 6 }, // Orchid butterfly
            { name: 'firefly', color: '#FFD700', size: 5, speed: 1.2, count: 12 }, // Yellow firefly
          ],
          gridColor: 'rgba(100, 50, 100, 0.3)',
          particleColor: '#DA70D6',
        };
      case 'contact':
        return {
          bgColor: 'rgba(10, 20, 20, 0.85)',
          bugTypes: [
            { name: 'bee', color: '#FFA500', size: 9, speed: 1.1, count: 8 }, // Orange bee
            { name: 'wasp', color: '#FFD700', size: 8, speed: 1.3, count: 7 }, // Yellow wasp
            { name: 'fly', color: '#696969', size: 6, speed: 1.6, count: 10 }, // Gray fly
          ],
          gridColor: 'rgba(50, 100, 100, 0.3)',
          particleColor: '#FFA500',
        };
      case 'pricing':
        return {
          bgColor: 'rgba(30, 10, 10, 0.85)',
          bugTypes: [
            { name: 'beetle', color: '#8B0000', size: 14, speed: 0.5, count: 6 }, // Dark red beetle
            { name: 'spider', color: '#2F4F4F', size: 12, speed: 0.8, count: 5 }, // Dark spider
            { name: 'roach', color: '#654321', size: 10, speed: 0.9, count: 8 }, // Brown roach
          ],
          gridColor: 'rgba(100, 50, 50, 0.3)',
          particleColor: '#FF6347',
        };
      case 'experience':
        return {
          bgColor: 'rgba(10, 30, 20, 0.85)',
          bugTypes: [
            { name: 'grasshopper', color: '#32CD32', size: 13, speed: 1.0, count: 7 }, // Green grasshopper
            { name: 'ladybug', color: '#FF6347', size: 10, speed: 0.7, count: 6 }, // Red ladybug
            { name: 'cicada', color: '#DEB887', size: 12, speed: 0.6, count: 5 }, // Tan cicada
          ],
          gridColor: 'rgba(50, 100, 80, 0.3)',
          particleColor: '#32CD32',
        };
      case 'checkout':
        return {
          bgColor: 'rgba(20, 10, 40, 0.85)',
          bugTypes: [
            { name: 'beetle', color: '#9370DB', size: 12, speed: 0.6, count: 7 }, // Purple beetle
            { name: 'moth', color: '#D8BFD8', size: 11, speed: 0.9, count: 6 }, // Thistle moth
            { name: 'ant', color: '#4B0082', size: 8, speed: 1.3, count: 10 }, // Indigo ant
          ],
          gridColor: 'rgba(80, 50, 120, 0.3)',
          particleColor: '#9370DB',
        };
      default:
        return {
          bgColor: 'rgba(10, 10, 20, 0.85)',
          bugTypes: [
            { name: 'beetle', color: '#8B4513', size: 15, speed: 0.5, count: 8 },
            { name: 'spider', color: '#2F4F4F', size: 12, speed: 0.8, count: 6 },
            { name: 'bug', color: '#32CD32', size: 10, speed: 0.7, count: 10 },
          ],
          gridColor: 'rgba(50, 50, 80, 0.3)',
          particleColor: '#4FC3F7',
        };
    }
  }, []);

  // Initialize bugs based on page type
  const initializeBugs = useCallback(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;
    const config = getPageConfig(pageType);
    const newBugs: Bug[] = [];

    config.bugTypes.forEach(bugType => {
      for (let i = 0; i < bugType.count; i++) {
        newBugs.push({
          id: `${bugType.name}-${i}-${Date.now()}`,
          x: Math.random() * dimensions.width,
          y: Math.random() * dimensions.height,
          vx: (Math.random() - 0.5) * bugType.speed,
          vy: (Math.random() - 0.5) * bugType.speed,
          size: bugType.size,
          type: bugType.name,
          color: bugType.color,
          animationPhase: Math.random() * Math.PI * 2,
        });
      }
    });

    bugsRef.current = newBugs;
  }, [dimensions.height, dimensions.width, getPageConfig, pageType]);

  // Draw a bug based on its type
  const drawBug = (ctx: CanvasRenderingContext2D, bug: Bug) => {
    ctx.save();
    ctx.beginPath();
    
    // Draw different bug types differently
    switch (bug.type) {
      case 'beetle':
      case 'bug':
      case 'ladybug':
      case 'caterpillar':
      case 'roach':
        // Draw body
        ctx.fillStyle = bug.color;
        ctx.beginPath();
        ctx.ellipse(bug.x, bug.y, bug.size / 2, bug.size / 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw head
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(bug.x - bug.size / 2.5, bug.y, bug.size / 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw legs
        ctx.strokeStyle = bug.color;
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI / 3) - Math.PI / 6;
          ctx.beginPath();
          ctx.moveTo(bug.x + Math.cos(angle) * (bug.size / 2.5), bug.y + Math.sin(angle) * (bug.size / 2.5));
          ctx.lineTo(
            bug.x + Math.cos(angle) * (bug.size / 2.5) + Math.cos(angle) * bug.size,
            bug.y + Math.sin(angle) * (bug.size / 2.5) + Math.sin(angle) * bug.size
          );
          ctx.stroke();
        }
        break;
        
      case 'spider':
        // Draw body
        ctx.fillStyle = bug.color;
        ctx.beginPath();
        ctx.arc(bug.x, bug.y, bug.size / 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw legs
        ctx.strokeStyle = bug.color;
        ctx.lineWidth = 1.2;
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI / 4);
          ctx.beginPath();
          ctx.moveTo(bug.x + Math.cos(angle) * (bug.size / 1.5), bug.y + Math.sin(angle) * (bug.size / 1.5));
          ctx.lineTo(
            bug.x + Math.cos(angle) * (bug.size / 1.5) + Math.cos(angle) * bug.size * 1.5,
            bug.y + Math.sin(angle) * (bug.size / 1.5) + Math.sin(angle) * bug.size * 1.5
          );
          ctx.stroke();
        }
        break;
        
      case 'ant':
        // Draw segments
        ctx.fillStyle = bug.color;
        ctx.beginPath();
        ctx.arc(bug.x, bug.y, bug.size / 2, 0, Math.PI * 2); // Head
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(bug.x + bug.size, bug.y, bug.size / 1.5, 0, Math.PI * 2); // Body
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(bug.x + bug.size * 2, bug.y, bug.size / 2, 0, Math.PI * 2); // Abdomen
        ctx.fill();
        
        // Draw legs and antennae
        ctx.strokeStyle = bug.color;
        ctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) {
          const angle = (i % 2 === 0 ? -0.5 : 0.5) * Math.PI / 3;
          const offset = Math.floor(i / 2) * bug.size;
          ctx.beginPath();
          ctx.moveTo(bug.x + offset, bug.y);
          ctx.lineTo(bug.x + offset + Math.cos(angle) * bug.size, bug.y + Math.sin(angle) * bug.size);
          ctx.stroke();
        }
        break;
        
      case 'fly':
      case 'mosquito':
        // Draw body
        ctx.fillStyle = bug.color;
        ctx.beginPath();
        ctx.ellipse(bug.x, bug.y, bug.size / 3, bug.size / 1.2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw wings
        ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
        ctx.beginPath();
        ctx.ellipse(bug.x - bug.size / 2, bug.y, bug.size / 1.5, bug.size / 3, Math.PI/4, 0, Math.PI * 2);
        ctx.ellipse(bug.x + bug.size / 2, bug.y, bug.size / 1.5, bug.size / 3, -Math.PI/4, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'wasp':
        // Draw segmented body
        ctx.fillStyle = bug.color;
        ctx.beginPath();
        ctx.arc(bug.x - bug.size * 0.5, bug.y, bug.size / 2, 0, Math.PI * 2); // Head
        ctx.fill();
        
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(bug.x, bug.y, bug.size / 1.5, 0, Math.PI * 2); // Thorax
        ctx.fill();
        
        ctx.fillStyle = bug.color;
        ctx.beginPath();
        ctx.arc(bug.x + bug.size * 0.8, bug.y, bug.size / 1.8, 0, Math.PI * 2); // Abdomen
        ctx.fill();
        
        // Draw wings
        ctx.fillStyle = 'rgba(200, 200, 200, 0.6)';
        ctx.beginPath();
        ctx.ellipse(bug.x, bug.y - bug.size / 2, bug.size * 1.2, bug.size / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'grasshopper':
        // Draw body
        ctx.fillStyle = bug.color;
        ctx.beginPath();
        ctx.ellipse(bug.x, bug.y, bug.size / 1.5, bug.size / 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw large hind legs
        ctx.strokeStyle = bug.color;
        ctx.lineWidth = 1.8;
        // Back legs
        ctx.beginPath();
        ctx.moveTo(bug.x + bug.size / 1.5, bug.y + bug.size / 2);
        ctx.lineTo(bug.x + bug.size * 1.5, bug.y + bug.size);
        ctx.lineTo(bug.x + bug.size * 2, bug.y + bug.size * 1.2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(bug.x - bug.size / 1.5, bug.y + bug.size / 2);
        ctx.lineTo(bug.x - bug.size * 1.5, bug.y + bug.size);
        ctx.lineTo(bug.x - bug.size * 2, bug.y + bug.size * 1.2);
        ctx.stroke();
        break;
        
      case 'moth':
      case 'butterfly':
        // Draw body
        ctx.fillStyle = bug.color;
        ctx.beginPath();
        ctx.ellipse(bug.x, bug.y, bug.size / 4, bug.size / 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw wings
        ctx.fillStyle = bug.color;
        ctx.beginPath();
        ctx.ellipse(bug.x, bug.y, bug.size * 1.2, bug.size / 1.2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw wing patterns
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(bug.x, bug.y, bug.size / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'firefly':
        // Draw body
        ctx.fillStyle = bug.color;
        ctx.beginPath();
        ctx.arc(bug.x, bug.y, bug.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw glowing abdomen
        const glowIntensity = Math.abs(Math.sin(Date.now() / 200 + bug.animationPhase)) * 0.7 + 0.3;
        const gradient = ctx.createRadialGradient(
          bug.x, 
          bug.y + bug.size / 3, 
          0, 
          bug.x, 
          bug.y + bug.size / 3, 
          bug.size
        );
        gradient.addColorStop(0, `rgba(255, 255, 200, ${glowIntensity})`);
        gradient.addColorStop(1, `rgba(255, 255, 100, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(bug.x, bug.y + bug.size / 3, bug.size, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'bee':
        // Draw body segments
        ctx.fillStyle = '#F5DEB3'; // Light brown
        ctx.beginPath();
        ctx.ellipse(bug.x, bug.y, bug.size / 2, bug.size / 1.8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw black stripes
        ctx.fillStyle = '#000';
        ctx.fillRect(bug.x - bug.size / 2, bug.y - bug.size / 3, bug.size, bug.size / 6);
        ctx.fillRect(bug.x - bug.size / 2, bug.y + bug.size / 6, bug.size, bug.size / 6);
        
        // Draw wings
        ctx.fillStyle = 'rgba(200, 200, 200, 0.7)';
        ctx.beginPath();
        ctx.ellipse(bug.x, bug.y - bug.size / 2, bug.size * 0.8, bug.size / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'cicada':
        // Draw body
        ctx.fillStyle = bug.color;
        ctx.beginPath();
        ctx.ellipse(bug.x, bug.y, bug.size / 2, bug.size / 1.2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw wings
        ctx.fillStyle = 'rgba(200, 200, 200, 0.6)';
        ctx.beginPath();
        ctx.ellipse(bug.x, bug.y, bug.size * 1.3, bug.size / 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      default:
        // Default bug shape
        ctx.fillStyle = bug.color;
        ctx.beginPath();
        ctx.arc(bug.x, bug.y, bug.size / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
    
    ctx.restore();
  };

  // Animation loop
  const animate = useCallback((timestamp: number) => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    // Calculate time delta for consistent animation speed
    const deltaTime = lastTimeRef.current ? (timestamp - lastTimeRef.current) / 16.67 : 1; // Normalize to 60fps
    lastTimeRef.current = timestamp;
    
    // Clear canvas
    ctx.fillStyle = getPageConfig(pageType).bgColor;
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);
    
    // Draw grid based on page type
    const config = getPageConfig(pageType);
    ctx.strokeStyle = config.gridColor;
    ctx.lineWidth = 1;
    
    const gridSize = 40;
    for (let x = 0; x < dimensions.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, dimensions.height);
      ctx.stroke();
    }
    
    for (let y = 0; y < dimensions.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(dimensions.width, y);
      ctx.stroke();
    }
    
    // Update and draw bugs
    bugsRef.current.forEach(bug => {
      // Update position
      bug.x += bug.vx * deltaTime;
      bug.y += bug.vy * deltaTime;
      
      // Boundary checks with bounce
      if (bug.x < 0 || bug.x > dimensions.width) {
        bug.vx *= -1;
        bug.x = Math.max(0, Math.min(dimensions.width, bug.x));
      }
      if (bug.y < 0 || bug.y > dimensions.height) {
        bug.vy *= -1;
        bug.y = Math.max(0, Math.min(dimensions.height, bug.y));
      }
      
      // Update animation phase
      bug.animationPhase += 0.02 * deltaTime;
      
      // Draw the bug
      drawBug(ctx, bug);
    });
    
    // Draw page-specific decorative elements
    switch (pageType) {
      case 'home':
        // Draw QA-themed elements
        ctx.fillStyle = 'rgba(76, 175, 80, 0.1)';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('QA', dimensions.width * 0.2, dimensions.height * 0.3);
        ctx.fillText('TEST', dimensions.width * 0.7, dimensions.height * 0.6);
        break;
        
      case 'about':
        // Draw personal elements
        ctx.fillStyle = 'rgba(244, 67, 54, 0.1)';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('EXPERIENCE', dimensions.width * 0.3, dimensions.height * 0.4);
        ctx.fillText('EXPERTISE', dimensions.width * 0.6, dimensions.height * 0.7);
        break;
        
      case 'skills':
        // Draw skill elements
        ctx.fillStyle = 'rgba(33, 150, 243, 0.1)';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('AUTOMATION', dimensions.width * 0.25, dimensions.height * 0.25);
        ctx.fillText('API', dimensions.width * 0.75, dimensions.height * 0.5);
        ctx.fillText('MANUAL', dimensions.width * 0.4, dimensions.height * 0.75);
        break;
        
      case 'projects':
        // Draw project elements
        ctx.fillStyle = 'rgba(139, 195, 74, 0.1)';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('PROJECTS', dimensions.width * 0.3, dimensions.height * 0.3);
        ctx.fillText('SUCCESS', dimensions.width * 0.7, dimensions.height * 0.7);
        break;
        
      case 'blog':
        // Draw blog elements
        ctx.fillStyle = 'rgba(156, 39, 176, 0.1)';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('BLOG', dimensions.width * 0.4, dimensions.height * 0.3);
        ctx.fillText('INSIGHTS', dimensions.width * 0.6, dimensions.height * 0.7);
        break;
        
      case 'contact':
        // Draw contact elements
        ctx.fillStyle = 'rgba(0, 150, 136, 0.1)';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('CONTACT', dimensions.width * 0.35, dimensions.height * 0.4);
        ctx.fillText('CONNECT', dimensions.width * 0.65, dimensions.height * 0.6);
        break;
        
      case 'pricing':
        // Draw pricing elements
        ctx.fillStyle = 'rgba(233, 30, 99, 0.1)';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('PRICING', dimensions.width * 0.4, dimensions.height * 0.3);
        ctx.fillText('VALUE', dimensions.width * 0.6, dimensions.height * 0.7);
        break;
        
      case 'experience':
        // Draw experience elements
        ctx.fillStyle = 'rgba(255, 152, 0, 0.1)';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('EXPERIENCE', dimensions.width * 0.3, dimensions.height * 0.25);
        ctx.fillText('GROWTH', dimensions.width * 0.7, dimensions.height * 0.75);
        break;
        
      case 'checkout':
        // Draw checkout elements
        ctx.fillStyle = 'rgba(103, 58, 183, 0.1)';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('SECURE', dimensions.width * 0.3, dimensions.height * 0.3);
        ctx.fillText('CHECKOUT', dimensions.width * 0.7, dimensions.height * 0.7);
        break;
    }

    // Continue animation loop
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [dimensions.height, dimensions.width, getPageConfig, pageType]);

  // Handle resize
  const handleResize = useCallback(() => {
    if (canvasRef.current) {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
  }, []);

  // Set up resize listener
  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  // Initialize bugs whenever size or page changes
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;
    initializeBugs();
  }, [dimensions.height, dimensions.width, initializeBugs]);

  // Start animation loop
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;
    lastTimeRef.current = 0;
    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [animate, dimensions.height, dimensions.width]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <canvas 
        ref={canvasRef} 
        width={dimensions.width} 
        height={dimensions.height}
        data-testid="game-background-canvas"
        className="w-full h-full"
      />
    </div>
  );
};

export default GamePageBackground;



