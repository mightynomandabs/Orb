# Machine Learning Enhanced Emotion Detector
# This module provides advanced ML capabilities for emotion detection

import numpy as np
import re
from typing import Dict, List, Any, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import pickle
import os

class MLEnhancedEmotionDetector:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            max_features=1000,
            ngram_range=(1, 3),
            stop_words='english',
            min_df=2,
            max_df=0.95
        )
        self.classifier = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        self.is_trained = False
        self.emotion_mapping = {
            'joy': 0, 'fear': 1, 'sadness': 2, 
            'anger': 3, 'love': 4, 'peace': 5, 'neutral': 6
        }
        self.reverse_mapping = {v: k for k, v in self.emotion_mapping.items()}
        
        # Training data for initial model
        self.training_data = self._generate_training_data()
        
    def _generate_training_data(self) -> List[Tuple[str, str]]:
        """Generate comprehensive training data for all emotions"""
        training_data = []
        
        # Joy training examples
        joy_examples = [
            "i am so happy today", "i won the lottery", "i got promoted",
            "this is amazing", "i feel wonderful", "i'm ecstatic",
            "i'm thrilled", "i'm overjoyed", "i'm elated", "i'm euphoric",
            "i'm blissful", "i achieved my goal", "i'm successful",
            "i'm grateful", "i'm blessed", "i'm cheerful", "i'm delighted",
            "i'm excited", "i'm proud", "i'm accomplished", "i'm victorious"
        ]
        for example in joy_examples:
            training_data.append((example, 'joy'))
        
        # Fear training examples
        fear_examples = [
            "i am terrified", "i killed someone", "i'm scared",
            "i'm afraid", "i'm anxious", "i'm worried", "i'm nervous",
            "i'm stressed", "i'm overwhelmed", "i'm paranoid",
            "i'm suspicious", "i'm cautious", "i'm wary", "i'm hesitant",
            "i'm timid", "i'm shy", "i'm intimidated", "i'm threatened",
            "i'm vulnerable", "i'm exposed", "i'm unsafe", "i'm in danger"
        ]
        for example in fear_examples:
            training_data.append((example, 'fear'))
        
        # Sadness training examples
        sadness_examples = [
            "i am devastated", "i'm heartbroken", "i'm depressed",
            "i'm sad", "i'm down", "i'm lonely", "i'm hurt",
            "i'm broken", "i'm crying", "i'm lost", "i miss you",
            "i'm alone", "i'm abandoned", "i'm disappointed",
            "i'm upset", "i'm unhappy", "i'm miserable", "i'm wretched",
            "i'm hopeless", "i'm helpless", "i'm worthless", "i'm useless"
        ]
        for example in sadness_examples:
            training_data.append((example, 'sadness'))
        
        # Anger training examples
        anger_examples = [
            "i am furious", "i'm enraged", "i'm livid", "i'm fuming",
            "i hate this", "i despise you", "i'm disgusted",
            "i'm angry", "i'm mad", "i'm frustrated", "i'm irritated",
            "i'm annoyed", "i'm pissed", "i'm upset", "i'm bothered",
            "i'm resentful", "i'm touchy", "i'm defensive", "i'm protective",
            "i'm jealous", "i'm envious", "i'm bitter", "i'm cynical"
        ]
        for example in anger_examples:
            training_data.append((example, 'anger'))
        
        # Love training examples
        love_examples = [
            "i love you", "i adore you", "i worship you", "i'm passionate",
            "i'm devoted", "i cherish you", "you're precious", "you're beloved",
            "you're darling", "you're my sweetheart", "you're my soulmate",
            "this is true love", "eternal love", "unconditional love",
            "pure love", "deep love", "intense love", "burning love",
            "i'm romantic", "i have a crush", "i'm affectionate", "i'm tender"
        ]
        for example in love_examples:
            training_data.append((example, 'love'))
        
        # Peace training examples
        peace_examples = [
            "i am peaceful", "i'm calm", "i'm relaxed", "i'm zen",
            "i'm meditative", "i'm contemplative", "i'm reflective",
            "i'm mindful", "i'm centered", "i'm balanced", "i'm harmonious",
            "i'm unified", "i'm integrated", "i'm whole", "i'm complete",
            "i'm fulfilled", "i'm content", "i'm satisfied", "i'm comfortable",
            "i'm at ease", "i'm unworried", "i'm untroubled", "i'm carefree"
        ]
        for example in peace_examples:
            training_data.append((example, 'peace'))
        
        # Neutral training examples
        neutral_examples = [
            "i feel nothing", "i'm indifferent", "i'm apathetic",
            "i'm unconcerned", "i'm uninterested", "i'm unmoved",
            "i'm unaffected", "i'm detached", "i'm disconnected",
            "i'm disengaged", "i'm uninvolved", "i'm uncommitted",
            "i'm neutral", "i'm okay", "i'm fine", "i'm alright",
            "i'm normal", "i'm average", "i'm ordinary", "i'm regular",
            "i'm standard", "i'm typical", "i'm usual", "i'm common"
        ]
        for example in neutral_examples:
            training_data.append((example, 'neutral'))
        
        return training_data
    
    def train_model(self):
        """Train the ML model with the training data"""
        if not self.training_data:
            raise ValueError("No training data available")
        
        texts, labels = zip(*self.training_data)
        
        # Convert labels to numeric
        numeric_labels = [self.emotion_mapping[label] for label in labels]
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            texts, numeric_labels, test_size=0.2, random_state=42
        )
        
        # Vectorize text
        X_train_vectors = self.vectorizer.fit_transform(X_train)
        X_test_vectors = self.vectorizer.transform(X_test)
        
        # Train classifier
        self.classifier.fit(X_train_vectors, y_train)
        
        # Evaluate
        y_pred = self.classifier.predict(X_test_vectors)
        accuracy = accuracy_score(y_test, y_pred)
        
        print(f"ML Model trained with {len(X_train)} examples")
        print(f"Test accuracy: {accuracy:.3f}")
        print(f"Classification report:")
        print(classification_report(y_test, y_pred, 
                                  target_names=list(self.emotion_mapping.keys())))
        
        self.is_trained = True
        return accuracy
    
    def predict_emotion_ml(self, text: str) -> Dict[str, Any]:
        """Predict emotion using the trained ML model"""
        if not self.is_trained:
            self.train_model()
        
        # Vectorize input text
        text_vector = self.vectorizer.transform([text])
        
        # Get prediction and probabilities
        prediction = self.classifier.predict(text_vector)[0]
        probabilities = self.classifier.predict_proba(text_vector)[0]
        
        # Get emotion name
        predicted_emotion = self.reverse_mapping[prediction]
        
        # Get confidence (highest probability)
        confidence = np.max(probabilities)
        
        # Get all emotion probabilities
        emotion_probs = {}
        for emotion, idx in self.emotion_mapping.items():
            emotion_probs[emotion] = probabilities[idx]
        
        # Sort emotions by probability
        sorted_emotions = sorted(emotion_probs.items(), 
                               key=lambda x: x[1], reverse=True)
        
        return {
            'emotion': predicted_emotion,
            'confidence': confidence,
            'probabilities': emotion_probs,
            'top_emotions': sorted_emotions[:3],
            'method': 'ml_model'
        }
    
    def save_model(self, filepath: str = 'emotion_model.pkl'):
        """Save the trained model to disk"""
        if not self.is_trained:
            raise ValueError("Model must be trained before saving")
        
        model_data = {
            'vectorizer': self.vectorizer,
            'classifier': self.classifier,
            'emotion_mapping': self.emotion_mapping,
            'reverse_mapping': self.reverse_mapping
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)
        
        print(f"Model saved to {filepath}")
    
    def load_model(self, filepath: str = 'emotion_model.pkl'):
        """Load a trained model from disk"""
        if not os.path.exists(filepath):
            print(f"Model file {filepath} not found. Training new model...")
            self.train_model()
            return
        
        with open(filepath, 'rb') as f:
            model_data = pickle.load(f)
        
        self.vectorizer = model_data['vectorizer']
        self.classifier = model_data['classifier']
        self.emotion_mapping = model_data['emotion_mapping']
        self.reverse_mapping = model_data['reverse_mapping']
        self.is_trained = True
        
        print(f"Model loaded from {filepath}")

