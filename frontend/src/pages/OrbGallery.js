import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmotion } from '../context/EmotionContext';
import Navigation from '../components/Navigation';
import GalleryOrb from '../components/GalleryOrb';
import { Button } from '../components/ui/button';
import { Trash2, Heart, Sparkles } from 'lucide-react';

const OrbGallery = () => {
  const navigate = useNavigate();
  const { orbHistory, clearHistory, deleteOrb } = useEmotion();
  const [selectedEmotion, setSelectedEmotion] = useState('all');

  const emotionTypes = ['all', 'joy', 'love', 'sadness', 'anger', 'fear', 'peace', 'neutral'];
  
  const filteredOrbs = selectedEmotion === 'all' 
    ? orbHistory 
    : orbHistory.filter(orb => orb.emotion === selectedEmotion);

  const getEmotionStats = () => {
    const stats = {};
    orbHistory.forEach(orb => {
      stats[orb.emotion] = (stats[orb.emotion] || 0) + 1;
    });
    return stats;
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all your orbs? This cannot be undone.')) {
      clearHistory();
    }
  };

  const stats = getEmotionStats();

  return (
    <div className="orb-gallery-page page-transition">
      <Navigation />
      
      <div className="content-container">
        <header className="header fade-in">
          <div className="title-container">
            <Sparkles className="title-icon" />
            <h1 className="title">Your Orb Gallery</h1>
          </div>
          <p className="subtitle">A collection of your emotional journey</p>
        </header>

        {orbHistory.length === 0 ? (
          <div className="empty-gallery">
            <div className="empty-icon">
              <Heart size={64} />
            </div>
            <h2>No orbs created yet</h2>
            <p>Start by sharing your emotions and creating your first orb!</p>
            <Button 
              onClick={() => navigate('/')}
              className="create-first-button"
            >
              Create Your First Orb
            </Button>
          </div>
        ) : (
          <>
            {/* Stats Section */}
            <div className="gallery-stats fade-in-delay">
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-number">{orbHistory.length}</span>
                  <span className="stat-label">Total Orbs</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{Object.keys(stats).length}</span>
                  <span className="stat-label">Emotions</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {Math.max(...Object.values(stats))}
                  </span>
                  <span className="stat-label">Most Felt</span>
                </div>
              </div>
            </div>

            {/* Filter Section */}
            <div className="filter-section fade-in-delay">
              <div className="filter-buttons">
                {emotionTypes.map(emotion => (
                  <button
                    key={emotion}
                    onClick={() => setSelectedEmotion(emotion)}
                    className={`filter-button ${selectedEmotion === emotion ? 'active' : ''}`}
                  >
                    {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                    {emotion !== 'all' && stats[emotion] && (
                      <span className="filter-count">{stats[emotion]}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Gallery Grid */}
            <div className="gallery-grid fade-in-delay">
              {filteredOrbs.map((orb, index) => (
                <GalleryOrb 
                  key={orb.id} 
                  orb={orb} 
                  onDelete={deleteOrb}
                  delay={index * 0.1}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="gallery-actions fade-in-delay">
              <Button 
                onClick={() => navigate('/')}
                className="create-new-button"
                size="lg"
              >
                <Sparkles className="button-icon" />
                Create New Orb
              </Button>
              
              <Button 
                onClick={handleClearAll}
                variant="outline"
                className="clear-button"
                size="sm"
              >
                <Trash2 className="button-icon" />
                Clear All
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrbGallery;