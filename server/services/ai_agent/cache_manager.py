"""
Multi-layer caching system with Redis and memory fallback
"""
import asyncio
import json
import gzip
import logging
from typing import Any, Optional, Callable, Dict, TypeVar
from datetime import datetime, timedelta
import aioredis
from .cache_config import CacheConfig, CacheKey
from .exceptions import CacheError

T = TypeVar('T')
logger = logging.getLogger(__name__)

class CacheManager:
    def __init__(self, config: CacheConfig):
        self.config = config
        self.redis_pool: Optional[aioredis.ConnectionPool] = None
        self.memory_cache: Dict[str, Dict[str, Any]] = {}
        self.memory_cache_access: Dict[str, datetime] = {}
        
    async def initialize(self):
        """Initialize Redis connection pool"""
        try:
            self.redis_pool = aioredis.ConnectionPool.from_url(
                self.config.redis_url,
                max_connections=20,
                retry_on_timeout=True,
                socket_keepalive=True
            )
            
            # Test connection
            redis = aioredis.Redis(connection_pool=self.redis_pool)
            await redis.ping()
            await redis.close()
            
            logger.info("Redis cache initialized successfully")
            
        except Exception as e:
            logger.warning(f"Redis initialization failed, using memory cache only: {e}")
            self.redis_pool = None
    
    async def get_or_compute(self, 
                           lyrics: str, 
                           audio_features: Dict[str, Any],
                           query: str, 
                           compute_func: Callable[[], Any],
                           user_id: Optional[str] = None,
                           ttl: Optional[int] = None) -> Any:
        """Get cached result or compute new one"""
        cache_key = CacheKey.generate(lyrics, audio_features, query, user_id)
        full_key = f"{self.config.key_prefix}:{cache_key}"
        
        # Try to get from cache
        cached_result = await self._get_from_cache(full_key)
        if cached_result is not None:
            logger.debug(f"Cache hit for key: {cache_key}")
            return cached_result
        
        # Cache miss - compute result
        logger.debug(f"Cache miss for key: {cache_key}")
        try:
            result = await compute_func()
            
            # Store in cache
            await self._set_in_cache(
                full_key, 
                result, 
                ttl or self.config.default_ttl
            )
            
            return result
            
        except Exception as e:
            logger.error(f"Compute function failed for key {cache_key}: {e}")
            raise
    
    async def _get_from_cache(self, key: str) -> Optional[Any]:
        """Get value from cache (Redis first, then memory)"""
        # Try Redis first
        if self.redis_pool:
            try:
                redis = aioredis.Redis(connection_pool=self.redis_pool)
                cached_data = await redis.get(key)
                await redis.close()
                
                if cached_data:
                    return self._deserialize_value(cached_data)
                    
            except Exception as e:
                logger.warning(f"Redis get failed for {key}: {e}")
        
        # Fallback to memory cache
        return self._get_from_memory(key)
    
    async def _set_in_cache(self, key: str, value: Any, ttl: int):
        """Set value in cache (both Redis and memory)"""
        serialized_value = self._serialize_value(value)
        
        # Try Redis first
        if self.redis_pool:
            try:
                redis = aioredis.Redis(connection_pool=self.redis_pool)
                await redis.setex(key, ttl, serialized_value)
                await redis.close()
                
            except Exception as e:
                logger.warning(f"Redis set failed for {key}: {e}")
        
        # Always store in memory as fallback
        self._set_in_memory(key, value, ttl)
    
    def _get_from_memory(self, key: str) -> Optional[Any]:
        """Get from in-memory cache"""
        if key in self.memory_cache:
            cache_item = self.memory_cache[key]
            expires_at = cache_item.get('expires_at')
            
            if expires_at and datetime.now() > expires_at:
                # Expired - remove from cache
                del self.memory_cache[key]
                if key in self.memory_cache_access:
                    del self.memory_cache_access[key]
                return None
            
            # Update access time for LRU
            self.memory_cache_access[key] = datetime.now()
            return cache_item['value']
        
        return None
    
    def _set_in_memory(self, key: str, value: Any, ttl: int):
        """Set in memory cache with LRU eviction"""
        # Check if we need to evict items
        if len(self.memory_cache) >= self.config.max_memory_cache_size:
            self._evict_lru_items()
        
        expires_at = datetime.now() + timedelta(seconds=ttl)
        
        self.memory_cache[key] = {
            'value': value,
            'expires_at': expires_at,
            'created_at': datetime.now()
        }
        self.memory_cache_access[key] = datetime.now()
    
    def _evict_lru_items(self):
        """Remove least recently used items"""
        # Remove 10% of items or at least 1
        items_to_remove = max(1, len(self.memory_cache) // 10)
        
        # Sort by access time
        sorted_keys = sorted(
            self.memory_cache_access.items(), 
            key=lambda x: x[1]
        )
        
        for key, _ in sorted_keys[:items_to_remove]:
            if key in self.memory_cache:
                del self.memory_cache[key]
            if key in self.memory_cache_access:
                del self.memory_cache_access[key]
    
    def _serialize_value(self, value: Any) -> bytes:
        """Serialize value for storage"""
        json_str = json.dumps(value, default=str)
        
        if self.config.enable_compression:
            return gzip.compress(json_str.encode('utf-8'))
        else:
            return json_str.encode('utf-8')
    
    def _deserialize_value(self, data: bytes) -> Any:
        """Deserialize value from storage"""
        if self.config.enable_compression:
            try:
                decompressed = gzip.decompress(data)
                return json.loads(decompressed.decode('utf-8'))
            except (gzip.BadGzipFile, UnicodeDecodeError):
                # Fallback to uncompressed
                return json.loads(data.decode('utf-8'))
        else:
            return json.loads(data.decode('utf-8'))
    
    async def warm_cache(self, common_queries: list):
        """Pre-warm cache with common queries"""
        logger.info(f"Warming cache with {len(common_queries)} queries")
        
        for query_data in common_queries:
            try:
                cache_key = CacheKey.generate(
                    query_data['lyrics'],
                    query_data['audio_features'],
                    query_data['query']
                )
                
                # Check if already cached
                full_key = f"{self.config.key_prefix}:{cache_key}"
                if await self._get_from_cache(full_key) is None:
                    # Not cached - would need actual analysis function here
                    logger.debug(f"Would warm cache for: {query_data['query']}")
                    
            except Exception as e:
                logger.warning(f"Cache warming failed for query: {e}")
    
    async def clear_cache(self, pattern: Optional[str] = None):
        """Clear cache entries"""
        if pattern:
            pattern = f"{self.config.key_prefix}:{pattern}"
        else:
            pattern = f"{self.config.key_prefix}:*"
        
        # Clear Redis
        if self.redis_pool:
            try:
                redis = aioredis.Redis(connection_pool=self.redis_pool)
                keys = await redis.keys(pattern)
                if keys:
                    await redis.delete(*keys)
                await redis.close()
                logger.info(f"Cleared {len(keys)} Redis keys matching {pattern}")
                
            except Exception as e:
                logger.error(f"Redis cache clear failed: {e}")
        
        # Clear memory cache
        keys_to_remove = [
            key for key in self.memory_cache.keys() 
            if key.startswith(self.config.key_prefix)
        ]
        
        for key in keys_to_remove:
            if key in self.memory_cache:
                del self.memory_cache[key]
            if key in self.memory_cache_access:
                del self.memory_cache_access[key]
        
        logger.info(f"Cleared {len(keys_to_remove)} memory cache entries")
    
    async def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        stats = {
            'memory_cache_size': len(self.memory_cache),
            'memory_cache_max_size': self.config.max_memory_cache_size,
            'redis_available': self.redis_pool is not None
        }
        
        if self.redis_pool:
            try:
                redis = aioredis.Redis(connection_pool=self.redis_pool)
                info = await redis.info('memory')
                stats['redis_memory_usage'] = info.get('used_memory_human', 'unknown')
                await redis.close()
            except Exception:
                stats['redis_memory_usage'] = 'error'
        
        return stats
    
    async def close(self):
        """Clean up resources"""
        if self.redis_pool:
            await self.redis_pool.disconnect()
        
        self.memory_cache.clear()
        self.memory_cache_access.clear()
