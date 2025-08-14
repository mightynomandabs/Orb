from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, BackgroundTasks
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter
from pydantic import BaseModel, Field, field_validator
from pydantic_settings import BaseSettings
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv
from pathlib import Path
import os
import logging
import uuid
from datetime import datetime
import json
import aiohttp
import re
import asyncio
import redis.asyncio as redis
from functools import lru_cache
from contextlib import asynccontextmanager
import hashlib
import bleach
from prometheus_client import Counter, Histogram, make_asgi_app
from starlette.middleware.base import BaseHTTPMiddleware

# Load environment variables
load_dotenv()

# Prometheus metrics
REQUEST_COUNT = Counter('api_requests_total', 'Total API requests', ['endpoint', 'method'])
REQUEST_LATENCY = Histogram('api_request_latency_seconds', 'API request latency', ['endpoint'])

# Centralized configuration
class Settings(BaseSettings):
    mongo_url: str = "mongodb://localhost:27017"
    db_name: str = "orbsocial"
    huggingface_api_key: Optional[str] = None
    cors_origins: str = "*"
    redis_url: str = "redis://localhost:6379"
    rate_limit_requests: int = 100
    rate_limit_window: int = 60  # seconds
    log_level: str = "INFO"
    circuit_breaker_timeout: int = 30
    circuit_breaker_failures: int = 5

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()

# Structured logging with request context
class RequestContextLogFilter(logging.Filter):
    def filter(self, record):
        record.request_id = getattr(record, 'request_id', 'none')
        record.client_ip = getattr(record, 'client_ip', 'unknown')
        record.user_agent = getattr(record, 'user_agent', 'unknown')
        return True

logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format='%(asctime)s - %(name)s - %(levelname)s - %(request_id)s - %(client_ip)s - %(user_agent)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('orbsocial.log')
    ]
)
logger = logging.getLogger(__name__)
logger.addFilter(RequestContextLogFilter())

# Custom middleware for request context
class RequestContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response

# Custom exception
class EmotionAnalysisError(Exception):
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

# MongoDB connection with indexing
client = AsyncIOMotorClient(settings.mongo_url)
db = client[settings.db_name]

async def setup_mongodb_indexes():
    try:
        await db.status_checks.create_index([("timestamp", -1)])
        await db.emotion_analyses.create_index([("request_id", 1), ("processed_at", -1)])
    except Exception as e:
        logger.warning(f"Failed to setup MongoDB indexes: {e}")

# Redis for caching (optional)
try:
    redis_client = redis.from_url(settings.redis_url)
    redis_available = True
except Exception as e:
    logger.warning(f"Redis not available: {e}. Running without caching and rate limiting.")
    redis_client = None
    redis_available = False

# Hugging Face API configuration
EMOTION_API_URL = "https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base"
SENTIMENT_API_URL = "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest"

# FastAPI app setup
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    if redis_available:
        try:
            await FastAPILimiter.init(redis_client)
        except Exception as e:
            logger.warning(f"Failed to initialize rate limiter: {e}")
    
    try:
        await setup_mongodb_indexes()
    except Exception as e:
        logger.warning(f"Failed to setup MongoDB indexes: {e}")
    
    yield
    
    # Shutdown
    if redis_available and redis_client:
        try:
            await redis_client.close()
        except Exception as e:
            logger.warning(f"Failed to close Redis: {e}")
    
    try:
        client.close()
    except Exception as e:
        logger.warning(f"Failed to close MongoDB client: {e}")

