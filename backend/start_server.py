#!/usr/bin/env python3
"""
Startup script for OrbSocial Backend Server
"""

import os
import uvicorn
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set DeepSeek API credentials if not already set
if not os.environ.get('DEEPSEEK_API_KEY'):
    os.environ['DEEPSEEK_API_KEY'] = 'sk-0aea9914c91545deb6cd3280e5baaa2b'
    print("🔑 DeepSeek API key loaded from script")

if not os.environ.get('DEEPSEEK_BASE_URL'):
    os.environ['DEEPSEEK_BASE_URL'] = 'https://api.deepseek.com'
    print("🌐 DeepSeek base URL loaded from script")

# Set other environment variables with defaults
if not os.environ.get('MONGO_URL'):
    os.environ['MONGO_URL'] = 'mongodb://localhost:27017'
    print("🗄️  MongoDB URL set to default")

if not os.environ.get('DB_NAME'):
    os.environ['DB_NAME'] = 'orbsocial'
    print("📊 Database name set to default")

if not os.environ.get('CORS_ORIGINS'):
    os.environ['CORS_ORIGINS'] = 'http://localhost:3000,http://localhost:3001'
    print("🌍 CORS origins set to default")

def main():
    """Start the FastAPI server"""
    print("🚀 Starting OrbSocial Backend Server...")
    print("=" * 50)
    print(f"🔑 DeepSeek API: {'Configured' if os.environ.get('DEEPSEEK_API_KEY') else 'Not configured'}")
    print(f"🗄️  MongoDB: {os.environ.get('MONGO_URL')}")
    print(f"📊 Database: {os.environ.get('DB_NAME')}")
    print(f"🌍 CORS Origins: {os.environ.get('CORS_ORIGINS')}")
    print("=" * 50)
    
    # Start the server
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    main()
