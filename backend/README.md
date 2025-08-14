# OrbSocial Backend

Advanced AI-powered emotion analysis backend with DeepSeek integration.

## 🚀 Features

- **AI-Powered Emotion Analysis**: Uses DeepSeek API for sophisticated emotion detection
- **Fallback System**: Automatic fallback to enhanced keyword-based analysis
- **FastAPI Backend**: Modern, fast Python web framework
- **MongoDB Integration**: Scalable database for emotional data
- **Advanced Analytics**: Emotion tracking, patterns, and insights
- **CORS Support**: Frontend integration ready

## 🔧 Setup

### Prerequisites

- Python 3.8+
- MongoDB (optional, will use localhost by default)

### Installation

1. **Install Dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Environment Variables** (Optional)
   Create a `.env` file in the backend directory:
   ```env
   DEEPSEEK_API_KEY=your_api_key_here
   DEEPSEEK_BASE_URL=https://api.deepseek.com
   MONGO_URL=mongodb://localhost:27017
   DB_NAME=orbsocial
   CORS_ORIGINS=http://localhost:3000,http://localhost:3001
   ```

   **Note**: The startup script automatically sets these if not configured.

## 🚀 Running the Server

### Option 1: Using the Startup Script (Recommended)
```bash
cd backend
python start_server.py
```

### Option 2: Using Uvicorn Directly
```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

### Option 3: Using Python Module
```bash
cd backend
python -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

## 📡 API Endpoints

### Core Endpoints

- `GET /api/` - Health check
- `POST /api/analyze-emotion` - AI emotion analysis
- `POST /api/combine-orbs` - Orb combination logic
- `POST /api/voice-analysis` - Voice emotion analysis

### Emotion Analysis

**Endpoint**: `POST /api/analyze-emotion`

**Request Body**:
```json
{
  "text": "I am feeling very happy today!",
  "include_insights": true,
  "include_recommendations": true
}
```

**Response**:
```json
{
  "emotion": "joy",
  "color": "#ffb000",
  "intensity": 0.8,
  "confidence": 0.9,
  "insights": ["Strong joy detected"],
  "recommendations": ["Share your happiness with others"],
  "is_ai_analyzed": true
}
```

## 🤖 DeepSeek AI Integration

The backend automatically uses DeepSeek API for advanced emotion analysis:

- **Primary Analysis**: DeepSeek AI for sophisticated understanding
- **Fallback System**: Enhanced keyword analysis if API fails
- **Smart Insights**: Contextual emotional understanding
- **Personalized Recommendations**: AI-generated emotional guidance

### API Key Configuration

The DeepSeek API key is automatically loaded from:
1. Environment variables
2. Startup script defaults
3. Manual configuration

## 🗄️ Database

### MongoDB Collections

- `status_checks` - System health monitoring
- `emotions` - Emotional analysis results
- `orbs` - Generated emotional orbs
- `combinations` - Orb fusion results

### Connection

MongoDB connection is automatically configured with fallback to localhost.

## 🔍 Testing

Run the test suite to verify integration:

```bash
cd backend
python test_deepseek.py
```

This will test:
- ✅ Import functionality
- ✅ Basic emotion analysis
- ✅ DeepSeek API integration
- ✅ Fallback system

## 🌐 CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:3000` (React dev server)
- `http://localhost:3001` (Alternative port)

## 📊 Monitoring

- **Health Check**: `GET /api/`
- **Status Monitoring**: `POST /api/status`
- **Logging**: Automatic logging with configurable levels

## 🚨 Troubleshooting

### Common Issues

1. **Import Errors**: Ensure all dependencies are installed
2. **API Key Issues**: Check DeepSeek API key configuration
3. **MongoDB Connection**: Verify MongoDB is running
4. **Port Conflicts**: Ensure port 8000 is available

### Debug Mode

Enable debug logging by setting log level to "debug" in the startup script.

## 🔄 Development

### Hot Reload

The server automatically reloads when code changes are detected.

### Code Quality

- **Black**: Code formatting
- **isort**: Import sorting
- **flake8**: Linting
- **mypy**: Type checking

## 📝 License

This project is part of OrbSocial - an emotional visualization platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Ready to analyze emotions with AI power! 🚀✨**
