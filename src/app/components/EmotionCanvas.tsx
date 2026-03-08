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

interface Ember extends Particle {
  glow: number;
  glowSpeed: number;
}

interface Leaf extends Particle {
  rotation: number;
  rotationSpeed: number;
  swayPhase: number;
}

interface Sparkle extends Particle {
  twinkle: number;
  twinkleSpeed: number;
}

interface EmotionCanvasProps {
  message: string;
  emotion: Emotion;
  onAnimationComplete: () => void;
  breathingPhase?: 'inhale' | 'hold' | 'exhale' | null;
}

export function EmotionCanvas({ message, emotion, onAnimationComplete, breathingPhase }: EmotionCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const theme = getEmotionTheme(emotion);
    const textParticles: TextParticle[] = [];
    const ambientParticles: Particle[] = [];
    const specialParticles: (Ember | Leaf | Sparkle)[] = [];
    let animationFrame: number;
    let startTime = Date.now();
    const animationDuration = message ? 7000 : 0;

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

    // Initialize special particles based on environment
    if (theme.showEmbers) {
      // Fire environment - embers
      for (let i = 0; i < 40; i++) {
        specialParticles.push({
          x: Math.random() * canvas.width,
          y: canvas.height + Math.random() * 200,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -(Math.random() * 1.5 + 0.5),
          size: Math.random() * 4 + 2,
          alpha: Math.random() * 0.8 + 0.2,
          life: 1,
          glow: Math.random() * Math.PI * 2,
          glowSpeed: Math.random() * 0.05 + 0.02
        } as Ember);
      }
    } else if (theme.showLeaves) {
      // Forest environment - leaves
      for (let i = 0; i < 25; i++) {
        specialParticles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height - canvas.height,
          vx: (Math.random() - 0.5) * 0.2,
          vy: Math.random() * 0.3 + 0.1,
          size: Math.random() * 8 + 4,
          alpha: Math.random() * 0.5 + 0.3,
          life: 1,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.03,
          swayPhase: Math.random() * Math.PI * 2
        } as Leaf);
      }
    } else if (theme.showSparkles) {
      // Pink/Joy environment - sparkles
      for (let i = 0; i < 60; i++) {
        specialParticles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 3 + 1,
          alpha: Math.random() * 0.8 + 0.2,
          life: 1,
          twinkle: Math.random() * Math.PI * 2,
          twinkleSpeed: Math.random() * 0.08 + 0.04
        } as Sparkle);
      }
    }

    // Create text particles
    const createTextParticles = () => {
      if (!message) return;
      
      const centerX = canvas.width / 2;
      const startY = canvas.height * 0.85;
      
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

    // Draw background based on environment
    const drawBackground = (time: number) => {
      if (theme.environmentType === 'gradient') {
        // Love - gradient background
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, theme.backgroundColor);
        gradient.addColorStop(1, theme.secondaryColor || '#3a3a7f');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (theme.environmentType === 'fire') {
        // Anger - dark with red gradient at bottom
        const gradient = ctx.createLinearGradient(0, canvas.height * 0.7, 0, canvas.height);
        gradient.addColorStop(0, theme.backgroundColor);
        gradient.addColorStop(1, theme.secondaryColor || '#330000');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (theme.environmentType === 'forest') {
        // Neutral - forest green gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, theme.secondaryColor || '#2d4d2d');
        gradient.addColorStop(1, theme.backgroundColor);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (theme.environmentType === 'pink') {
        // Joy - bright pink
        const gradient = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 2, 0,
          canvas.width / 2, canvas.height / 2, canvas.height
        );
        gradient.addColorStop(0, theme.backgroundColor);
        gradient.addColorStop(1, theme.secondaryColor || '#cc3366');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        // Ocean - solid background
        ctx.fillStyle = theme.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };

    // Draw light rays
    const drawLightRays = (time: number) => {
      const rayCount = theme.environmentType === 'forest' ? 8 : 5;
      const intensity = breathingPhase === 'inhale' ? 1.5 : breathingPhase === 'hold' ? 0.5 : 1;
      
      for (let i = 0; i < rayCount; i++) {
        const x = (canvas.width / rayCount) * i + Math.sin(time / 1000 + i) * 50;
        const gradient = ctx.createLinearGradient(x, 0, x + 100, canvas.height);
        
        const baseColor = theme.lightRayColor.replace(/[\d.]+\)$/g, `${parseFloat(theme.lightRayColor.match(/[\d.]+\)$/)?.[0] || '0.3') * intensity})`);
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
      const speedMultiplier = getBreathingIntensity();
      
      ambientParticles.forEach(particle => {
        particle.x += particle.vx * speedMultiplier;
        particle.y += particle.vy * speedMultiplier;

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

    // Draw special particles (embers, leaves, sparkles)
    const drawSpecialParticles = (time: number) => {
      const speedMultiplier = getBreathingIntensity();
      
      specialParticles.forEach((particle, index) => {
        if (theme.showEmbers) {
          const ember = particle as Ember;
          ember.x += ember.vx * speedMultiplier;
          ember.y += ember.vy * speedMultiplier;
          ember.glow += ember.glowSpeed;

          if (ember.y < -50) {
            ember.y = canvas.height + 50;
            ember.x = Math.random() * canvas.width;
          }

          const glowIntensity = (Math.sin(ember.glow) + 1) / 2;
          ctx.shadowBlur = 20 * glowIntensity;
          ctx.shadowColor = theme.glowColor;
          
          ctx.fillStyle = `rgba(255, ${100 + glowIntensity * 100}, 50, ${ember.alpha})`;
          ctx.beginPath();
          ctx.arc(ember.x, ember.y, ember.size, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.shadowBlur = 0;
        } else if (theme.showLeaves) {
          const leaf = particle as Leaf;
          leaf.x += leaf.vx * speedMultiplier + Math.sin(time / 300 + leaf.swayPhase) * 0.3;
          leaf.y += leaf.vy * speedMultiplier;
          leaf.rotation += leaf.rotationSpeed;

          if (leaf.y > canvas.height + 50) {
            leaf.y = -50;
            leaf.x = Math.random() * canvas.width;
          }

          ctx.save();
          ctx.translate(leaf.x, leaf.y);
          ctx.rotate(leaf.rotation);
          ctx.fillStyle = `rgba(136, 204, 136, ${leaf.alpha})`;
          ctx.beginPath();
          ctx.ellipse(0, 0, leaf.size, leaf.size * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (theme.showSparkles) {
          const sparkle = particle as Sparkle;
          sparkle.x += sparkle.vx * speedMultiplier;
          sparkle.y += sparkle.vy * speedMultiplier;
          sparkle.twinkle += sparkle.twinkleSpeed;

          if (sparkle.x < 0) sparkle.x = canvas.width;
          if (sparkle.x > canvas.width) sparkle.x = 0;
          if (sparkle.y < 0) sparkle.y = canvas.height;
          if (sparkle.y > canvas.height) sparkle.y = 0;

          const twinkleIntensity = (Math.sin(sparkle.twinkle) + 1) / 2;
          ctx.shadowBlur = 15 * twinkleIntensity;
          ctx.shadowColor = '#ffffff';
          
          ctx.fillStyle = `rgba(255, 255, 255, ${sparkle.alpha * twinkleIntensity})`;
          ctx.beginPath();
          ctx.arc(sparkle.x, sparkle.y, sparkle.size, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.shadowBlur = 0;
        }
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

      drawBackground(time);
      drawLightRays(time);
      drawAmbientParticles();
      drawSpecialParticles(time);
      
      if (message) {
        drawTextParticles(elapsedTime);
      }

      if (message && elapsedTime >= animationDuration) {
        setTimeout(() => {
          onAnimationComplete();
        }, 500);
        return;
      }

      animationFrame = requestAnimationFrame(animate);
    };

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
