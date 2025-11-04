// Enhanced matching algorithm with new scoring weights
interface Student {
  interests: string[];
  subjects: string[];
  languages: string[];
  meeting_pref: string;
  grade: number;
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

    // Hard filters first
    const hasCommonLanguage = student.languages.some(lang =>
      mentor.languages.includes(lang)
    );
    
    // Age preference filter
    const ageMatch = mentor.age_pref === 'either' || 
                     mentor.age_pref === String(student.grade);

    if (!hasCommonLanguage || !ageMatch) {
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

    // Age preference fit (10% weight)
    if (ageMatch) {
      score += 10;
      if (mentor.age_pref === String(student.grade)) {
        reasons.push(`Perfect age match (Grade ${student.grade})`);
      } else {
        reasons.push('Age preference compatible');
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

    // Mentor capacity bonus (10% weight for experienced mentors)
    if (mentor.max_students > 1) {
      score += 10;
      reasons.push(`Experienced mentor (capacity: ${mentor.max_students})`);
    }

    return {
      mentor,
      score: Math.round(score),
      reasons,
    };
  });

  // Sort by score descending and return matches above threshold
  return scoredMatches
    .filter((match) => match.score >= 30) // Minimum 30% match
    .sort((a, b) => b.score - a.score);
}
