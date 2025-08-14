"""
Audio feature analyzer for processing Spotify audio features
"""
import asyncio
import logging
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import asdict

try:
    import numpy as np  # type: ignore
except ImportError:
    import math
    
    def clip(value, min_val, max_val):
        return max(min_val, min(max_val, value))
    
    # Create np namespace for compatibility
    class np:
        @staticmethod
        def clip(value, min_val, max_val):
            return clip(value, min_val, max_val)
        
        @staticmethod
        def mean(values):
            return sum(values) / len(values) if values else 0.0
        
        @staticmethod
        def average(values, weights=None):
            if not weights:
                return np.mean(values)
            total = sum(v * w for v, w in zip(values, weights))
            return total / sum(weights) if sum(weights) > 0 else 0.0

from .types import AudioFeatures, AudioResult, AudioMood
from .models.base import BaseAnalyzer
from .exceptions import AnalysisError

logger = logging.getLogger(__name__)

class AudioAnalyzer(BaseAnalyzer):
    """Analyzes Spotify audio features to determine mood and compatibility"""
    
    async def validate(self, data: Dict[str, float]) -> bool:
        """
        Validate input audio features
        
        Args:
            data: Audio features to validate
            
        Returns:
            bool: True if valid, False otherwise
        """
        required_features = {'valence', 'energy', 'danceability', 'tempo', 'mode'}
        if not all(k in data for k in required_features):
            return False
            
        try:
            # Validate value ranges
            if not (0 <= data.get('valence', 0) <= 1):
                return False
            if not (0 <= data.get('energy', 0) <= 1):
                return False
            if not (0 <= data.get('danceability', 0) <= 1):
                return False
            if not (0 <= data.get('tempo', 0) <= 300):  # Reasonable BPM range
                return False
            if data.get('mode') not in (0, 1):
                return False
            return True
        except (TypeError, ValueError):
            return False
    
    async def preprocess(self, data: Dict[str, float]) -> Dict[str, float]:
        """
        Preprocess audio features before analysis
        
        Args:
            data: Raw audio features
            
        Returns:
            Dict[str, float]: Preprocessed features
        """
        # Handle missing optional features
        defaults = {
            'instrumentalness': 0.0,
            'speechiness': 0.0,
            'acousticness': 0.0,
            'liveness': 0.0,
            'loudness': -10.0
        }
        
        # Create a new dict with defaults for missing values
        processed = {**defaults, **data}
        
        # Ensure all values are within valid ranges
        processed['valence'] = np.clip(processed['valence'], 0, 1)
        processed['energy'] = np.clip(processed['energy'], 0, 1)
        processed['danceability'] = np.clip(processed['danceability'], 0, 1)
        processed['tempo'] = np.clip(processed['tempo'], 0, 300)
        processed['mode'] = int(processed['mode'])  # Ensure int type
        
        return processed
    
    def __init__(self, feature_weights: Optional[Dict[str, float]] = None):
        """
        Initialize AudioAnalyzer
        
        Args:
            feature_weights: Optional custom weights for audio features
        """
        self.feature_weights = feature_weights or self._default_weights()
        self.mood_profiles = self._create_mood_profiles()
        self.initialized = False
        
    async def initialize(self) -> None:
        """Initialize the analyzer"""
        if self.initialized:
            return
        
        try:
            # Validate weights
            total = sum(self.feature_weights.values())
            if not 0.99 <= total <= 1.01:  # Allow small float imprecision
                raise ValueError(f"Feature weights must sum to 1.0, got {total}")
            
            self.initialized = True
            logger.info("AudioAnalyzer initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize AudioAnalyzer: {str(e)}")
            raise
    
    def _default_weights(self) -> Dict[str, float]:
        """Default weights for audio features"""
        return {
            'valence': 0.25,
            'energy': 0.20,
            'danceability': 0.15,
            'tempo': 0.10,
            'mode': 0.10,
            'instrumentalness': 0.05,
            'speechiness': 0.05,
            'acousticness': 0.05,
            'liveness': 0.05
        }
    
    def _create_mood_profiles(self) -> Dict[AudioMood, Dict[str, Tuple[float, float]]]:
        """Create mood profiles with expected ranges for each feature"""
        return {
            AudioMood.ENERGETIC: {
                'valence': (0.6, 1.0),
                'energy': (0.7, 1.0),
                'danceability': (0.6, 1.0),
                'tempo': (120, 200),
                'mode': (0.7, 1.0),  # Prefer major
            },
            AudioMood.CALM: {
                'valence': (0.3, 0.7),
                'energy': (0.0, 0.4),
                'danceability': (0.0, 0.5),
                'tempo': (60, 120),
                'acousticness': (0.3, 1.0),
            },
            AudioMood.HAPPY: {
                'valence': (0.7, 1.0),
                'energy': (0.5, 0.9),
                'danceability': (0.5, 1.0),
                'mode': (0.8, 1.0),  # Strongly prefer major
            },
            AudioMood.MELANCHOLIC: {
                'valence': (0.0, 0.4),
                'energy': (0.0, 0.5),
                'mode': (0.0, 0.3),  # Prefer minor
                'acousticness': (0.2, 1.0),
            },
            AudioMood.AGGRESSIVE: {
                'energy': (0.8, 1.0),
                'loudness': (0.8, 1.0),
                'valence': (0.0, 0.4),
                'tempo': (140, 200),
            },
            AudioMood.ROMANTIC: {
                'valence': (0.4, 0.8),
                'energy': (0.3, 0.6),
                'acousticness': (0.4, 1.0),
                'instrumentalness': (0.0, 0.4),
            },
            AudioMood.DANCEABLE: {
                'danceability': (0.7, 1.0),
                'energy': (0.6, 1.0),
                'tempo': (115, 130),
                'valence': (0.5, 1.0),
            }
        }
    
    async def analyze(self, data: Dict[str, float], query: str) -> AudioResult:
        """
        Analyze audio features to determine mood and compatibility
        
        Args:
            data: Spotify audio features dictionary
            query: User's search query for context
            
        Returns:
            AudioResult with mood prediction and scores
        """
        if not self.initialized:
            await self.initialize()
            
        try:
            # Validate input data
            if not await self.validate(data):
                raise ValueError("Invalid audio features format")
                
            # Preprocess the data
            processed_data = await self.preprocess(data)
            
            # Convert to structured format
            audio_features = self._parse_audio_features(processed_data)
            
            # Normalize features for consistent scoring
            normalized_features = await self._normalize_features(audio_features)
            
            # Predict mood based on feature patterns
            predicted_mood, confidence = await self._predict_mood(normalized_features)
            
            # Calculate feature contributions
            contributions = self._calculate_contributions(normalized_features, predicted_mood)
            
            # Calculate final score based on query match
            final_score = await self._calculate_query_match_score(
                normalized_features, predicted_mood, query, confidence
            )
            
            return AudioResult(
                score=final_score,
                features=asdict(normalized_features),
                confidence=confidence,
                details={
                    'predicted_mood': predicted_mood.value,
                    'mood_confidence': confidence,
                    'feature_contributions': contributions,
                    'raw_features': data,
                    'query': query
                }
            )
            
        except Exception as e:
            logger.error(f"Audio analysis failed: {str(e)}")
            raise AnalysisError(f"Failed to analyze audio features: {str(e)}") from e
    
    def _parse_audio_features(self, raw_features: Dict[str, float]) -> AudioFeatures:
        """Convert raw Spotify features to structured format"""
        try:
            return AudioFeatures(
                valence=raw_features.get('valence', 0.5),
                energy=raw_features.get('energy', 0.5),
                danceability=raw_features.get('danceability', 0.5),
                tempo=raw_features.get('tempo', 120.0),
                mode=int(raw_features.get('mode', 0)),  # Ensure int type
                instrumentalness=raw_features.get('instrumentalness', 0.0),
                speechiness=raw_features.get('speechiness', 0.0),
                acousticness=raw_features.get('acousticness', 0.0),
                liveness=raw_features.get('liveness', 0.0),
                loudness=raw_features.get('loudness', -10.0)
            )
        except Exception as e:
            raise ValueError(f"Invalid audio features format: {str(e)}") from e
    
    async def _normalize_features(self, features: AudioFeatures) -> AudioFeatures:
        """Normalize features to standard ranges"""
        loop = asyncio.get_event_loop()
        
        def _normalize():
            # Tempo normalization (typical range 60-200 BPM)
            normalized_tempo = np.clip((features.tempo - 60) / 140, 0, 1)
            
            # Loudness normalization (-60 to 0 dB)
            normalized_loudness = np.clip((features.loudness + 60) / 60, 0, 1)
            
            return AudioFeatures(
                valence=features.valence,  # Already 0-1
                energy=features.energy,    # Already 0-1
                danceability=features.danceability,  # Already 0-1
                tempo=normalized_tempo,
                mode=features.mode,  # Keep as int
                instrumentalness=features.instrumentalness,  # Already 0-1
                speechiness=features.speechiness,  # Already 0-1
                acousticness=features.acousticness,  # Already 0-1
                liveness=features.liveness,  # Already 0-1
                loudness=normalized_loudness
            )
        
        return await loop.run_in_executor(None, _normalize)
    
    async def _predict_mood(self, features: AudioFeatures) -> Tuple[AudioMood, float]:
        """Predict mood based on feature matching"""
        loop = asyncio.get_event_loop()
        
        def _predict():
            mood_scores: Dict[AudioMood, float] = {}
            
            for mood, profile in self.mood_profiles.items():
                score = 0.0
                total_weight = 0.0
                
                for feature_name, (min_val, max_val) in profile.items():
                    feature_value = getattr(features, feature_name)
                    weight = self.feature_weights.get(feature_name, 0.1)
                    
                    # Calculate how well feature matches profile
                    if feature_name == 'tempo':
                        # Special handling for tempo
                        if min_val <= features.tempo <= max_val:
                            match_score = 1.0
                        else:
                            # Penalize based on distance from range
                            distance = min(abs(features.tempo - min_val), 
                                         abs(features.tempo - max_val))
                            match_score = max(0.0, 1.0 - (distance / 50))
                    else:
                        # Standard 0-1 feature matching
                        if min_val <= feature_value <= max_val:
                            match_score = 1.0
                        else:
                            distance = min(abs(feature_value - min_val), 
                                         abs(feature_value - max_val))
                            match_score = max(0.0, 1.0 - distance)
                    
                    score += match_score * weight
                    total_weight += weight
                
                mood_scores[mood] = score / total_weight if total_weight > 0 else 0.0
            
            # Find best matching mood
            best_mood = max(mood_scores.items(), key=lambda x: x[1])
            return best_mood[0], best_mood[1]
        
        return await loop.run_in_executor(None, _predict)
    
    def _calculate_contributions(self, features: AudioFeatures, 
                               mood: AudioMood) -> Dict[str, float]:
        """Calculate how much each feature contributes to the mood prediction"""
        contributions = {}
        
        if mood in self.mood_profiles:
            profile = self.mood_profiles[mood]
            
            for feature_name in self.feature_weights.keys():
                if feature_name in profile:
                    feature_value = getattr(features, feature_name)
                    min_val, max_val = profile[feature_name]
                    
                    # Calculate contribution based on how well it matches
                    if min_val <= feature_value <= max_val:
                        contribution = self.feature_weights[feature_name]
                    else:
                        distance = min(abs(feature_value - min_val), 
                                     abs(feature_value - max_val))
                        contribution = max(0.0, 
                                        self.feature_weights[feature_name] * (1.0 - distance))
                    
                    contributions[feature_name] = contribution
        
        return contributions
    
    async def _calculate_query_match_score(
        self, 
        features: AudioFeatures, 
        mood: AudioMood, 
        query: str, 
        confidence: float
    ) -> float:
        """Calculate final score based on query matching"""
        loop = asyncio.get_event_loop()
        
        def _calculate():
            # Base score from mood confidence
            base_score = confidence
            
            # Query matching boost
            query_lower = query.lower()
            mood_keywords = {
                AudioMood.ENERGETIC: ['energy', 'energetic', 'pump', 'intense', 'active'],
                AudioMood.CALM: ['calm', 'peaceful', 'relax', 'chill', 'quiet'],
                AudioMood.HAPPY: ['happy', 'joy', 'cheerful', 'upbeat', 'positive'],
                AudioMood.MELANCHOLIC: ['sad', 'melancholic', 'depressed', 'down', 'blue'],
                AudioMood.AGGRESSIVE: ['aggressive', 'angry', 'intense', 'hard', 'heavy'],
                AudioMood.ROMANTIC: ['romantic', 'love', 'sweet', 'gentle', 'soft'],
                AudioMood.DANCEABLE: ['dance', 'party', 'club', 'groove', 'beat']
            }
            
            query_boost = 0.0
            if mood in mood_keywords:
                for keyword in mood_keywords[mood]:
                    if keyword in query_lower:
                        query_boost += 0.1
            
            # Feature-based adjustments for common queries
            feature_adjustments = 0.0
            if 'fast' in query_lower and features.tempo > 0.7:
                feature_adjustments += 0.1
            elif 'slow' in query_lower and features.tempo < 0.3:
                feature_adjustments += 0.1
            
            if 'loud' in query_lower and features.loudness > 0.7:
                feature_adjustments += 0.1
            elif 'quiet' in query_lower and features.loudness < 0.3:
                feature_adjustments += 0.1
            
            final_score = min(1.0, base_score + query_boost + feature_adjustments)
            return final_score
        
        return await loop.run_in_executor(None, _calculate)
