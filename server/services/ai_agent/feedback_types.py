"""
Data structures for feedback learning system
"""
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum

class FeedbackType(Enum):
    """Types of user feedback"""
    POSITIVE = "positive"
    NEGATIVE = "negative" 
    SKIP = "skip"
    SAVE = "save"
    SHARE = "share"

class ModelVersion(Enum):
    """Model versions for A/B testing"""
    BASELINE = "v1.0"
    CURRENT = "v1.1"
    EXPERIMENTAL = "v1.2"

@dataclass
class UserFeedback:
    """User feedback data"""
    user_id: str
    song_id: str
    query: str
    feedback_type: FeedbackType
    match_score: float
    timestamp: datetime
    session_id: Optional[str] = None
    context: Dict[str, Any] = field(default_factory=dict)

@dataclass
class TrainingFeature:
    """Features for model training"""
    # Emotion features
    emotion_score: float
    emotion_confidence: float
    primary_emotion: str
    sentiment_polarity: float
    
    # Audio features  
    audio_score: float
    audio_mood: str
    valence: float
    energy: float
    danceability: float
    tempo_normalized: float
    
    # Context features
    query_length: int
    query_sentiment: float
    time_of_day: int  # 0-23
    day_of_week: int  # 0-6
    
    # User features (aggregated, anonymized)
    user_avg_valence_pref: float
    user_avg_energy_pref: float
    user_feedback_history_size: int
    
    # Target
    feedback_score: float  # -1 to 1

@dataclass 
class ModelPerformance:
    """Model performance metrics"""
    model_version: ModelVersion
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    total_predictions: int
    timestamp: datetime
