import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EmotionCanvas } from './components/EmotionCanvas';
import { BreathingGuide } from './components/BreathingGuide';
import { detectEmotion, Emotion, EmotionSelection, emotionLabels, emotionIcons } from './utils/emotionDetector';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';

type AppState = 'input' | 'textAnimation' | 'breathing';

export default function App() {
  const [appState, setAppState] = useState<AppState>('input');
  const [inputText, setInputText] = useState('');
  const [currentMessage, setCurrentMessage] = useState('');
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>('neutral');
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionSelection>('auto');
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale' | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputText.trim()) return;

    // Determine emotion: use selected emotion or auto-detect
    const emotion = selectedEmotion === 'auto' ? detectEmotion(inputText) : selectedEmotion;
    
    setCurrentMessage(inputText);
    setCurrentEmotion(emotion);
    setAppState('textAnimation');
    setInputText('');
  };

  const handleTextAnimationComplete = () => {
    setCurrentMessage('');
    setAppState('breathing');
  };

  const handleBreathingComplete = () => {
    setBreathingPhase(null);
    setAppState('input');
  };

  const handleBreathingPhaseChange = (phase: 'inhale' | 'hold' | 'exhale') => {
    setBreathingPhase(phase);
  };

  const emotions: EmotionSelection[] = ['auto', 'anger', 'neutral', 'sadness', 'joy', 'love'];

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Emotion background - always present */}
      <EmotionCanvas
        message={appState === 'textAnimation' ? currentMessage : ''}
        emotion={currentEmotion}
        onAnimationComplete={handleTextAnimationComplete}
        breathingPhase={appState === 'breathing' ? breathingPhase : null}
      />

      {/* Input UI */}
      <AnimatePresence>
        {appState === 'input' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 z-10 flex flex-col items-center justify-center px-8"
          >
            <div className="max-w-xl w-full space-y-8">
              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-center space-y-3 mb-12"
              >
                <h1 className="text-5xl font-extralight tracking-wide text-white/90">
                  感情の海で呼吸する
                </h1>
                <p className="text-white/50 text-base font-light tracking-wide">
                  あなたの想いを深海へ解き放つ
                </p>
              </motion.div>

              {/* Input form */}
              <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="space-y-6"
              >
                <div className="relative group">
                  <Input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="メッセージを入力してください..."
                    className="w-full px-6 py-6 text-lg bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:bg-white/8 focus:border-white/20 transition-all duration-500 backdrop-blur-md shadow-xl"
                    maxLength={120}
                    autoFocus
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                </div>

                {/* Emotion tabs */}
                <div className="flex flex-wrap justify-center gap-2">
                  {emotions.map((emotion, index) => {
                    const isSelected = selectedEmotion === emotion;
                    const isAuto = emotion === 'auto';
                    const label = isAuto ? '自動' : emotionLabels[emotion as Emotion];
                    const icon = isAuto ? '🤖' : emotionIcons[emotion as Emotion];

                    return (
                      <motion.button
                        key={emotion}
                        type="button"
                        onClick={() => setSelectedEmotion(emotion)}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.05, duration: 0.4 }}
                        className={`
                          relative px-4 py-2.5 rounded-full text-sm font-light tracking-wide
                          backdrop-blur-md transition-all duration-300
                          ${isSelected 
                            ? 'bg-white/20 border-2 border-white/40 text-white shadow-lg scale-105' 
                            : 'bg-white/5 border border-white/15 text-white/60 hover:bg-white/10 hover:border-white/25 hover:text-white/80'
                          }
                        `}
                        whileHover={{ scale: isSelected ? 1.05 : 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-base">{icon}</span>
                          <span>{label}</span>
                        </span>
                        
                        {/* Glow effect for selected */}
                        {isSelected && (
                          <motion.div
                            className="absolute inset-0 rounded-full bg-white/20 blur-md -z-10"
                            animate={{
                              opacity: [0.3, 0.6, 0.3],
                              scale: [1, 1.1, 1]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'easeInOut'
                            }}
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                <Button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="w-full py-5 text-base font-light tracking-widest uppercase bg-white/8 hover:bg-white/15 text-white/90 border border-white/15 rounded-xl backdrop-blur-md shadow-xl transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center justify-center gap-3">
                    <span>解き放つ</span>
                    <motion.span
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      className="text-xl"
                    >
                      ↑
                    </motion.span>
                  </span>
                </Button>
              </motion.form>

              {/* Subtle hint */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="text-center text-white/30 text-xs font-light tracking-wider"
              >
                {selectedEmotion === 'auto' 
                  ? 'AIが感情を自動検出します'
                  : `選択した環境：${emotionLabels[selectedEmotion as Emotion]}`
                }
              </motion.p>
            </div>

            {/* Subtle decorative elements */}
            <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-gradient-radial from-white/5 to-transparent rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-gradient-radial from-blue-400/5 to-transparent rounded-full blur-3xl pointer-events-none" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breathing guide */}
      <AnimatePresence>
        {appState === 'breathing' && (
          <BreathingGuide
            onComplete={handleBreathingComplete}
            onPhaseChange={handleBreathingPhaseChange}
          />
        )}
      </AnimatePresence>

      {/* Wabi-sabi texture overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-30 mix-blend-overlay">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent" />
      </div>
    </div>
  );
}
