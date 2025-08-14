from dataclasses import dataclass
from typing import Dict, Any, Optional, List, Union
from datetime import datetime
from enum import Enum

class EmotionCategory(Enum):
    """Supported emotion categories"""
    HAPPINESS = "happiness"
    SADNESS = "sadness"
    ANGER = "anger"
    FEAR = "fear"
    SURPRISE = "surprise"
    LOVE = "love"
    ENERGY = "energy"

@dataclass
class EmotionScore:
    """Individual emotion score"""
    category: EmotionCategory
    confidence: float
    intensity: float

@dataclass
class EmotionResult:
    """Comprehensive emotion analysis result"""
    primary_emotion: EmotionScore
    secondary_emotions: List[EmotionScore]
    sentiment_polarity: float  # -1 to 1
    emotional_intensity: float  # 0 to 1
    score: float  # Final weighted score
    details: Dict[str, Any]

@dataclass
class AudioResult:
    """Result from audio feature analysis"""
    score: float
    features: Dict[str, float]
    confidence: float
    details: Dict[str, Any]

@dataclass
class CombinedScore:
    """Combined analysis score"""
    score: float
    confidence: float
    weights: Dict[str, float]

@dataclass
class AnalysisResult:
    """Final analysis result"""
    emotion_score: float
    audio_score: float
    combined_score: float
    confidence: float
    metadata: Dict[str, Any]
    timestamp: datetime

@dataclass
class AnalysisRequest:
    """Analysis request parameters"""
    lyrics: str
    audio_features: Dict[str, float]
    query: str
    user_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None
