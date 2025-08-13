from dataclasses import dataclass
from typing import Dict, Any, Optional, List, Union
from datetime import datetime

@dataclass
class EmotionResult:
    """Result from emotion analysis"""
    score: float
    emotions: Dict[str, float]
    confidence: float
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
