"""
Simple test script to verify the CV Analysis API is working correctly.
Run this after starting both the Temporal worker and Flask API.
"""

import requests
import json

API_URL = "http://localhost:5000"

def test_health():
    """Test health endpoint"""
    print("\n=== Testing Health Endpoint ===")
    response = requests.get(f"{API_URL}/health")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def test_get_interests():
    """Test get interests endpoint"""
    print("\n=== Testing Get Interests Endpoint ===")
    response = requests.get(f"{API_URL}/api/interests")
    print(f"Status Code: {response.status_code}")
    data = response.json()
    print(f"Number of interests: {len(data.get('interests', []))}")
    print(f"Sample interests: {data.get('interests', [])[:5]}")
    return response.status_code == 200

def test_analyze_cv():
    """Test CV analysis endpoint"""
    print("\n=== Testing CV Analysis Endpoint ===")
    
    # Sample CV text
    cv_text = """
    John Doe
    Senior Software Engineer
    
    Professional Summary:
    Experienced software engineer with 8 years of expertise in blockchain technology 
    and cryptocurrency systems. Passionate about decentralized finance (DeFi) and 
    building scalable distributed systems. Active contributor to open-source projects.
    
    Skills:
    - Blockchain Development (Ethereum, Solidity)
    - Backend Development (Python, Go, Node.js)
    - Cloud Infrastructure (AWS, Docker, Kubernetes)
    - Database Design (PostgreSQL, MongoDB, Redis)
    
    Experience:
    Blockchain Solutions Architect at CryptoTech Inc. (2020-Present)
    - Led development of DeFi protocols handling $100M+ in transactions
    - Designed and implemented smart contracts for NFT marketplace
    - Built automated trading systems for cryptocurrency exchanges
    
    Hobbies:
    - Gaming (RPGs and Strategy games)
    - Technology blogging and staying updated with latest tech trends
    - Travel and exploring new cultures
    - Reading science fiction and tech news
    """
    
    payload = {"cv_text": cv_text}
    
    print(f"Sending CV text ({len(cv_text)} characters)...")
    print("This may take 10-30 seconds while the LLM processes the text...")
    
    try:
        response = requests.post(
            f"{API_URL}/api/analyze-cv",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=60
        )
        
        print(f"\nStatus Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if data.get('success'):
            print(f"\n✅ Successfully analyzed CV!")
            print(f"Found {len(data.get('interests', []))} matching interests:")
            for interest in data.get('interests', []):
                print(f"  - {interest}")
        else:
            print(f"\n❌ Analysis failed: {data.get('error')}")
        
        return response.status_code == 200 and data.get('success', False)
        
    except requests.Timeout:
        print("\n❌ Request timed out. This might mean:")
        print("  1. Temporal worker is not running")
        print("  2. OpenRouter API is slow")
        print("  3. Network issues")
        return False
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("CV Analysis API Test Suite")
    print("=" * 60)
    print("\nMake sure you have:")
    print("  1. Temporal server running (docker run -p 7233:7233 temporalio/auto-setup:latest)")
    print("  2. Temporal worker running (python temporal_worker.py)")
    print("  3. Flask API running (python app.py)")
    
    input("\nPress Enter to start tests...")
    
    results = []
    
    # Run tests
    results.append(("Health Check", test_health()))
    results.append(("Get Interests", test_get_interests()))
    results.append(("Analyze CV", test_analyze_cv()))
    
    # Print summary
    print("\n" + "=" * 60)
    print("Test Results Summary")
    print("=" * 60)
    
    for test_name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    all_passed = all(result[1] for result in results)
    
    if all_passed:
        print("\n🎉 All tests passed! Your CV Analysis API is working correctly.")
    else:
        print("\n⚠️ Some tests failed. Check the logs above for details.")
    
    print("=" * 60)

if __name__ == "__main__":
    main()
