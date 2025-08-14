# User Feedback Loop System for Continuous Improvement
# This system collects user corrections and uses them to improve the model

import json
import os
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
import sqlite3
from pathlib import Path

@dataclass
class FeedbackEntry:
    """Represents a user feedback entry"""
    id: str
    original_text: str
    predicted_emotion: str
    predicted_confidence: float
    user_corrected_emotion: str
    user_confidence: float
    feedback_type: str  # 'correction', 'improvement', 'new_example'
    user_notes: Optional[str]
    timestamp: str
    model_version: str
    detection_method: str

class FeedbackDatabase:
    """Manages feedback data storage and retrieval"""
    
    def __init__(self, db_path: str = 'feedback.db'):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize the feedback database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS feedback (
                id TEXT PRIMARY KEY,
                original_text TEXT NOT NULL,
                predicted_emotion TEXT NOT NULL,
                predicted_confidence REAL NOT NULL,
                user_corrected_emotion TEXT NOT NULL,
                user_confidence REAL NOT NULL,
                feedback_type TEXT NOT NULL,
                user_notes TEXT,
                timestamp TEXT NOT NULL,
                model_version TEXT NOT NULL,
                detection_method TEXT NOT NULL
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS model_improvements (
                id TEXT PRIMARY KEY,
                improvement_type TEXT NOT NULL,
                description TEXT NOT NULL,
                applied BOOLEAN DEFAULT FALSE,
                timestamp TEXT NOT NULL,
                feedback_count INTEGER DEFAULT 0
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def add_feedback(self, feedback: FeedbackEntry):
        """Add a new feedback entry"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO feedback VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            feedback.id, feedback.original_text, feedback.predicted_emotion,
            feedback.predicted_confidence, feedback.user_corrected_emotion,
            feedback.user_confidence, feedback.feedback_type, feedback.user_notes,
            feedback.timestamp, feedback.model_version, feedback.detection_method
        ))
        
        conn.commit()
        conn.close()
    
    def get_feedback_by_emotion(self, emotion: str) -> List[FeedbackEntry]:
        """Get all feedback for a specific emotion"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM feedback WHERE user_corrected_emotion = ?
        ''', (emotion,))
        
        rows = cursor.fetchall()
        conn.close()
        
        feedback_list = []
        for row in rows:
            feedback = FeedbackEntry(
                id=row[0], original_text=row[1], predicted_emotion=row[2],
                predicted_confidence=row[3], user_corrected_emotion=row[4],
                user_confidence=row[5], feedback_type=row[6], user_notes=row[7],
                timestamp=row[8], model_version=row[9], detection_method=row[10]
            )
            feedback_list.append(feedback)
        
        return feedback_list
    
    def get_all_feedback(self) -> List[FeedbackEntry]:
        """Get all feedback entries"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM feedback ORDER BY timestamp DESC')
        rows = cursor.fetchall()
        conn.close()
        
        feedback_list = []
        for row in rows:
            feedback = FeedbackEntry(
                id=row[0], original_text=row[1], predicted_emotion=row[2],
                predicted_confidence=row[3], user_corrected_emotion=row[4],
                user_confidence=row[5], feedback_type=row[6], user_notes=row[7],
                timestamp=row[8], model_version=row[9], detection_method=row[10]
            )
            feedback_list.append(feedback)
        
        return feedback_list
    
    def get_feedback_stats(self) -> Dict[str, Any]:
        """Get statistics about feedback data"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Total feedback count
        cursor.execute('SELECT COUNT(*) FROM feedback')
        total_count = cursor.fetchone()[0]
        
        # Feedback by emotion
        cursor.execute('''
            SELECT user_corrected_emotion, COUNT(*) 
            FROM feedback 
            GROUP BY user_corrected_emotion
        ''')
        emotion_counts = dict(cursor.fetchall())
        
        # Feedback by type
        cursor.execute('''
            SELECT feedback_type, COUNT(*) 
            FROM feedback 
            GROUP BY feedback_type
        ''')
        type_counts = dict(cursor.fetchall())
        
        # Average confidence improvement
        cursor.execute('''
            SELECT AVG(user_confidence - predicted_confidence) 
            FROM feedback
        ''')
        avg_improvement = cursor.fetchone()[0] or 0
        
        conn.close()
        
        return {
            'total_feedback': total_count,
            'emotion_distribution': emotion_counts,
            'type_distribution': type_counts,
            'average_confidence_improvement': avg_improvement
        }

class FeedbackAnalyzer:
    """Analyzes feedback to generate improvement suggestions"""
    
    def __init__(self, feedback_db: FeedbackDatabase):
        self.feedback_db = feedback_db
    
    def analyze_common_mistakes(self) -> List[Dict[str, Any]]:
        """Analyze common prediction mistakes"""
        feedback = self.feedback_db.get_all_feedback()
        
        # Group by predicted vs corrected emotion
        mistake_patterns = {}
        for entry in feedback:
            key = (entry.predicted_emotion, entry.user_corrected_emotion)
            if key not in mistake_patterns:
                mistake_patterns[key] = {
                    'count': 0,
                    'examples': [],
                    'avg_confidence_diff': 0,
                    'total_confidence_diff': 0
                }
            
            pattern = mistake_patterns[key]
            pattern['count'] += 1
            pattern['examples'].append(entry.original_text)
            confidence_diff = entry.user_confidence - entry.predicted_confidence
            pattern['total_confidence_diff'] += confidence_diff
        
        # Calculate averages and sort by frequency
        for pattern in mistake_patterns.values():
            pattern['avg_confidence_diff'] = pattern['total_confidence_diff'] / pattern['count']
            # Keep only first 5 examples to avoid overwhelming
            pattern['examples'] = pattern['examples'][:5]
        
        # Sort by frequency
        sorted_patterns = sorted(
            mistake_patterns.items(), 
            key=lambda x: x[1]['count'], 
            reverse=True
        )
        
        return [
            {
                'predicted': pred,
                'corrected': corr,
                **stats
            }
            for (pred, corr), stats in sorted_patterns
        ]
    
    def generate_improvement_suggestions(self) -> List[Dict[str, Any]]:
        """Generate specific improvement suggestions based on feedback"""
        common_mistakes = self.analyze_common_mistakes()
        suggestions = []
        
        for mistake in common_mistakes:
            if mistake['count'] >= 3:  # Only suggest improvements for frequent mistakes
                suggestion = {
                    'type': 'keyword_addition',
                    'priority': 'high' if mistake['count'] >= 5 else 'medium',
                    'description': f"Add keywords for '{mistake['corrected']}' to prevent misclassification as '{mistake['predicted']}'",
                    'examples': mistake['examples'],
                    'affected_emotions': [mistake['predicted'], mistake['corrected']],
                    'estimated_impact': mistake['count']
                }
                suggestions.append(suggestion)
        
        return suggestions
    
    def export_training_data(self) -> List[tuple]:
        """Export feedback as training data for ML model"""
        feedback = self.feedback_db.get_all_feedback()
        training_data = []
        
        for entry in feedback:
            # Use user-corrected emotion as the correct label
            training_data.append((entry.original_text, entry.user_corrected_emotion))
        
        return training_data

class FeedbackCollector:
    """Collects and processes user feedback in real-time"""
    
    def __init__(self, feedback_db: FeedbackDatabase):
        self.feedback_db = feedback_db
    
    def collect_correction(self, 
                          original_text: str,
                          predicted_emotion: str,
                          predicted_confidence: float,
                          user_corrected_emotion: str,
                          user_confidence: float = 1.0,
                          user_notes: Optional[str] = None,
                          model_version: str = "2.2",
                          detection_method: str = "hybrid") -> str:
        """Collect a user correction"""
        import uuid
        
        feedback_id = str(uuid.uuid4())
        
        feedback = FeedbackEntry(
            id=feedback_id,
            original_text=original_text,
            predicted_emotion=predicted_emotion,
            predicted_confidence=predicted_confidence,
            user_corrected_emotion=user_corrected_emotion,
            user_confidence=user_confidence,
            feedback_type='correction',
            user_notes=user_notes,
            timestamp=datetime.utcnow().isoformat(),
            model_version=model_version,
            detection_method=detection_method
        )
        
        self.feedback_db.add_feedback(feedback)
        
        # Trigger immediate analysis if this is a new pattern
        if self._is_new_mistake_pattern(predicted_emotion, user_corrected_emotion):
            self._flag_for_immediate_improvement(predicted_emotion, user_corrected_emotion)
        
        return feedback_id
    
    def _is_new_mistake_pattern(self, predicted: str, corrected: str) -> bool:
        """Check if this is a new type of mistake"""
        existing_feedback = self.feedback_db.get_feedback_by_emotion(corrected)
        
        for entry in existing_feedback:
            if entry.predicted_emotion == predicted:
                return False  # Pattern already exists
        
        return True
    
    def _flag_for_immediate_improvement(self, predicted: str, corrected: str):
        """Flag a new mistake pattern for immediate improvement"""
        conn = sqlite3.connect(self.feedback_db.db_path)
        cursor = conn.cursor()
        
        improvement_id = f"immediate_{predicted}_{corrected}_{int(datetime.utcnow().timestamp())}"
        
        cursor.execute('''
            INSERT INTO model_improvements VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            improvement_id,
            'immediate_keyword_addition',
            f'Add keywords to prevent {predicted} from being misclassified as {corrected}',
            False,  # Not applied yet
            datetime.utcnow().isoformat(),
            1  # Initial count
        ))
        
        conn.commit()
        conn.close()

# Example usage and testing
if __name__ == "__main__":
    # Initialize feedback system
    feedback_db = FeedbackDatabase()
    analyzer = FeedbackAnalyzer(feedback_db)
    collector = FeedbackCollector(feedback_db)
    
    # Example: Collect some feedback
    collector.collect_correction(
        original_text="i won a lottery",
        predicted_emotion="neutral",
        predicted_confidence=0.6,
        user_corrected_emotion="joy",
        user_notes="This should definitely be joy, not neutral"
    )
    
    # Analyze feedback
    suggestions = analyzer.generate_improvement_suggestions()
    print("Improvement suggestions:", suggestions)
    
    # Get stats
    stats = feedback_db.get_feedback_stats()
    print("Feedback stats:", stats)
