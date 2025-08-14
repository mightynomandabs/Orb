import React from 'react';

const FloatingOrb = ({ color, size, delay }) => {
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

  const getSizeClass = (size) => {
    switch (size) {
      case 'small': return 'w-8 h-8';
      case 'medium': return 'w-12 h-12';
      case 'large': return 'w-16 h-16';
      default: return 'w-10 h-10';
    }
  };

  return (
    <div 
      className={`floating-orb ${getSizeClass(size)}`}
      style={{
        backgroundColor: getOrbColor(color),
        animationDelay: delay,
      }}
    >
      <div className="orb-glow" style={{ backgroundColor: getOrbColor(color) }}></div>
    </div>
  );
};

export default FloatingOrb;