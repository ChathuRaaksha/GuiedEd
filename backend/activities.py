import csv
import json
from typing import Dict, List, Tuple, Any
from temporalio import activity
from openai import OpenAI
from config import Config
from geocoding import GeocodingService, get_fallback_coordinates
from matching import MatchingScorer, validate_matching_input

def load_interests():
    """Load interests from CSV file"""
    interests = []
    with open(Config.INTERESTS_CSV_PATH, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            interests.append(row['interest'])
    return interests

@activity.defn
async def analyze_cv_with_llm(cv_text: str) -> list[str]:
    """
    Analyze CV text using LLM and match against predefined interests.
    
    Args:
        cv_text: The CV text to analyze
        
    Returns:
        List of matching interests from the predefined list
    """
    activity.logger.info(f"Starting CV analysis with LLM for text length: {len(cv_text)}")
    
    try:
        # Load interests list
        interests = load_interests()
        activity.logger.info(f"Loaded {len(interests)} interests from CSV")
        
        # Initialize OpenAI client with OpenRouter
        client = OpenAI(
            base_url=Config.OPENROUTER_BASE_URL,
            api_key=Config.OPENROUTER_API_KEY
        )
        
        # Prepare the prompt
        prompt = f"""You are an expert at analyzing CVs and identifying people's interests based on their professional background, skills, and experience.

Given the following CV text, identify which interests from the predefined list below are most relevant to this person. Consider their:
- Professional experience and career path
- Skills and technologies mentioned
- Projects and achievements
- Education and certifications
- Any hobbies or personal interests mentioned

Only select interests that have clear evidence in the CV. Return between 3-8 interests that best match.

PREDEFINED INTERESTS LIST:
{', '.join(interests)}

CV TEXT:
{cv_text}

Respond with ONLY a JSON array of the matching interest names from the list above. Example format:
["Technology", "Business & Finance", "Gaming"]

Do not include any explanation, just the JSON array."""

        # Make API call to OpenRouter
        activity.logger.info(f"Calling OpenRouter API with model: {Config.LLM_MODEL}")
        
        response = client.chat.completions.create(
            model=Config.LLM_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,  # Lower temperature for more consistent results
            max_tokens=500
        )
        
        # Extract the response
        result_text = response.choices[0].message.content.strip()
        activity.logger.info(f"Received response from LLM: {result_text}")
        
        # Parse JSON response
        try:
            matched_interests = json.loads(result_text)
            
            # Validate that returned interests are in our predefined list
            valid_interests = [
                interest for interest in matched_interests 
                if interest in interests
            ]
            
            activity.logger.info(f"Successfully matched {len(valid_interests)} interests: {valid_interests}")
            return valid_interests
            
        except json.JSONDecodeError as e:
            activity.logger.error(f"Failed to parse LLM response as JSON: {e}")
            activity.logger.error(f"Raw response: {result_text}")
            
            # Fallback: try to extract interests manually
            matched = []
            for interest in interests:
                if interest.lower() in result_text.lower():
                    matched.append(interest)
            
            if matched:
                activity.logger.info(f"Fallback extraction found {len(matched)} interests: {matched}")
                return matched
            else:
                raise Exception("Could not parse LLM response and no interests found in text")
                
    except Exception as e:
        activity.logger.error(f"Error in analyze_cv_with_llm: {str(e)}")
        raise


@activity.defn
async def geocode_postcodes(postcodes: Dict[str, str]) -> Dict[str, Tuple[float, float]]:
    """
    Geocode multiple postcodes to lat/lng coordinates.
    
    Args:
        postcodes: Dict mapping person_id -> postcode
        
    Returns:
        Dict mapping person_id -> (lat, lng) for successfully geocoded postcodes
    """
    activity.logger.info(f"Starting geocoding for {len(postcodes)} postcodes")
    
    try:
        geocoding_service = GeocodingService()
        results = geocoding_service.geocode_postcodes(postcodes)
        
        # Apply fallbacks for failed lookups
        for person_id, postcode in postcodes.items():
            if person_id not in results:
                fallback_coords = get_fallback_coordinates(postcode)
                if fallback_coords:
                    results[person_id] = fallback_coords
                    activity.logger.info(f"Applied fallback coordinates for {person_id} ({postcode}): {fallback_coords}")
        
        activity.logger.info(f"Geocoding completed: {len(results)} out of {len(postcodes)} postcodes resolved")
        return results
        
    except Exception as e:
        activity.logger.error(f"Error in geocode_postcodes: {str(e)}")
        raise


@activity.defn
async def calculate_mentor_matches(
    student: Dict[str, Any],
    mentors: List[Dict[str, Any]],
    coordinates: Dict[str, Tuple[float, float]]
) -> List[Dict[str, Any]]:
    """
    Calculate matching scores between a student and mentors.

    Args:
        student: Student profile dictionary
        mentors: List of mentor profile dictionaries
        coordinates: Dict mapping person_id -> (lat, lng)

    Returns:
        List of matches with mentor_id, score, and reasoning, sorted by score descending
    """
    activity.logger.info(f"Calculating matches for student against {len(mentors)} mentors")

    try:
        scorer = MatchingScorer()
        matches = scorer.calculate_matches(student, mentors, coordinates)

        activity.logger.info(f"Generated {len(matches)} matches with scores > 0")

        # Generate unique reasoning for TOP 10 matches only (to avoid timeouts)
        top_matches = matches[:10]
        activity.logger.info(f"Generating personalized reasoning for top {len(top_matches)} matches...")

        for match in top_matches:
            # Find the mentor details
            mentor = next((m for m in mentors if m['id'] == match['mentor_id']), None)
            if mentor:
                try:
                    # Generate personalized reasoning using LLM
                    reasoning = await generate_match_reasoning(student, mentor, match['score'], activity.logger)
                    match['reasoning'] = reasoning
                except Exception as e:
                    activity.logger.error(f"Error generating reasoning for {mentor.get('id')}: {str(e)}")
                    # Fallback to generic reasoning if LLM fails
                    match['reasoning'] = f"{match['score']}% match based on compatible interests and goals."
            else:
                match['reasoning'] = "Good compatibility match."

        # Add generic reasoning for remaining matches
        for match in matches[10:]:
            match['reasoning'] = f"{match['score']}% compatibility based on shared interests and goals."

        activity.logger.info(f"Generated personalized reasoning for {len(top_matches)} matches, generic for {len(matches) - len(top_matches)}")
        return matches

    except Exception as e:
        activity.logger.error(f"Error in calculate_mentor_matches: {str(e)}")
        raise


@activity.defn
async def validate_matching_data(data: Dict[str, Any]) -> bool:
    """
    Validate the matching request data.
    
    Args:
        data: The matching request data
        
    Returns:
        True if valid
        
    Raises:
        ValueError: If validation fails
    """
    activity.logger.info("Validating matching request data")
    
    try:
        is_valid, error_message = validate_matching_input(data)
        
        if not is_valid:
            activity.logger.error(f"Validation failed: {error_message}")
            raise ValueError(error_message)
        
        activity.logger.info("Matching data validation successful")
        return True
        
    except Exception as e:
        activity.logger.error(f"Error in validate_matching_data: {str(e)}")
        raise


async def generate_match_reasoning(
    student: Dict[str, Any],
    mentor: Dict[str, Any],
    score: int,
    logger=None
) -> str:
    """
    Use LLM to generate personalized reasoning for why a mentor matches a student.
    Helper function (not an activity) that can be called from within activities.

    Args:
        student: Student profile dictionary
        mentor: Mentor profile dictionary
        score: Match score
        logger: Optional logger instance

    Returns:
        A 1-2 sentence natural language explanation of the match
    """
    if logger:
        logger.info(f"Generating match reasoning for student-mentor pair (score: {score})")
    else:
        print(f"Generating match reasoning for student-mentor pair (score: {score})")
    
    try:
        # Initialize OpenAI client with OpenRouter
        client = OpenAI(
            base_url=Config.OPENROUTER_BASE_URL,
            api_key=Config.OPENROUTER_API_KEY
        )
        
        # Build student context
        student_context = []
        if student.get('goals'):
            student_context.append(f"Goals: {student['goals']}")
        if student.get('bio'):
            student_context.append(f"About: {student['bio']}")
        if student.get('interests'):
            student_context.append(f"Interests: {', '.join(student['interests'])}")
        if student.get('subjects'):
            student_context.append(f"Favorite subjects: {', '.join(student['subjects'])}")
        
        student_desc = "\n".join(student_context) if student_context else "Student seeking mentorship"
        
        # Build mentor context
        mentor_name = f"{mentor.get('first_name', '')} {mentor.get('last_name', '')}".strip()
        mentor_role = mentor.get('role', 'Professional')
        mentor_bio = mentor.get('bio', '')
        mentor_skills = ', '.join(mentor.get('skills', []))
        mentor_interests = ', '.join(mentor.get('interests', []))
        
        # Create the prompt
        prompt = f"""You are an expert career counselor and mentorship matcher. Generate a compelling, personalized 1-2 sentence explanation for why this mentor is a great match for this student.

STUDENT PROFILE:
{student_desc}

MENTOR PROFILE:
Name: {mentor_name}
Role: {mentor_role}
Bio: {mentor_bio}
Skills: {mentor_skills}
Interests: {mentor_interests}

Match Score: {score}/100

Based on the student's goals, interests, and the mentor's experience, write a natural, engaging 1-2 sentence explanation of why they're compatible. Focus on:
- Shared interests or passions
- How the mentor's expertise aligns with student's goals or curiosity
- Specific connections between what the student wants to learn/explore and what the mentor offers
- Use a warm, encouraging tone

If the student is uncertain about their goals but has interests, emphasize how the mentor can help them explore those interests.

Respond with ONLY the 1-2 sentence explanation, nothing else."""

        # Make API call to OpenRouter
        if logger:
            logger.info(f"Calling OpenRouter API for match reasoning")

        response = client.chat.completions.create(
            model=Config.LLM_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,  # Slightly creative for personalized responses
            max_tokens=150
        )

        # Extract the response
        reasoning = response.choices[0].message.content.strip()
        if logger:
            logger.info(f"Generated reasoning: {reasoning}")

        return reasoning

    except Exception as e:
        if logger:
            logger.error(f"Error in generate_match_reasoning: {str(e)}")
        # Return a fallback message if LLM fails
        mentor_skills = ', '.join(mentor.get('skills', [])[:2])
        return f"Specializes in {mentor_skills if mentor_skills else mentor.get('bio', 'their field')[:50]}."
