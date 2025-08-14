"""
Feature engineering pipeline for feedback learning
"""
import asyncio
import numpy as np  # type: ignore
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime, timedelta
from .feedback_types import UserFeedback, TrainingFeature, FeedbackType
from .exceptions import AnalysisError

class FeatureEngineer:
    """Feature engineering for feedback learning"""
    
    def __init__(self):
        self.user_profiles: Dict[str, Dict[str, float]] = {}
        self.global_stats = {
            'avg_valence': 0.5,
            'avg_energy': 0.5,
            'avg_tempo': 0.5
        }
    
    async def create_training_features(self, 
                                     feedback: UserFeedback,
                                     emotion_result: Any,
                                     audio_result: Any,
                                     query_analysis: Optional[Dict] = None) -> TrainingFeature:
        """
        Create training features from feedback and analysis results
        
        Args:
            feedback: User feedback data
            emotion_result: Emotion analysis result
            audio_result: Audio analysis result  
            query_analysis: Optional query sentiment analysis
            
        Returns:
            TrainingFeature for model training
        """
        try:
            # Get user profile (anonymized aggregations)
            user_profile = await self._get_user_profile(feedback.user_id)
            
            # Extract temporal features
            timestamp = feedback.timestamp
            time_features = self._extract_time_features(timestamp)
            
            # Query features
            query_features = await self._analyze_query_features(
                feedback.query, query_analysis
            )
            
            # Convert feedback to numerical score
            feedback_score = self._feedback_to_score(feedback.feedback_type)
            
            return TrainingFeature(
                # Emotion features
                emotion_score=emotion_result.score,
                emotion_confidence=getattr(emotion_result, 'confidence', 0.5),
                primary_emotion=str(emotion_result.primary_emotion.category.value),
                sentiment_polarity=emotion_result.sentiment_polarity,
                
                # Audio features
                audio_score=audio_result.score,
                audio_mood=str(audio_result.predicted_mood.value),
                valence=audio_result.details['normalized_features']['valence'],
                energy=audio_result.details['normalized_features']['energy'],
                danceability=audio_result.details['normalized_features']['danceability'],
                tempo_normalized=audio_result.details['normalized_features']['tempo'],
                
                # Context features
                query_length=len(feedback.query.split()),
                query_sentiment=query_features['sentiment'],
                time_of_day=time_features['hour'],
                day_of_week=time_features['weekday'],
                
                # User features (anonymized)
                user_avg_valence_pref=user_profile['avg_valence_pref'],
                user_avg_energy_pref=user_profile['avg_energy_pref'],
                user_feedback_history_size=int(min(user_profile['feedback_count'], 100)),
                
                # Targetc
                feedback_score=feedback_score
            )
            
        except Exception as e:
            raise AnalysisError(f"Feature engineering failed: {str(e)}") from e
    
    async def _get_user_profile(self, user_id: str) -> Dict[str, float]:
        """Get anonymized user profile features"""
        if user_id not in self.user_profiles:
            # Cold start - use global averages
            return {
                'avg_valence_pref': self.global_stats['avg_valence'],
                'avg_energy_pref': self.global_stats['avg_energy'],
                'feedback_count': 0
            }
        
        return self.user_profiles[user_id]
    
    def _extract_time_features(self, timestamp: datetime) -> Dict[str, int]:
        """Extract temporal features"""
        return {
            'hour': timestamp.hour,
            'weekday': timestamp.weekday(),
            'month': timestamp.month
        }
    
    async def _analyze_query_features(self, query: str, 
                                    query_analysis: Optional[Dict]) -> Dict[str, float]:
        """Extract features from user query"""
        if query_analysis:
            sentiment = query_analysis.get('sentiment', 0.0)
        else:
            # Simple heuristic-based sentiment
            positive_words = ['happy', 'upbeat', 'energetic', 'fun', 'love']
            negative_words = ['sad', 'depressed', 'angry', 'hate', 'tired']
            
            query_lower = query.lower()
            positive_count = sum(1 for word in positive_words if word in query_lower)
            negative_count = sum(1 for word in negative_words if word in query_lower)
            
            if positive_count > negative_count:
                sentiment = 0.7
            elif negative_count > positive_count:
                sentiment = -0.7
            else:
                sentiment = 0.0
        
        return {
            'sentiment': sentiment,
            'length': len(query.split()),
            'has_emotion_words': any(word in query.lower() 
                                   for word in ['feel', 'mood', 'emotion'])
        }
    
    def _feedback_to_score(self, feedback_type: FeedbackType) -> float:
        """Convert feedback type to numerical score"""
        mapping = {
            FeedbackType.POSITIVE: 1.0,
            FeedbackType.SAVE: 0.8,
            FeedbackType.SHARE: 0.9,
            FeedbackType.SKIP: -0.3,
            FeedbackType.NEGATIVE: -1.0
        }
        return mapping.get(feedback_type, 0.0)
    
    async def update_user_profile(self, user_id: str, 
                                audio_features: Dict[str, float],
                                feedback_score: float):
        """Update user profile with new interaction (anonymized)"""
        if user_id not in self.user_profiles:
            self.user_profiles[user_id] = {
                'avg_valence_pref': self.global_stats['avg_valence'],
                'avg_energy_pref': self.global_stats['avg_energy'],
                'feedback_count': 0
            }
        
        profile = self.user_profiles[user_id]
        
        # Only update preferences for positive feedback
        if feedback_score > 0:
            alpha = 0.1  # Learning rate
            
            profile['avg_valence_pref'] = (
                (1 - alpha) * profile['avg_valence_pref'] + 
                alpha * audio_features.get('valence', 0.5)
            )
            
            profile['avg_energy_pref'] = (
                (1 - alpha) * profile['avg_energy_pref'] + 
                alpha * audio_features.get('energy', 0.5)
            )
        
        profile['feedback_count'] += 1
        
        # Cap profile data for privacy
        if profile['feedback_count'] > 1000:
            profile['feedback_count'] = 1000