app = FastAPI(
    title="OrbSocial API",
    description="Advanced API for emotion analysis and social orb interactions with enhanced performance and security",
    version="2.2",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add Prometheus metrics endpoint
app.mount("/metrics", make_asgi_app())

# Add middlewares
app.add_middleware(RequestContextMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=settings.cors_origins.split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# API router
api_router = APIRouter(prefix="/api")

# Pydantic models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    @field_validator("client_name")
    @classmethod
    def validate_client_name(cls, v):
        if not v.strip():
            raise ValueError("Client name cannot be empty")
        return bleach.clean(v)

class StatusCheckCreate(BaseModel):
    client_name: str

class EmotionAnalysisRequest(BaseModel):
    text: str
    include_insights: bool = True
    include_recommendations: bool = True

    @field_validator("text")
    @classmethod
    def validate_text(cls, v):
        cleaned = bleach.clean(v.strip())
        if len(cleaned) < 2:
            raise ValueError("Text must be at least 2 characters long")
        if len(cleaned) > 1000:
            raise ValueError("Text exceeds maximum length of 1000 characters")
        return cleaned

class EmotionAnalysisResponse(BaseModel):
    emotion: str
    color: str
    intensity: float
    confidence: float
    insights: List[str]
    recommendations: List[str]
    secondary_emotions: List[str]
    emotional_complexity: str
    is_ai_analyzed: bool
    request_id: str
    processed_at: str
    text_length: int
    sentiment: Optional[str] = None
    raw_emotion_label: Optional[str] = None
    matches: Optional[List[str]] = None

class OrbCombinationRequest(BaseModel):
    orb_ids: List[str]
    combination_type: str = "fusion"

    @field_validator("orb_ids")
    @classmethod
    def validate_orb_ids(cls, v):
        if len(v) < 2:
            raise ValueError("At least 2 orb IDs are required")
        return [bleach.clean(orb_id) for orb_id in v]

class VoiceAnalysisRequest(BaseModel):
    audio_data: str
    language: str = "en-US"

    @field_validator("audio_data")
    @classmethod
    def validate_audio_data(cls, v):
        if not v.strip():
            raise ValueError("Audio data cannot be empty")
        return bleach.clean(v)

# Emotion Analysis Service
class EmotionAnalysisService:
    def __init__(self):
        self.emotion_mapping = {
            'joy': 'joy', 'love': 'love', 'sadness': 'sadness', 'anger': 'anger',
            'fear': 'fear', 'surprise': 'joy', 'neutral': 'neutral', 'disgust': 'anger',
            'optimism': 'joy', 'pessimism': 'sadness', 'trust': 'peace',
            'anticipation': 'joy', 'confusion': 'neutral', 'remorse': 'sadness',
            'disappointment': 'sadness', 'realization': 'neutral', 'curiosity': 'neutral',
            'admiration': 'love', 'amusement': 'joy', 'annoyance': 'anger',
            'gratitude': 'joy', 'relief': 'peace', 'pride': 'joy', 'excitement': 'joy',
            'satisfaction': 'peace', 'embarrassment': 'fear', 'grief': 'sadness',
            'nervousness': 'fear', 'contentment': 'peace', 'hope': 'joy',
            'loneliness': 'sadness', 'frustration': 'anger', 'enthenthusiasm': 'joy',
            'worry': 'fear', 'boredom': 'neutral', 'shame': 'fear', 'jealousy': 'anger',
            'sympathy': 'love', 'awe': 'joy', 'contempt': 'anger'
        }
        self.emotion_colors = {
            'joy': '#ffb000', 'love': '#ff6b9d', 'sadness': '#4a9eff',
            'anger': '#ff4757', 'fear': '#b644ff', 'peace': '#00ff88',
            'neutral': '#808080'
        }
        self.emotion_data = {
            'joy': {
                'strong_keywords': ['ecstatic', 'elated', 'thrilled', 'overjoyed', 'euphoric', 'blissful', 'promoted'],
                'moderate_keywords': ['happy', 'joy', 'joyful', 'excited', 'wonderful', 'amazing', 'fantastic', 'great', 'awesome', 'blessed', 'grateful', 'cheerful', 'delighted', 'good', 'excellent', 'perfect', 'love it', 'achieved', 'success', 'won', 'accomplished', 'proud'],
                'context_boosters': ['today', 'just', 'finally', 'got', 'received'],
                'color': '#ffb000',
                'base_intensity': 0.8
            },
            'anger': {
                'strong_keywords': ['furious', 'rage', 'livid', 'enraged', 'fuming', 'hate', 'despise', 'disgusted'],
                'moderate_keywords': ['angry', 'mad', 'frustrated', 'irritated', 'annoyed', 'pissed', 'upset', 'bothered', 'resentment', 'touchy'],
                'context_boosters': ['boss', 'work', 'stupid', 'idiot', 'damn', 'hell'],
                'color': '#ff4757',
                'base_intensity': 0.9
            },
            'sadness': {
                'strong_keywords': ['devastated', 'heartbroken', 'depressed', 'despair', 'grief', 'mourning'],
                'moderate_keywords': ['sad', 'down', 'lonely', 'hurt', 'broken', 'crying', 'tears', 'sorrow', 'melancholy', 'gloomy', 'lost', 'miss', 'alone', 'abandoned', 'disappointed'],
                'context_boosters': ['died', 'death', 'broke up', 'lost', 'failed', 'rejected'],
                'color': '#4a9eff',
                'base_intensity': 0.8
            },
            'fear': {
                'strong_keywords': ['terrified', 'petrified', 'horrified', 'panic', 'terror'],
                'moderate_keywords': ['scared', 'afraid', 'anxious', 'worried', 'nervous', 'fear', 'stress', 'stressed', 'overwhelmed', 'dread', 'anxiety', 'uneasy'],
                'context_boosters': ['dying', 'death', 'kill', 'danger', 'threat', 'accident'],
                'color': '#b644ff',
                'base_intensity': 0.8
            },
            'love': {
                'strong_keywords': ['adore', 'worship', 'passionate', 'devoted', 'cherish'],
                'moderate_keywords': ['love', 'romance', 'romantic', 'crush', 'affection', 'valentine', 'tender', 'beloved', 'dear'],
                'context_boosters': ['hugged', 'kissed', 'married', 'relationship', 'together'],
                'color': '#ff6b9d',
                'base_intensity': 0.7
            },
            'peace': {
                'strong_keywords': ['blissful', 'serene', 'tranquil', 'zenlike'],
                'moderate_keywords': ['calm', 'peace', 'peaceful', 'relaxed', 'zen', 'meditation', 'quiet', 'still', 'content', 'balanced', 'centered', 'mindful', 'satisfied', 'fulfilled'],
                'context_boosters': ['finally', 'at last', 'relief', 'resolved'],
                'color': '#00ff88',
                'base_intensity': 0.6
            },
            'neutral': {
                'strong_keywords': ['indifferent', 'apathetic', 'unconcerned'],
                'moderate_keywords': ['neutral', 'okay', 'fine', 'alright', 'normal', 'average', 'ordinary', 'regular', 'standard', 'typical', 'usual', 'common', 'tried', 'attempted', 'maybe', 'possibly'],
                'context_boosters': ['whatever', 'doesn\'t matter', 'not sure'],
                'color': '#808080',
                'base_intensity': 0.5
            }
        }
        self.circuit_breaker_state = {"failures": 0, "is_open": False, "last_failure": None}

    async def _get_emotion_with_retry(self, session: aiohttp.ClientSession, text: str, request_id: str, max_retries: int = 2) -> Optional[List[Dict]]:
        for attempt in range(max_retries + 1):
            if self.circuit_breaker_state["is_open"]:
                if (datetime.utcnow() - self.circuit_breaker_state["last_failure"]).total_seconds() > settings.circuit_breaker_timeout:
                    self.circuit_breaker_state["is_open"] = False
                    self.circuit_breaker_state["failures"] = 0
                else:
                    logger.warning("Circuit breaker open, skipping Hugging Face API", extra={"request_id": request_id})
                    return None

            try:
                async with session.post(
                    EMOTION_API_URL,
                    headers={
                        "Authorization": f"Bearer {settings.huggingface_api_key}",
                        "Content-Type": "application/json"
                    },
                    json={"inputs": text},
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    if response.status == 200:
                        self.circuit_breaker_state["failures"] = 0
                        result = await response.json()
                        if isinstance(result, list) and len(result) > 0:
                            return result[0] if isinstance(result[0], list) else result
                    elif response.status == 503:
                        if attempt < max_retries:
                            await asyncio.sleep(2 ** attempt)
                            continue
                    else:
                        self.circuit_breaker_state["failures"] += 1
                        if self.circuit_breaker_state["failures"] >= settings.circuit_breaker_failures:
                            self.circuit_breaker_state["is_open"] = True
                            self.circuit_breaker_state["last_failure"] = datetime.utcnow()
                        break
            except asyncio.TimeoutError:
                self.circuit_breaker_state["failures"] += 1
                if self.circuit_breaker_state["failures"] >= settings.circuit_breaker_failures:
                    self.circuit_breaker_state["is_open"] = True
                    self.circuit_breaker_state["last_failure"] = datetime.utcnow()
                if attempt < max_retries:
                    await asyncio.sleep(1)
                    continue
            except Exception as e:
                logger.error(f"Emotion API attempt {attempt + 1} failed: {e}", extra={"request_id": request_id})
                self.circuit_breaker_state["failures"] += 1
                if self.circuit_breaker_state["failures"] >= settings.circuit_breaker_failures:
                    self.circuit_breaker_state["is_open"] = True
                    self.circuit_breaker_state["last_failure"] = datetime.utcnow()
                if attempt < max_retries:
                    await asyncio.sleep(1)
                    continue
        return None

    async def _get_sentiment_with_retry(self, session: aiohttp.ClientSession, text: str, request_id: str, max_retries: int = 2) -> Optional[List[Dict]]:
        for attempt in range(max_retries + 1):
            if self.circuit_breaker_state["is_open"]:
                if (datetime.utcnow() - self.circuit_breaker_state["last_failure"]).total_seconds() > settings.circuit_breaker_timeout:
                    self.circuit_breaker_state["is_open"] = False
                    self.circuit_breaker_state["failures"] = 0
                else:
                    logger.warning("Circuit breaker open, skipping Hugging Face API", extra={"request_id": request_id})
                    return None

            try:
                async with session.post(
                    SENTIMENT_API_URL,
                    headers={
                        "Authorization": f"Bearer {settings.huggingface_api_key}",
                        "Content-Type": "application/json"
                    },
                    json={"inputs": text},
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    if response.status == 200:
                        self.circuit_breaker_state["failures"] = 0
                        result = await response.json()
                        if isinstance(result, list) and len(result) > 0:
                            return result[0] if isinstance(result[0], list) else result
                    elif response.status == 503:
                        if attempt < max_retries:
                            await asyncio.sleep(2 ** attempt)
                            continue
                    else:
                        self.circuit_breaker_state["failures"] += 1
                        if self.circuit_breaker_state["failures"] >= settings.circuit_breaker_failures:
                            self.circuit_breaker_state["is_open"] = True
                            self.circuit_breaker_state["last_failure"] = datetime.utcnow()
                        break
            except asyncio.TimeoutError:
                self.circuit_breaker_state["failures"] += 1
                if self.circuit_breaker_state["failures"] >= settings.circuit_breaker_failures:
                    self.circuit_breaker_state["is_open"] = True
                    self.circuit_breaker_state["last_failure"] = datetime.utcnow()
                if attempt < max_retries:
                    await asyncio.sleep(1)
                    continue
            except Exception as e:
                logger.error(f"Sentiment API attempt {attempt + 1} failed: {e}", extra={"request_id": request_id})
                self.circuit_breaker_state["failures"] += 1
                if self.circuit_breaker_state["failures"] >= settings.circuit_breaker_failures:
                    self.circuit_breaker_state["is_open"] = True
                    self.circuit_breaker_state["last_failure"] = datetime.utcnow()
                if attempt < max_retries:
                    await asyncio.sleep(1)
                    continue
        return None

    def _process_ai_results(self, emotion_result: Optional[List[Dict]], sentiment_result: Optional[List[Dict]], text: str) -> Dict[str, Any]:
        primary_emotion = 'neutral'
        confidence = 0.5
        emotion_label = 'neutral'

        if emotion_result and isinstance(emotion_result, list):
            sorted_emotions = sorted(emotion_result, key=lambda x: x.get('score', 0), reverse=True)
            if sorted_emotions:
                top_emotion = sorted_emotions[0]
                emotion_label = top_emotion.get('label', 'neutral').lower()
                confidence = top_emotion.get('score', 0.5)
                primary_emotion = self.emotion_mapping.get(emotion_label, 'neutral')

        sentiment_modifier = 1.0
        sentiment_label = 'neutral'
        if sentiment_result and isinstance(sentiment_result, list):
            sorted_sentiment = sorted(sentiment_result, key=lambda x: x.get('score', 0), reverse=True)
            if sorted_sentiment:
                sentiment_data = sorted_sentiment[0]
                sentiment_label = sentiment_data.get('label', 'neutral').lower()
                sentiment_score = sentiment_data.get('score', 0.5)
                if ((primary_emotion in ['joy', 'love', 'peace'] and 'positive' in sentiment_label) or
                    (primary_emotion in ['sadness', 'anger', 'fear'] and 'negative' in sentiment_label)):
                    sentiment_modifier = 1.2
                elif primary_emotion == 'neutral' and 'neutral' in sentiment_label:
                    sentiment_modifier = 1.1

        final_confidence = min(confidence * sentiment_modifier, 1.0)
        final_intensity = min(final_confidence * 1.3, 1.0)

        insights = []
        if final_confidence > 0.8:
            insights.append(f'High confidence {primary_emotion} detection ({final_confidence:.2f})')
        elif final_confidence > 0.6:
            insights.append(f'Moderate confidence {primary_emotion} detection ({final_confidence:.2f})')
        else:
            insights.append(f'Low confidence detection, consider providing more context')

        if sentiment_result:
            insights.append(f'Sentiment: {sentiment_label} (reinforces emotion analysis)')

        secondary_emotions = []
        if emotion_result and isinstance(emotion_result, list):
            sorted_emotions = sorted(emotion_result, key=lambda x: x.get('score', 0), reverse=True)
            for emotion_data in sorted_emotions[1:3]:
                if emotion_data.get('score', 0) > 0.2:
                    sec_label = emotion_data.get('label', '').lower()
                    mapped_emotion = self.emotion_mapping.get(sec_label, sec_label)
                    if mapped_emotion != primary_emotion and mapped_emotion not in secondary_emotions:
                        secondary_emotions.append(mapped_emotion)

        return {
            'emotion': primary_emotion,
            'color': self.emotion_colors.get(primary_emotion, '#808080'),
            'intensity': final_intensity,
            'confidence': final_confidence,
            'insights': insights,
            'recommendations': self._generate_improved_recommendations(primary_emotion, final_intensity, text),
            'secondary_emotions': secondary_emotions,
            'emotional_complexity': self._determine_complexity(final_confidence, len(secondary_emotions)),
            'is_ai_analyzed': True,
            'sentiment': sentiment_label,
            'raw_emotion_label': emotion_label
        }

    async def analyze_enhanced(self, text: str, request_id: str) -> Dict[str, Any]:
        text_lower = text.lower().strip()
        words = re.findall(r'\b\w+\b', text_lower)
        emotion_scores = {}

        for emotion, data in self.emotion_data.items():
            score = 0
            matches = []
            for keyword in data['strong_keywords']:
                if keyword in text_lower:
                    score += 3
                    matches.append(f"strong: {keyword}")
            for keyword in data['moderate_keywords']:
                if keyword in text_lower:
                    score += 1.5
                    matches.append(f"moderate: {keyword}")
            context_boost = 0
            for booster in data['context_boosters']:
                if booster in text_lower and score > 0:
                    context_boost += 0.5
            total_score = score + context_boost

            if total_score > 0:
                confidence = min(0.95, 0.3 + (total_score * 0.15))
                intensity = min(1.0, data['base_intensity'] + (total_score * 0.05))
                emotion_scores[emotion] = {
                    'score': total_score,
                    'confidence': confidence,
                    'intensity': intensity,
                    'color': data['color'],
                    'matches': matches
                }

        if emotion_scores:
            sorted_emotions = sorted(emotion_scores.items(), key=lambda x: x[1]['score'], reverse=True)
            primary_emotion_name, primary_data = sorted_emotions[0]
            if len(sorted_emotions) > 1:
                second_emotion_name, second_data = sorted_emotions[1]
                if abs(primary_data['score'] - second_data['score']) < 0.5:
                    if second_data['intensity'] > primary_data['intensity']:
                        primary_emotion_name, primary_data = second_emotion_name, second_data

            insights = []
            if primary_data['confidence'] > 0.8:
                insights.append(f"Strong {primary_emotion_name} indicators detected")
            if len(emotion_scores) > 1:
                insights.append(f"Mixed emotions detected: {len(emotion_scores)} different states")

            secondary_emotions = [name for name, _ in sorted_emotions[1:3] if name != primary_emotion_name]

            return {
                'emotion': primary_emotion_name,
                'color': primary_data['color'],
                'intensity': primary_data['intensity'],
                'confidence': primary_data['confidence'],
                'insights': insights,
                'recommendations': self._generate_improved_recommendations(primary_emotion_name, primary_data['intensity'], text),
                'secondary_emotions': secondary_emotions,
                'emotional_complexity': self._determine_complexity(primary_data['confidence'], len(secondary_emotions)),
                'is_ai_analyzed': False,
                'matches': primary_data['matches']
            }

        return {
            'emotion': 'neutral',
            'color': '#808080',
            'intensity': 0.5,
            'confidence': 0.6,
            'insights': ['No strong emotional indicators detected'],
            'recommendations': ['Try expressing your feelings more specifically'],
            'secondary_emotions': [],
            'emotional_complexity': 'simple',
            'is_ai_analyzed': False
        }

    def _generate_improved_recommendations(self, emotion: str, intensity: float, text: str) -> List[str]:
        recommendations = []
        text_lower = text.lower()

        if emotion == 'sadness':
            if intensity > 0.8:
                recommendations.append('Consider reaching out to a trusted friend or counselor for support')
                recommendations.append('Allow yourself to feel these emotions - they are valid and temporary')
            else:
                recommendations.append('Try engaging in a comforting activity like listening to music or taking a walk')
                recommendations.append('Practice self-compassion and remember that difficult feelings pass')
        elif emotion == 'anger':
            if intensity > 0.8:
                recommendations.append('Take several deep breaths and step away from the situation if possible')
                recommendations.append('Consider writing down your feelings before taking any action')
            else:
                recommendations.append('Try to identify the root cause of your frustration')
                recommendations.append('Channel this energy into something constructive')
        elif emotion == 'fear':
            if intensity > 0.8:
                recommendations.append('Focus on what you can control in this moment')
                recommendations.append('Try grounding techniques: name 5 things you can see, 4 you can touch')
            else:
                recommendations.append('Break down your concerns into smaller, manageable parts')
                recommendations.append('Consider talking to someone about what\'s worrying you')
        elif emotion == 'joy':
            recommendations.append('Share this positive energy with someone you care about')
            recommendations.append('Take a moment to savor and remember this feeling')
        elif emotion == 'love':
            recommendations.append('Express your feelings to the person who matters to you')
            recommendations.append('Consider creative ways to show your appreciation')
        elif emotion == 'peace':
            recommendations.append('Use this calm state for reflection or planning')
            recommendations.append('Consider what led to this peaceful feeling to recreate it later')

        if any(word in text_lower for word in ['work', 'job', 'boss', 'career']):
            recommendations.append('Remember to maintain work-life balance and take breaks when needed')
        if any(word in text_lower for word in ['relationship', 'friend', 'family']):
            recommendations.append('Open and honest communication strengthens relationships')
        if any(word in text_lower for word in ['health', 'sick', 'doctor']):
            recommendations.append('Prioritize your physical and mental wellbeing')

        return recommendations[:3]

    def _determine_complexity(self, confidence: float, secondary_count: int) -> str:
        if confidence > 0.9 and secondary_count == 0:
            return 'simple'
        elif confidence > 0.7 and secondary_count <= 1:
            return 'moderate'
        else:
            return 'complex'

    async def analyze_with_huggingface(self, text: str, request_id: str) -> Dict[str, Any]:
        # Try to get from cache if Redis is available
        cache_key = None
        if redis_available and redis_client:
            try:
                cache_key = f"hf_emotion:{hashlib.md5(text.encode()).hexdigest()}"
                cached_result = await redis_client.get(cache_key)
                if cached_result:
                    logger.info(f"Cache hit for emotion analysis: {cache_key}", extra={"request_id": request_id})
                    return json.loads(cached_result)
            except Exception as e:
                logger.warning(f"Cache access failed: {e}", extra={"request_id": request_id})

        if not settings.huggingface_api_key:
            logger.warning("Hugging Face API key not configured, using enhanced analysis", extra={"request_id": request_id})
            return await self.analyze_enhanced(text, request_id)

        try:
            async with aiohttp.ClientSession() as session:
                emotion_result = await self._get_emotion_with_retry(session, text, request_id)
                sentiment_result = await self._get_sentiment_with_retry(session, text, request_id)
                result = self._process_ai_results(emotion_result, sentiment_result, text)
                
                # Try to cache result if Redis is available
                if redis_available and redis_client and cache_key:
                    try:
                        await redis_client.setex(cache_key, 3600, json.dumps(result))
                    except Exception as e:
                        logger.warning(f"Failed to cache result: {e}", extra={"request_id": request_id})
                
                return result
        except Exception as e:
            logger.error(f"Hugging Face API error: {e}", extra={"request_id": request_id})
            return await self.analyze_enhanced(text, request_id)

    async def analyze_emotion(self, text: str, request_id: str) -> Dict[str, Any]:
        try:
            if not text or len(text.strip()) < 2:
                raise EmotionAnalysisError("Text too short for analysis", 400)

            result = await self.analyze_with_huggingface(text, request_id)
            if result.get('confidence', 0) > 0.3:
                return result
            return await self.analyze_enhanced(text, request_id)
        except EmotionAnalysisError as e:
            raise e
        except Exception as e:
            logger.error(f"Emotion analysis failed: {e}", extra={"request_id": request_id})
            return {
                'emotion': 'neutral',
                'color': '#808080',
                'intensity': 0.5,
                'confidence': 0.5,
                'insights': ['Analysis failed, please try again'],
                'recommendations': ['Try rephrasing your text'],
                'secondary_emotions': [],
                'is_ai_analyzed': False,
                'error': str(e)
            }

# Initialize the emotion service
emotion_service = EmotionAnalysisService()

# Routes
@api_router.get("/", response_model=dict)
async def root():
    REQUEST_COUNT.labels(endpoint="/api/", method="GET").inc()
    with REQUEST_LATENCY.labels(endpoint="/api/").time():
        return {"message": "OrbSocial API v2.2 - Advanced Emotion Analysis"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate, background_tasks: BackgroundTasks, http_request: Request):
    REQUEST_COUNT.labels(endpoint="/api/status", method="POST").inc()
    with REQUEST_LATENCY.labels(endpoint="/api/status").time():
        status_dict = input.dict()
        status_obj = StatusCheck(**status_dict)
        background_tasks.add_task(
            db.status_checks.insert_one, status_obj.dict(),
            extra={"request_id": http_request.state.request_id, "client_ip": http_request.client.host, "user_agent": http_request.headers.get("user-agent", "unknown")}
        )
        return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks(http_request: Request):
    REQUEST_COUNT.labels(endpoint="/api/status", method="GET").inc()
    with REQUEST_LATENCY.labels(endpoint="/api/status").time():
        status_checks = await db.status_checks.find().to_list(1000)
        return [StatusCheck(**status_check) for status_check in status_checks]

@api_router.post("/analyze-emotion", response_model=EmotionAnalysisResponse, dependencies=[Depends(RateLimiter(times=settings.rate_limit_requests, seconds=settings.rate_limit_window))] if redis_available else [])
async def analyze_emotion(request: EmotionAnalysisRequest, background_tasks: BackgroundTasks, http_request: Request):
    REQUEST_COUNT.labels(endpoint="/api/analyze-emotion", method="POST").inc()
    with REQUEST_LATENCY.labels(endpoint="/api/analyze-emotion").time():
        try:
            analysis = await emotion_service.analyze_emotion(request.text, http_request.state.request_id)
            analysis['request_id'] = http_request.state.request_id
            analysis['processed_at'] = datetime.utcnow().isoformat()
            analysis['text_length'] = len(request.text)
            background_tasks.add_task(
                db.emotion_analyses.insert_one, analysis,
                extra={"request_id": http_request.state.request_id, "client_ip": http_request.client.host, "user_agent": http_request.headers.get("user-agent", "unknown")}
            )
            return analysis
        except EmotionAnalysisError as e:
            raise HTTPException(status_code=e.status_code, detail=e.message)
        except Exception as e:
            logger.error(f"Emotion analysis error: {e}", extra={"request_id": http_request.state.request_id, "client_ip": http_request.client.host, "user_agent": http_request.headers.get("user-agent", "unknown")})
            raise HTTPException(status_code=500, detail="Analysis service temporarily unavailable")

@api_router.post("/test-emotion-detection", dependencies=[Depends(RateLimiter(times=settings.rate_limit_requests, seconds=settings.rate_limit_window))] if redis_available else [])
async def test_emotion_detection(request: EmotionAnalysisRequest, http_request: Request):
    REQUEST_COUNT.labels(endpoint="/api/test-emotion-detection", method="POST").inc()
    with REQUEST_LATENCY.labels(endpoint="/api/test-emotion-detection").time():
        try:
            text = request.text
            if not text.strip():
                raise HTTPException(status_code=400, detail="Test text cannot be empty")

            results = {
                'test_id': str(uuid.uuid4()),
                'text': text,
                'methods': {},
                'timestamp': datetime.utcnow().isoformat()
            }

            if settings.huggingface_api_key:
                try:
                    hf_result = await emotion_service.analyze_with_huggingface(text, http_request.state.request_id)
                    results['methods']['huggingface'] = hf_result
                except Exception as e:
                    results['methods']['huggingface'] = {'error': str(e), 'available': False}
            else:
                results['methods']['huggingface'] = {'error': 'API key not configured', 'available': False}

            try:
                enhanced_result = await emotion_service.analyze_enhanced(text, http_request.state.request_id)
                results['methods']['enhanced'] = enhanced_result
            except Exception as e:
                results['methods']['enhanced'] = {'error': str(e)}

            hf_emotion = results['methods'].get('huggingface', {}).get('emotion')
            enhanced_emotion = results['methods'].get('enhanced', {}).get('emotion')
            results['comparison'] = {
                'consistency': 'high' if hf_emotion == enhanced_emotion else 'low',
                'recommended_method': 'huggingface' if (hf_emotion and 'error' not in results['methods']['huggingface']) else 'enhanced',
                'confidence_difference': abs(
                    results['methods'].get('huggingface', {}).get('confidence', 0) -
                    results['methods'].get('enhanced', {}).get('confidence', 0)
                ) if hf_emotion and enhanced_emotion else None
            }

            logger.info(f"Completed emotion detection test for text: {text}", extra={
                "request_id": http_request.state.request_id,
                "client_ip": http_request.client.host,
                "user_agent": http_request.headers.get("user-agent", "unknown")
            })
            return results

        except Exception as e:
            logger.error(f"Test emotion detection error: {e}", extra={
                "request_id": http_request.state.request_id, 
                "client_ip": http_request.client.host, 
                "user_agent": http_request.headers.get("user-agent", "unknown")
            })
            raise HTTPException(status_code=500, detail=f"Test failed: {str(e)}")

@api_router.post("/combine-orbs")
async def combine_orbs(request: OrbCombinationRequest, http_request: Request):
    REQUEST_COUNT.labels(endpoint="/api/combine-orbs", method="POST").inc()
    with REQUEST_LATENCY.labels(endpoint="/api/combine-orbs").time():
        try:
            if len(request.orb_ids) < 2:
                raise HTTPException(status_code=400, detail="At least 2 orb IDs are required")
            
            # Create a combination result
            combination = {
                "id": str(uuid.uuid4()),
                "combination_type": request.combination_type,
                "source_orbs": request.orb_ids,
                "emotion": "complex",
                "color": "#ff6b9d",  # Could be calculated based on source emotions
                "intensity": 0.8,
                "complexity": "high",
                "created_at": datetime.utcnow().isoformat(),
                "request_id": http_request.state.request_id
            }
            
            # Store in database
            background_tasks.add_task(
                db.orb_combinations.insert_one, combination,
                extra={"request_id": http_request.state.request_id, "client_ip": http_request.client.host, "user_agent": http_request.headers.get("user-agent", "unknown")}
            )
            
            return combination
            
        except HTTPException as e:
            raise e
        except Exception as e:
            logger.error(f"Orb combination error: {e}", extra={
                "request_id": http_request.state.request_id, 
                "client_ip": http_request.client.host, 
                "user_agent": http_request.headers.get("user-agent", "unknown")
            })
            raise HTTPException(status_code=500, detail="Combination failed")

# Mount the API router
app.include_router(api_router)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
