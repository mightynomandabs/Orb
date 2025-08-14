import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { 
  Home, 
  Image, 
  Star, 
  BookOpen, 
  Zap, 
  Palette 
} from 'lucide-react';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="app-navigation">
      <div className="nav-content">
        <div className="nav-logo">
          <Star className="nav-icon" />
          <span>Orb</span>
        </div>
        
        <div className="nav-buttons">
          <Button
            onClick={() => navigate('/')}
            variant={location.pathname === '/' ? 'default' : 'ghost'}
            size="sm"
            className="nav-button"
          >
            <Home className="button-icon" />
            Create
          </Button>
          
          <Button
            onClick={() => navigate('/gallery')}
            variant={location.pathname === '/gallery' ? 'default' : 'ghost'}
            size="sm"
            className="nav-button"
          >
            <Image className="button-icon" />
            Gallery
          </Button>

          <Button
            onClick={() => navigate('/journal')}
            variant={location.pathname === '/journal' ? 'default' : 'ghost'}
            size="sm"
            className="nav-button"
          >
            <BookOpen className="button-icon" />
            Journal
          </Button>

          <Button
            onClick={() => navigate('/combinations')}
            variant={location.pathname === '/combinations' ? 'default' : 'ghost'}
            size="sm"
            className="nav-button"
          >
            <Zap className="button-icon" />
            Combine
          </Button>

          <Button
            onClick={() => navigate('/customize')}
            variant={location.pathname === '/customize' ? 'default' : 'ghost'}
            size="sm"
            className="nav-button"
          >
            <Palette className="button-icon" />
            Customize
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;