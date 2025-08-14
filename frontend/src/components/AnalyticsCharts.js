import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
} from 'chart.js';
import { Bar, Line, Doughnut, PolarArea } from 'react-chartjs-2';
import { useEmotion } from '../context/EmotionContext';
import { Card } from './ui/card';
import { motion } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

const AnalyticsCharts = () => {
  const { analytics, orbHistory } = useEmotion();

  // Emotion distribution chart
  const emotionDistributionData = useMemo(() => {
    const emotions = Object.keys(analytics.emotionCounts);
    const counts = Object.values(analytics.emotionCounts);
    
    const colors = {
      joy: '#ffb000',
      love: '#ff6b9d',
      sadness: '#4a9eff',
      anger: '#ff4757',
      fear: '#b644ff',
      peace: '#00ff88',
      neutral: '#gray'
    };

    return {
      labels: emotions.map(e => e.charAt(0).toUpperCase() + e.slice(1)),
      datasets: [{
        data: counts,
        backgroundColor: emotions.map(e => colors[e] || '#gray'),
        borderColor: emotions.map(e => colors[e] || '#gray'),
        borderWidth: 2,
        hoverBorderWidth: 3
      }]
    };
  }, [analytics.emotionCounts]);

  // Daily mood trends
  const dailyTrendsData = useMemo(() => {
    const last30Days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      last30Days.push(date.toDateString());
    }

    const datasets = {};
    
    // Initialize datasets for each emotion
    Object.keys(analytics.emotionCounts).forEach(emotion => {
      datasets[emotion] = {
        label: emotion.charAt(0).toUpperCase() + emotion.slice(1),
        data: [],
        borderColor: {
          joy: '#ffb000',
          love: '#ff6b9d',
          sadness: '#4a9eff',
          anger: '#ff4757',
          fear: '#b644ff',
          peace: '#00ff88',
          neutral: '#gray'
        }[emotion] || '#gray',
        backgroundColor: ({
          joy: '#ffb000',
          love: '#ff6b9d',
          sadness: '#4a9eff',
          anger: '#ff4757',
          fear: '#b644ff',
          peace: '#00ff88',
          neutral: '#gray'
        }[emotion] || '#gray') + '20',
        tension: 0.4,
        fill: true
      };
    });

    // Fill data for each day
    last30Days.forEach(date => {
      const dayData = analytics.dailyMoods[date] || {};
      Object.keys(datasets).forEach(emotion => {
        datasets[emotion].data.push(dayData[emotion] || 0);
      });
    });

    return {
      labels: last30Days.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: Object.values(datasets)
    };
  }, [analytics.dailyMoods, analytics.emotionCounts]);

  // Intensity over time
  const intensityData = useMemo(() => {
    const recentOrbs = orbHistory.slice(-20).reverse(); // Last 20 orbs
    
    return {
      labels: recentOrbs.map((_, index) => `Orb ${index + 1}`),
      datasets: [{
        label: 'Emotion Intensity',
        data: recentOrbs.map(orb => orb.intensity * 100),
        borderColor: '#ff6b9d',
        backgroundColor: '#ff6b9d20',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: recentOrbs.map(orb => ({
          joy: '#ffb000',
          love: '#ff6b9d',
          sadness: '#4a9eff',
          anger: '#ff4757',
          fear: '#b644ff',
          peace: '#00ff88'
        }[orb.emotion] || '#gray')),
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6
      }]
    };
  }, [orbHistory]);

  // Evolution levels
  const evolutionData = useMemo(() => {
    const evolutionCounts = {};
    orbHistory.forEach(orb => {
      if (orb.evolution) {
        const level = orb.evolution.level;
        evolutionCounts[level] = (evolutionCounts[level] || 0) + 1;
      }
    });

    return {
      labels: Object.keys(evolutionCounts).map(level => `Level ${level}`),
      datasets: [{
        label: 'Evolution Distribution',
        data: Object.values(evolutionCounts),
        backgroundColor: [
          '#4a9eff40',
          '#00ff8840',
          '#ffb00040',
          '#ff6b9d40',
          '#b644ff40',
          '#ff475740'
        ],
        borderColor: [
          '#4a9eff',
          '#00ff88',
          '#ffb000',
          '#ff6b9d',
          '#b644ff',
          '#ff4757'
        ],
        borderWidth: 2
      }]
    };
  }, [orbHistory]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#ffffff',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#ffffff',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        ticks: { color: '#ffffff' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      y: {
        ticks: { color: '#ffffff' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      }
    }
  };

  const polarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#ffffff',
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff'
      }
    },
    scales: {
      r: {
        ticks: { color: '#ffffff', backdropColor: 'transparent' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        angleLines: { color: 'rgba(255, 255, 255, 0.1)' }
      }
    }
  };

  return (
    <div className="analytics-charts">
      <div className="charts-grid">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="chart-card">
            <h3 className="chart-title">Emotion Distribution</h3>
            <div className="chart-container">
              <Doughnut data={emotionDistributionData} options={chartOptions} />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="chart-card">
            <h3 className="chart-title">Daily Mood Trends (30 Days)</h3>
            <div className="chart-container">
              <Line data={dailyTrendsData} options={chartOptions} />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="chart-card">
            <h3 className="chart-title">Emotion Intensity Over Time</h3>
            <div className="chart-container">
              <Line data={intensityData} options={chartOptions} />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="chart-card">
            <h3 className="chart-title">Evolution Levels</h3>
            <div className="chart-container">
              <PolarArea data={evolutionData} options={polarOptions} />
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="insights-section"
      >
        <Card className="insights-card">
          <h3 className="insights-title">Emotional Insights</h3>
          <div className="insights-grid">
            <div className="insight-item">
              <span className="insight-label">Most Frequent Emotion</span>
              <span className="insight-value">
                {Object.keys(analytics.emotionCounts).reduce((a, b) => 
                  analytics.emotionCounts[a] > analytics.emotionCounts[b] ? a : b, 'none'
                )}
              </span>
            </div>
            <div className="insight-item">
              <span className="insight-label">Total Orbs Created</span>
              <span className="insight-value">{orbHistory.length}</span>
            </div>
            <div className="insight-item">
              <span className="insight-label">Longest Streak</span>
              <span className="insight-value">
                {Math.max(...Object.values(analytics.streaks), 0)} orbs
              </span>
            </div>
            <div className="insight-item">
              <span className="insight-label">Average Daily Orbs</span>
              <span className="insight-value">
                {Object.keys(analytics.dailyMoods).length > 0 
                  ? (orbHistory.length / Object.keys(analytics.dailyMoods).length).toFixed(1)
                  : '0'
                }
              </span>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default AnalyticsCharts;