#!/usr/bin/env python3
"""
Test script for the enhanced emotion detection system
"""

import asyncio
import aiohttp
import json

# Test cases with expected emotions
TEST_CASES = [
    {
        "text": "I got promoted in my job today!",
        "expected": "joy",
        "description": "Positive achievement - should detect joy"
    },
    {
        "text": "My crush hugged me today",
        "expected": "love", 
        "description": "Romantic interaction - should detect love"
    },
    {
        "text": "I lost my watch today",
        "expected": "sadness",
        "description": "Loss of possession - should detect sadness"
    },
    {
        "text": "I tried to kill my self",
        "expected": "sadness",
        "description": "Suicidal thoughts - should detect sadness"
    },
    {
        "text": "I slapped my friend today",
        "expected": "anger",
        "description": "Violent action - should detect anger"
    },
    {
        "text": "I broke my leg today",
        "expected": "sadness",
        "description": "Physical injury - should detect sadness"
    },
    {
        "text": "I'm feeling really anxious about the future",
        "expected": "fear",
        "description": "Anxiety about future - should detect fear"
    },
    {
        "text": "I'm feeling peaceful and content right now",
        "expected": "peace",
        "description": "Positive calm state - should detect peace"
    },
    {
        "text": "I'm just okay, nothing special",
        "expected": "neutral",
        "description": "Neutral state - should detect neutral"
    }
]

async def test_emotion_detection():
    """Test the emotion detection endpoint"""
    base_url = "http://localhost:8000/api"
    
    async with aiohttp.ClientSession() as session:
        print("🧪 Testing Enhanced Emotion Detection System\n")
        print("=" * 60)
        
        results = []
        
        for i, test_case in enumerate(TEST_CASES, 1):
            print(f"\n📝 Test {i}: {test_case['description']}")
            print(f"   Text: '{test_case['text']}'")
            print(f"   Expected: {test_case['expected']}")
            
            try:
                # Test the analyze-emotion endpoint
                async with session.post(
                    f"{base_url}/analyze-emotion",
                    json={"text": test_case['text']},
                    headers={"Content-Type": "application/json"}
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        
                        detected_emotion = result.get('emotion', 'unknown')
                        confidence = result.get('confidence', 0)
                        intensity = result.get('intensity', 0)
                        is_ai_analyzed = result.get('is_ai_analyzed', False)
                        
                        # Check if emotion matches expected
                        is_correct = detected_emotion == test_case['expected']
                        status = "✅ PASS" if is_correct else "❌ FAIL"
                        
                        print(f"   Detected: {detected_emotion} (confidence: {confidence:.2f}, intensity: {intensity:.2f})")
                        print(f"   AI Analyzed: {'Yes' if is_ai_analyzed else 'No'}")
                        print(f"   Status: {status}")
                        
                        # Store results
                        results.append({
                            'test': i,
                            'text': test_case['text'],
                            'expected': test_case['expected'],
                            'detected': detected_emotion,
                            'confidence': confidence,
                            'intensity': intensity,
                            'is_ai_analyzed': is_ai_analyzed,
                            'passed': is_correct
                        })
                        
                    else:
                        error_text = await response.text()
                        print(f"   ❌ HTTP Error {response.status}: {error_text}")
                        results.append({
                            'test': i,
                            'text': test_case['text'],
                            'expected': test_case['expected'],
                            'detected': 'error',
                            'confidence': 0,
                            'intensity': 0,
                            'is_ai_analyzed': False,
                            'passed': False
                        })
                        
            except Exception as e:
                print(f"   ❌ Exception: {str(e)}")
                results.append({
                    'test': i,
                    'text': test_case['text'],
                    'expected': test_case['expected'],
                    'detected': 'exception',
                    'confidence': 0,
                    'intensity': 0,
                    'is_ai_analyzed': False,
                    'passed': False
                })
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(results)
        passed_tests = sum(1 for r in results if r['passed'])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        # Show failed tests
        if failed_tests > 0:
            print(f"\n❌ Failed Tests:")
            for result in results:
                if not result['passed']:
                    print(f"   Test {result['test']}: Expected '{result['expected']}', got '{result['detected']}'")
        
        # Show AI vs Basic analysis stats
        ai_tests = [r for r in results if r['is_ai_analyzed']]
        basic_tests = [r for r in results if not r['is_ai_analyzed']]
        
        if ai_tests:
            ai_accuracy = sum(1 for r in ai_tests if r['passed']) / len(ai_tests) * 100
            print(f"\n🤖 AI Analysis Accuracy: {ai_accuracy:.1f}% ({len(ai_tests)} tests)")
        
        if basic_tests:
            basic_accuracy = sum(1 for r in basic_tests if r['passed']) / len(basic_tests) * 100
            print(f"🔍 Basic Analysis Accuracy: {basic_accuracy:.1f}% ({len(basic_tests)} tests)")
        
        # Save detailed results
        with open('emotion_detection_test_results.json', 'w') as f:
            json.dump(results, f, indent=2)
        print(f"\n💾 Detailed results saved to 'emotion_detection_test_results.json'")

if __name__ == "__main__":
    print("🚀 Starting Emotion Detection Tests...")
    print("Make sure your backend server is running on http://localhost:8000")
    print()
    
    try:
        asyncio.run(test_emotion_detection())
    except KeyboardInterrupt:
        print("\n⏹️  Tests interrupted by user")
    except Exception as e:
        print(f"\n💥 Test execution failed: {e}")
        print("Make sure your backend server is running and accessible")
