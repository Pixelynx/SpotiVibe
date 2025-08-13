class AIAgentError(Exception):
    """Base exception for AI Agent errors"""
    pass

class AnalysisError(AIAgentError):
    """Raised when song analysis fails"""
    pass

class ModelNotFoundError(AIAgentError):
    """Raised when required ML model is not available"""
    pass

class CacheError(AIAgentError):
    """Raised when cache operations fail"""
    pass

class ValidationError(AIAgentError):
    """Raised when input validation fails"""
    pass

class FeedbackError(AIAgentError):
    """Raised when feedback processing fails"""
    pass

class ConfigurationError(AIAgentError):
    """Raised when there's a configuration issue"""
    pass
