/**
 * Matching Service
 * Handles communication with the backend matching API using Temporal workflows
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export interface StudentMatchRequest {
  firstName: string;
  lastName: string;
  educationLevel: string;
  city: string;
  postcode: string;
  interests: string[];
  languages: string[];
  subjects: string[];
  talkAboutYourself?: string;
  goals?: string;
  meetingPref: string;
}

export interface MentorMatch {
  mentor_id: string;
  score: number;
  mentor: {
    id: string;
    first_name: string;
    last_name: string;
    bio: string;
    city: string;
    education_level: string;
    interests: string[];
    languages: string[];
    meeting_preference: string;
    postcode: string;
    skills: string[];
  };
}

export interface MatchResponse {
  success: boolean;
  matches: MentorMatch[];
  error?: string;
}

/**
 * Call the backend matching API with mock mentors
 * This uses the Temporal workflow for intelligent matching
 */
export async function getMatches(student: StudentMatchRequest): Promise<MatchResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/match-with-mocks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ student }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    const data: MatchResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching matches:', error);
    return {
      success: false,
      matches: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get available interests from the backend
 */
export async function getAvailableInterests(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/interests`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.interests || [];
  } catch (error) {
    console.error('Error fetching interests:', error);
    return [];
  }
}
