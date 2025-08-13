import asyncio
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime

from .types import (
    AnalysisResult,
    AnalysisRequest,
    EmotionResult,
    AudioResult,
    CombinedScore
)
from .exceptions import AnalysisError, ValidationError
from .emotion_analyzer import EmotionAnalyzer
from .audio_analyzer import AudioAnalyzer
from .feedback_learner import FeedbackLearner
from .cache_manager import CacheManager

logger = logging.getLogger(__name__)

class VibeMatchingAgent:
    """Core AI agent for matching songs with vibes/emotions"""
    
    def __init__(
        self,
        emotion_analyzer: EmotionAnalyzer,
        audio_analyzer: AudioAnalyzer,
        feedback_learner: FeedbackLearner,
        cache_manager: CacheManager,
        config: Optional[Dict[str, Any]] = None
    ):
        """Initialize the VibeMatchingAgent with its components
        
        Args:
            emotion_analyzer: Component for analyzing lyrics and emotions
            audio_analyzer: Component for analyzing audio features
            feedback_learner: Component for learning from user feedback
            cache_manager: Component for caching results
            config: Optional configuration dictionary
        """
        self.emotion_analyzer = emotion_analyzer
        self.audio_analyzer = audio_analyzer
        self.feedback_learner = feedback_learner
        self.cache_manager = cache_manager
        self.config = config or {}
        
        # Configure logging
        self._setup_logging()
    
    def _setup_logging(self) -> None:
        """Configure logging for the agent"""
        logging.basicConfig(
            level=self.config.get('log_level', logging.INFO),
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
    
    async def initialize(self) -> None:
        """Initialize all components of the agent"""
        try:
            await asyncio.gather(
                self.emotion_analyzer.initialize(),
                self.audio_analyzer.initialize(),
                self.feedback_learner.initialize()
            )
            logger.info("VibeMatchingAgent initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize VibeMatchingAgent: {str(e)}")
            raise
    
    async def analyze_song(self, request: AnalysisRequest) -> AnalysisResult:
        """
        Analyze a song using multi-modal approach
        
        Args:
            request: AnalysisRequest containing all necessary data
            
        Returns:
            AnalysisResult with scores and metadata
            
        Raises:
            AnalysisError: If analysis fails
            ValidationError: If input validation fails
        """
        try:
            # Validate input
            self._validate_request(request)
            
            # Generate cache key
            cache_key = self._generate_cache_key(request)
            
            # Try to get from cache first
            cached_result = await self.cache_manager.get(cache_key)
            if cached_result:
                logger.info(f"Cache hit for key: {cache_key}")
                return cached_result
            
            # Perform analysis if not in cache
            result = await self._perform_analysis(request)
            
            # Cache the result
            await self.cache_manager.set(cache_key, result)
            
            return result
            
        except Exception as e:
            logger.error(f"Analysis failed: {str(e)}")
            raise AnalysisError(f"Failed to analyze song: {str(e)}") from e
    
    def _validate_request(self, request: AnalysisRequest) -> None:
        """Validate the analysis request"""
        if not request.lyrics or not request.lyrics.strip():
            raise ValidationError("Lyrics cannot be empty")
        if not request.audio_features:
            raise ValidationError("Audio features cannot be empty")
        if not request.query or not request.query.strip():
            raise ValidationError("Query cannot be empty")
    
    def _generate_cache_key(self, request: AnalysisRequest) -> str:
        """Generate a unique cache key for the request"""
        # Use relevant fields to generate a unique key
        components = [
            request.lyrics[:100],  # First 100 chars of lyrics
            str(sorted(request.audio_features.items())),  # Sorted audio features
            request.query,
            request.user_id or 'anonymous'
        ]
        return ":".join(components)
    
    async def _perform_analysis(self, request: AnalysisRequest) -> AnalysisResult:
        """Perform the actual analysis"""
        try:
            # Run emotion and audio analysis concurrently
            emotion_task = self.emotion_analyzer.analyze(request.lyrics, request.query)
            audio_task = self.audio_analyzer.analyze(request.audio_features, request.query)
            
            emotion_result, audio_result = await asyncio.gather(
                emotion_task,
                audio_task,
                return_exceptions=True
            )
            
            # Check for exceptions in results
            for result in [emotion_result, audio_result]:
                if isinstance(result, Exception):
                    raise result
            
            # Combine scores using feedback learner
            combined_score = await self.feedback_learner.combine_scores(
                emotion_result,
                audio_result,
                request.user_id
            )
            
            return AnalysisResult(
                emotion_score=emotion_result.score,
                audio_score=audio_result.score,
                combined_score=combined_score.score,
                confidence=combined_score.confidence,
                metadata={
                    'emotion_details': emotion_result.details,
                    'audio_details': audio_result.details,
                    'query': request.query,
                    'user_id': request.user_id,
                    'context': request.context
                },
                timestamp=datetime.utcnow()
            )
            
        except Exception as e:
            logger.error(f"Analysis failed: {str(e)}")
            raise AnalysisError(f"Failed to perform analysis: {str(e)}") from e
    
    async def process_feedback(
        self,
        analysis_result: AnalysisResult,
        feedback: Dict[str, Any],
        user_id: Optional[str] = None
    ) -> None:
        """Process user feedback to improve future analyses"""
        try:
            await self.feedback_learner.learn(
                features={
                    'emotion_score': analysis_result.emotion_score,
                    'audio_score': analysis_result.audio_score,
                    'metadata': analysis_result.metadata
                },
                feedback=feedback,
                user_id=user_id
            )
            logger.info(f"Processed feedback for user {user_id}")
        except Exception as e:
            logger.error(f"Failed to process feedback: {str(e)}")
            raise
