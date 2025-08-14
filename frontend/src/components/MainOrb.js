import React, { useState, useEffect } from 'react';

const MainOrb = ({ color }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [touches, setTouches] = useState([]);

  const getOrbColor = (color) => {
    switch (color) {
      case 'pink': return '#ff6b9d';
      case 'blue': return '#4a9eff';
      case 'cyan': return '#00f5ff';
      case 'purple': return '#b644ff';
      case 'golden': return '#ffb000';
      case 'green': return '#00ff88';
      case 'red': return '#ff4757';
      case 'gray': return '#6c757d';
      default: return '#ffb000';
    }
  };

  const playHoverSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create a more pleasant hover sound
      oscillator.frequency.setValueAtTime(440 + (clickCount * 50), audioContext.currentTime);
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.03, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.4);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  const playClickSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // More dynamic click sound based on click count
      const frequency = 523.25 + (clickCount * 25);
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'triangle';
      gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    playHoverSound();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleClick = (e) => {
    setIsClicked(true);
    setClickCount(prev => prev + 1);
    playClickSound();
    
    // Add click ripple effect
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    e.currentTarget.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
    
    setTimeout(() => {
      setIsClicked(false);
    }, 200);
    
    // Haptic feedback for mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const handleTouchStart = (e) => {
    const newTouches = Array.from(e.touches).map(touch => ({
      id: touch.identifier,
      x: touch.clientX,
      y: touch.clientY
    }));
    setTouches(newTouches);
    
    // Multi-touch effects
    if (newTouches.length > 1) {
      setClickCount(prev => prev + newTouches.length);
    }
  };

  const handleTouchEnd = () => {
    setTouches([]);
  };

  useEffect(() => {
    // Reset click count after some time
    if (clickCount > 0) {
      const timer = setTimeout(() => {
        setClickCount(0);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [clickCount]);

  // Generate dynamic particle positions based on interactions
  const generateParticles = () => {
    const particleCount = Math.min(clickCount * 2, 20);
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      angle: (360 / particleCount) * i,
      delay: i * 0.1,
      size: Math.random() * 3 + 1
    }));
  };

  const particles = generateParticles();

  return (
    <div 
      className={`main-orb enhanced ${isHovered ? 'hovered' : ''} ${isClicked ? 'clicked' : ''}`}
      style={{ 
        '--orb-color': getOrbColor(color),
        '--click-intensity': Math.min(clickCount / 10, 1),
        '--touch-count': touches.length
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Core orb with enhanced effects */}
      <div className="orb-core enhanced">
        <div className="orb-inner-glow"></div>
        <div className="orb-highlight"></div>
      </div>
      
      {/* Multiple glow rings for depth */}
      <div className="orb-glow-ring primary"></div>
      <div className="orb-glow-ring secondary"></div>
      <div className="orb-pulse-ring"></div>
      
      {/* Dynamic particle system */}
      <div className="orb-particles">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="orb-particle"
            style={{
              '--particle-angle': `${particle.angle}deg`,
              '--particle-delay': `${particle.delay}s`,
              '--particle-size': `${particle.size}px`,
              animationDuration: `${2 + Math.random()}s`
            }}
          />
        ))}
      </div>
      
      {/* Extra interaction effects */}
      {clickCount > 5 && <div className="orb-extra-glow"></div>}
      {clickCount > 10 && <div className="orb-extra-glow-2"></div>}
      {clickCount > 15 && <div className="orb-corona"></div>}
      
      {/* Touch indicators for multi-touch */}
      {touches.map(touch => (
        <div
          key={touch.id}
          className="touch-indicator"
          style={{
            left: touch.x,
            top: touch.y
          }}
        />
      ))}
    </div>
  );
};

export default MainOrb;