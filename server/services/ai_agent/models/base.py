from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from ..types import AnalysisResult, EmotionResult, AudioResult, CombinedScore

class BaseModel(ABC):
    """Base class for all AI models"""
    
    @abstractmethod
    async def initialize(self) -> None:
        """Initialize the model and load required resources"""
        pass
    
    @abstractmethod
    async def predict(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Make a prediction using the model"""
        pass
    
    @abstractmethod
    async def validate_input(self, input_data: Dict[str, Any]) -> bool:
        """Validate input data before prediction"""
        pass

class BaseAnalyzer(ABC):
    """Base class for analyzers (emotion, audio, etc.)"""
    
    @abstractmethod
    async def analyze(self, data: Any, query: str) -> Any:
        """Analyze input data and return results"""
        pass
    
    @abstractmethod
    async def validate(self, data: Any) -> bool:
        """Validate input data"""
        pass
    
    @abstractmethod
    async def preprocess(self, data: Any) -> Any:
        """Preprocess input data before analysis"""
        pass

class BaseLearner(ABC):
    """Base class for feedback learning"""
    
    @abstractmethod
    async def learn(self, features: Dict[str, Any], feedback: Dict[str, Any]) -> None:
        """Learn from user feedback"""
        pass
    
    @abstractmethod
    async def predict(self, features: Dict[str, Any]) -> CombinedScore:
        """Make a prediction based on learned patterns"""
        pass
    
    @abstractmethod
    async def save_state(self) -> None:
        """Save learned state"""
        pass
    
    @abstractmethod
    async def load_state(self) -> None:
        """Load learned state"""
        pass
