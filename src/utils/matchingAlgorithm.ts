// Enhanced matching algorithm with availability overlap scoring
interface Student {
  interests: string[];
  subjects: string[];
  languages: string[];
  meeting_pref: string;
  education_level: string;
  availability?: string[];
}

interface Mentor {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  employer: string;
  bio: string;
  skills: string[];
  hobbies: string[];
  languages: string[];
  age_pref: string;
  meeting_pref: string;
  max_students: number;
  availability?: string[];
}

export interface ScoredMatch {
  mentor: Mentor;
  score: number;
  reasons: string[];
  firstOverlap?: string;
}

// Helper to find first overlapping date within 21 days
function findFirstOverlap(studentAvail?: string[], mentorAvail?: string[]): string | null {
  if (!studentAvail || !mentorAvail) return null;
  
  const now = new Date();
  const cutoff = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000); // 21 days from now
  
  for (const dateStr of studentAvail) {
    const date = new Date(dateStr);
    if (date >= now && date <= cutoff && mentorAvail.includes(dateStr)) {
      return dateStr;
    }
  }
  return null;
}

export function calculateMatch(student: Student, mentors: Mentor[]): ScoredMatch[] {
  const scoredMatches = mentors.map((mentor) => {
    let score = 0;
    const reasons: string[] = [];

    // Hard filters first
    const hasCommonLanguage = student.languages.some(lang =>
      mentor.languages.includes(lang)
    );
    
    // Education level preference filter
    const educationMatch = mentor.age_pref === 'any' || 
                           mentor.age_pref === student.education_level;

    if (!hasCommonLanguage || !educationMatch) {
      return { mentor, score: 0, reasons: ['Not compatible'] };
    }

    // Interests and skills overlap (40% weight)
    const interestSkillOverlap = student.interests.filter((interest) =>
      mentor.skills.includes(interest) || mentor.hobbies?.includes(interest)
    ).length;
    if (interestSkillOverlap > 0) {
      const interestScore = (interestSkillOverlap / Math.max(student.interests.length, 1)) * 40;
      score += interestScore;
      reasons.push(`${interestSkillOverlap} shared interest${interestSkillOverlap > 1 ? 's' : ''}`);
    }

    // Subjects vs mentor skills overlap (20% weight)
    const subjectSkillOverlap = student.subjects?.filter((subject) =>
      mentor.skills.includes(subject)
    ).length || 0;
    if (subjectSkillOverlap > 0) {
      const subjectScore = (subjectSkillOverlap / Math.max(student.subjects?.length || 1, 1)) * 20;
      score += subjectScore;
      reasons.push(`${subjectSkillOverlap} matching subject${subjectSkillOverlap > 1 ? 's' : ''}`);
    }

    // Language overlap (15% weight)
    const languageOverlap = student.languages.filter((lang) =>
      mentor.languages.includes(lang)
    ).length;
    if (languageOverlap > 0) {
      const langScore = (languageOverlap / Math.max(student.languages.length, 1)) * 15;
      score += langScore;
      reasons.push(`${languageOverlap} common language${languageOverlap > 1 ? 's' : ''}`);
    }

    // Education level fit (10% weight)
    if (educationMatch) {
      score += 10;
      if (mentor.age_pref === student.education_level) {
        const levelLabel = student.education_level === 'middle_school' ? 'Middle School' : 
                          student.education_level === 'high_school' ? 'High School' : 'University';
        reasons.push(`Perfect education match (${levelLabel})`);
      } else {
        reasons.push('Education level compatible');
      }
    }

    // Meeting preference compatibility (5% weight)
    if (
      student.meeting_pref === mentor.meeting_pref ||
      student.meeting_pref === "either" ||
      mentor.meeting_pref === "either"
    ) {
      score += 5;
      reasons.push("Meeting preference match");
    }

    // Availability overlap within 21 days (10% weight)
    const firstOverlap = findFirstOverlap(student.availability, mentor.availability);
    if (firstOverlap) {
      score += 10;
      const date = new Date(firstOverlap);
      reasons.push(`Available ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`);
    }

    return {
      mentor,
      score: Math.round(score),
      reasons,
      firstOverlap: firstOverlap || undefined,
    };
  });

  // Sort by score descending and return matches above threshold
  return scoredMatches
    .filter((match) => match.score >= 30) // Minimum 30% match
    .sort((a, b) => b.score - a.score);
}
