"""
Cache configuration and key generation
"""
from dataclasses import dataclass
from typing import Optional, Dict, Any
import json
import hashlib

@dataclass
class CacheConfig:
    redis_url: str = "redis://localhost:6379"
    default_ttl: int = 24 * 60 * 60  # 24 hours
    max_memory_cache_size: int = 1000  # items
    key_prefix: str = "vibe_agent"
    enable_compression: bool = True
    
class CacheKey:
    @staticmethod
    def generate(lyrics: str, audio_features: Dict[str, Any], 
                query: str, user_id: Optional[str] = None) -> str:
        """Generate deterministic cache key from inputs"""
        # Create normalized representation
        data = {
            'lyrics_hash': hashlib.sha256(lyrics.encode()).hexdigest()[:16],
            'audio_hash': hashlib.sha256(
                json.dumps(audio_features, sort_keys=True).encode()
            ).hexdigest()[:16],
            'query_hash': hashlib.sha256(query.lower().strip().encode()).hexdigest()[:16],
        }
        
        if user_id:
            data['user_id'] = user_id
        
        key_string = json.dumps(data, sort_keys=True)
        key_hash = hashlib.sha256(key_string.encode()).hexdigest()[:16]
        
        return f"analysis:{key_hash}"
