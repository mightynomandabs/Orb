# Context Window Analysis for Emotion Detection
# Analyzes surrounding context, conversation history, and user patterns

import re
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
import json
from collections import defaultdict, deque

class ContextWindowAnalyzer:
    """Analyzes text within context windows for better emotion detection"""
    
    def __init__(self, window_size: int = 5):
        self.window_size = window_size
        self.conversation_history = defaultdict(deque)
        self.user_patterns = defaultdict(dict)
        self.emotion_transitions = defaultdict(list)
        
        # Context patterns that affect emotion interpretation
        self.context_patterns = {
            'intensifiers': {
                'very': 1.5, 'extremely': 2.0, 'really': 1.3, 'so': 1.4,
                'too': 1.6, 'quite': 1.2, 'rather': 1.1, 'somewhat': 0.8
            },
            'diminishers': {
                'slightly': 0.7, 'a little': 0.6, 'somewhat': 0.8,
                'kind of': 0.7, 'sort of': 0.7, 'maybe': 0.5
            },
            'negators': {
                'not': -1.0, 'no': -1.0, 'never': -1.5, 'none': -1.0,
                'nobody': -1.0, 'nothing': -1.0, 'nowhere': -1.0
            },
            'amplifiers': {
                'absolutely': 2.0, 'completely': 1.8, 'totally': 1.8,
                'entirely': 1.7, 'thoroughly': 1.6, 'fully': 1.5
            }
        }
        
        # Emotional context words that provide additional context
        self.emotional_context = {
            'work_context': ['boss', 'work', 'job', 'career', 'office', 'meeting', 'deadline'],
            'relationship_context': ['boyfriend', 'girlfriend', 'spouse', 'partner', 'family', 'friend'],
            'health_context': ['doctor', 'hospital', 'sick', 'pain', 'medicine', 'treatment'],
            'financial_context': ['money', 'bills', 'debt', 'salary', 'expenses', 'budget'],
            'social_context': ['party', 'event', 'celebration', 'gathering', 'social', 'people']
        }
    
    def analyze_context(self, text: str, user_id: str = "default", 
                       conversation_id: str = "default") -> Dict[str, Any]:
        """Analyze text with full context awareness"""
        
        # Get conversation history
        history = self.conversation_history[conversation_id]
        
        # Analyze current text
        current_analysis = self._analyze_current_text(text)
        
        # Analyze context window
        context_analysis = self._analyze_context_window(text, history)
        
        # Analyze user patterns
        user_analysis = self._analyze_user_patterns(text, user_id)
        
        # Analyze emotional transitions
        transition_analysis = self._analyze_emotional_transitions(text, history)
        
        # Combine all analyses
        combined_analysis = self._combine_analyses(
            current_analysis, context_analysis, user_analysis, transition_analysis
        )
        
        # Update conversation history
        self._update_history(conversation_id, text, combined_analysis)
        
        return combined_analysis
    
    def _analyze_current_text(self, text: str) -> Dict[str, Any]:
        """Analyze the current text for immediate emotional indicators"""
        text_lower = text.lower()
        
        analysis = {
            'immediate_emotion': None,
            'intensity_modifiers': [],
            'context_domains': [],
            'emotional_indicators': []
        }
        
        # Check for intensity modifiers
        for modifier, multiplier in self.context_patterns['intensifiers'].items():
            if modifier in text_lower:
                analysis['intensity_modifiers'].append({
                    'modifier': modifier,
                    'multiplier': multiplier,
                    'type': 'intensifier'
                })
        
        for modifier, multiplier in self.context_patterns['diminishers'].items():
            if modifier in text_lower:
                analysis['intensity_modifiers'].append({
                    'modifier': modifier,
                    'multiplier': multiplier,
                    'type': 'diminisher'
                })
        
        # Check for negators
        for negator, multiplier in self.context_patterns['negators'].items():
            if negator in text_lower:
                analysis['intensity_modifiers'].append({
                    'modifier': negator,
                    'multiplier': multiplier,
                    'type': 'negator'
                })
        
        # Check for context domains
        for domain, keywords in self.emotional_context.items():
            if any(keyword in text_lower for keyword in keywords):
                analysis['context_domains'].append(domain)
        
        # Check for emotional indicators
        emotional_words = [
            'feel', 'feeling', 'emotion', 'emotional', 'mood', 'attitude',
            'reaction', 'response', 'experience', 'sensation'
        ]
        
        for word in emotional_words:
            if word in text_lower:
                analysis['emotional_indicators'].append(word)
        
        return analysis
    
    def _analyze_context_window(self, text: str, history: deque) -> Dict[str, Any]:
        """Analyze the context window around the current text"""
        if not history:
            return {'context_emotion': None, 'context_trend': 'neutral'}
        
        # Get recent emotions from history
        recent_emotions = [entry['emotion'] for entry in list(history)[-self.window_size:]]
        
        # Analyze emotional trend
        if len(recent_emotions) >= 2:
            # Check for emotional escalation
            escalation_patterns = [
                ['neutral', 'sadness', 'anger'],  # Escalating negative
                ['joy', 'excitement', 'ecstasy'],  # Escalating positive
                ['fear', 'panic', 'terror']  # Escalating fear
            ]
            
            for pattern in escalation_patterns:
                if self._matches_pattern(recent_emotions, pattern):
                    return {
                        'context_emotion': recent_emotions[-1],
                        'context_trend': 'escalating',
                        'pattern': pattern
                    }
            
            # Check for emotional de-escalation
            deescalation_patterns = [
                ['anger', 'sadness', 'neutral'],  # De-escalating negative
                ['ecstasy', 'joy', 'peace'],  # De-escalating positive
                ['terror', 'fear', 'anxiety']  # De-escalating fear
            ]
            
            for pattern in deescalation_patterns:
                if self._matches_pattern(recent_emotions, pattern):
                    return {
                        'context_emotion': recent_emotions[-1],
                        'context_trend': 'de-escalating',
                        'pattern': pattern
                    }
        
        # Check for emotional stability
        if len(set(recent_emotions)) == 1:
            return {
                'context_emotion': recent_emotions[0],
                'context_trend': 'stable',
                'pattern': recent_emotions
            }
        
        # Check for emotional volatility
        if len(set(recent_emotions)) >= 3:
            return {
                'context_emotion': recent_emotions[-1],
                'context_trend': 'volatile',
                'pattern': recent_emotions
            }
        
        return {
            'context_emotion': recent_emotions[-1] if recent_emotions else None,
            'context_trend': 'mixed',
            'pattern': recent_emotions
        }
    
    def _analyze_user_patterns(self, text: str, user_id: str) -> Dict[str, Any]:
        """Analyze user-specific emotional patterns"""
        if user_id not in self.user_patterns:
            return {'user_pattern': None, 'emotional_baseline': 'neutral'}
        
        user_data = self.user_patterns[user_id]
        
        # Check for user's emotional baseline
        baseline = user_data.get('emotional_baseline', 'neutral')
        
        # Check for user's typical response patterns
        typical_responses = user_data.get('typical_responses', {})
        
        # Check for user's emotional triggers
        emotional_triggers = user_data.get('emotional_triggers', {})
        
        return {
            'user_pattern': 'known_user',
            'emotional_baseline': baseline,
            'typical_responses': typical_responses,
            'emotional_triggers': emotional_triggers
        }
    
    def _analyze_emotional_transitions(self, text: str, history: deque) -> Dict[str, Any]:
        """Analyze emotional transitions and patterns"""
        if not history:
            return {'transition_type': 'new_conversation', 'emotional_flow': 'stable'}
        
        # Get recent emotional states
        recent_states = list(history)[-self.window_size:]
        
        # Analyze transition patterns
        transitions = []
        for i in range(1, len(recent_states)):
            prev_emotion = recent_states[i-1]['emotion']
            curr_emotion = recent_states[i]['emotion']
            transitions.append((prev_emotion, curr_emotion))
        
        # Categorize transitions
        positive_transitions = [('sadness', 'joy'), ('fear', 'peace'), ('anger', 'calm')]
        negative_transitions = [('joy', 'sadness'), ('peace', 'fear'), ('calm', 'anger')]
        
        positive_count = sum(1 for t in transitions if t in positive_transitions)
        negative_count = sum(1 for t in transitions if t in negative_transitions)
        
        if positive_count > negative_count:
            transition_type = 'positive_trend'
        elif negative_count > positive_count:
            transition_type = 'negative_trend'
        else:
            transition_type = 'mixed_trend'
        
        return {
            'transition_type': transition_type,
            'emotional_flow': 'flowing' if len(transitions) > 2 else 'stable',
            'transition_count': len(transitions),
            'positive_transitions': positive_count,
            'negative_transitions': negative_count
        }
    
    def _combine_analyses(self, current: Dict, context: Dict, 
                          user: Dict, transition: Dict) -> Dict[str, Any]:
        """Combine all analyses into a comprehensive result"""
        
        combined = {
            'text_analysis': current,
            'context_analysis': context,
            'user_analysis': user,
            'transition_analysis': transition,
            'recommendations': []
        }
        
        # Generate context-aware recommendations
        if context.get('context_trend') == 'escalating':
            combined['recommendations'].append(
                "Emotional escalation detected - consider de-escalation techniques"
            )
        
        if context.get('context_trend') == 'volatile':
            combined['recommendations'].append(
                "Emotional volatility detected - consider grounding exercises"
            )
        
        if transition.get('transition_type') == 'negative_trend':
            combined['recommendations'].append(
                "Negative emotional trend detected - consider positive interventions"
            )
        
        # Add context-specific recommendations
        if 'work_context' in current.get('context_domains', []):
            combined['recommendations'].append(
                "Work-related context detected - consider work-life balance"
            )
        
        if 'health_context' in current.get('context_domains', []):
            combined['recommendations'].append(
                "Health-related context detected - consider professional support"
            )
        
        return combined
    
    def _update_history(self, conversation_id: str, text: str, analysis: Dict):
        """Update conversation history with new analysis"""
        entry = {
            'text': text,
            'emotion': analysis.get('emotion', 'neutral'),
            'timestamp': datetime.utcnow().isoformat(),
            'analysis': analysis
        }
        
        self.conversation_history[conversation_id].append(entry)
        
        # Keep only the last window_size entries
        if len(self.conversation_history[conversation_id]) > self.window_size:
            self.conversation_history[conversation_id].popleft()
    
    def _matches_pattern(self, emotions: List[str], pattern: List[str]) -> bool:
        """Check if emotions match a specific pattern"""
        if len(emotions) < len(pattern):
            return False
        
        # Check if the last emotions match the pattern
        return emotions[-len(pattern):] == pattern
    
    def get_conversation_summary(self, conversation_id: str) -> Dict[str, Any]:
        """Get a summary of the conversation"""
        if conversation_id not in self.conversation_history:
            return {'error': 'Conversation not found'}
        
        history = self.conversation_history[conversation_id]
        
        if not history:
            return {'error': 'No conversation history'}
        
        emotions = [entry['emotion'] for entry in history]
        emotion_counts = defaultdict(int)
        for emotion in emotions:
            emotion_counts[emotion] += 1
        
        # Calculate emotional diversity
        emotional_diversity = len(set(emotions)) / len(emotions) if emotions else 0
        
        # Find dominant emotion
        dominant_emotion = max(emotion_counts.items(), key=lambda x: x[1])[0] if emotion_counts else 'neutral'
        
        return {
            'conversation_id': conversation_id,
            'total_messages': len(history),
            'emotion_distribution': dict(emotion_counts),
            'dominant_emotion': dominant_emotion,
            'emotional_diversity': emotional_diversity,
            'conversation_duration': self._calculate_duration(history),
            'emotional_trend': self._calculate_trend(emotions)
        }
    
    def _calculate_duration(self, history: deque) -> str:
        """Calculate conversation duration"""
        if len(history) < 2:
            return "0 minutes"
        
        first_time = datetime.fromisoformat(history[0]['timestamp'])
        last_time = datetime.fromisoformat(history[-1]['timestamp'])
        duration = last_time - first_time
        
        if duration.total_seconds() < 60:
            return f"{int(duration.total_seconds())} seconds"
        elif duration.total_seconds() < 3600:
            return f"{int(duration.total_seconds() / 60)} minutes"
        else:
            return f"{int(duration.total_seconds() / 3600)} hours"
    
    def _calculate_trend(self, emotions: List[str]) -> str:
        """Calculate overall emotional trend"""
        if len(emotions) < 2:
            return "stable"
        
        # Simple trend calculation
        positive_emotions = ['joy', 'love', 'peace']
        negative_emotions = ['sadness', 'anger', 'fear']
        
        positive_count = sum(1 for e in emotions if e in positive_emotions)
        negative_count = sum(1 for e in emotions if e in negative_emotions)
        
        if positive_count > negative_count:
            return "positive"
        elif negative_count > positive_count:
            return "negative"
        else:
            return "neutral"

# Example usage
if __name__ == "__main__":
    analyzer = ContextWindowAnalyzer(window_size=5)
    
    # Simulate a conversation
    conversation_id = "test_conv_1"
    
    # Analyze several messages
    messages = [
        "I'm feeling okay today",
        "Actually, I'm a bit worried about work",
        "My boss is really stressing me out",
        "I'm so angry about this situation",
        "I think I need to talk to someone about this"
    ]
    
    for i, message in enumerate(messages):
        print(f"\nMessage {i+1}: {message}")
        analysis = analyzer.analyze_context(message, "user123", conversation_id)
        print(f"Analysis: {json.dumps(analysis, indent=2)}")
    
    # Get conversation summary
    summary = analyzer.get_conversation_summary(conversation_id)
    print(f"\nConversation Summary: {json.dumps(summary, indent=2)}")
