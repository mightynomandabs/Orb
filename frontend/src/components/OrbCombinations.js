import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Zap, 
  Target, 
  Palette, 
  Download, 
  Share2, 
  Sparkles, 
  Heart, 
  Brain, 
  Star,
  FileText,
  Badge,
  Eye,
  ArrowLeft
} from 'lucide-react';
import { useEmotion } from '../context/EmotionContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const OrbCombinations = () => {
  const navigate = useNavigate();
  const { orbHistory, combineOrbs } = useEmotion();
  const [selectedOrbs, setSelectedOrbs] = useState([]);
  const [combinationType, setCombinationType] = useState('fusion');
  const [customName, setCustomName] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const combinationTypes = [
    { value: 'fusion', label: 'Fusion', icon: Zap, description: 'Merge emotions into one powerful orb' },
    { value: 'harmony', label: 'Harmony', icon: Heart, description: 'Create balanced emotional states' },
    { value: 'chaos', label: 'Chaos', icon: Star, description: 'Unleash raw emotional energy' },
    { value: 'serenity', label: 'Serenity', icon: FileText, description: 'Find peace in complexity' },
    { value: 'wisdom', label: 'Wisdom', icon: Brain, description: 'Gain insights from mixed emotions' }
  ];

  // Available orbs for selection - show all orbs for now
  const availableOrbs = orbHistory || [];

  // Get emotion color
  const getEmotionColor = (emotion) => {
    const colors = {
      joy: '#ffb000',
      love: '#ff6b9d',
      sadness: '#4a9eff',
      anger: '#ff4757',
      fear: '#b644ff',
      peace: '#00ff88',
      neutral: '#808080'
    };
    return colors[emotion] || '#808080';
  };

  // Calculate combination result
  const combinationResult = useMemo(() => {
    if (selectedOrbs.length < 2) return null;

    const emotions = [...new Set(selectedOrbs.map(orb => orb.emotion))];
    const avgIntensity = selectedOrbs.reduce((sum, orb) => sum + (orb.intensity || 0.5), 0) / selectedOrbs.length;
    
    // Complex emotion mapping based on combination type
    const combinationMap = {
      fusion: {
        'joy,love': { color: '#ff8c42', emotion: 'bliss', name: 'Blissful Love', icon: Star },
        'sadness,anger': { color: '#dc143c', emotion: 'anguish', name: 'Deep Anguish', icon: Zap },
        'fear,anger': { color: '#8a2be2', emotion: 'rage', name: 'Furious Fear', icon: Zap },
        'peace,joy': { color: '#40e0d0', emotion: 'serenity', name: 'Joyful Peace', icon: Heart },
        'love,sadness': { color: '#fe6f5e', emotion: 'melancholy', name: 'Bittersweet Love', icon: Star },
        'joy,fear': { color: '#ffd700', emotion: 'excitement', name: 'Thrilling Joy', icon: Sparkles },
        'peace,fear': { color: '#98fb98', emotion: 'courage', name: 'Peaceful Courage', icon: Target }
      },
      harmony: {
        'joy,love,peace': { color: '#ffb6c1', emotion: 'harmony', name: 'Perfect Harmony', icon: Heart },
        'sadness,peace': { color: '#87ceeb', emotion: 'melancholy', name: 'Peaceful Sadness', icon: FileText },
        'anger,peace': { color: '#ff6347', emotion: 'determination', name: 'Focused Anger', icon: Target }
      },
      chaos: {
        'joy,anger,fear': { color: '#ff4500', emotion: 'chaos', name: 'Emotional Storm', icon: Zap },
        'love,sadness,anger': { color: '#8b0000', emotion: 'turmoil', name: 'Heart Turmoil', icon: Zap }
      }
    };

    const emotionKey = emotions.sort().join(',');
    const combination = combinationMap[combinationType]?.[emotionKey] || {
      color: '#ffffff',
      emotion: 'complex',
      name: `Mixed ${combinationType.charAt(0).toUpperCase() + combinationType.slice(1)}`,
      icon: Sparkles
    };

    return {
      ...combination,
      intensity: Math.min(1.0, avgIntensity * 1.2),
      complexity: 'fusion',
      combinedEmotions: emotions,
      sourceOrbs: selectedOrbs.map(orb => orb.id),
      evolutionLevel: 1,
      combinationType,
      customName: customName || combination.name
    };
  }, [selectedOrbs, combinationType, customName]);

  // Select/deselect orb
  const toggleOrbSelection = (orbId) => {
    setSelectedOrbs(prev => 
      prev.includes(orbId) 
        ? prev.filter(id => id !== orbId)
        : [...prev, orbId]
    );
  };

  // Create combination
  const createCombination = async () => {
    if (!combinationResult || selectedOrbs.length < 2) return;

    try {
      const result = await combineOrbs(selectedOrbs.map(orb => orb.id));
      console.log('Combination created:', result);
      
      // Reset selection
      setSelectedOrbs([]);
      setCustomName('');
      setShowPreview(false);
    } catch (error) {
      console.error('Combination failed:', error);
    }
  };

  // Export combination as image
  const exportCombination = async () => {
    const element = document.getElementById('combination-preview');
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
      const link = document.createElement('a');
      link.download = `orb-combination-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Export as PDF
  const exportPDF = async () => {
    const element = document.getElementById('combination-preview');
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`orb-combination-${Date.now()}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
    }
  };

  // Share combination
  const shareCombination = async () => {
    if (!navigator.share) {
      // Fallback: copy to clipboard
      const shareText = `Check out my orb combination: ${combinationResult.name}!`;
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Share text copied to clipboard!');
      } catch (error) {
        console.error('Share failed:', error);
      }
      return;
    }

    try {
      await navigator.share({
        title: 'My Orb Combination',
        text: `Check out my orb combination: ${combinationResult.name}!`,
        url: window.location.href
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  return (
    <div className="orb-combinations-page">
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
            <Zap className="text-primary" />
            Orb Combinations
          </h1>
          <p className="text-muted-foreground text-lg">
            Combine your emotional orbs to create powerful new combinations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Orb Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Select Orbs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {availableOrbs.map((orb) => (
                  <div
                    key={orb.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedOrbs.includes(orb.id)
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => toggleOrbSelection(orb.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: getEmotionColor(orb.emotion) }}
                      />
                      <div>
                        <p className="font-medium">{orb.emotion}</p>
                        <p className="text-sm text-muted-foreground">
                          Intensity: {Math.round((orb.intensity || 0.5) * 100)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {availableOrbs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No orbs available for combination</p>
                  <p className="text-sm">Create some orbs first to combine them</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Combination Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Combination Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="combination-type">Combination Type</Label>
                <Select value={combinationType} onValueChange={setCombinationType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {combinationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-name">Custom Name (Optional)</Label>
                <Input
                  id="custom-name"
                  placeholder="Enter a custom name for your combination"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
              </div>

              <Button
                onClick={() => setShowPreview(true)}
                disabled={selectedOrbs.length < 2}
                className="w-full"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview Combination
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Combination Preview */}
        {showPreview && combinationResult && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Combination Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div id="combination-preview" className="text-center p-8 bg-gradient-to-br from-background to-muted rounded-lg">
                <div className="mb-6">
                  <div
                    className="w-32 h-32 rounded-full mx-auto mb-4 shadow-2xl"
                    style={{ backgroundColor: combinationResult.color }}
                  />
                  <h3 className="text-2xl font-bold mb-2">{combinationResult.customName}</h3>
                  <p className="text-muted-foreground mb-4">
                    {combinationResult.combinedEmotions.join(' + ')} → {combinationResult.emotion}
                  </p>
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <Badge variant="secondary">
                      Intensity: {Math.round(combinationResult.intensity * 100)}%
                    </Badge>
                    <Badge variant="outline">
                      Type: {combinationResult.combinationType}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Button onClick={createCombination} variant="default" className="w-full sm:w-auto">
                    <Zap className="w-4 h-4 mr-2" />
                    Create Combination
                  </Button>
                  <Button onClick={exportCombination} variant="outline" className="w-full sm:w-auto">
                    <Download className="w-4 h-4 mr-2" />
                    Export Image
                  </Button>
                  <Button onClick={exportPDF} variant="outline" className="w-full sm:w-auto">
                    <FileText className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button onClick={shareCombination} variant="outline" className="w-full sm:w-auto">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OrbCombinations;
