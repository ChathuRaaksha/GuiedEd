"""
Matching algorithm for connecting students with mentors.
Implements multi-criteria scoring based on interests, languages, education, meeting preferences, and location.
"""

import math
import logging
from typing import List, Dict, Any, Tuple, Optional

logger = logging.getLogger(__name__)

class MatchingScorer:
    """Handles the scoring logic for student-mentor matching."""
    
    # Scoring weights (should sum to 100%)
    WEIGHTS = {
        'interests': 25,
        'languages': 15, 
        'education': 10,
        'meeting_pref': 5,
        'distance': 5,
        'subjects': 15,
        'bio_goals': 25  # LLM-based semantic matching on bio/goals
    }
    
    # Maximum distance for bonus scoring (km)
    MAX_DISTANCE_BONUS = 50
    
    def __init__(self):
        self.available_interests = self._load_available_interests()
    
    def _load_available_interests(self) -> List[str]:
        """Load available interests from CSV file."""
        try:
            import csv
            import os
            
            interests_path = os.path.join(os.path.dirname(__file__), 'data', 'interests.csv')
            interests = []
            
            with open(interests_path, 'r') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    interests.append(row['interest'])
            
            logger.info(f"Loaded {len(interests)} available interests")
            return interests
            
        except Exception as e:
            logger.error(f"Failed to load interests: {e}")
            return []
    
    def calculate_matches(self, student: Dict[str, Any], mentors: List[Dict[str, Any]], 
                         coordinates: Dict[str, Tuple[float, float]]) -> List[Dict[str, Any]]:
        """
        Calculate matching scores for all mentors against a student.
        
        Args:
            student: Student profile dictionary
            mentors: List of mentor profile dictionaries
            coordinates: Dict mapping person_id -> (lat, lng) coordinates
            
        Returns:
            List of matches with mentor_id and score, sorted by score descending
        """
        matches = []
        student_coords = coordinates.get('student')
        
        for mentor in mentors:
            score = self._calculate_single_match(student, mentor, student_coords, 
                                               coordinates.get(mentor['id']))
            
            if score > 0:  # Only include matches with some compatibility
                matches.append({
                    'mentor_id': mentor['id'],
                    'score': score
                })
        
        # Sort by score descending
        matches.sort(key=lambda x: x['score'], reverse=True)
        
        logger.info(f"Generated {len(matches)} matches for student")
        return matches
    
    def _calculate_single_match(self, student: Dict[str, Any], mentor: Dict[str, Any],
                               student_coords: Optional[Tuple[float, float]], 
                               mentor_coords: Optional[Tuple[float, float]]) -> int:
        """Calculate matching score between a student and single mentor."""
        
        # Hard compatibility filters
        if not self._check_hard_filters(student, mentor):
            return 0
        
        total_score = 0
        
        # Interest overlap score (25%)
        interest_score = self._calculate_interest_score(student, mentor)
        total_score += interest_score * (self.WEIGHTS['interests'] / 100)
        
        # Language compatibility score (15%)
        language_score = self._calculate_language_score(student, mentor)
        total_score += language_score * (self.WEIGHTS['languages'] / 100)
        
        # Education level score (10%)
        education_score = self._calculate_education_score(student, mentor)
        total_score += education_score * (self.WEIGHTS['education'] / 100)
        
        # Meeting preference score (5%)
        meeting_score = self._calculate_meeting_score(student, mentor)
        total_score += meeting_score * (self.WEIGHTS['meeting_pref'] / 100)
        
        # Distance score (5%)
        distance_score = self._calculate_distance_score(student_coords, mentor_coords)
        total_score += distance_score * (self.WEIGHTS['distance'] / 100)
        
        # Subject compatibility score (15%)
        subject_score = self._calculate_subject_score(student, mentor)
        total_score += subject_score * (self.WEIGHTS['subjects'] / 100)
        
        # Bio and goals semantic matching score (25%)
        bio_goals_score = self._calculate_bio_goals_score(student, mentor)
        total_score += bio_goals_score * (self.WEIGHTS['bio_goals'] / 100)
        
        return round(total_score)
    
    def _check_hard_filters(self, student: Dict[str, Any], mentor: Dict[str, Any]) -> bool:
        """Check if student and mentor pass hard compatibility filters."""
        
        # Must have at least one common language
        student_languages = set(student.get('languages', []))
        mentor_languages = set(mentor.get('languages', []))
        
        if not student_languages.intersection(mentor_languages):
            return False
        
        # Basic validation - both must have required fields
        required_fields = ['education_level', 'interests', 'languages', 'meeting_preference']
        for field in required_fields:
            if not student.get(field) or not mentor.get(field):
                return False
        
        return True
    
    def _calculate_interest_score(self, student: Dict[str, Any], mentor: Dict[str, Any]) -> float:
        """Calculate score based on shared interests (0-100)."""
        
        student_interests = set(student.get('interests', []))
        mentor_interests = set(mentor.get('interests', []))
        
        if not student_interests or not mentor_interests:
            return 70  # More generous baseline
        
        overlap = student_interests.intersection(mentor_interests)
        
        if not overlap:
            return 70  # Still give decent score even without direct overlap
        
        # More generous scoring for shared interests
        overlap_ratio = len(overlap) / len(student_interests)
        
        # Bigger bonus for shared interests
        bonus = min(len(overlap) * 8, 30)  # Up to 30 point bonus
        
        base_score = min(overlap_ratio * 70 + 70, 90)  # Base score starts at 70
        
        return min(base_score + bonus, 100)
    
    def _calculate_language_score(self, student: Dict[str, Any], mentor: Dict[str, Any]) -> float:
        """Calculate score based on language compatibility (0-100)."""
        
        student_languages = set(student.get('languages', []))
        mentor_languages = set(mentor.get('languages', []))
        
        if not student_languages or not mentor_languages:
            return 80  # More generous default
        
        overlap = student_languages.intersection(mentor_languages)
        
        if not overlap:
            return 80  # Still give good score
        
        # Higher base score for having common languages
        base_score = 85
        
        # Bonus for each additional shared language
        language_bonus = (len(overlap) - 1) * 5
        
        return min(base_score + language_bonus, 100)
    
    def _calculate_education_score(self, student: Dict[str, Any], mentor: Dict[str, Any]) -> float:
        """Calculate score based on education level compatibility (0-100)."""
        
        student_level = student.get('education_level', '').lower()
        mentor_level = student.get('education_level', '').lower()
        
        if not student_level or not mentor_level:
            return 90  # More generous default
        
        # Normalize education levels
        education_hierarchy = {
            'middle school': 1,
            'high school': 2, 
            'university': 3
        }
        
        student_rank = education_hierarchy.get(student_level, 0)
        mentor_rank = education_hierarchy.get(mentor_level, 0)
        
        if student_rank == 0 or mentor_rank == 0:
            return 90  # Default to high score
        
        # Perfect match
        if student_rank == mentor_rank:
            return 100
        
        # Any education level match is good
        return 95
    
    def _calculate_meeting_score(self, student: Dict[str, Any], mentor: Dict[str, Any]) -> float:
        """Calculate score based on meeting preference compatibility (0-100)."""
        
        student_pref = student.get('meeting_preference', '').lower()
        mentor_pref = mentor.get('meeting_preference', '').lower()
        
        if not student_pref or not mentor_pref:
            return 90  # More generous default
        
        # Perfect match
        if student_pref == mentor_pref:
            return 100
        
        # "Both" is compatible with everything
        if student_pref == 'both' or mentor_pref == 'both':
            return 95
        
        # Any meeting preference is fine
        return 85
    
    def _calculate_distance_score(self, student_coords: Optional[Tuple[float, float]], 
                                mentor_coords: Optional[Tuple[float, float]]) -> float:
        """Calculate score based on geographic proximity (0-100)."""
        
        if not student_coords or not mentor_coords:
            # No location data available - give high score
            return 90
        
        try:
            distance_km = self._calculate_haversine_distance(
                student_coords[0], student_coords[1],
                mentor_coords[0], mentor_coords[1]
            )
            
            # Very close (< 5km) gets full score
            if distance_km <= 5:
                return 100
            
            # Linear decay up to MAX_DISTANCE_BONUS
            if distance_km <= self.MAX_DISTANCE_BONUS:
                return 100 - (distance_km / self.MAX_DISTANCE_BONUS) * 80
            
            # Far distance gets minimal score
            return 20
            
        except Exception as e:
            logger.error(f"Error calculating distance: {e}")
            return 50
    
    def _calculate_haversine_distance(self, lat1: float, lng1: float, 
                                    lat2: float, lng2: float) -> float:
        """Calculate the great circle distance between two points on Earth (in km)."""
        
        # Convert latitude and longitude from degrees to radians
        lat1, lng1, lat2, lng2 = map(math.radians, [lat1, lng1, lat2, lng2])
        
        # Haversine formula
        dlat = lat2 - lat1
        dlng = lng2 - lng1
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        # Radius of earth in kilometers
        r = 6371
        
        return c * r
    
    def _calculate_subject_score(self, student: Dict[str, Any], mentor: Dict[str, Any]) -> float:
        """Calculate score based on subject alignment with mentor's skills (0-100)."""
        
        student_subjects = student.get('subjects', [])
        mentor_skills = mentor.get('skills', [])
        mentor_bio = mentor.get('bio', '').lower()
        
        if not student_subjects:
            return 85  # Generous default if no subjects specified
        
        score = 85  # Start with good baseline
        
        # Map subjects to relevant keywords/skills
        subject_keywords = {
            '🔢 Mathematics': ['math', 'mathematics', 'statistics', 'data', 'analysis', 'finance', 'engineering'],
            '🔬 Science': ['science', 'research', 'biology', 'chemistry', 'physics', 'lab', 'environmental'],
            '💻 Technology': ['technology', 'tech', 'software', 'programming', 'coding', 'computer', 'it', 'web', 'app'],
            '⚙️ Engineering': ['engineering', 'engineer', 'mechanical', 'civil', 'design', 'cad', 'technical'],
            '📖 English': ['english', 'writing', 'communication', 'literature', 'language'],
            '📜 History': ['history', 'historical', 'culture', 'social'],
            '🌍 Geography': ['geography', 'travel', 'global', 'world', 'maps', 'culture'],
            '🎨 Art': ['art', 'design', 'creative', 'visual', 'graphic', 'drawing', 'painting'],
            '🎵 Music': ['music', 'audio', 'sound', 'musician', 'production', 'producer'],
            '🏃 Physical Education': ['sports', 'fitness', 'athletics', 'coaching', 'physical', 'training']
        }
        
        matches = 0
        for subject in student_subjects:
            keywords = subject_keywords.get(subject, [])
            
            # Check if mentor's skills or bio mention related keywords
            for keyword in keywords:
                if any(keyword in skill.lower() for skill in mentor_skills):
                    matches += 1
                    break
                elif keyword in mentor_bio:
                    matches += 0.7  # Slightly lower weight for bio mentions
                    break
        
        if matches > 0:
            # Bonus for subject alignment
            bonus = min(matches * 10, 15)
            score = min(score + bonus, 100)
        
        return score
    
    def _calculate_bio_goals_score(self, student: Dict[str, Any], mentor: Dict[str, Any]) -> float:
        """
        Calculate semantic similarity between student bio/goals and mentor profile (0-100).
        Uses keyword matching and context analysis.
        """
        
        student_bio = student.get('bio', '').lower()
        student_goals = student.get('goals', '').lower()
        mentor_bio = mentor.get('bio', '').lower()
        mentor_role = mentor.get('role', '').lower()
        mentor_skills = [s.lower() for s in mentor.get('skills', [])]
        mentor_hobbies = [h.lower() for h in mentor.get('hobbies', [])]
        
        # If student hasn't provided bio/goals, use generous default
        if not student_bio and not student_goals:
            return 85
        
        score = 70  # Base score
        
        # Combine student text
        student_text = f"{student_bio} {student_goals}"
        
        # Combine mentor text
        mentor_text = f"{mentor_bio} {mentor_role} {' '.join(mentor_skills)} {' '.join(mentor_hobbies)}"
        
        # Career/field keywords - specific career interests
        career_keywords = {
            'software': ['software', 'programmer', 'developer', 'coding', 'engineering'],
            'data': ['data', 'analytics', 'statistics', 'machine learning', 'ai'],
            'business': ['business', 'entrepreneur', 'management', 'finance', 'marketing'],
            'design': ['design', 'creative', 'ux', 'ui', 'graphic', 'art'],
            'music': ['music', 'musician', 'producer', 'artist', 'singer', 'band'],
            'gaming': ['game', 'gaming', 'esports', 'streamer', 'developer'],
            'science': ['scientist', 'research', 'biology', 'chemistry', 'physics', 'lab'],
            'medical': ['doctor', 'medicine', 'healthcare', 'nurse', 'medical'],
            'teaching': ['teacher', 'education', 'teaching', 'professor', 'tutor'],
            'sports': ['sports', 'athlete', 'coach', 'fitness', 'trainer'],
            'engineering': ['engineer', 'mechanical', 'civil', 'automotive', 'technical'],
            'fashion': ['fashion', 'designer', 'style', 'clothing', 'beauty'],
            'food': ['chef', 'cooking', 'culinary', 'restaurant', 'food'],
            'aviation': ['pilot', 'aviation', 'flight', 'aerospace'],
            'content': ['content', 'creator', 'influencer', 'social media', 'youtube'],
            'crypto': ['crypto', 'blockchain', 'bitcoin', 'cryptocurrency']
        }
        
        # Check for specific career mentions
        career_matches = 0
        for career_type, keywords in career_keywords.items():
            student_mentions = any(keyword in student_text for keyword in keywords)
            mentor_has = any(keyword in mentor_text for keyword in keywords)
            
            if student_mentions and mentor_has:
                career_matches += 1
        
        if career_matches > 0:
            # Strong bonus for career alignment
            score += min(career_matches * 15, 30)
        
        # Personal interest keywords - hobbies and interests
        interest_keywords = [
            'taylor swift', 'music', 'gaming', 'games', 'sports', 'travel',
            'photography', 'art', 'reading', 'books', 'movies', 'cooking',
            'fashion', 'fitness', 'nature', 'animals', 'pets', 'technology'
        ]
        
        interest_matches = 0
        for keyword in interest_keywords:
            if keyword in student_text and keyword in mentor_text:
                interest_matches += 1
        
        if interest_matches > 0:
            # Moderate bonus for shared interests
            score += min(interest_matches * 5, 15)
        
        # Specific high-value phrases
        value_phrases = {
            'i don\'t know': 0,  # Student is unsure
            'explore': 5,  # Student wants to explore
            'learn more': 5,  # Student wants to learn
            'career': 10,  # Interested in career guidance
            'mentor': 10,  # Explicitly wants mentorship
        }
        
        for phrase, bonus in value_phrases.items():
            if phrase in student_text:
                score += bonus
        
        return min(score, 100)


