import React, { useState } from 'react';
import { Trash2, Calendar, Clock, Quote } from 'lucide-react';
import { Button } from './ui/button';

const GalleryOrb = ({ orb, onDelete, delay = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const getEmotionEmoji = (emotion) => {
    switch (emotion) {
      case 'joy': return '😊';
      case 'love': return '💖';
      case 'sadness': return '😢';
      case 'anger': return '😠';
      case 'fear': return '😰';
      case 'peace': return '😌';
      default: return '✨';
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this orb?')) {
      setIsDeleting(true);
      
      // Add delay for smooth animation
      setTimeout(() => {
        onDelete(orb.id);
      }, 300);
    }
  };

  const truncateText = (text, maxLength = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div 
      className={`gallery-orb-card ${isDeleting ? 'deleting' : ''}`}
      style={{ 
        animationDelay: `${delay}s`,
        '--orb-color': getOrbColor(orb.color)
      }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="gallery-orb-header">
        <div className="gallery-orb">
          <div className="gallery-orb-core"></div>
          <div className="gallery-orb-glow"></div>
        </div>
        
        <div className="orb-meta">
          <div className="emotion-tag">
            <span className="emotion-emoji">{getEmotionEmoji(orb.emotion)}</span>
            <span className="emotion-name">{orb.emotion}</span>
          </div>
          
          <Button
            onClick={handleDelete}
            variant="ghost"
            size="sm"
            className="delete-button"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      <div className="orb-content">
        <div className="orb-text">
          <Quote className="quote-icon" />
          <p>{isExpanded ? orb.text : truncateText(orb.text)}</p>
          {orb.text.length > 100 && (
            <button className="expand-button">
              {isExpanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
        
        <div className="orb-timestamp">
          <div className="timestamp-item">
            <Calendar size={14} />
            <span>{orb.date}</span>
          </div>
          <div className="timestamp-item">
            <Clock size={14} />
            <span>{orb.time}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryOrb;