import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface BreathingGuideProps {
  onComplete: () => void;
  onPhaseChange: (phase: 'inhale' | 'hold' | 'exhale') => void;
}

type BreathPhase = 'inhale' | 'hold' | 'exhale';

interface PhaseConfig {
  name: string;
  duration: number;
  nextPhase: BreathPhase | null;
}

const phases: Record<BreathPhase, PhaseConfig> = {
  inhale: { name: '吸う', duration: 4, nextPhase: 'hold' },
  hold: { name: '止める', duration: 7, nextPhase: 'exhale' },
  exhale: { name: '吐く', duration: 8, nextPhase: null }
};

const TOTAL_CYCLES = 1;

export function BreathingGuide({ onComplete, onPhaseChange }: BreathingGuideProps) {
  const [currentPhase, setCurrentPhase] = useState<BreathPhase>('inhale');
  const [countdown, setCountdown] = useState(4);
  const [currentCycle, setCurrentCycle] = useState(1);

  useEffect(() => {
    onPhaseChange(currentPhase);
    
    const phase = phases[currentPhase];
    setCountdown(phase.duration);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          
          if (phase.nextPhase) {
            setTimeout(() => setCurrentPhase(phase.nextPhase!), 100);
          } else {
            // Exhale phase complete, check if we need another cycle
            if (currentCycle < TOTAL_CYCLES) {
              setTimeout(() => {
                setCurrentCycle(c => c + 1);
                setCurrentPhase('inhale');
              }, 100);
            } else {
              // All cycles complete
              setTimeout(() => onComplete(), 1000);
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentPhase, currentCycle, onPhaseChange, onComplete]);

  const totalDuration = phases[currentPhase].duration;
  const progress = 1 - (countdown / totalDuration);

  // Calculate scale for breathing circle
  const getCircleScale = () => {
    if (currentPhase === 'inhale') {
      return 1 + progress * 0.3;
    } else if (currentPhase === 'exhale') {
      return 1.3 - progress * 0.3;
    }
    return 1.3;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 flex items-center justify-center pointer-events-none z-30"
    >
      <div className="flex flex-col items-center space-y-8">
        {/* Breathing circle */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Outer glow rings */}
          <motion.div
            className="absolute inset-0 rounded-full border border-white/10"
            animate={{
              scale: getCircleScale() * 1.1,
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{
              scale: { duration: totalDuration, ease: 'easeInOut' },
              opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
            }}
          />
          
          <motion.div
            className="absolute inset-0 rounded-full border border-white/5"
            animate={{
              scale: getCircleScale() * 1.2,
              opacity: [0.05, 0.15, 0.05]
            }}
            transition={{
              scale: { duration: totalDuration, ease: 'easeInOut' },
              opacity: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
            }}
          />

          {/* Main breathing circle */}
          <motion.div
            className="absolute inset-8 rounded-full bg-white/5 backdrop-blur-sm border border-white/20 shadow-lg"
            animate={{
              scale: getCircleScale()
            }}
            transition={{
              duration: totalDuration,
              ease: currentPhase === 'inhale' ? 'easeIn' : currentPhase === 'exhale' ? 'easeOut' : 'linear'
            }}
          />

          {/* Progress ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="120"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
            />
            <motion.circle
              cx="50%"
              cy="50%"
              r="120"
              fill="none"
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="1"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 120}
              animate={{ strokeDashoffset: (1 - progress) * 2 * Math.PI * 120 }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </svg>

          {/* Center content */}
          <div className="relative z-10 flex flex-col items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPhase}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                <div className="text-white/70 text-xl font-light tracking-[0.3em] uppercase mb-3">
                  {phases[currentPhase].name}
                </div>
                <div className="text-white/90 text-6xl font-extralight tabular-nums">
                  {countdown}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Cycle indicator */}
        <div className="flex items-center space-x-6 mt-4">
          {[...Array(TOTAL_CYCLES)].map((_, i) => (
            <motion.div
              key={i}
              className="relative"
              animate={{
                scale: currentCycle === i + 1 ? 1 : 0.7,
                opacity: currentCycle > i ? 1 : currentCycle === i + 1 ? 1 : 0.3
              }}
              transition={{ duration: 0.4 }}
            >
              <div className="w-2 h-2 rounded-full bg-white" />
              {currentCycle === i + 1 && (
                <motion.div
                  className="absolute inset-0 w-2 h-2 rounded-full bg-white"
                  animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Phase dots */}
        <div className="flex items-center space-x-2 opacity-40">
          {(['inhale', 'hold', 'exhale'] as BreathPhase[]).map((phase) => (
            <motion.div
              key={phase}
              className="w-1 h-1 rounded-full bg-white"
              animate={{
                opacity: currentPhase === phase ? 1 : 0.3,
                scale: currentPhase === phase ? 1.5 : 1
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}