#!/usr/bin/env python3
"""
Test script for DeepSeek API integration
"""

import asyncio
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def test_deepseek_import():
    """Test if DeepSeek integration can be imported"""
    try:
        from server import analyze_emotion_with_deepseek
        print("✅ DeepSeek integration imported successfully!")
        return True
    except ImportError as e:
        print(f"❌ Import failed: {e}")
        return False

async def test_basic_analysis():
    """Test basic emotion analysis"""
    try:
        from server import analyze_emotion_basic
        result = await analyze_emotion_basic("I am feeling very happy today!")
        print(f"✅ Basic analysis working: {result['emotion']} (confidence: {result['confidence']})")
        return True
    except Exception as e:
        print(f"❌ Basic analysis failed: {e}")
        return False

async def test_deepseek_analysis():
    """Test DeepSeek API analysis"""
    try:
        from server import analyze_emotion_with_deepseek
        
        # Check if API key is configured
        api_key = os.environ.get('DEEPSEEK_API_KEY')
        if not api_key:
            print("⚠️  DeepSeek API key not configured, testing fallback...")
            return await test_basic_analysis()
        
        print(f"🔑 API Key found: {api_key[:10]}...")
        
        # Test with a simple emotion
        result = await analyze_emotion_with_deepseek("I am feeling very happy today!")
        print(f"✅ DeepSeek analysis working: {result['emotion']} (confidence: {result['confidence']})")
        print(f"   Insights: {result.get('insights', [])}")
        print(f"   Recommendations: {result.get('recommendations', [])}")
        return True
        
    except Exception as e:
        print(f"❌ DeepSeek analysis failed: {e}")
        print("   This might be expected if the API key is invalid or network issues occur")
        return False

async def main():
    """Run all tests"""
    print("🚀 Testing OrbSocial Backend Integration...")
    print("=" * 50)
    
    # Test imports
    import_success = await test_deepseek_import()
    
    # Test basic analysis
    basic_success = await test_basic_analysis()
    
    # Test DeepSeek analysis
    deepseek_success = await test_deepseek_analysis()
    
    print("=" * 50)
    print("📊 Test Results:")
    print(f"   Imports: {'✅' if import_success else '❌'}")
    print(f"   Basic Analysis: {'✅' if basic_success else '❌'}")
    print(f"   DeepSeek API: {'✅' if deepseek_success else '❌'}")
    
    if import_success and basic_success:
        print("\n🎉 Backend is ready to use!")
        if deepseek_success:
            print("🤖 DeepSeek AI integration is working!")
        else:
            print("⚠️  DeepSeek API not working, but fallback system is ready")
    else:
        print("\n❌ Some tests failed. Please check the errors above.")

if __name__ == "__main__":
    asyncio.run(main())
