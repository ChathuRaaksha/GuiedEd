// Matching algorithm for students and mentors
interface Student {
  interests: string[];
  languages: string[];
  meeting_pref: string;
}

interface Mentor {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  employer: string;
  bio: string;
  skills: string[];
  languages: string[];
  age_pref: string;
  meeting_pref: string;
  max_students: number;
}

export interface ScoredMatch {
  mentor: Mentor;
  score: number;
  reasons: string[];
}

export function calculateMatch(student: Student, mentors: Mentor[]): ScoredMatch[] {
  const scoredMatches = mentors.map((mentor) => {
    let score = 0;
    const reasons: string[] = [];

    // Interest overlap (50% weight)
    const interestOverlap = student.interests.filter((interest) =>
      mentor.skills.includes(interest)
    ).length;
    if (interestOverlap > 0) {
      score += interestOverlap * 50 / Math.max(student.interests.length, 1);
      reasons.push(`${interestOverlap} shared interest${interestOverlap > 1 ? 's' : ''}`);
    }

    // Language overlap (15% weight)
    const languageOverlap = student.languages.filter((lang) =>
      mentor.languages.includes(lang)
    ).length;
    if (languageOverlap > 0) {
      score += languageOverlap * 15 / Math.max(student.languages.length, 1);
      reasons.push(`Common language${languageOverlap > 1 ? 's' : ''}`);
    }

    // Meeting preference compatibility (25% weight)
    if (
      student.meeting_pref === mentor.meeting_pref ||
      student.meeting_pref === "both" ||
      mentor.meeting_pref === "both"
    ) {
      score += 25;
      reasons.push("Meeting preference match");
    }

    // Bonus points for mentor experience (10% weight)
    if (mentor.max_students > 1) {
      score += 10;
      reasons.push(`Experienced mentor (${mentor.max_students} student capacity)`);
    }

    return {
      mentor,
      score: Math.round(score),
      reasons,
    };
  });

  // Sort by score descending and return top matches
  return scoredMatches
    .filter((match) => match.score >= 30) // Minimum threshold
    .sort((a, b) => b.score - a.score);
}