class HybridEmotionDetector:
    """Combines rule-based and ML-based detection for maximum accuracy"""
    
    def __init__(self):
        self.rule_based = None  # Will be set from main service
        self.ml_detector = MLEnhancedEmotionDetector()
        
    def analyze_emotion_hybrid(self, text: str, rule_based_result: Dict[str, Any]) -> Dict[str, Any]:
        """Combine rule-based and ML-based detection"""
        # Get ML prediction
        ml_result = self.ml_detector.predict_emotion_ml(text)
        
        # Combine results
        rule_confidence = rule_based_result.get('confidence', 0.5)
        ml_confidence = ml_result.get('confidence', 0.5)
        
        # Weight the results (can be adjusted)
        rule_weight = 0.6  # Rule-based gets more weight initially
        ml_weight = 0.4
        
        # Calculate combined confidence
        combined_confidence = (rule_confidence * rule_weight + 
                             ml_confidence * ml_weight)
        
        # Determine final emotion
        if rule_confidence > 0.8 and ml_confidence > 0.7:
            # Both methods agree with high confidence
            final_emotion = rule_based_result['emotion']
            method = 'hybrid_agreement'
        elif rule_confidence > ml_confidence:
            # Rule-based is more confident
            final_emotion = rule_based_result['emotion']
            method = 'rule_based'
        else:
            # ML is more confident
            final_emotion = ml_result['emotion']
            method = 'ml_based'
        
        # Enhanced insights
        insights = []
        if rule_based_result.get('insights'):
            insights.extend(rule_based_result['insights'])
        
        if rule_confidence > 0.8:
            insights.append(f"Rule-based detection: Very confident ({rule_confidence:.2f})")
        elif rule_confidence > 0.6:
            insights.append(f"Rule-based detection: Confident ({rule_confidence:.2f})")
        
        if ml_confidence > 0.8:
            insights.append(f"ML detection: Very confident ({ml_confidence:.2f})")
        elif ml_confidence > 0.6:
            insights.append(f"ML detection: Confident ({ml_confidence:.2f})")
        
        if abs(rule_confidence - ml_confidence) < 0.1:
            insights.append("Both detection methods agree")
        else:
            insights.append(f"Detection methods differ: Rule-based ({rule_confidence:.2f}) vs ML ({ml_confidence:.2f})")
        
        return {
            'emotion': final_emotion,
            'color': rule_based_result.get('color', '#808080'),
            'intensity': rule_based_result.get('intensity', 0.5),
            'confidence': combined_confidence,
            'insights': insights,
            'recommendations': rule_based_result.get('recommendations', []),
            'matches': rule_based_result.get('matches', []),
            'method': method,
            'rule_based_result': rule_based_result,
            'ml_result': ml_result
        }
