"""
Types for multi-modal integration and fusion
"""
from dataclasses import dataclass
from typing import Dict, List, Any, Optional
from enum import Enum

class FusionStrategy(Enum):
    """Available fusion strategies for multi-modal integration"""
    WEIGHTED_AVERAGE = "weighted_average"
    LEARNED_FUSION = "learned_fusion"
    ATTENTION_BASED = "attention_based"
    RANK_FUSION = "rank_fusion"

@dataclass
class ContextualFactors:
    """Contextual information for recommendation"""
    time_of_day: int  # 0-23
    day_of_week: int  # 0-6
    user_listening_history: Dict[str, float]
    current_playlist_context: Optional[str]
    social_context: Optional[str]  # alone, with_friends, party, etc.
    device_type: Optional[str]  # mobile, desktop, speaker
    location_context: Optional[str]  # home, work, gym, car

@dataclass
class ExplanationComponent:
    """Component of recommendation explanation"""
    component: str  # "lyrics", "audio", "context", "user_preference"
    contribution_score: float
    explanation_text: str
    supporting_evidence: List[str]

@dataclass
class IntegratedResult:
    """Result of multi-modal integration"""
    final_score: float
    confidence: float
    explanation_components: List[ExplanationComponent]
    fusion_strategy_used: FusionStrategy
    processing_time_ms: float
    metadata: Dict[str, Any]
