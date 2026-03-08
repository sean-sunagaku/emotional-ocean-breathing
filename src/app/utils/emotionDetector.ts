export type Emotion = 'joy' | 'sadness' | 'anger' | 'neutral' | 'love';
export type EmotionSelection = 'auto' | Emotion;

export interface EmotionKeywords {
  [key: string]: string[];
}

const emotionKeywords: EmotionKeywords = {
  joy: [
    'happy', 'joy', 'excited', 'wonderful', 'great', 'amazing', 'fantastic',
    'delighted', 'cheerful', 'glad', 'pleased', 'thrilled', 'celebrate',
    'yay', 'awesome', 'brilliant', 'beautiful', 'sunshine', 'smile', 'laugh',
    'fun', 'party', 'hooray', 'victory', 'perfect', 'excellent',
    '嬉しい', '楽しい', '幸せ', '喜び', '最高', '素晴らしい', '笑顔', '笑う',
    '楽しみ', 'わくわく', 'ワクワク', 'ハッピー', '明るい', '元気'
  ],
  sadness: [
    'sad', 'unhappy', 'depressed', 'miserable', 'lonely', 'empty', 'hurt',
    'tears', 'cry', 'sorrow', 'grief', 'heartbroken', 'down', 'blue',
    'disappointed', 'lost', 'miss', 'goodbye', 'farewell', 'alone',
    'melancholy', 'gloomy', 'dark', 'regret', 'sorry',
    '悲しい', '寂しい', '辛い', '苦しい', '泣く', '涙', '憂鬱', 'さよなら',
    '別れ', '失う', '孤独', '虚しい', '切ない', 'つらい', '寂しさ', '落ち込む'
  ],
  anger: [
    'angry', 'mad', 'furious', 'rage', 'hate', 'annoyed', 'frustrated',
    'irritated', 'upset', 'pissed', 'outraged', 'livid', 'enraged',
    'hostile', 'resentful', 'bitter', 'disgusted', 'fed up', 'stupid',
    'terrible', 'awful', 'horrible', 'worse',
    '怒り', '腹立つ', 'イライラ', 'ムカつく', '許せない', '嫌い', '憎い',
    '不満', '最悪', 'ひどい', 'うざい', '頭にくる', 'むかつく'
  ],
  neutral: [
    'calm', 'peace', 'peaceful', 'serene', 'tranquil', 'relaxed',
    'quiet', 'still', 'rest', 'breathe', 'gentle', 'soft', 'slow',
    'meditation', 'zen', 'balance', 'harmony', 'comfortable', 'content',
    'easy', 'smooth', 'light', 'floating', 'release', 'nature', 'forest',
    '穏やか', '静か', '落ち着く', '平和', '安らぎ', '癒し', '自然', '森',
    'リラックス', 'ゆっくり', 'ゆったり', '呼吸', '深呼吸', '瞑想', '調和'
  ],
  love: [
    'love', 'adore', 'cherish', 'heart', 'sweetheart', 'darling',
    'beloved', 'dear', 'affection', 'caring', 'tender', 'warm',
    'embrace', 'hug', 'kiss', 'forever', 'together', 'soulmate',
    'romantic', 'passion', 'devotion', 'admire', 'appreciate',
    'thankful', 'grateful', 'blessing',
    '愛', '好き', '大好き', '愛してる', '恋', 'ありがとう', '感謝', '優しい',
    '温かい', '抱きしめる', 'ハグ', 'キス', '永遠', '一緒', '大切', '愛情'
  ]
};

export function detectEmotion(text: string): Emotion {
  const lowerText = text.toLowerCase();
  const scores: { [key in Emotion]: number } = {
    joy: 0,
    sadness: 0,
    anger: 0,
    neutral: 0,
    love: 0
  };

  // Count keyword matches for each emotion
  Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
    keywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        scores[emotion as Emotion] += 1;
      }
    });
  });

  // Find the emotion with the highest score
  let maxScore = 0;
  let detectedEmotion: Emotion = 'neutral'; // Default to neutral

  Object.entries(scores).forEach(([emotion, score]) => {
    if (score > maxScore) {
      maxScore = score;
      detectedEmotion = emotion as Emotion;
    }
  });

  return detectedEmotion;
}

