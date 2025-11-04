// Enhanced matching algorithm with AI-like flexible matching
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

// Normalize string: remove emojis, special chars, lowercase, trim
function normalizeString(str: string): string {
  return str
    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '') // Remove emojis
    .replace(/[^\w\s]/g, '') // Remove special chars except spaces
    .toLowerCase()
    .trim();
}

// Calculate similarity between two strings (0-1)
function calculateSimilarity(str1: string, str2: string): number {
  const norm1 = normalizeString(str1);
  const norm2 = normalizeString(str2);
  
  // Exact match after normalization
  if (norm1 === norm2) return 1.0;
  
  // One contains the other
  if (norm1.includes(norm2) || norm2.includes(norm1)) return 0.8;
  
  // Check word overlap
  const words1 = norm1.split(/\s+/).filter(w => w.length > 2);
  const words2 = norm2.split(/\s+/).filter(w => w.length > 2);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  const commonWords = words1.filter(w => words2.some(w2 => w.includes(w2) || w2.includes(w)));
  const similarity = commonWords.length / Math.max(words1.length, words2.length);
  
  return similarity > 0.5 ? 0.6 : 0;
}

// Find matches between two arrays with flexible matching
function findFlexibleMatches(arr1: string[], arr2: string[]): { count: number; matches: string[] } {
  const matches: string[] = [];
  const matchedIndices = new Set<number>();
  
  for (const item1 of arr1) {
    let bestMatch = { index: -1, score: 0, item: '' };
    
    arr2.forEach((item2, idx) => {
      if (matchedIndices.has(idx)) return;
      const score = calculateSimilarity(item1, item2);
      if (score > bestMatch.score && score >= 0.6) {
        bestMatch = { index: idx, score, item: item1 };
      }
    });
    
    if (bestMatch.index !== -1) {
      matches.push(bestMatch.item);
      matchedIndices.add(bestMatch.index);
    }
  }
  
  return { count: matches.length, matches };
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
      return { mentor, score: 0, reasons: ['No common language or education mismatch'] };
    }

    // Interests and skills overlap (40% weight) - AI-powered flexible matching
    const mentorSkillsAndHobbies = [...mentor.skills, ...(mentor.hobbies || [])];
    const interestMatches = findFlexibleMatches(student.interests, mentorSkillsAndHobbies);
    if (interestMatches.count > 0) {
      const interestScore = (interestMatches.count / Math.max(student.interests.length, 1)) * 40;
      score += interestScore;
      reasons.push(`${interestMatches.count} shared interest${interestMatches.count > 1 ? 's' : ''}`);
    }

    // Subjects vs mentor skills overlap (20% weight) - AI-powered flexible matching
    const subjectMatches = findFlexibleMatches(student.subjects || [], mentor.skills);
    if (subjectMatches.count > 0) {
      const subjectScore = (subjectMatches.count / Math.max(student.subjects?.length || 1, 1)) * 20;
      score += subjectScore;
      reasons.push(`${subjectMatches.count} matching subject${subjectMatches.count > 1 ? 's' : ''}`);
    }

    // Language overlap (15% weight) - AI-powered flexible matching
    const languageMatches = findFlexibleMatches(student.languages, mentor.languages);
    if (languageMatches.count > 0) {
      const langScore = (languageMatches.count / Math.max(student.languages.length, 1)) * 15;
      score += langScore;
      reasons.push(`${languageMatches.count} common language${languageMatches.count > 1 ? 's' : ''}`);
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

  // Return ALL matches sorted by score (no minimum threshold)
  return scoredMatches.sort((a, b) => b.score - a.score);
}
