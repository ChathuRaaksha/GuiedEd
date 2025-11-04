import csv
import json
from temporalio import activity
from openai import OpenAI
from config import Config

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
