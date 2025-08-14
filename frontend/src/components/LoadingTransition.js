import React, { useState, useEffect } from 'react';
import { useEmotion } from '../context/EmotionContext';

const LoadingTransition = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isLoading: emotionLoading } = useEmotion();

  useEffect(() => {
    if (emotionLoading) {
      setIsLoading(true);
    } else {
      // Delay hiding loading to show complete transition
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [emotionLoading]);

  if (!isLoading) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="loading-orb">
          <div className="loading-orb-core"></div>
          <div className="loading-orb-ring"></div>
          <div className="loading-orb-particles">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                className="loading-particle"
                style={{ 
                  animationDelay: `${i * 0.2}s`,
                  transform: `rotate(${i * 45}deg) translateY(-40px)`
                }}
              />
            ))}
          </div>
        </div>
        <div className="loading-text">
          <h3>Transforming your emotions...</h3>
          <p>Creating something magical ✨</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingTransition;