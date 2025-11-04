"""
Test script for the matching API functionality.
Tests the complete matching pipeline from API request to response.
"""

import json
import requests
import time

# Test data
sample_matching_request = {
    "student": {
        "education_level": "University",
        "postcode": "11122",
        "city": "Stockholm",
        "interests": ["Technology", "Gaming", "Music"],
        "languages": ["Swedish", "English"],
        "meeting_preference": "Both"
    },
    "mentors": [
        {
            "id": "mentor-1",
            "education_level": "University",
            "postcode": "11123",
            "city": "Stockholm",
            "interests": ["Technology", "Business & Finance", "Gaming"],
            "languages": ["Swedish", "English", "German"],
            "meeting_preference": "In person"
        },
        {
            "id": "mentor-2", 
            "education_level": "High school",
            "postcode": "41101",
            "city": "Gothenburg",
            "interests": ["Music", "Art", "Travel"],
            "languages": ["Swedish", "Spanish"],
            "meeting_preference": "Online"
        },
        {
            "id": "mentor-3",
            "education_level": "University",
            "postcode": "11140",
            "city": "Stockholm",
            "interests": ["Technology", "Science", "Music"],
            "languages": ["English", "Swedish", "Finnish"],
            "meeting_preference": "Both"
        }
    ]
}

def test_matching_api():
    """Test the matching API endpoint."""
    
    print("🧪 Testing Matching API")
    print("=" * 50)
    
    # API endpoint
    url = "http://localhost:5000/api/matching"
    
    try:
        print(f"📤 Sending request to {url}")
        print(f"📋 Student: {sample_matching_request['student']['education_level']}, "
              f"Interests: {', '.join(sample_matching_request['student']['interests'][:3])}")
        print(f"👥 Testing against {len(sample_matching_request['mentors'])} mentors")
        
        # Make request
        start_time = time.time()
        response = requests.post(
            url,
            json=sample_matching_request,
            headers={"Content-Type": "application/json"},
            timeout=60
        )
        end_time = time.time()
        
        print(f"⏱️  Response time: {end_time - start_time:.2f} seconds")
        print(f"📊 Status code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            
            if 'suggest' in result:
                matches = result['suggest']
                print(f"✅ Success! Found {len(matches)} matches")
                
                print("\n🎯 Match Results:")
                print("-" * 30)
                
                for i, match in enumerate(matches, 1):
                    mentor_id = match['mentor_id']
                    score = match['score']
                    print(f"{i}. Mentor {mentor_id}: {score}% match")
                
                # Verify scores are sorted correctly
                scores = [match['score'] for match in matches]
                if scores == sorted(scores, reverse=True):
                    print("\n✅ Scores are properly sorted (descending)")
                else:
                    print("\n❌ ERROR: Scores are not properly sorted")
                    
                return True
            else:
                print(f"❌ ERROR: Response missing 'suggest' field. Response: {result}")
                return False
                
        else:
            print(f"❌ ERROR: HTTP {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error details: {error_data}")
            except:
                print(f"Error response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Could not connect to API. Make sure the server is running.")
        print("💡 Start the server with: python app.py")
        return False
        
    except requests.exceptions.Timeout:
        print("❌ ERROR: Request timed out after 60 seconds")
        return False
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False


def test_validation_errors():
    """Test API validation with invalid requests."""
    
    print("\n🛡️  Testing Input Validation")
    print("=" * 50)
    
    url = "http://localhost:5000/api/matching"
    
    # Test cases for validation
    test_cases = [
        {
            "name": "Missing student field",
            "data": {"mentors": []},
            "expected_status": 400
        },
        {
            "name": "Missing mentors field", 
            "data": {"student": sample_matching_request["student"]},
            "expected_status": 400
        },
        {
            "name": "Empty mentors list",
            "data": {
                "student": sample_matching_request["student"],
                "mentors": []
            },
            "expected_status": 400
        },
        {
            "name": "Invalid education level",
            "data": {
                "student": {
                    **sample_matching_request["student"],
                    "education_level": "PhD"  # Invalid
                },
                "mentors": sample_matching_request["mentors"]
            },
            "expected_status": 500  # Will fail in validation activity
        },
        {
            "name": "Invalid postcode",
            "data": {
                "student": {
                    **sample_matching_request["student"],
                    "postcode": "123"  # Too short
                },
                "mentors": sample_matching_request["mentors"]
            },
            "expected_status": 500  # Will fail in validation activity
        }
    ]
    
    for test_case in test_cases:
        print(f"\n🧪 Testing: {test_case['name']}")
        
        try:
            response = requests.post(
                url,
                json=test_case["data"],
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == test_case["expected_status"]:
                print(f"✅ Expected HTTP {test_case['expected_status']} - Got {response.status_code}")
            else:
                print(f"❌ Expected HTTP {test_case['expected_status']} - Got {response.status_code}")
                
        except Exception as e:
            print(f"❌ ERROR: {str(e)}")


def test_interests_endpoint():
    """Test the interests endpoint."""
    
    print("\n📋 Testing Interests Endpoint")
    print("=" * 50)
    
    url = "http://localhost:5000/api/interests"
    
    try:
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            
            if 'interests' in result:
                interests = result['interests']
                print(f"✅ Success! Found {len(interests)} interests")
                print(f"🎯 Sample interests: {', '.join(interests[:5])}")
                return True
            else:
                print(f"❌ ERROR: Missing 'interests' field in response")
                return False
                
        else:
            print(f"❌ ERROR: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False


if __name__ == "__main__":
    print("🚀 Starting Matching API Tests")
    print("=" * 50)
    
    # Test basic functionality
    success = test_matching_api()
    
    if success:
        # Test validation
        test_validation_errors()
        
        # Test interests endpoint
        test_interests_endpoint()
        
        print("\n🎉 All tests completed!")
    else:
        print("\n❌ Basic matching test failed. Check your setup:")
        print("1. Make sure Temporal is running")
        print("2. Make sure the worker is running: python temporal_worker.py")
        print("3. Make sure the API server is running: python app.py")
        print("4. Check that all dependencies are installed")
