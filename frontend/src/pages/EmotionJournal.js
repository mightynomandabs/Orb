import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmotion } from '../context/EmotionContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Calendar } from '../components/ui/calendar';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Calendar as CalendarIcon, 
  BookOpen, 
  TrendingUp, 
  Heart, 
  Brain, 
  Zap,
  Download,
  Share2,
  Plus,
  Search,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';

const EmotionJournal = () => {
  const navigate = useNavigate();
  const { orbHistory, analytics, getCalendarData } = useEmotion();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [journalEntry, setJournalEntry] = useState('');
  const [moodRating, setMoodRating] = useState(5);
  const [emotionTags, setEmotionTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEmotion, setFilterEmotion] = useState('all');
  const [viewMode, setViewMode] = useState('calendar');

  const availableEmotions = ['joy', 'love', 'sadness', 'anger', 'fear', 'peace', 'neutral'];

  // Get orbs for selected date
  const selectedDateOrbs = useMemo(() => {
    const dateStr = selectedDate.toDateString();
    return orbHistory.filter(orb => 
      new Date(orb.timestamp).toDateString() === dateStr
    );
  }, [selectedDate, orbHistory]);

  // Calendar data for mood tracking
  const calendarData = useMemo(() => getCalendarData(), [getCalendarData]);

  // Filtered orbs based on search and filter
  const filteredOrbs = useMemo(() => {
    let filtered = orbHistory;
    
    if (searchQuery) {
      filtered = filtered.filter(orb => 
        orb.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        orb.emotion.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filterEmotion !== 'all') {
      filtered = filtered.filter(orb => orb.emotion === filterEmotion);
    }
    
    return filtered;
  }, [orbHistory, searchQuery, filterEmotion]);

  // Add new journal entry
  const addJournalEntry = () => {
    if (!journalEntry.trim()) return;

    const newEntry = {
      id: Date.now(),
      date: selectedDate.toISOString(),
      text: journalEntry,
      moodRating,
      emotionTags,
      timestamp: new Date().toISOString()
    };

    // Here you would typically save to backend
    console.log('New journal entry:', newEntry);
    
    // Reset form
    setJournalEntry('');
    setMoodRating(5);
    setEmotionTags([]);
  };

  // Export journal to PDF
  const exportToPDF = async () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      
      // Add title
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Emotion Journal Report', pageWidth / 2, 30, { align: 'center' });
      
      // Add date
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      const currentDate = new Date().toLocaleDateString();
      pdf.text(`Generated on: ${currentDate}`, pageWidth / 2, 45, { align: 'center' });
      
      let yPosition = 70;
      
      // Add summary statistics
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Summary Statistics', margin, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      // Total entries
      pdf.text(`Total Entries: ${filteredOrbs.length}`, margin, yPosition);
      yPosition += 8;
      
      // Emotion distribution
      const emotionCounts = {};
      filteredOrbs.forEach(orb => {
        emotionCounts[orb.emotion] = (emotionCounts[orb.emotion] || 0) + 1;
      });
      
      pdf.text('Emotion Distribution:', margin, yPosition);
      yPosition += 8;
      
      Object.entries(emotionCounts).forEach(([emotion, count]) => {
        const percentage = ((count / filteredOrbs.length) * 100).toFixed(1);
        pdf.text(`  ${emotion.charAt(0).toUpperCase() + emotion.slice(1)}: ${count} (${percentage}%)`, margin + 5, yPosition);
        yPosition += 6;
      });
      
      yPosition += 10;
      
      // Add recent entries
      if (filteredOrbs.length > 0) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Recent Entries', margin, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        // Show last 10 entries
        const recentOrbs = filteredOrbs.slice(0, 10);
        recentOrbs.forEach((orb, index) => {
          if (yPosition > pageHeight - 40) {
            pdf.addPage();
            yPosition = 30;
          }
          
          const date = new Date(orb.timestamp).toLocaleDateString();
          const time = new Date(orb.timestamp).toLocaleTimeString();
          
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${index + 1}. ${orb.emotion.charAt(0).toUpperCase() + orb.emotion.slice(1)}`, margin, yPosition);
          yPosition += 6;
          
          pdf.setFont('helvetica', 'normal');
          pdf.text(`   Date: ${date} at ${time}`, margin + 5, yPosition);
          yPosition += 5;
          
          if (orb.text) {
            const text = orb.text.length > 60 ? orb.text.substring(0, 60) + '...' : orb.text;
            pdf.text(`   Text: "${text}"`, margin + 5, yPosition);
            yPosition += 5;
          }
          
          yPosition += 5;
        });
      }
      
      // Add footer
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.text('Generated by OrbSocial - Your Emotional Universe', pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      // Save the PDF
      pdf.save('emotion-journal-report.pdf');
      
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('PDF export failed. Please try again.');
    }
  };

  // Get mood color based on rating
  const getMoodColor = (rating) => {
    if (rating >= 8) return '#00ff88'; // Green for high mood
    if (rating >= 6) return '#ffb000'; // Yellow for medium-high
    if (rating >= 4) return '#ff6b9d'; // Pink for medium
    if (rating >= 2) return '#4a9eff'; // Blue for medium-low
    return '#ff4757'; // Red for low mood
  };

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

  return (
    <div className="emotion-journal-page page-transition">
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
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
            <BookOpen className="text-primary" />
            Emotion Journal
          </h1>
          <p className="text-muted-foreground text-lg">
            Track your emotional journey and discover patterns over time
          </p>
        </motion.div>

        <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Calendar View
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Calendar View */}
          <TabsContent value="calendar" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    Mood Calendar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    modifiers={{
                      hasOrbs: (date) => {
                        const dateStr = date.toDateString();
                        return calendarData[dateStr] && calendarData[dateStr].length > 0;
                      }
                    }}
                    modifiersStyles={{
                      hasOrbs: { backgroundColor: '#ff6b9d20', fontWeight: 'bold' }
                    }}
                  />
                </CardContent>
              </Card>

              {/* Journal Entry Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    New Entry
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="mood-rating">Mood Rating (1-10)</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        id="mood-rating"
                        type="range"
                        min="1"
                        max="10"
                        value={moodRating}
                        onChange={(e) => setMoodRating(parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <Badge 
                        style={{ backgroundColor: getMoodColor(moodRating) }}
                        className="text-white min-w-[40px] text-center"
                      >
                        {moodRating}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="emotion-tags">Emotion Tags</Label>
                    <Select onValueChange={(value) => {
                      if (!emotionTags.includes(value)) {
                        setEmotionTags([...emotionTags, value]);
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Add emotion tag" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableEmotions.map(emotion => (
                          <SelectItem key={emotion} value={emotion}>
                            {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {emotionTags.map(tag => (
                        <Badge 
                          key={tag}
                          style={{ backgroundColor: getEmotionColor(tag) }}
                          className="text-white cursor-pointer"
                          onClick={() => setEmotionTags(emotionTags.filter(t => t !== tag))}
                        >
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="journal-text">Journal Entry</Label>
                    <Textarea
                      id="journal-text"
                      placeholder="How are you feeling today? What's on your mind?"
                      value={journalEntry}
                      onChange={(e) => setJournalEntry(e.target.value)}
                      rows={4}
                      className="mt-2"
                    />
                  </div>

                  <Button 
                    onClick={addJournalEntry}
                    disabled={!journalEntry.trim()}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Entry
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Selected Date Orbs */}
            {selectedDateOrbs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Entries for {selectedDate.toLocaleDateString()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedDateOrbs.map(orb => (
                      <motion.div
                        key={orb.id}
                        className="p-4 border rounded-lg"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge 
                                style={{ backgroundColor: getEmotionColor(orb.emotion) }}
                                className="text-white"
                              >
                                {orb.emotion}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(orb.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-gray-700">{orb.text}</p>
                            {orb.evolution && orb.evolution.level > 0 && (
                              <div className="mt-2">
                                <Badge variant="outline" className="text-xs">
                                  Level {orb.evolution.level} {orb.evolution.complexity}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Timeline View */}
          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Emotional Timeline
                  </span>
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search entries..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-64"
                    />
                    <Select value={filterEmotion} onValueChange={setFilterEmotion}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Emotions</SelectItem>
                        {availableEmotions.map(emotion => (
                          <SelectItem key={emotion} value={emotion}>
                            {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredOrbs.map((orb, index) => (
                    <motion.div
                      key={orb.id}
                      className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div 
                        className="w-4 h-4 rounded-full mt-2"
                        style={{ backgroundColor: getEmotionColor(orb.emotion) }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            style={{ backgroundColor: getEmotionColor(orb.emotion) }}
                            className="text-white"
                          >
                            {orb.emotion}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(orb.timestamp).toLocaleDateString()}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(orb.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{orb.text}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics View */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Mood Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Mood Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(analytics.emotionCounts).map(([emotion, count]) => (
                      <div key={emotion} className="flex items-center justify-between">
                        <span className="capitalize">{emotion}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Streaks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Emotion Streaks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(analytics.streaks).map(([emotion, streak]) => (
                      <div key={emotion} className="flex items-center justify-between">
                        <span className="capitalize">{emotion}</span>
                        <Badge variant="outline">{streak} days</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Export Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Export & Share</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={exportToPDF} variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Export to PDF
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Journal
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Hidden div for PDF export */}
      <div id="journal-content" className="hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-6">Emotion Journal</h1>
          <div className="space-y-4">
            {orbHistory.map(orb => (
              <div key={orb.id} className="border-b pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">{orb.emotion}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(orb.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p>{orb.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotionJournal;
