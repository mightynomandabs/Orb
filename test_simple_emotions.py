#!/usr/bin/env python3
"""
Simple test for the fixed emotion detection system
"""

import asyncio
import aiohttp
import json

# Test cases that were failing before
CRITICAL_TEST_CASES = [
    {
        "text": "I hate my boss, he tries to be touchy with me",
        "expected": "anger",
        "description": "Should detect ANGER, not love"
    },
    {
        "text": "I was close to dying today",
        "expected": "fear", 
        "description": "Should detect FEAR, not love"
    },
    {
        "text": "I got promoted in my job today",
        "expected": "joy",
        "description": "Should detect JOY, not neutral"
    },
    {
        "text": "I broke my phone bymistakely",
        "expected": "sadness",
        "description": "Should detect SADNESS (this was working)"
    }
]

async def test_critical_fixes():
    """Test the critical emotion detection fixes"""
    base_url = "http://localhost:8000/api"
    
    async with aiohttp.ClientSession() as session:
        print("🔧 Testing Critical Emotion Detection Fixes\n")
        print("=" * 60)
        
        results = []
        
        for i, test_case in enumerate(CRITICAL_TEST_CASES, 1):
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
                        
                        if not is_correct:
                            print(f"   ⚠️  WRONG EMOTION! Expected '{test_case['expected']}', got '{detected_emotion}'")
                        
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
        print("📊 CRITICAL FIXES TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(results)
        passed_tests = sum(1 for r in results if r['passed'])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests == 0:
            print("\n🎉 ALL CRITICAL FIXES WORKING! Emotion detection is now accurate.")
        else:
            print(f"\n❌ {failed_tests} critical tests still failing. Need more fixes.")
            for result in results:
                if not result['passed']:
                    print(f"   Test {result['test']}: Expected '{result['expected']}', got '{result['detected']}'")
        
        # Save results
        with open('critical_fixes_test_results.json', 'w') as f:
            json.dump(results, f, indent=2)
        print(f"\n💾 Results saved to 'critical_fixes_test_results.json'")

if __name__ == "__main__":
    print("🚀 Testing Critical Emotion Detection Fixes...")
    print("Make sure your backend server is running on http://localhost:8000")
    print()
    
    try:
        asyncio.run(test_critical_fixes())
    except KeyboardInterrupt:
        print("\n⏹️  Tests interrupted by user")
    except Exception as e:
        print(f"\n💥 Test execution failed: {e}")
        print("Make sure your backend server is running and accessible")
