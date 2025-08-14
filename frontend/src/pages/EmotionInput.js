import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmotion } from '../context/EmotionContext';
import FloatingOrb from '../components/FloatingOrb';
import Navigation from '../components/Navigation';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Heart, Star } from 'lucide-react';

const EmotionInput = () => {
  const [inputText, setInputText] = useState('');
  const navigate = useNavigate();
  const { transformToOrb, isLoading } = useEmotion();

  const handleTransform = async () => {
    if (inputText.trim() && !isLoading) {
      await transformToOrb(inputText);
      navigate('/orb');
    }
  };

  const handleInputChange = (e) => {
    const text = e.target.value;
    if (text.length <= 500) {
      setInputText(text);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey && inputText.trim()) {
      handleTransform();
    }
  };

  return (
    <div className="emotion-input-page page-transition">
      {/* Navigation */}
      <Navigation />
      
      {/* Floating Orbs */}
      <div className="floating-orbs">
        <FloatingOrb color="pink" size="small" delay="0s" />
        <FloatingOrb color="blue" size="medium" delay="1s" />
        <FloatingOrb color="cyan" size="small" delay="2s" />
        <FloatingOrb color="purple" size="medium" delay="0.5s" />
        <FloatingOrb color="green" size="small" delay="1.5s" />
      </div>

      <div className="content-container">
        <header className="header fade-in">
          <div className="title-container">
            <Star className="title-icon" />
            <h1 className="title">Orb</h1>
          </div>
          <p className="subtitle">Your Emotional Universe</p>
        </header>

        <main className="main-content fade-in-delay">
          <div className="prompt-section">
            <h2 className="main-prompt">What's weighing on your heart today?</h2>
            <p className="prompt-subtitle">
              <Heart className="inline-icon" />
              Share your feelings and watch them become alive
            </p>
          </div>

          <div className="input-section">
            <div className="textarea-container">
              <Textarea
                value={inputText}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Share what's on your heart..."
                className="emotion-textarea enhanced"
                rows={6}
                disabled={isLoading}
              />
              <div className="character-count">
                <span className={inputText.length > 450 ? 'warning' : ''}>
                  {inputText.length}/500
                </span>
              </div>
            </div>
            
            <div className="input-hint">
              <small>Press Ctrl + Enter to transform quickly</small>
            </div>
          </div>

          <Button 
            onClick={handleTransform}
            disabled={!inputText.trim() || isLoading}
            className="transform-button enhanced"
            size="lg"
          >
            {isLoading ? (
              <div className="loading-content">
                <div className="spinner"></div>
                Transforming...
              </div>
            ) : (
              <>
                <Star className="button-icon" />
                Transform into an Orb
              </>
            )}
          </Button>
        </main>
      </div>
    </div>
  );
};

export default EmotionInput;