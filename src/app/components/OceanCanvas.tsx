import { useEffect, useRef } from 'react';
import { Emotion, getEmotionTheme } from '../utils/emotionDetector';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
}

interface TextParticle extends Particle {
  char: string;
  rotation: number;
  rotationSpeed: number;
  targetY: number;
  originalX: number;
}

interface Bubble {
  x: number;
  y: number;
  size: number;
  speed: number;
  wobble: number;
  wobbleSpeed: number;
}

interface Fish {
  x: number;
  y: number;
  speed: number;
  size: number;
  direction: number;
}

interface OceanCanvasProps {
  message: string;
  emotion: Emotion;
  onAnimationComplete: () => void;
  breathingPhase?: 'inhale' | 'hold' | 'exhale' | null;
}

export function OceanCanvas({ message, emotion, onAnimationComplete, breathingPhase }: OceanCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const theme = getEmotionTheme(emotion);
    const textParticles: TextParticle[] = [];
    const ambientParticles: Particle[] = [];
    const bubbles: Bubble[] = [];
    const fish: Fish[] = [];
    let animationFrame: number;
    let startTime = Date.now();
    const animationDuration = message ? 7000 : 0; // 7 seconds for text animation

    // Calculate breathing intensity based on phase
    const getBreathingIntensity = () => {
      if (breathingPhase === 'inhale') return 1.2;
      if (breathingPhase === 'hold') return 0.3;
      if (breathingPhase === 'exhale') return 0.8;
      return 1;
    };

    // Initialize ambient particles
    for (let i = 0; i < theme.ambientParticleCount; i++) {
      ambientParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2 - 0.1,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.3 + 0.1,
        life: 1
      });
    }

    // Initialize bubbles
    for (let i = 0; i < 15; i++) {
      bubbles.push({
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * 200,
        size: Math.random() * 8 + 3,
        speed: Math.random() * 0.5 + 0.3,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.02 + 0.01
      });
    }

    // Initialize fish if the theme shows fish
    if (theme.showFish) {
      for (let i = 0; i < 3; i++) {
        fish.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height * 0.6 + canvas.height * 0.2,
          speed: (Math.random() * 0.5 + 0.3) * theme.fishSpeed,
          size: Math.random() * 30 + 20,
          direction: Math.random() < 0.5 ? 1 : -1
        });
      }
    }

    // Create text particles from ocean floor
    const createTextParticles = () => {
      if (!message) return;
      
      const centerX = canvas.width / 2;
      const startY = canvas.height * 0.85; // Start near bottom
      
      ctx.font = 'bold 36px sans-serif';
      const chars = message.split('');
      const spacing = 28;
      const totalWidth = chars.length * spacing;
      const startX = centerX - totalWidth / 2;

      chars.forEach((char, index) => {
        if (char.trim()) {
          textParticles.push({
            char,
            x: startX + index * spacing,
            y: startY,
            originalX: startX + index * spacing,
            vx: 0,
            vy: -theme.bubbleSpeed * (0.8 + Math.random() * 0.4),
            size: 36,
            alpha: 1,
            life: 1,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.02,
            targetY: canvas.height * 0.1
          });
        }
      });
    };

    if (message) {
      createTextParticles();
    }

    // Draw light rays from surface
    const drawLightRays = (time: number) => {
      const rayCount = 5;
      const intensity = breathingPhase === 'inhale' ? 1.5 : breathingPhase === 'hold' ? 0.5 : 1;
      
      for (let i = 0; i < rayCount; i++) {
        const x = (canvas.width / rayCount) * i + Math.sin(time / 1000 + i) * 50;
        const gradient = ctx.createLinearGradient(x, 0, x + 100, canvas.height);
        
        const baseColor = theme.lightRayColor.replace(/[\d.]+\\)$/g, `${0.3 * intensity})`);
        gradient.addColorStop(0, baseColor);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 50, 0);
        ctx.lineTo(x + 150, canvas.height);
        ctx.lineTo(x + 100, canvas.height);
        ctx.closePath();
        ctx.fill();
      }
    };

    // Draw ambient particles
    const drawAmbientParticles = () => {
      const speedMultiplier = breathingPhase === 'hold' ? 0.1 : breathingPhase === 'inhale' ? 1.3 : 1;
      
      ambientParticles.forEach(particle => {
        particle.x += particle.vx * speedMultiplier;
        particle.y += particle.vy * speedMultiplier;

        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        ctx.fillStyle = `rgba(255, 255, 255, ${particle.alpha})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    // Draw bubbles
    const drawBubbles = (time: number) => {
      const speedMultiplier = breathingPhase === 'hold' ? 0.2 : breathingPhase === 'exhale' ? 1.2 : 1;
      
      bubbles.forEach(bubble => {
        bubble.y -= bubble.speed * theme.bubbleSpeed * speedMultiplier;
        bubble.wobble += bubble.wobbleSpeed;
        const wobbleX = Math.sin(bubble.wobble) * 10;

        if (bubble.y < -50) {
          bubble.y = canvas.height + 50;
          bubble.x = Math.random() * canvas.width;
        }

        ctx.strokeStyle = `rgba(255, 255, 255, 0.2)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(bubble.x + wobbleX, bubble.y, bubble.size, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = `rgba(255, 255, 255, 0.1)`;
        ctx.beginPath();
        ctx.arc(bubble.x + wobbleX - bubble.size * 0.3, bubble.y - bubble.size * 0.3, bubble.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    // Draw fish
    const drawFish = (time: number) => {
      fish.forEach(f => {
        f.x += f.speed * f.direction;
        
        if (f.direction > 0 && f.x > canvas.width + 100) {
          f.x = -100;
          f.y = Math.random() * canvas.height * 0.6 + canvas.height * 0.2;
        } else if (f.direction < 0 && f.x < -100) {
          f.x = canvas.width + 100;
          f.y = Math.random() * canvas.height * 0.6 + canvas.height * 0.2;
        }

        const sway = Math.sin(time / 200 + f.x / 50) * 5;
        
        ctx.save();
        ctx.translate(f.x, f.y + sway);
        if (f.direction < 0) ctx.scale(-1, 1);
        
        ctx.fillStyle = `rgba(255, 255, 255, 0.15)`;
        ctx.beginPath();
        ctx.ellipse(0, 0, f.size, f.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-f.size, 0);
        ctx.lineTo(-f.size - 15, -10);
        ctx.lineTo(-f.size - 15, 10);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      });
    };

    // Draw text particles
    const drawTextParticles = (elapsedTime: number) => {
      if (!message) return;
      
      const progress = Math.min(elapsedTime / animationDuration, 1);
      const breakApartStart = 0.5;

      textParticles.forEach(particle => {
        particle.y += particle.vy;

        if (progress > breakApartStart) {
          const breakProgress = (progress - breakApartStart) / (1 - breakApartStart);
          particle.alpha = Math.max(0, 1 - breakProgress * 1.5);
          particle.life = particle.alpha;
          
          particle.vx += (Math.random() - 0.5) * theme.particleSpeed * 0.15;
          particle.x += particle.vx;
          particle.rotation += particle.rotationSpeed;
          particle.size = Math.max(particle.size * 0.97, 8);
        } else {
          // Slight wave motion while intact
          particle.x = particle.originalX + Math.sin(elapsedTime / 300 + particle.originalX / 100) * 8;
        }

        if (theme.turbulence > 0) {
          particle.x += Math.sin(elapsedTime / 100 + particle.y / 50) * theme.turbulence * 0.5;
        }

        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        
        ctx.shadowBlur = 20;
        ctx.shadowColor = theme.glowColor;
        
        ctx.fillStyle = theme.textColor;
        ctx.globalAlpha = particle.alpha;
        ctx.font = `bold ${particle.size}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(particle.char, 0, 0);
        
        ctx.restore();
      });
    };

    // Main animation loop
    const animate = () => {
      const elapsedTime = Date.now() - startTime;
      const time = Date.now();

      // Background color with breathing effect
      let bgColor = theme.backgroundColor;
      if (breathingPhase === 'inhale') {
        bgColor = lightenColor(theme.backgroundColor, 1.1);
      } else if (breathingPhase === 'hold') {
        bgColor = lightenColor(theme.backgroundColor, 0.95);
      }

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawLightRays(time);
      drawAmbientParticles();
      drawBubbles(time);
      
      if (theme.showFish) {
        drawFish(time);
      }
      
      if (message) {
        drawTextParticles(elapsedTime);
      }

      // Check if text animation is complete
      if (message && elapsedTime >= animationDuration) {
        setTimeout(() => {
          onAnimationComplete();
        }, 500);
        return;
      }

      animationFrame = requestAnimationFrame(animate);
    };

    // Helper to lighten/darken color
    function lightenColor(color: string, factor: number): string {
      const hex = color.replace('#', '');
      const r = Math.min(255, Math.floor(parseInt(hex.slice(0, 2), 16) * factor));
      const g = Math.min(255, Math.floor(parseInt(hex.slice(2, 4), 16) * factor));
      const b = Math.min(255, Math.floor(parseInt(hex.slice(4, 6), 16) * factor));
      return `rgb(${r}, ${g}, ${b})`;
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, [message, emotion, onAnimationComplete, breathingPhase]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ background: getEmotionTheme(emotion).backgroundColor }}
    />
  );
}