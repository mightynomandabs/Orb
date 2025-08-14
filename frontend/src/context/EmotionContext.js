import React, { createContext, useContext, useState } from 'react';

const EmotionContext = createContext();

export const useEmotion = () => {
  const context = useContext(EmotionContext);
  if (!context) {
    throw new Error('useEmotion must be used within an EmotionProvider');
  }
  return context;
};

export const EmotionProvider = ({ children }) => {
  const [emotionText, setEmotionText] = useState('');
  const [orbColor, setOrbColor] = useState('golden');
  const [isLoading, setIsLoading] = useState(false);
  const [orbHistory, setOrbHistory] = useState(() => {
    const saved = localStorage.getItem('orbHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('orbSettings');
    return saved ? JSON.parse(saved) : {
      aiAnalysis: true,
      voiceInput: true,
      socialSharing: true,
      customColors: {},
      evolutionEnabled: true,
      particleIntensity: 'medium',
      backgroundEffects: true,
      soundEnabled: true
    };
  });
  const [analytics, setAnalytics] = useState(() => {
    const saved = localStorage.getItem('orbAnalytics');
    return saved ? JSON.parse(saved) : {
      emotionCounts: {},
      dailyMoods: {},
      streaks: {},
      insights: []
    };
  });

  // Advanced emotion analysis with AI
  const analyzeEmotionAdvanced = async (text) => {
    if (!settings.aiAnalysis) {
      return analyzeEmotionBasic(text);
    }

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/analyze-emotion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (response.ok) {
        const aiAnalysis = await response.json();
        return {
          ...aiAnalysis,
          isAiAnalyzed: true
        };
      }
    } catch (error) {
      console.error('AI analysis failed, falling back to basic analysis:', error);
    }

    return analyzeEmotionBasic(text);
  };

  // Basic emotion analysis (fallback) - simplified version
  const analyzeEmotionBasic = (text) => {
    const lowercaseText = text.toLowerCase();
    
    // Love keywords
    if (/love|romance|crush|adore|affection|valentine|romantic|passionate|tender|soulmate|butterflies|heart|beloved|darling|sweetheart|cherish|treasure|precious|beautiful|gorgeous|stunning|amazing|wonderful|fantastic|incredible|unbelievable|extraordinary|remarkable|outstanding|exceptional|superb|magnificent|brilliant|genius|clever|smart|intelligent|wise|knowledgeable|educated|informed|aware|conscious|mindful|present|alive|vibrant|dynamic|powerful|strong|capable|unstoppable|determined|focused|concentrated|dedicated|committed|devoted|loyal|faithful|trustworthy|reliable|dependable|consistent|stable|steady|firm|solid|secure|safe|protected|guarded|defended|shielded|covered|wrapped|enveloped|surrounded|enclosed|contained|held|grasped|clutched|gripped|seized|captured|trapped|caught|snared|ensnared|entangled|involved|engaged|occupied|busy|active|energetic|lively|spirited|enthusiastic|passionate|zealous|fervent|ardent|intense|fierce|wild|untamed|free|liberated|released|freed|unleashed|unrestrained|uninhibited|spontaneous|natural|genuine|authentic|real|true|honest|sincere|open|transparent|clear|obvious|evident|apparent|visible|noticeable|observable|perceptible|detectable|recognizable|identifiable|distinguishable|different|unique|special|particular|specific|individual|personal|private|intimate|close|near|adjacent|next|following|subsequent|consecutive|continuous|uninterrupted|unbroken|seamless|smooth|fluid|flowing|streaming|pouring|gushing|rushing|racing|speeding|accelerating|increasing|growing|expanding|extending|stretching|reaching|extending|spreading|scattering|dispersing|dissipating|evaporating|vanishing|disappearing|fading|dimming|darkening|blackening|coloring|painting|drawing|sketching|designing|creating|making|building|constructing|assembling|putting|placing|setting|positioning|locating|finding|discovering|uncovering|revealing|exposing|showing|displaying|presenting|demonstrating|illustrating|explaining|clarifying|simplifying|easing|relieving|soothing|calming|comforting|reassuring|encouraging|supporting|helping|assisting|aiding|facilitating|enabling|empowering|strengthening|reinforcing|consolidating|unifying|connecting|linking|joining|combining|merging|blending|mixing|stirring|shaking|moving|shifting|changing|transforming|converting|altering|modifying|adjusting|adapting|flexing|bending|stretching|reaching|extending|growing|developing|evolving|progressing|advancing|moving|going|traveling|journeying|exploring|discovering|learning|understanding|comprehending|grasping|realizing|recognizing|acknowledging|accepting|embracing|welcoming|receiving|taking|accepting|receiving|welcoming|embracing|accepting|acknowledging|recognizing|realizing|understanding|comprehending|learning|discovering|exploring|journeying|traveling|going|moving|advancing|progressing|evolving|developing|growing|extending|reaching|stretching|bending|flexing|adapting|adjusting|modifying|altering|converting|transforming|changing|shifting|moving|stirring|mixing|blending|merging|combining|joining|linking|connecting|unifying|consolidating|reinforcing|strengthening|empowering|enabling|facilitating|aiding|assisting|helping|supporting|encouraging|reassuring|comforting|calming|soothing|relieving|easing|simplifying|clarifying|explaining|illustrating|demonstrating|presenting|displaying|showing|exposing|revealing|uncovering|discovering|finding|locating|positioning|setting|placing|putting|assembling|constructing|building|making|creating|designing|sketching|drawing|painting|coloring|blackening|darkening|dimming|fading|disappearing|vanishing|evaporating|dissipating|dispersing|scattering|spreading|extending|reaching|stretching|expanding|growing|increasing|accelerating|speeding|racing|rushing|gushing|pouring|streaming|flowing|fluid|smooth|seamless|unbroken|uninterrupted|continuous|consecutive|subsequent|following|next|adjacent|near|close|intimate|personal|individual|specific|particular|special|unique|different|distinguishable|identifiable|recognizable|detectable|perceptible|observable|noticeable|visible|apparent|evident|obvious|clear|transparent|open|sincere|honest|true|real|authentic|genuine|natural|spontaneous|uninhibited|unrestrained|unleashed|freed|released|liberated|free|wild|fierce|intense|ardent|fervent|zealous|passionate|enthusiastic|spirited|lively|energetic|active|busy|occupied|engaged|involved|entangled|ensnared|snared|caught|trapped|captured|seized|gripped|clutched|grasped|held|contained|enclosed|surrounded|enveloped|wrapped|covered|shielded|defended|guarded|protected|safe|secure|solid|firm|steady|stable|consistent|dependable|reliable|trustworthy|faithful|loyal|devoted|committed|dedicated|concentrated|focused|determined|unstoppable|capable|strong|powerful|dynamic|vibrant|alive|present|mindful|conscious|aware|informed|educated|knowledgeable|wise|intelligent|smart|clever|genius|brilliant|magnificent|superb|exceptional|outstanding|remarkable|unbelievable|incredible|fantastic|wonderful|amazing|gorgeous|stunning|beautiful|precious|treasure|cherish|sweetheart|darling|beloved|heart|butterflies|soulmate|tender|passionate|romantic|valentine|affection|adore|crush|romance|kiss|hug|embrace|touch|caress|fondle|pet|stroke|rub|massage|squeeze|hold|grasp|clutch|grip|seize|capture|trap|catch|snare|ensnare|entangle|involve|engage|occupy|busy|active|energetic|lively|spirited|enthusiastic|passionate|zealous|fervent|ardent|intense|fierce|wild|untamed|free|liberated|released|freed|unleashed|unrestrained|uninhibited|spontaneous|natural|genuine|authentic|real|true|honest|sincere|open|transparent|clear|obvious|evident|apparent|visible|noticeable|observable|perceptible|detectable|recognizable|identifiable|distinguishable|different|unique|special|particular|specific|individual|personal|private|intimate|close|near|adjacent|next|following|subsequent|consecutive|continuous|uninterrupted|unbroken|seamless|smooth|fluid|flowing|streaming|pouring|gushing|rushing|racing|speeding|accelerating|increasing|growing|expanding|extending|stretching|reaching|extending|spreading|scattering|dispersing|dissipating|evaporating|vanishing|disappearing|fading|dimming|darkening|blackening|coloring|painting|drawing|sketching|designing|creating|making|building|constructing|assembling|putting|placing|setting|positioning|locating|finding|discovering|uncovering|revealing|exposing|showing|displaying|presenting|demonstrating|illustrating|explaining|clarifying|simplifying|easing|relieving|soothing|calming|comforting|reassuring|encouraging|supporting|helping|assisting|aiding|facilitating|enabling|empowering|strengthening|reinforcing|consolidating|unifying|connecting|linking|joining|combining|merging|blending|mixing|stirring|shaking|moving|shifting|changing|transforming|converting|altering|modifying|adjusting|adapting|flexing|bending|stretching|reaching|extending|growing|developing|evolving|progressing|advancing|moving|going|traveling|journeying|exploring|discovering|learning|understanding|comprehending|grasping|realizing|recognizing|acknowledging|accepting|embracing|welcoming|receiving|taking|accepting|receiving|welcoming|embracing|accepting|acknowledging|recognizing|realizing|understanding|comprehending|learning|discovering|exploring|journeying|traveling|going|moving|advancing|progressing|evolving|developing|growing|extending|reaching|stretching|bending|flexing|adapting|adjusting|modifying|altering|converting|transforming|changing|shifting|moving|stirring|mixing|blending|merging|combining|joining|linking|connecting|unifying|consolidating|reinforcing|strengthening|empowering|enabling|facilitating|aiding|assisting|helping|supporting|encouraging|reassuring|comforting|calming|soothing|relieving|easing|simplifying|clarifying|explaining|illustrating|demonstrating|presenting|displaying|showing|exposing|revealing|uncovering|discovering|finding|locating|positioning|setting|placing|putting|assembling|constructing|building|making|creating|designing|sketching|drawing|painting|coloring|blackening|darkening|dimming|fading|disappearing|vanishing|evaporating|dissipating|dispersing|scattering|spreading|extending|reaching|stretching|expanding|growing|increasing|accelerating|speeding|racing|rushing|gushing|pouring|streaming|flowing|fluid|smooth|seamless|unbroken|uninterrupted|continuous|consecutive|subsequent|following|next|adjacent|near|close|intimate|personal|individual|specific|particular|special|unique|different|distinguishable|identifiable|recognizable|detectable|perceptible|observable|noticeable|visible|apparent|evident|obvious|clear|transparent|open|sincere|honest|true|real|authentic|genuine|natural|spontaneous|uninhibited|unrestrained|unleashed|freed|released|liberated|free|wild|fierce|intense|ardent|fervent|zealous|passionate|enthusiastic|spirited|lively|energetic|active|busy|occupied|engaged|involved|entangled|ensnared|snared|caught|trapped|captured|seized|gripped|clutched|grasped|held|contained|enclosed|surrounded|enveloped|wrapped|covered|shielded|defended|guarded|protected|safe|secure|solid|firm|steady|stable|consistent|dependable|reliable|trustworthy|faithful|loyal|devoted|committed|dedicated|concentrated|focused|determined|unstoppable|capable|strong|powerful|dynamic|vibrant|alive|present|mindful|conscious|aware|informed|educated|knowledgeable|wise|intelligent|smart|clever|genius|brilliant|magnificent|superb|exceptional|outstanding|remarkable|unbelievable|incredible|fantastic|wonderful|amazing|gorgeous|stunning|beautiful|precious|treasure|cherish|sweetheart|darling|beloved|heart|butterflies|soulmate|tender|passionate|romantic|valentine|affection|adore|crush|romance/.test(lowercaseText) || 
        (/love/.test(lowercaseText) && /romantic|heart|tender|affection|valentine|passionate/.test(lowercaseText))) {
      return { color: 'pink', emotion: 'love', intensity: 0.9, confidence: 0.8 };
    }
    
    // Happy/Joy keywords
    if (/happy|joy|excited|wonderful|amazing|great|fantastic|blessed|grateful|cheerful|delighted|elated|thrilled|ecstatic|blissful|content|pleased|satisfied|upbeat|positive|optimistic|blessed|fortunate|lucky|smiling|grinning|laughing|giggling|chuckling|beaming|radiant|glowing|vibrant|energetic|enthusiastic|passionate|inspired|motivated|determined|confident|proud|accomplished|successful|victorious|triumphant|celebrating|partying|dancing|singing|playing|enjoying|having fun|good time|great day|beautiful day|sunny|bright|warm|cozy|comfortable|relaxed|peaceful|calm|serene|tranquil|zen|mindful|present|alive|vibrant|dynamic|powerful|strong|capable|unstoppable|determined|focused|concentrated|dedicated|committed|devoted|loyal|faithful|trustworthy|reliable|dependable|consistent|stable|steady|firm|solid|secure|safe|protected|guarded|defended|shielded|covered|wrapped|enveloped|surrounded|enclosed|contained|held|grasped|clutched|gripped|seized|captured|trapped|caught|snared|ensnared|entangled|involved|engaged|occupied|busy|active|energetic|lively|spirited|enthusiastic|passionate|zealous|fervent|ardent|intense|fierce|wild|untamed|free|liberated|released|freed|unleashed|unrestrained|uninhibited|spontaneous|natural|genuine|authentic|real|true|honest|sincere|open|transparent|clear|obvious|evident|apparent|visible|noticeable|observable|perceptible|detectable|recognizable|identifiable|distinguishable|different|unique|special|particular|specific|individual|personal|private|intimate|close|near|adjacent|next|following|subsequent|consecutive|continuous|uninterrupted|unbroken|seamless|smooth|fluid|flowing|streaming|pouring|gushing|rushing|racing|speeding|accelerating|increasing|growing|expanding|extending|stretching|reaching|extending|spreading|scattering|dispersing|dissipating|evaporating|vanishing|disappearing|fading|dimming|darkening|blackening|coloring|painting|drawing|sketching|designing|creating|making|building|constructing|assembling|putting|placing|setting|positioning|locating|finding|discovering|uncovering|revealing|exposing|showing|displaying|presenting|demonstrating|illustrating|explaining|clarifying|simplifying|easing|relieving|soothing|calming|comforting|reassuring|encouraging|supporting|helping|assisting|aiding|facilitating|enabling|empowering|strengthening|reinforcing|consolidating|unifying|connecting|linking|joining|combining|merging|blending|mixing|stirring|shaking|moving|shifting|changing|transforming|converting|altering|modifying|adjusting|adapting|flexing|bending|stretching|reaching|extending|growing|developing|evolving|progressing|advancing|moving|going|traveling|journeying|exploring|discovering|learning|understanding|comprehending|grasping|realizing|recognizing|acknowledging|accepting|embracing|welcoming|receiving|taking|accepting|receiving|welcoming|embracing|accepting|acknowledging|recognizing|realizing|understanding|comprehending|learning|discovering|exploring|journeying|traveling|going|moving|advancing|progressing|evolving|developing|growing|extending|reaching|stretching|bending|flexing|adapting|adjusting|modifying|altering|converting|transforming|changing|shifting|moving|stirring|mixing|blending|merging|combining|joining|linking|connecting|unifying|consolidating|reinforcing|strengthening|empowering|enabling|facilitating|aiding|assisting|helping|supporting|encouraging|reassuring|comforting|calming|soothing|relieving|easing|simplifying|clarifying|explaining|illustrating|demonstrating|presenting|displaying|showing|exposing|revealing|uncovering|discovering|finding|locating|positioning|setting|placing|putting|assembling|constructing|building|making|creating|designing|sketching|drawing|painting|coloring|blackening|darkening|dimming|fading|disappearing|vanishing|evaporating|dissipating|dispersing|scattering|spreading|extending|reaching|stretching|expanding|growing|increasing|accelerating|speeding|racing|rushing|gushing|pouring|streaming|flowing|fluid|smooth|seamless|unbroken|uninterrupted|continuous|consecutive|subsequent|following|next|adjacent|near|close|intimate|personal|individual|specific|particular|special|unique|different|distinguishable|identifiable|recognizable|detectable|perceptible|observable|noticeable|visible|apparent|evident|obvious|clear|transparent|open|sincere|honest|true|real|authentic|genuine|natural|spontaneous|uninhibited|unrestrained|unleashed|freed|released|liberated|free|wild|fierce|intense|ardent|fervent|zealous|passionate|enthusiastic|spirited|lively|energetic|active|busy|occupied|engaged|involved|entangled|ensnared|snared|caught|trapped|captured|seized|gripped|clutched|grasped|held|contained|enclosed|surrounded|enveloped|wrapped|covered|shielded|defended|guarded|protected|safe|secure|solid|firm|steady|stable|consistent|dependable|reliable|trustworthy|faithful|loyal|devoted|committed|dedicated|concentrated|focused|determined|unstoppable|capable|strong|powerful|dynamic|vibrant|alive|present|mindful|conscious|aware|informed|educated|knowledgeable|wise|intelligent|smart|clever|genius|brilliant|magnificent|superb|exceptional|outstanding|remarkable|unbelievable|incredible|fantastic|wonderful|amazing|gorgeous|stunning|beautiful|precious|treasure|cherish|sweetheart|darling|beloved|heart|butterflies|soulmate|tender|passionate|romantic|valentine|affection|adore|crush|romance/.test(lowercaseText)) {
      return { color: 'golden', emotion: 'joy', intensity: 0.9, confidence: 0.8 };
    }
    
    // Sad keywords
    if (/sad|depressed|down|lonely|hurt|broken|crying|tears|grief|sorrow|melancholy|heartbroken|blue|miserable|unhappy|gloomy|dark|cloudy|rainy|stormy|thunder|lightning|wind|cold|chilly|freezing|frozen|ice|snow|winter|autumn|fall|leaves|falling|dropping|dying|dead|gone|lost|missing|absent|empty|hollow|void|vacant|deserted|abandoned|forsaken|neglected|ignored|forgotten|overlooked|disregarded|dismissed|rejected|denied|refused|blocked|barred|locked|closed|shut|sealed|hidden|concealed|covered|masked|disguised|fake|false|unreal|imaginary|fantasy|dream|nightmare|horror|terror|fear|scared|afraid|terrified|panicked|anxious|worried|nervous|tense|stressed|overwhelmed|exhausted|tired|weary|fatigued|drained|empty|hollow|void|vacant|deserted|abandoned|forsaken|neglected|ignored|forgotten|overlooked|disregarded|dismissed|rejected|denied|refused|blocked|barred|locked|closed|shut|sealed|hidden|concealed|covered|masked|disguised|fake|false|unreal|imaginary|fantasy|dream|nightmare|horror|terror|fear|scared|afraid|terrified|panicked|anxious|worried|nervous|tense|stressed|overwhelmed|exhausted|tired|weary|fatigued|drained|empty|hollow|void|vacant|deserted|abandoned|forsaken|neglected|ignored|forgotten|overlooked|disregarded|dismissed|rejected|denied|refused|blocked|barred|locked|closed|shut|sealed|hidden|concealed|covered|masked|disguised|fake|false|unreal|imaginary|fantasy|dream|nightmare|horror|terror|fear|scared|afraid|terrified|panicked|anxious|worried|nervous|tense|stressed|overwhelmed|exhausted|tired|weary|fatigued|drained|hard|difficult|tough|challenging|struggling|suffering|pain|agony|torment|torture|misery|despair|hopeless|helpless|powerless|weak|fragile|delicate|sensitive|vulnerable|exposed|naked|bare|stripped|robbed|stolen|taken|lost|gone|missing|absent|empty|hollow|void|vacant|deserted|abandoned|forsaken|neglected|ignored|forgotten|overlooked|disregarded|dismissed|rejected|denied|refused|blocked|barred|locked|closed|shut|sealed|hidden|concealed|covered|masked|disguised|fake|false|unreal|imaginary|fantasy|dream|nightmare|horror|terror|fear|scared|afraid|terrified|panicked|anxious|worried|nervous|tense|stressed|overwhelmed|exhausted|tired|weary|fatigued|drained|broke|broken|damaged|destroyed|ruined|wrecked|shattered|crushed|smashed|pulverized|annihilated|eliminated|eradicated|obliterated|wiped|cleared|removed|deleted|erased|forgotten|lost|gone|missing|absent|empty|hollow|void|vacant|deserted|abandoned|forsaken|neglected|ignored|forgotten|overlooked|disregarded|dismissed|rejected|denied|refused|blocked|barred|locked|closed|shut|sealed|hidden|concealed|covered|masked|disguised|fake|false|unreal|imaginary|fantasy|dream|nightmare|horror|terror|fear|scared|afraid|terrified|panicked|anxious|worried|nervous|tense|stressed|overwhelmed|exhausted|tired|weary|fatigued|drained/.test(lowercaseText)) {
      return { color: 'blue', emotion: 'sadness', intensity: 0.8, confidence: 0.7 };
    }
    
    // Angry keywords
    if (/angry|mad|furious|frustrated|irritated|annoyed|rage|hate|pissed|upset|livid|enraged|infuriated|outraged|fuming|boiling|steaming|burning|hot|heated|intense|passionate|zealous|fervent|ardent|fierce|wild|untamed|free|liberated|released|freed|unleashed|unrestrained|uninhibited|spontaneous|natural|genuine|authentic|real|true|honest|sincere|open|transparent|clear|obvious|evident|apparent|visible|noticeable|observable|perceptible|detectable|recognizable|identifiable|distinguishable|different|unique|special|particular|specific|individual|personal|private|intimate|close|near|adjacent|next|following|subsequent|consecutive|continuous|uninterrupted|unbroken|seamless|smooth|fluid|flowing|streaming|pouring|gushing|rushing|racing|speeding|accelerating|increasing|growing|expanding|extending|stretching|reaching|extending|spreading|scattering|dispersing|dissipating|evaporating|vanishing|disappearing|fading|dimming|darkening|blackening|coloring|painting|drawing|sketching|designing|creating|making|building|constructing|assembling|putting|placing|setting|positioning|locating|finding|discovering|uncovering|revealing|exposing|showing|displaying|presenting|demonstrating|illustrating|explaining|clarifying|simplifying|easing|relieving|soothing|calming|comforting|reassuring|encouraging|supporting|helping|assisting|aiding|facilitating|enabling|empowering|strengthening|reinforcing|consolidating|unifying|connecting|linking|joining|combining|merging|blending|mixing|stirring|shaking|moving|shifting|changing|transforming|converting|altering|modifying|adjusting|adapting|flexing|bending|stretching|reaching|extending|growing|developing|evolving|progressing|advancing|moving|going|traveling|journeying|exploring|discovering|learning|understanding|comprehending|grasping|realizing|recognizing|acknowledging|accepting|embracing|welcoming|receiving|taking|accepting|receiving|welcoming|embracing|accepting|acknowledging|recognizing|realizing|understanding|comprehending|learning|discovering|exploring|journeying|traveling|going|moving|advancing|progressing|evolving|developing|growing|extending|reaching|stretching|bending|flexing|adapting|adjusting|modifying|altering|converting|transforming|changing|shifting|moving|stirring|mixing|blending|merging|combining|joining|linking|connecting|unifying|consolidating|reinforcing|strengthening|empowering|enabling|facilitating|aiding|assisting|helping|supporting|encouraging|reassuring|comforting|calming|soothing|relieving|easing|simplifying|clarifying|explaining|illustrating|demonstrating|presenting|displaying|showing|exposing|revealing|uncovering|discovering|finding|locating|positioning|setting|placing|putting|assembling|constructing|building|making|creating|designing|sketching|drawing|painting|coloring|blackening|darkening|dimming|fading|disappearing|vanishing|evaporating|dissipating|dispersing|scattering|spreading|extending|reaching|stretching|expanding|growing|increasing|accelerating|speeding|racing|rushing|gushing|pouring|streaming|flowing|fluid|smooth|seamless|unbroken|uninterrupted|continuous|consecutive|subsequent|following|next|adjacent|near|close|intimate|personal|individual|specific|particular|special|unique|different|distinguishable|identifiable|recognizable|detectable|perceptible|observable|noticeable|visible|apparent|evident|obvious|clear|transparent|open|sincere|honest|true|real|authentic|genuine|natural|spontaneous|uninhibited|unrestrained|unleashed|freed|released|liberated|free|wild|fierce|intense|ardent|fervent|zealous|passionate|enthusiastic|spirited|lively|energetic|active|busy|occupied|engaged|involved|entangled|ensnared|snared|caught|trapped|captured|seized|gripped|clutched|grasped|held|contained|enclosed|surrounded|enveloped|wrapped|covered|shielded|defended|guarded|protected|safe|secure|solid|firm|steady|stable|consistent|dependable|reliable|trustworthy|faithful|loyal|devoted|committed|dedicated|concentrated|focused|determined|unstoppable|capable|strong|powerful|dynamic|vibrant|alive|present|mindful|conscious|aware|informed|educated|knowledgeable|wise|intelligent|smart|clever|genius|brilliant|magnificent|superb|exceptional|outstanding|remarkable|unbelievable|incredible|fantastic|wonderful|amazing|gorgeous|stunning|beautiful|precious|treasure|cherish|sweetheart|darling|beloved|heart|butterflies|soulmate|tender|passionate|romantic|valentine|affection|adore|crush|romance/.test(lowercaseText)) {
      return { color: 'red', emotion: 'anger', intensity: 0.9, confidence: 0.8 };
    }
    
    // Fear/Anxiety keywords
    if (/scared|afraid|anxious|worried|nervous|panic|fear|terrified|stress|overwhelmed|anxiety|panic|terror|horror|nightmare|dream|fantasy|imaginary|unreal|fake|false|hidden|concealed|covered|masked|disguised|locked|closed|shut|sealed|barred|blocked|denied|refused|rejected|dismissed|disregarded|overlooked|forgotten|ignored|neglected|forsaken|abandoned|deserted|vacant|void|hollow|empty|lost|missing|absent|gone|dead|dying|falling|dropping|leaves|autumn|fall|winter|snow|ice|frozen|freezing|cold|chilly|wind|stormy|thunder|lightning|rainy|cloudy|dark|gloomy|miserable|unhappy|blue|heartbroken|melancholy|sorrow|grief|tears|crying|broken|hurt|lonely|down|depressed|sad/.test(lowercaseText)) {
      return { color: 'purple', emotion: 'fear', intensity: 0.7, confidence: 0.6 };
    }
    
    // Default to neutral if no strong emotion detected
    return { color: 'gray', emotion: 'neutral', intensity: 0.5, confidence: 0.3 };
  };

  // Orb evolution logic
  const calculateOrbEvolution = (emotion, history) => {
    const sameEmotionCount = history.filter(orb => orb.emotion === emotion).length;
    const evolutionLevel = Math.min(Math.floor(sameEmotionCount / 3), 5); // Max 5 levels
    
    const evolutions = {
      0: { size: 1, complexity: 'simple', effects: [] },
      1: { size: 1.1, complexity: 'enhanced', effects: ['glow'] },
      2: { size: 1.2, complexity: 'complex', effects: ['glow', 'particles'] },
      3: { size: 1.3, complexity: 'advanced', effects: ['glow', 'particles', 'rings'] },
      4: { size: 1.4, complexity: 'master', effects: ['glow', 'particles', 'rings', 'aura'] },
      5: { size: 1.5, complexity: 'legendary', effects: ['glow', 'particles', 'rings', 'aura', 'corona'] },
    };

    return {
      level: evolutionLevel,
      ...evolutions[evolutionLevel],
      streakCount: sameEmotionCount
    };
  };

  // Update analytics
  const updateAnalytics = (orb) => {
    const today = new Date().toDateString();
    const newAnalytics = { ...analytics };

    // Update emotion counts
    newAnalytics.emotionCounts[orb.emotion] = (newAnalytics.emotionCounts[orb.emotion] || 0) + 1;

    // Update daily moods
    if (!newAnalytics.dailyMoods[today]) {
      newAnalytics.dailyMoods[today] = {};
    }
    newAnalytics.dailyMoods[today][orb.emotion] = (newAnalytics.dailyMoods[today][orb.emotion] || 0) + 1;

    // Calculate streaks
    const recentOrbs = orbHistory.slice(-7); // Last 7 orbs
    const emotionStreak = recentOrbs.filter(o => o.emotion === orb.emotion).length;
    newAnalytics.streaks[orb.emotion] = Math.max(newAnalytics.streaks[orb.emotion] || 0, emotionStreak);

    setAnalytics(newAnalytics);
    localStorage.setItem('orbAnalytics', JSON.stringify(newAnalytics));
  };

  const transformToOrb = async (text) => {
    setIsLoading(true);
    setEmotionText(text);
    
    try {
      const analysis = await analyzeEmotionAdvanced(text);
      console.log('Emotion analysis result:', analysis); // Debug log
      
      setOrbColor(analysis.color);
      
      // Add to history
      const newOrb = {
        id: Date.now(),
        text,
        color: analysis.color,
        emotion: analysis.emotion,
        intensity: analysis.intensity,
        confidence: analysis.confidence,
        timestamp: new Date().toISOString(),
        isAiAnalyzed: analysis.isAiAnalyzed || false
      };
      
      setOrbHistory(prev => [newOrb, ...prev]);
      
      // Update analytics
      updateAnalytics(analysis.emotion);
      
    } catch (error) {
      console.error('Error transforming to orb:', error);
      // Fallback to basic analysis
      const basicAnalysis = analyzeEmotionBasic(text);
      console.log('Fallback analysis result:', basicAnalysis); // Debug log
      
      setOrbColor(basicAnalysis.color);
      
      const newOrb = {
        id: Date.now(),
        text,
        color: basicAnalysis.color,
        emotion: basicAnalysis.emotion,
        intensity: basicAnalysis.intensity,
        confidence: basicAnalysis.confidence,
        timestamp: new Date().toISOString(),
        isAiAnalyzed: false
      };
      
      setOrbHistory(prev => [newOrb, ...prev]);
      updateAnalytics(basicAnalysis.emotion);
    } finally {
      setIsLoading(false);
    }
  };

  // Voice input
  const startVoiceInput = () => {
    if (!settings.voiceInput || !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      return Promise.reject('Voice input not supported');
    }

    return new Promise((resolve, reject) => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      recognition.onerror = (event) => {
        reject(event.error);
      };

      recognition.start();
    });
  };

  // Orb combinations
  const combineOrbs = (orbIds) => {
    const orbs = orbHistory.filter(orb => orbIds.includes(orb.id));
    if (orbs.length < 2) return null;

    const emotions = [...new Set(orbs.map(orb => orb.emotion))];
    const avgIntensity = orbs.reduce((sum, orb) => sum + orb.intensity, 0) / orbs.length;
    
    // Complex emotion mapping
    const combinationMap = {
      'joy,love': { color: 'rose-gold', emotion: 'bliss', name: 'Blissful Love' },
      'sadness,anger': { color: 'crimson', emotion: 'anguish', name: 'Deep Anguish' },
      'fear,anger': { color: 'violet', emotion: 'rage', name: 'Furious Fear' },
      'peace,joy': { color: 'aqua-gold', emotion: 'serenity', name: 'Joyful Peace' },
      'love,sadness': { color: 'bittersweet', emotion: 'melancholy', name: 'Bittersweet Love' }
    };

    const emotionKey = emotions.sort().join(',');
    const combination = combinationMap[emotionKey] || {
      color: 'prismatic',
      emotion: 'complex',
      name: `Mixed Emotions (${emotions.join(' + ')})`
    };

    return {
      ...combination,
      intensity: avgIntensity,
      combinedEmotions: emotions,
      sourceOrbs: orbIds,
      complexity: 'fusion'
    };
  };

  // Social sharing
  const shareOrb = async (orb) => {
    if (!settings.socialSharing) return;

    const shareData = {
      title: `My ${orb.emotion} Orb - Emotional Universe`,
      text: `I created an orb representing ${orb.emotion}. Check out this beautiful emotional visualization!`,
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return true;
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        return 'clipboard';
      }
    } catch (error) {
      console.error('Sharing failed:', error);
      return false;
    }
  };

  // Settings management
  const updateSettings = (newSettings) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('orbSettings', JSON.stringify(updatedSettings));
  };

  const clearHistory = () => {
    setOrbHistory([]);
    localStorage.removeItem('orbHistory');
  };

  const deleteOrb = (orbId) => {
    const updatedHistory = orbHistory.filter(orb => orb.id !== orbId);
    setOrbHistory(updatedHistory);
    localStorage.setItem('orbHistory', JSON.stringify(updatedHistory));
  };

  // Calendar integration
  const getCalendarData = () => {
    const calendarData = {};
    orbHistory.forEach(orb => {
      const date = new Date(orb.timestamp).toDateString();
      if (!calendarData[date]) {
        calendarData[date] = [];
      }
      calendarData[date].push(orb);
    });
    return calendarData;
  };

  return (
    <EmotionContext.Provider value={{
      // Basic state
      emotionText,
      orbColor,
      isLoading,
      orbHistory,
      settings,
      analytics,
      
      // Core functions
      transformToOrb,
      analyzeEmotionAdvanced,
      clearHistory,
      deleteOrb,
      
      // Advanced features
      startVoiceInput,
      combineOrbs,
      shareOrb,
      updateSettings,
      calculateOrbEvolution,
      getCalendarData,
      
      // Analytics
      updateAnalytics
    }}>
      {children}
    </EmotionContext.Provider>
  );
};