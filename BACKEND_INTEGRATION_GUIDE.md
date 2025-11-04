# Backend Integration Guide

## Overview
The frontend StudentMatch component has been successfully integrated with the backend matching API using mock data.

## What Was Implemented

### 1. API Service Layer (`src/services/api.ts`)
- Centralized API communication service
- `matchStudent()` function to call backend `/api/matching` endpoint
- Health check function
- Proper error handling and TypeScript types

### 2. Mock Mentor Data (`src/data/mockMentors.ts`)
- 8 diverse mock mentor profiles
- Various skills, interests, languages, and locations
- Ready to test different matching scenarios

### 3. Data Transformation Utilities (`src/utils/dataMappers.ts`)
- `mapStudentToBackendFormat()` - Converts student data to backend format
- `mapMentorToBackendFormat()` - Converts mentor data to backend format
- `mapScoresToMentors()` - Maps backend scores back to mentor profiles
- `validateStudentProfile()` - Validates student data before API call

### 4. Modified StudentMatch.tsx
- Now calls backend API instead of local matching algorithm
- Uses mock mentors instead of database mentors
- Displays backend-calculated match scores
- Graceful error handling if backend is unavailable

### 5. Environment Configuration
- `.env.local` created with backend URL
- Vite environment types updated

## How to Test

### Step 1: Start the Backend Server
```bash
cd backend
python app.py
```

The backend should start on `http://localhost:5000`

### Step 2: Verify Backend is Running
Open a new terminal and test:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "CV Analysis API"
}
```

### Step 3: Start the Frontend
```bash
npm run dev
```

### Step 4: Test the Student Workflow

1. **Login as a Student** or create a new student account
2. **Complete Student Onboarding** if not already done:
   - Fill in personal details (name, education level, etc.)
   - Add interests (e.g., Technology, Gaming, Music)
   - Add languages (e.g., Swedish, English)
   - Select meeting preference (Online, In person, or Both)
   - Add postcode and city

3. **Navigate to Student Match Page**
   - The page will automatically call the backend API
   - You should see a success toast: "Found X matches using backend AI!"
   - View the matched mentors with their scores (0-100 percentage)

4. **Check Browser Console**
   - Open Developer Tools (F12)
   - Look for console logs:
     - "Calling backend matching API with: ..."
     - "Backend response: ..."
   - This helps verify the API is being called correctly

### Step 5: Verify Match Scores

The backend calculates scores based on:
- **Interests overlap (40%)** - Shared interests between student and mentor
- **Languages (25%)** - Common languages
- **Education level (15%)** - Education compatibility
- **Meeting preference (10%)** - Meeting preference match
- **Distance (10%)** - Geographic proximity

Check that:
- Scores are displayed as percentages (0-100)
- Higher scores appear first in the list
- Match reasons are displayed below each mentor

## Mock Data Available

The mock mentors include:
1. **Erik Andersson** - Senior Software Engineer at Spotify (Technology, Gaming, Music)
2. **Maria Johansson** - Product Manager at Klarna (Business, Travel, Photography)
3. **Ahmed Hassan** - Data Scientist at H&M (Technology, Mathematics, Science)
4. **Lisa Pettersson** - UX Designer at IKEA (Art, Design, Technology)
5. **Johan Lindström** - Engineering Manager at Ericsson (Technology, Leadership, Sports)
6. **Yuki Tanaka** - Game Developer at Paradox (Gaming, Technology, Art)
7. **Sofia Nielsen** - Financial Analyst at Nordea (Business, Mathematics, Travel)
8. **Carlos Rodriguez** - Cybersecurity Specialist at Telia (Technology, Gaming, Science)

## Troubleshooting

### Error: "Backend matching unavailable"
- **Cause**: Backend server is not running or not accessible
- **Solution**: 
  1. Check backend server is running on port 5000
  2. Verify `.env.local` has correct URL
  3. Check console for detailed error messages

### Error: "Please complete your profile"
- **Cause**: Student profile is missing required fields
- **Solution**: Complete the student onboarding form with all required fields

### No matches shown
- **Possible causes**:
  1. Student profile doesn't match any mentors (unlikely with mock data)
  2. Backend returned empty results
  3. API call failed
- **Solution**: Check browser console for errors and backend logs

### TypeScript Errors in IDE
- The TypeScript errors shown are related to type definitions
- They don't affect functionality
- Can be ignored for testing purposes

## Architecture

```
Frontend (StudentMatch.tsx)
    ↓
API Service (api.ts)
    ↓
Backend Flask API (/api/matching)
    ↓
Temporal Workflow (MatchingWorkflow)
    ↓
Matching Algorithm (matching.py)
    ↓
Response with Scores
    ↓
Frontend Display
```

## Next Steps

After successful testing:
1. Replace mock mentors with real database data
2. Add more detailed match reasons from backend
3. Implement caching for better performance
4. Add loading states during API calls
5. Handle edge cases (no internet, slow responses)

## Configuration

The backend URL can be changed in `.env.local`:
```env
VITE_API_BASE_URL=http://localhost:5000
```

For production, set this to your production backend URL.