def validate_matching_input(data: Dict[str, Any]) -> Tuple[bool, str]:
    """
    Validate the input data for the matching API.
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    
    # Check top-level structure
    if 'student' not in data:
        return False, "Missing required field: student"
    
    if 'mentors' not in data:
        return False, "Missing required field: mentors"
    
    if not isinstance(data['mentors'], list):
        return False, "mentors must be a list"
    
    if len(data['mentors']) == 0:
        return False, "mentors list cannot be empty"
    
    # Validate student
    student = data['student']
    student_valid, student_error = _validate_person_data(student, 'student')
    if not student_valid:
        return False, f"Student validation error: {student_error}"
    
    # Validate mentors
    for i, mentor in enumerate(data['mentors']):
        mentor_valid, mentor_error = _validate_person_data(mentor, 'mentor')
        if not mentor_valid:
            return False, f"Mentor {i} validation error: {mentor_error}"
        
        if 'id' not in mentor:
            return False, f"Mentor {i} missing required field: id"
    
    return True, ""


def _validate_person_data(person: Dict[str, Any], person_type: str) -> Tuple[bool, str]:
    """Validate a person's data (student or mentor)."""
    
    required_fields = ['education_level', 'postcode', 'city', 'interests', 'languages', 'meeting_preference']
    
    for field in required_fields:
        if field not in person:
            return False, f"Missing required field: {field}"
    
    # Validate education level
    valid_education = ['middle school', 'high school', 'university']
    if person['education_level'].lower() not in valid_education:
        return False, f"Invalid education_level. Must be one of: {valid_education}"
    
    # Validate postcode (Swedish 5-digit)
    postcode = str(person['postcode']).strip()
    if not postcode.isdigit() or len(postcode) != 5:
        return False, "postcode must be a 5-digit Swedish postal code"
    
    # Validate lists
    for list_field in ['interests', 'languages']:
        if not isinstance(person[list_field], list):
            return False, f"{list_field} must be a list"
        if len(person[list_field]) == 0:
            return False, f"{list_field} cannot be empty"
    
    # Validate meeting preference
    valid_meeting_prefs = ['online', 'in person', 'both']
    if person['meeting_preference'].lower() not in valid_meeting_prefs:
        return False, f"Invalid meeting_preference. Must be one of: {valid_meeting_prefs}"
    
    # Validate languages
    valid_languages = [
        "English", "Spanish", "French", "German", "Mandarin", "Swedish", "Arabic",
        "Portuguese", "Italian", "Russian", "Japanese", "Korean", "Hindi", "Dutch",
        "Polish", "Turkish", "Norwegian", "Danish", "Finnish", "Other"
    ]
    
    for lang in person['languages']:
        if lang not in valid_languages:
            return False, f"Invalid language: {lang}. Must be one of: {valid_languages}"
    
    return True, ""
