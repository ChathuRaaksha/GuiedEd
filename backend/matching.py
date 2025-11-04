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
        'interests': 40,
        'languages': 25, 
        'education': 15,
        'meeting_pref': 10,
        'distance': 10
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
        
        # Interest overlap score (40%)
        interest_score = self._calculate_interest_score(student, mentor)
        total_score += interest_score * (self.WEIGHTS['interests'] / 100)
        
        # Language compatibility score (25%)
        language_score = self._calculate_language_score(student, mentor)
        total_score += language_score * (self.WEIGHTS['languages'] / 100)
        
        # Education level score (15%)
        education_score = self._calculate_education_score(student, mentor)
        total_score += education_score * (self.WEIGHTS['education'] / 100)
        
        # Meeting preference score (10%)
        meeting_score = self._calculate_meeting_score(student, mentor)
        total_score += meeting_score * (self.WEIGHTS['meeting_pref'] / 100)
        
        # Distance score (10%)
        distance_score = self._calculate_distance_score(student_coords, mentor_coords)
        total_score += distance_score * (self.WEIGHTS['distance'] / 100)
        
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
            return 0
        
        overlap = student_interests.intersection(mentor_interests)
        
        if not overlap:
            return 0
        
        # Score based on percentage of student interests covered
        overlap_ratio = len(overlap) / len(student_interests)
        
        # Bonus for many shared interests
        bonus = min(len(overlap) * 5, 20)  # Up to 20 point bonus
        
        base_score = min(overlap_ratio * 80, 80)  # Up to 80 points base
        
        return min(base_score + bonus, 100)
    
    def _calculate_language_score(self, student: Dict[str, Any], mentor: Dict[str, Any]) -> float:
        """Calculate score based on language compatibility (0-100)."""
        
        student_languages = set(student.get('languages', []))
        mentor_languages = set(mentor.get('languages', []))
        
        if not student_languages or not mentor_languages:
            return 0
        
        overlap = student_languages.intersection(mentor_languages)
        
        if not overlap:
            return 0
        
        # Base score for having common languages
        base_score = 60
        
        # Bonus for each additional shared language
        language_bonus = (len(overlap) - 1) * 15
        
        return min(base_score + language_bonus, 100)
    
    def _calculate_education_score(self, student: Dict[str, Any], mentor: Dict[str, Any]) -> float:
        """Calculate score based on education level compatibility (0-100)."""
        
        student_level = student.get('education_level', '').lower()
        mentor_level = mentor.get('education_level', '').lower()
        
        if not student_level or not mentor_level:
            return 0
        
        # Normalize education levels
        education_hierarchy = {
            'middle school': 1,
            'high school': 2, 
            'university': 3
        }
        
        student_rank = education_hierarchy.get(student_level, 0)
        mentor_rank = education_hierarchy.get(mentor_level, 0)
        
        if student_rank == 0 or mentor_rank == 0:
            return 0
        
        # Perfect match
        if student_rank == mentor_rank:
            return 100
        
        # Mentor should ideally be at same or higher level
        if mentor_rank > student_rank:
            # Slight preference for higher-educated mentors
            return 80
        else:
            # Lower penalty for mentors at lower education level
            return 60
    
    def _calculate_meeting_score(self, student: Dict[str, Any], mentor: Dict[str, Any]) -> float:
        """Calculate score based on meeting preference compatibility (0-100)."""
        
        student_pref = student.get('meeting_preference', '').lower()
        mentor_pref = mentor.get('meeting_preference', '').lower()
        
        if not student_pref or not mentor_pref:
            return 0
        
        # Perfect match
        if student_pref == mentor_pref:
            return 100
        
        # "Both" is compatible with everything
        if student_pref == 'both' or mentor_pref == 'both':
            return 90
        
        # Online vs In person - some compatibility
        return 20
    
    def _calculate_distance_score(self, student_coords: Optional[Tuple[float, float]], 
                                mentor_coords: Optional[Tuple[float, float]]) -> float:
        """Calculate score based on geographic proximity (0-100)."""
        
        if not student_coords or not mentor_coords:
            # No location data available - neutral score
            return 50
        
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
