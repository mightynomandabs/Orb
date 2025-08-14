import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmotion } from '../context/EmotionContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { 
  Palette, 
  Download, 
  Share2, 
  Settings, 
  Sparkles, 
  Eye,
  Heart,
  Brain,
  Zap,
  RotateCcw,
  Save,
  ArrowLeft
} from 'lucide-react';

const CustomOrbColors = () => {
  const navigate = useNavigate();
  const { settings, updateSettings } = useEmotion();
  const [customColors, setCustomColors] = useState(settings?.customColors || {});
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [particleIntensity, setParticleIntensity] = useState(settings?.particleIntensity || 'medium');
  const [backgroundEffects, setBackgroundEffects] = useState(settings?.backgroundEffects !== false);
  const [soundEnabled, setSoundEnabled] = useState(settings?.soundEnabled !== false);

  const emotions = [
    { key: 'joy', label: 'Joy', icon: Sparkles, defaultColor: '#ffb000' },
    { key: 'love', label: 'Love', icon: Heart, defaultColor: '#ff6b9d' },
    { key: 'sadness', label: 'Sadness', icon: Brain, defaultColor: '#4a9eff' },
    { key: 'anger', label: 'Anger', icon: Zap, defaultColor: '#ff4757' },
    { key: 'fear', label: 'Fear', icon: Brain, defaultColor: '#b644ff' },
    { key: 'peace', label: 'Peace', icon: Heart, defaultColor: '#00ff88' },
    { key: 'neutral', label: 'Neutral', icon: Settings, defaultColor: '#808080' }
  ];

  // Update custom colors
  const updateCustomColor = (emotion, color) => {
    const newColors = { ...customColors, [emotion]: color };
    setCustomColors(newColors);
  };

  // Reset to default colors
  const resetToDefaults = () => {
    setCustomColors({});
    setParticleIntensity('medium');
    setBackgroundEffects(true);
    setSoundEnabled(true);
  };

  // Save settings
  const saveSettings = () => {
    const newSettings = {
      ...settings,
      customColors,
      particleIntensity,
      backgroundEffects,
      soundEnabled
    };
    updateSettings(newSettings);
  };

  // Export color scheme
  const exportColorScheme = () => {
    const colorScheme = {
      customColors,
      particleIntensity,
      backgroundEffects,
      soundEnabled,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(colorScheme, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'orb-color-scheme.json';
    link.click();
  };

  // Share color scheme
  const shareColorScheme = async () => {
    const shareData = {
      title: 'My Custom Orb Color Scheme',
      text: 'Check out my personalized orb colors!',
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        const shareText = `${shareData.text} ${shareData.url}`;
        await navigator.clipboard.writeText(shareText);
        alert('Share text copied to clipboard!');
      }
    } catch (error) {
      console.error('Sharing failed:', error);
    }
  };

  // Simple color picker component
  const ColorPicker = ({ color, onChange, onClose }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Choose Color</h3>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {[
            '#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ff00', '#00ff80', '#00ffff',
            '#0080ff', '#0000ff', '#8000ff', '#ff00ff', '#ff0080', '#ff4000', '#ffbf00',
            '#80ff40', '#40ff80', '#40ffff', '#4080ff', '#4000ff', '#8000ff', '#ff0040',
            '#ff8000', '#ffb300', '#b3ff00', '#80ff40', '#40ff80', '#40b3ff', '#4040ff'
          ].map((presetColor) => (
            <button
              key={presetColor}
              className="w-8 h-8 rounded border-2 border-border hover:border-primary transition-colors"
              style={{ backgroundColor: presetColor }}
              onClick={() => onChange(presetColor)}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            type="color"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1"
          />
          <Button onClick={onClose} variant="outline">
            Done
          </Button>
        </div>
      </div>
    </div>
  );

  // Preview orb component
  const PreviewOrb = ({ emotion, color, size = 'w-16 h-16' }) => {
    const IconComponent = emotions.find(e => e.key === emotion)?.icon || Sparkles;
    
    return (
      <div className="flex flex-col items-center gap-2">
        <div
          className={`${size} rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110`}
          style={{ backgroundColor: color }}
        >
          <IconComponent className="w-6 h-6 text-white" />
        </div>
        <span className="text-sm font-medium capitalize">{emotion}</span>
      </div>
    );
  };

  return (
    <div className="custom-orb-colors-page">
      {/* Back Navigation Button */}
      <Button
        onClick={() => navigate('/')}
        variant="ghost"
        className="fixed top-4 left-4 z-50 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-3 py-2 sm:px-4 rounded-lg shadow-lg text-sm sm:text-base"
      >
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
        <span className="hidden sm:inline">Back</span>
        <span className="sm:hidden">←</span>
      </Button>
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
            <Palette className="text-primary" />
            Custom Orb Colors
          </h1>
          <p className="text-muted-foreground text-lg">
            Personalize your emotional universe with custom colors and effects
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Color Customization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Emotion Colors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {emotions.map((emotion) => (
                  <div key={emotion.key} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <emotion.icon className="w-4 h-4" />
                      <Label className="text-sm font-medium">{emotion.label}</Label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded border cursor-pointer hover:scale-110 transition-transform"
                        style={{ backgroundColor: customColors[emotion.key] || emotion.defaultColor }}
                        onClick={() => {
                          setSelectedEmotion(emotion.key);
                          setShowColorPicker(true);
                        }}
                      />
                      <Input
                        type="text"
                        value={customColors[emotion.key] || emotion.defaultColor}
                        onChange={(e) => updateCustomColor(emotion.key, e.target.value)}
                        className="flex-1 text-xs"
                        placeholder="Hex color"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button onClick={resetToDefaults} variant="outline" className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset to Defaults
                </Button>
                <Button onClick={saveSettings} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Effects & Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Effects & Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Particle Intensity */}
              <div className="space-y-3">
                <Label>Particle Intensity</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[particleIntensity === 'low' ? 0 : particleIntensity === 'medium' ? 1 : 2]}
                    onValueChange={([value]) => {
                      const levels = ['low', 'medium', 'high'];
                      setParticleIntensity(levels[value]);
                    }}
                    max={2}
                    step={1}
                    className="flex-1"
                  />
                  <Badge variant="outline" className="min-w-[60px] text-center">
                    {particleIntensity}
                  </Badge>
                </div>
              </div>

              {/* Background Effects */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Background Effects</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable dynamic background animations
                  </p>
                </div>
                <Switch
                  checked={backgroundEffects}
                  onCheckedChange={setBackgroundEffects}
                />
              </div>

              {/* Sound Effects */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Sound Effects</Label>
                  <p className="text-sm text-muted-foreground">
                    Play sounds when creating orbs
                  </p>
                </div>
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Color Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 sm:gap-6 justify-items-center">
              {emotions.map((emotion) => (
                <PreviewOrb
                  key={emotion.key}
                  emotion={emotion.key}
                  color={customColors[emotion.key] || emotion.defaultColor}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-8">
          <Button onClick={exportColorScheme} variant="outline" className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Export Scheme
          </Button>
          <Button onClick={shareColorScheme} variant="outline" className="w-full sm:w-auto">
            <Share2 className="w-4 h-4 mr-2" />
            Share Scheme
          </Button>
        </div>
      </div>

      {/* Color Picker Modal */}
      {showColorPicker && selectedEmotion && (
        <ColorPicker
          color={customColors[selectedEmotion] || emotions.find(e => e.key === selectedEmotion)?.defaultColor}
          onChange={(color) => updateCustomColor(selectedEmotion, color)}
          onClose={() => {
            setShowColorPicker(false);
            setSelectedEmotion(null);
          }}
        />
      )}
    </div>
  );
};

export default CustomOrbColors;