export interface EmotionTheme {
  backgroundColor: string;
  environmentType: 'ocean' | 'fire' | 'forest' | 'pink' | 'gradient';
  particleColor: string;
  textColor: string;
  lightRayColor: string;
  glowColor: string;
  bubbleSpeed: number;
  particleSpeed: number;
  particleJitter: number;
  turbulence: number;
  showFish: boolean;
  fishSpeed: number;
  ambientParticleCount: number;
  secondaryColor?: string;
  showEmbers?: boolean;
  showLeaves?: boolean;
  showSparkles?: boolean;
}

export function getEmotionTheme(emotion: Emotion): EmotionTheme {
  const themes: { [key in Emotion]: EmotionTheme } = {
    joy: {
      backgroundColor: '#ff85c8',
      environmentType: 'pink',
      particleColor: '#ffffff',
      textColor: '#ffffff',
      lightRayColor: 'rgba(255, 255, 255, 0.4)',
      glowColor: '#ffb3e6',
      bubbleSpeed: 2.5,
      particleSpeed: 2,
      particleJitter: 0.8,
      turbulence: 0,
      showFish: false,
      fishSpeed: 2,
      ambientParticleCount: 100,
      secondaryColor: '#ff6fb3',
      showSparkles: true
    },
    sadness: {
      backgroundColor: '#0d1b2a',
      environmentType: 'ocean',
      particleColor: '#6b8fa3',
      textColor: '#8ba3b5',
      lightRayColor: 'rgba(100, 120, 150, 0.15)',
      glowColor: '#4a6278',
      bubbleSpeed: 0.8,
      particleSpeed: 0.5,
      particleJitter: 0.1,
      turbulence: 0,
      showFish: false,
      fishSpeed: 0.5,
      ambientParticleCount: 30
    },
    anger: {
      backgroundColor: '#1a0a0f',
      environmentType: 'fire',
      particleColor: '#ff6633',
      textColor: '#ff8866',
      lightRayColor: 'rgba(255, 100, 50, 0.3)',
      glowColor: '#ff4422',
      bubbleSpeed: 2.5,
      particleSpeed: 2,
      particleJitter: 2,
      turbulence: 1.5,
      showFish: false,
      fishSpeed: 3,
      ambientParticleCount: 80,
      secondaryColor: '#cc3300',
      showEmbers: true
    },
    neutral: {
      backgroundColor: '#1a2f1a',
      environmentType: 'forest',
      particleColor: '#88cc88',
      textColor: '#b3d9b3',
      lightRayColor: 'rgba(170, 220, 170, 0.25)',
      glowColor: '#66aa66',
      bubbleSpeed: 1,
      particleSpeed: 0.6,
      particleJitter: 0.3,
      turbulence: 0,
      showFish: false,
      fishSpeed: 1,
      ambientParticleCount: 60,
      secondaryColor: '#2d4d2d',
      showLeaves: true
    },
    love: {
      backgroundColor: '#1a1a3e',
      environmentType: 'gradient',
      particleColor: '#ffb3d9',
      textColor: '#ffe6f2',
      lightRayColor: 'rgba(255, 180, 220, 0.25)',
      glowColor: '#ff88cc',
      bubbleSpeed: 1.2,
      particleSpeed: 0.8,
      particleJitter: 0.3,
      turbulence: 0,
      showFish: false,
      fishSpeed: 1,
      ambientParticleCount: 60,
      secondaryColor: '#2a2a5f'
    }
  };

  return themes[emotion];
}

export const emotionLabels: { [key in Emotion]: string } = {
  joy: '喜び',
  sadness: '悲しみ',
  anger: '怒り',
  neutral: '平静',
  love: '愛'
};

export const emotionIcons: { [key in Emotion]: string } = {
  joy: '✨',
  sadness: '🌊',
  anger: '🔥',
  neutral: '🌿',
  love: '💕'
};
