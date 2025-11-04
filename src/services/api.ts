/**
 * API Service for backend communication
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

export interface MatchingRequest {
  student: {
    education_level: string;
    postcode: string;
    city: string;
    interests: string[];
    languages: string[];
    meeting_preference: string;
  };
  mentors: Array<{
    id: string;
    education_level: string;
    postcode: string;
    city: string;
    interests: string[];
    languages: string[];
    meeting_preference: string;
  }>;
}

export interface MatchingResponse {
  suggest: Array<{
    mentor_id: string;
    score: number;
  }>;
}

export interface ApiError {
  success: false;
  error: string;
}

/**
 * Call the backend matching API
 */
export async function matchStudent(request: MatchingRequest): Promise<MatchingResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/matching`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data: MatchingResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error calling matching API:', error);
    throw error;
  }
}

/**
 * Health check for the backend API
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
}
