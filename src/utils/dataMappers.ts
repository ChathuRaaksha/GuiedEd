/**
 * Data transformation utilities for converting between frontend and backend formats
 */

import { MockMentor } from "@/data/mockMentors";

/**
 * Convert student profile from Supabase format OR sessionStorage format to backend API format
 */
export function mapStudentToBackendFormat(student: any) {
  // Normalize education level to match backend expectations
  const educationLevelMap: { [key: string]: string } = {
    'middle_school': 'Middle School',
    'high_school': 'High School',
    'university': 'University'
  };

  // Normalize meeting preference to match backend expectations
  const meetingPrefMap: { [key: string]: string } = {
    'online': 'Online',
    'in_person': 'In person',
    'either': 'Both',
    'both': 'Both'
  };

  // Handle both snake_case (database) and camelCase (sessionStorage) formats
  const educationLevel = student.education_level || student.educationLevel;
  const meetingPref = student.meeting_pref || student.meetingPref;
  const talkAbout = student.talkAboutYourself || student.talk_about_yourself || student.bio;

  return {
    education_level: educationLevelMap[educationLevel] || educationLevel,
    postcode: student.postcode || '11122', // Default postcode if missing
    city: student.city || 'Stockholm', // Default city if missing
    interests: student.interests || [],
    languages: student.languages || [],
    meeting_preference: meetingPrefMap[meetingPref] || meetingPref || 'Both',
    // Include optional fields for enhanced matching
    bio: talkAbout || '',
    goals: student.goals || '',
    subjects: student.subjects || []
  };
}

/**
 * Convert mentor profile to backend API format
 */
export function mapMentorToBackendFormat(mentor: MockMentor) {
  return {
    id: mentor.id,
    education_level: mentor.education_level,
    postcode: mentor.postcode,
    city: mentor.city,
    interests: mentor.interests,
    languages: mentor.languages,
    meeting_preference: mentor.meeting_preference,
    // Include additional fields for enhanced matching
    bio: mentor.bio || '',
    role: mentor.role || '',
    skills: mentor.skills || [],
    hobbies: mentor.hobbies || []
  };
}

/**
 * Map backend scores back to mentor profiles
 */
export function mapScoresToMentors(
  mentors: MockMentor[],
  scores: Array<{ mentor_id: string; score: number; reasoning?: string }>
) {
  // Create a map of mentor_id to score and reasoning
  const scoreMap = new Map(
    scores.map(s => [s.mentor_id, { score: s.score, reasoning: s.reasoning }])
  );

  // Map scores to mentors and filter out those without scores
  const mentorsWithScores = mentors
    .map(mentor => {
      const matchData = scoreMap.get(mentor.id);
      return {
        mentor,
        score: matchData?.score || 0,
        reasoning: matchData?.reasoning,
        reasons: matchData?.reasoning ? [matchData.reasoning] : generateReasonsFromScore(matchData?.score || 0)
      };
    })
    .filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score);

  return mentorsWithScores;
}

/**
 * Generate match reasons based on score
 * This is a simplified version since the backend doesn't return detailed reasons
 */
function generateReasonsFromScore(score: number): string[] {
  const reasons: string[] = [];

  if (score >= 90) {
    reasons.push('Excellent match');
  } else if (score >= 75) {
    reasons.push('Strong match');
  } else if (score >= 60) {
    reasons.push('Good match');
  } else if (score >= 40) {
    reasons.push('Moderate match');
  } else if (score > 0) {
    reasons.push('Potential match');
  }

  // Add generic reasons based on score ranges
  if (score >= 80) {
    reasons.push('High compatibility');
  }
  if (score >= 60) {
    reasons.push('Shared interests');
  }
  if (score >= 40) {
    reasons.push('Common language');
  }

  return reasons;
}

/**
 * Validate that student has required fields for backend API
 * Handles both snake_case (database) and camelCase (sessionStorage) formats
 */
export function validateStudentProfile(student: any): { valid: boolean; error?: string } {
  if (!student) {
    return { valid: false, error: 'Student profile is missing' };
  }

  // Check for education_level (snake_case) or educationLevel (camelCase)
  const educationLevel = student.education_level || student.educationLevel;
  if (!educationLevel) {
    return { valid: false, error: 'Missing required field: education level' };
  }

  // Check for meeting_pref (snake_case) or meetingPref (camelCase)
  const meetingPref = student.meeting_pref || student.meetingPref;
  if (!meetingPref) {
    return { valid: false, error: 'Missing required field: meeting preference' };
  }

  if (!Array.isArray(student.interests) || student.interests.length === 0) {
    return { valid: false, error: 'Student must have at least one interest' };
  }

  if (!Array.isArray(student.languages) || student.languages.length === 0) {
    return { valid: false, error: 'Student must have at least one language' };
  }

  return { valid: true };
}
