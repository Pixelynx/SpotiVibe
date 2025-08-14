"""
Enhanced emotion analysis using multiple models
"""
import asyncio
import logging
from typing import Dict, List, Optional, Any, Tuple
from transformers import pipeline, Pipeline
import numpy as np
from dataclasses import asdict

from .types import EmotionResult, EmotionScore, EmotionCategory
from .models.base import BaseAnalyzer
from .exceptions import ModelNotFoundError, AnalysisError

logger = logging.getLogger(__name__)

class EmotionAnalyzer(BaseAnalyzer):
    """
    Multi-model emotion analyzer that combines zero-shot classification,
    sentiment analysis, and emotion-specific models.
    """
    
    def __init__(self, model_config: Optional[Dict[str, str]] = None):
        """
        Initialize the EmotionAnalyzer
        
        Args:
            model_config: Optional configuration mapping model names to paths
        """
        self.model_config = model_config or self._default_models()
        self.models: Dict[str, Pipeline] = {}
        self.emotion_labels = [e.value for e in EmotionCategory]
        self.initialized = False
        
    def _default_models(self) -> Dict[str, str]:
        """Default model configurations"""
        return {
            'zero_shot': 'MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli',
            'sentiment': 'cardiffnlp/twitter-roberta-base-sentiment-latest',
            'emotion': 'j-hartmann/emotion-english-distilroberta-base'
        }
    
    async def initialize(self) -> None:
        """Initialize all models asynchronously"""
        if self.initialized:
            return
            
        try:
            tasks = []
            for model_name, model_path in self.model_config.items():
                task = asyncio.create_task(self._load_model(model_name, model_path))
                tasks.append(task)
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for model_name, result in zip(self.model_config.keys(), results):
                if isinstance(result, Exception):
                    logger.error(f"Failed to load {model_name}: {result}")
                else:
                    self.models[model_name] = result
                    logger.info(f"Successfully loaded {model_name}")
            
            if not self.models:
                raise ModelNotFoundError("No models were successfully loaded")
                
            self.initialized = True
            
        except Exception as e:
            logger.error(f"Failed to initialize EmotionAnalyzer: {str(e)}")
            raise
    
    async def _load_model(self, model_name: str, model_path: str) -> Pipeline:
        """
        Load individual model in executor to avoid blocking
        
        Args:
            model_name: Name of the model to load
            model_path: Path or identifier of the model
            
        Returns:
            Loaded model pipeline
        """
        loop = asyncio.get_event_loop()
        
        def _load():
            try:
                if model_name == 'zero_shot':
                    return pipeline("zero-shot-classification", model=model_path)
                elif model_name == 'sentiment':
                    return pipeline("sentiment-analysis", model=model_path)
                elif model_name == 'emotion':
                    return pipeline("text-classification", model=model_path)
                else:
                    raise ModelNotFoundError(f"Unknown model type: {model_name}")
            except Exception as e:
                logger.error(f"Error loading model {model_name}: {str(e)}")
                raise ModelNotFoundError(f"Failed to load {model_name}") from e
        
        return await loop.run_in_executor(None, _load)
    
    async def analyze(self, lyrics: str, query: str) -> EmotionResult:
        """
        Perform comprehensive emotion analysis
        
        Args:
            lyrics: Song lyrics to analyze
            query: User's mood query for context
            
        Returns:
            EmotionResult with detailed analysis
        """
        if not self.initialized:
            await self.initialize()
        
        try:
            # Run all available analyses concurrently
            tasks = []
            
            if 'zero_shot' in self.models:
                tasks.append(self._analyze_zero_shot(lyrics, query))
            if 'sentiment' in self.models:
                tasks.append(self._analyze_sentiment(lyrics))
            if 'emotion' in self.models:
                tasks.append(self._analyze_emotion(lyrics))
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Process results and handle exceptions
            analysis_data: Dict[str, Any] = {}
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    logger.warning(f"Analysis {i} failed: {result}")
                else:
                    analysis_data.update(result)
            
            if not analysis_data:
                raise AnalysisError("All analyses failed")
            
            return self._combine_analyses(analysis_data, query)
            
        except Exception as e:
            logger.error(f"Analysis failed: {str(e)}")
            raise AnalysisError(f"Failed to analyze lyrics: {str(e)}") from e
    
    async def _analyze_zero_shot(self, lyrics: str, query: str) -> Dict[str, Any]:
        """Zero-shot classification against emotion labels"""
        loop = asyncio.get_event_loop()
        
        def _analyze():
            # Combine query context with standard emotion labels
            candidate_labels = self.emotion_labels + [query] if query else self.emotion_labels
            chunks = self._split_text(lyrics)
            results = []
            
            for chunk in chunks:
                result = self.models['zero_shot'](chunk, candidate_labels)
                results.append(result)
            
            return {'zero_shot': self._aggregate_zero_shot(results)}
        
        return await loop.run_in_executor(None, _analyze)
    
    async def _analyze_sentiment(self, lyrics: str) -> Dict[str, Any]:
        """Sentiment analysis"""
        loop = asyncio.get_event_loop()
        
        def _analyze():
            chunks = self._split_text(lyrics)
            results = []
            
            for chunk in chunks:
                result = self.models['sentiment'](chunk)
                results.extend(result)
            
            return {'sentiment': self._aggregate_sentiment(results)}
        
        return await loop.run_in_executor(None, _analyze)
    
    async def _analyze_emotion(self, lyrics: str) -> Dict[str, Any]:
        """Detailed emotion classification"""
        loop = asyncio.get_event_loop()
        
        def _analyze():
            chunks = self._split_text(lyrics)
            results = []
            
            for chunk in chunks:
                result = self.models['emotion'](chunk)
                results.extend(result)
            
            return {'emotion': self._aggregate_emotions(results)}
        
        return await loop.run_in_executor(None, _analyze)
    
    def _split_text(self, text: str, max_length: int = 512) -> List[str]:
        """Split text into chunks of maximum token length"""
        # Simple splitting by sentences - in production you'd want to use
        # a proper tokenizer to respect token limits
        sentences = text.split('.')
        chunks = []
        current_chunk = []
        current_length = 0
        
        for sentence in sentences:
            # Rough approximation - in production use actual tokenizer
            sentence_length = len(sentence.split())
            if current_length + sentence_length > max_length:
                chunks.append('. '.join(current_chunk))
                current_chunk = [sentence]
                current_length = sentence_length
            else:
                current_chunk.append(sentence)
                current_length += sentence_length
        
        if current_chunk:
            chunks.append('. '.join(current_chunk))
        
        return chunks
    
    def _aggregate_zero_shot(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Aggregate zero-shot classification results"""
        all_scores = {}
        for result in results:
            for label, score in zip(result['labels'], result['scores']):
                if label not in all_scores:
                    all_scores[label] = []
                all_scores[label].append(score)
        
        return {
            'labels': list(all_scores.keys()),
            'scores': [np.mean(scores) for scores in all_scores.values()]
        }
    
    def _aggregate_sentiment(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Aggregate sentiment analysis results"""
        sentiments = [r['label'] for r in results]
        scores = [r['score'] for r in results]
        
        # Convert labels to polarity scores
        polarities = [1 if s == 'POSITIVE' else (-1 if s == 'NEGATIVE' else 0) 
                     for s in sentiments]
        
        return {
            'polarity': np.average(polarities, weights=scores),
            'confidence': np.mean(scores)
        }
    
    def _aggregate_emotions(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Aggregate emotion classification results"""
        emotions = {}
        for result in results:
            emotion = result['label']
            score = result['score']
            if emotion not in emotions:
                emotions[emotion] = []
            emotions[emotion].append(score)
        
        return {
            'emotions': {e: np.mean(s) for e, s in emotions.items()},
            'confidence': np.mean([max(r['score'] for r in chunk) 
                                 for chunk in results])
        }
    
    def _combine_analyses(self, analysis_data: Dict[str, Any], query: str) -> EmotionResult:
        """Combine multiple analysis results into final score"""
        # Extract primary emotion
        primary_emotion = self._extract_primary_emotion(analysis_data)
        secondary_emotions = self._extract_secondary_emotions(analysis_data)
        
        # Calculate sentiment polarity
        sentiment_data = analysis_data.get('sentiment', {})
        sentiment_polarity = sentiment_data.get('polarity', 0.0)
        
        # Calculate emotional intensity
        emotional_intensity = self._calculate_intensity(analysis_data)
        
        # Calculate final score
        weights = {'zero_shot': 0.4, 'sentiment': 0.3, 'emotion': 0.3}
        final_score = self._calculate_weighted_score(analysis_data, weights, query)
        
        return EmotionResult(
            primary_emotion=primary_emotion,
            secondary_emotions=secondary_emotions,
            sentiment_polarity=sentiment_polarity,
            emotional_intensity=emotional_intensity,
            score=final_score,
            details=analysis_data
        )
    
    def _extract_primary_emotion(self, analysis_data: Dict[str, Any]) -> EmotionScore:
        """Extract the primary emotion from analysis results"""
        # Combine zero-shot and emotion-specific results
        emotions = {}
        
        if 'zero_shot' in analysis_data:
            zero_shot = analysis_data['zero_shot']
            for label, score in zip(zero_shot['labels'], zero_shot['scores']):
                if label in self.emotion_labels:
                    emotions[label] = emotions.get(label, 0) + score * 0.4
        
        if 'emotion' in analysis_data:
            emotion_data = analysis_data['emotion']['emotions']
            for emotion, score in emotion_data.items():
                if emotion in self.emotion_labels:
                    emotions[emotion] = emotions.get(emotion, 0) + score * 0.6
        
        # Get the strongest emotion
        if not emotions:
            # Fallback if no emotions detected
            return EmotionScore(
                category=EmotionCategory.NEUTRAL,
                confidence=0.0,
                intensity=0.0
            )
        
        top_emotion = max(emotions.items(), key=lambda x: x[1])
        return EmotionScore(
            category=EmotionCategory(top_emotion[0]),
            confidence=top_emotion[1],
            intensity=self._calculate_intensity(analysis_data)
        )
    
    def _extract_secondary_emotions(self, analysis_data: Dict[str, Any]) -> List[EmotionScore]:
        """Extract secondary emotions from analysis results"""
        emotions = {}
        
        # Similar to primary emotion extraction but get top 3 after primary
        if 'zero_shot' in analysis_data:
            zero_shot = analysis_data['zero_shot']
            for label, score in zip(zero_shot['labels'], zero_shot['scores']):
                if label in self.emotion_labels:
                    emotions[label] = emotions.get(label, 0) + score * 0.4
        
        if 'emotion' in analysis_data:
            emotion_data = analysis_data['emotion']['emotions']
            for emotion, score in emotion_data.items():
                if emotion in self.emotion_labels:
                    emotions[emotion] = emotions.get(emotion, 0) + score * 0.6
        
        # Get top 3 emotions after removing primary
        sorted_emotions = sorted(emotions.items(), key=lambda x: x[1], reverse=True)[1:4]
        
        return [
            EmotionScore(
                category=EmotionCategory(emotion),
                confidence=score,
                intensity=score
            )
            for emotion, score in sorted_emotions
        ]
    
    def _calculate_intensity(self, analysis_data: Dict[str, Any]) -> float:
        """Calculate overall emotional intensity"""
        intensity = 0.0
        count = 0
        
        if 'sentiment' in analysis_data:
            intensity += abs(analysis_data['sentiment']['polarity'])
            count += 1
        
        if 'emotion' in analysis_data:
            max_emotion_score = max(analysis_data['emotion']['emotions'].values())
            intensity += max_emotion_score
            count += 1
        
        if 'zero_shot' in analysis_data:
            max_zero_shot = max(analysis_data['zero_shot']['scores'])
            intensity += max_zero_shot
            count += 1
        
        return intensity / count if count > 0 else 0.0
    
    def _calculate_weighted_score(
        self,
        analysis_data: Dict[str, Any],
        weights: Dict[str, float],
        query: str
    ) -> float:
        """Calculate final weighted score"""
        score = 0.0
        weight_sum = 0.0
        
        for model_name, weight in weights.items():
            if model_name in analysis_data:
                if model_name == 'zero_shot':
                    # For zero-shot, consider query match
                    query_score = 0.0
                    if query in analysis_data['zero_shot']['labels']:
                        idx = analysis_data['zero_shot']['labels'].index(query)
                        query_score = analysis_data['zero_shot']['scores'][idx]
                    score += weight * query_score
                elif model_name == 'sentiment':
                    # For sentiment, use absolute polarity
                    score += weight * abs(analysis_data['sentiment']['polarity'])
                elif model_name == 'emotion':
                    # For emotion, use max emotion score
                    score += weight * max(analysis_data['emotion']['emotions'].values())
                
                weight_sum += weight
        
        return score / weight_sum if weight_sum > 0 else 0.0
