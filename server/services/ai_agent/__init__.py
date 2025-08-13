"""
AI Agent for sophisticated song-emotion matching
"""

from .core import VibeMatchingAgent
from .types import (
    AnalysisResult,
    AnalysisRequest,
    EmotionResult,
    AudioResult,
    CombinedScore
)
from .exceptions import (
    AIAgentError,
    AnalysisError,
    ModelNotFoundError,
    CacheError,
    ValidationError,
    FeedbackError,
    ConfigurationError
)

__all__ = [
    'VibeMatchingAgent',
    'AnalysisResult',
    'AnalysisRequest',
    'EmotionResult',
    'AudioResult',
    'CombinedScore',
    'AIAgentError',
    'AnalysisError',
    'ModelNotFoundError',
    'CacheError',
    'ValidationError',
    'FeedbackError',
    'ConfigurationError'
]

__version__ = '0.1.0'
