from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
import asyncio
import logging
from datetime import datetime, timedelta
from temporalio.client import Client
from config import Config
from workflows import CVAnalysisWorkflow, MatchingWorkflow
from email_service import EmailService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Store Temporal client globally
temporal_client = None

async def get_temporal_client():
    """Get or create Temporal client"""
    global temporal_client
    if temporal_client is None:
        temporal_client = await Client.connect(
            Config.TEMPORAL_HOST,
            namespace=Config.TEMPORAL_NAMESPACE
        )
    return temporal_client

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "CV Analysis API"
    }), 200

@app.route('/api/analyze-cv', methods=['POST'])
def analyze_cv():
    """
    Analyze CV text and return matching interests.
    
    Request body:
    {
        "cv_text": "The CV content as text..."
    }
    
    Response:
    {
        "success": true,
        "interests": ["Interest1", "Interest2", ...],
        "workflow_id": "workflow-xxx"
    }
    """
    try:
        # Validate request
        if not request.is_json:
            return jsonify({
                "success": False,
                "error": "Content-Type must be application/json"
            }), 400
        
        data = request.get_json()
        
        if 'cv_text' not in data:
            return jsonify({
                "success": False,
                "error": "Missing required field: cv_text"
            }), 400
        
        cv_text = data['cv_text'].strip()
        
        if not cv_text:
            return jsonify({
                "success": False,
                "error": "cv_text cannot be empty"
            }), 400
        
        logger.info(f"Received CV analysis request (text length: {len(cv_text)})")
        
        # Execute Temporal workflow synchronously
        result = asyncio.run(execute_workflow(cv_text))
        
        if result['success']:
            logger.info(f"Successfully analyzed CV, found {len(result['interests'])} interests")
            return jsonify({
                "success": True,
                "interests": result['interests'],
                "workflow_id": result.get('workflow_id')
            }), 200
        else:
            logger.error(f"Workflow execution failed: {result.get('error')}")
            return jsonify({
                "success": False,
                "error": result.get('error', 'Unknown error occurred'),
                "interests": []
            }), 500
            
    except Exception as e:
        logger.error(f"Error in analyze_cv endpoint: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e),
            "interests": []
        }), 500

async def execute_workflow(cv_text: str) -> dict:
    """
    Execute the Temporal workflow and wait for result.
    
    Args:
        cv_text: The CV text to analyze
        
    Returns:
        Dictionary with workflow execution result
    """
    try:
        # Get Temporal client
        client = await get_temporal_client()
        
        # Generate unique workflow ID
        import uuid
        workflow_id = f"cv-analysis-{uuid.uuid4()}"
        
        logger.info(f"Starting workflow {workflow_id}")
        
        # Execute workflow and wait for result
        result = await client.execute_workflow(
            CVAnalysisWorkflow.run,
            cv_text,
            id=workflow_id,
            task_queue=Config.TEMPORAL_TASK_QUEUE,
        )
        
        logger.info(f"Workflow {workflow_id} completed")
        
        return {
            **result,
            "workflow_id": workflow_id
        }
        
    except Exception as e:
        logger.error(f"Error executing workflow: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "interests": []
        }

@app.route('/api/matching', methods=['POST'])
def match_mentors():
    """
    Match a student with mentors based on various criteria.
    
    Request body:
    {
        "student": {
            "education_level": "University",
            "postcode": "11122",
            "city": "Stockholm", 
            "interests": ["Technology", "Gaming"],
            "languages": ["Swedish", "English"],
            "meeting_preference": "Both"
        },
        "mentors": [
            {
                "id": "mentor-123",
                "education_level": "University",
                "postcode": "11123", 
                "city": "Stockholm",
                "interests": ["Technology", "Business & Finance"],
                "languages": ["Swedish", "English"],
                "meeting_preference": "In person"
            }
        ]
    }
    
    Response:
    {
        "suggest": [
            {"mentor_id": "mentor-123", "score": 85},
            {"mentor_id": "mentor-456", "score": 72}
        ]
    }
    """
    try:
        # Validate request
        if not request.is_json:
            return jsonify({
                "success": False,
                "error": "Content-Type must be application/json"
            }), 400
        
        data = request.get_json()
        
        # Basic structure validation
        if 'student' not in data:
            return jsonify({
                "success": False,
                "error": "Missing required field: student"
            }), 400
        
        if 'mentors' not in data:
            return jsonify({
                "success": False,
                "error": "Missing required field: mentors"
            }), 400
        
        if not isinstance(data['mentors'], list) or len(data['mentors']) == 0:
            return jsonify({
                "success": False,
                "error": "mentors must be a non-empty list"
            }), 400
        
        logger.info(f"Received matching request for student against {len(data['mentors'])} mentors")
        
        # Execute Temporal workflow synchronously
        result = asyncio.run(execute_matching_workflow(data))
        
        if result['success']:
            logger.info(f"Successfully matched student, found {len(result['suggest'])} matches")
            return jsonify({
                "suggest": result['suggest']
            }), 200
        else:
            logger.error(f"Matching workflow execution failed: {result.get('error')}")
            return jsonify({
                "success": False,
                "error": result.get('error', 'Unknown error occurred'),
                "suggest": []
            }), 500
            
    except Exception as e:
        logger.error(f"Error in match_mentors endpoint: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e),
            "suggest": []
        }), 500


async def execute_matching_workflow(matching_data: dict) -> dict:
    """
    Execute the Temporal matching workflow and wait for result.
    
    Args:
        matching_data: The matching request data
        
    Returns:
        Dictionary with workflow execution result
    """
    try:
        # Get Temporal client
        client = await get_temporal_client()
        
        # Generate unique workflow ID
        import uuid
        workflow_id = f"matching-{uuid.uuid4()}"
        
        logger.info(f"Starting matching workflow {workflow_id}")
        
        # Execute workflow and wait for result
        result = await client.execute_workflow(
            MatchingWorkflow.run,
            matching_data,
            id=workflow_id,
            task_queue=Config.TEMPORAL_TASK_QUEUE,
        )
        
        logger.info(f"Matching workflow {workflow_id} completed")
        
        return {
            **result,
            "workflow_id": workflow_id
        }
        
    except Exception as e:
        logger.error(f"Error executing matching workflow: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "suggest": []
        }


@app.route('/api/interests', methods=['GET'])
def get_interests():
    """
    Get the list of all available interests.

    Response:
    {
        "interests": ["Interest1", "Interest2", ...]
    }
    """
    try:
        import csv
        interests = []
        with open(Config.INTERESTS_CSV_PATH, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                interests.append(row['interest'])

        return jsonify({
            "interests": interests
        }), 200

    except Exception as e:
        logger.error(f"Error loading interests: {str(e)}")
        return jsonify({
            "error": str(e)
        }), 500


@app.route('/api/match-with-mocks', methods=['POST'])
def match_with_mocks():
    """
    Match a student with mock mentors using the backend matching algorithm.
    Uses mock data to bypass database, perfect for testing frontend integration.

    Request body:
    {
        "student": {
            "firstName": "John",
            "lastName": "Doe",
            "education_level": "university" or "high_school" or "middle_school",
            "city": "Stockholm",
            "postcode": "11122",
            "interests": ["Technology", "Gaming"],
            "languages": ["Swedish", "English"],
            "subjects": ["Mathematics", "Science"],
            "talkAboutYourself": "I like to listen to Taylor Swift songs...",
            "goals": "I want to learn software engineering",
            "meetingPref": "online" or "in_person" or "either"
        }
    }

    Response:
    {
        "success": true,
        "matches": [
            {
                "mentor_id": "mentor-1",
                "score": 85,
                "mentor": {...mentor details...}
            }
        ]
    }
    """
    try:
        from mock_mentors import get_mock_mentors

        # Validate request
        if not request.is_json:
            return jsonify({
                "success": False,
                "error": "Content-Type must be application/json"
            }), 400

        data = request.get_json()

        if 'student' not in data:
            return jsonify({
                "success": False,
                "error": "Missing required field: student"
            }), 400

        student_data = data['student']

        # Transform frontend format to backend format
        def normalize_interests(interests):
            """Remove emojis from interests"""
            import re
            return [re.sub(r'[\U0001F300-\U0001F9FF]|[\u2600-\u26FF]|[\u2700-\u27BF]', '', interest).strip()
                    for interest in interests]

        # Normalize education level
        education_map = {
            'middle_school': 'Middle school',
            'high_school': 'High school',
            'university': 'University'
        }

        # Normalize meeting preference
        meeting_map = {
            'online': 'Online',
            'in_person': 'In person',
            'either': 'Both'
        }

        backend_student = {
            "education_level": education_map.get(student_data.get('educationLevel', '').lower(),
                                                  student_data.get('educationLevel', 'University')),
            "postcode": student_data.get('postcode', '11122'),
            "city": student_data.get('city', 'Stockholm'),
            "interests": normalize_interests(student_data.get('interests', [])),
            "languages": student_data.get('languages', []),
            "meeting_preference": meeting_map.get(student_data.get('meetingPref', '').lower(), 'Both'),
            "bio": student_data.get('talkAboutYourself', ''),
            "goals": student_data.get('goals', ''),
            "subjects": normalize_interests(student_data.get('subjects', []))
        }

        logger.info(f"Received match request from frontend: {backend_student.get('education_level')}, Interests: {backend_student.get('interests')}")

        # Get mock mentors
        mock_mentors = get_mock_mentors()

        # Execute matching workflow
        matching_request = {
            "student": backend_student,
            "mentors": mock_mentors
        }

        result = asyncio.run(execute_matching_workflow(matching_request))

        if result['success']:
            # Enhance matches with full mentor details
            matches_with_details = []
            for match in result['suggest']:
                mentor_id = match['mentor_id']
                mentor = next((m for m in mock_mentors if m['id'] == mentor_id), None)
                if mentor:
                    matches_with_details.append({
                        **match,
                        "mentor": mentor
                    })

            logger.info(f"Successfully matched student, found {len(matches_with_details)} matches")
            return jsonify({
                "success": True,
                "matches": matches_with_details
            }), 200
        else:
            logger.error(f"Matching workflow execution failed: {result.get('error')}")
            return jsonify({
                "success": False,
                "error": result.get('error', 'Unknown error occurred'),
                "matches": []
            }), 500

    except Exception as e:
        logger.error(f"Error in match_with_mocks endpoint: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e),
            "matches": []
        }), 500


# Initialize email service
email_service = EmailService(Config.SMTP_USER, Config.SMTP_PASSWORD)


@app.route('/api/send-invite-email', methods=['POST'])
def send_invite_email():
    """
    Send invitation email to mentor.
    
    Request body:
    {
        "invite_id": "uuid",
        "student_id": "uuid", 
        "mentor_id": "uuid",
        "match_score": 85,
        "reasons": ["reason1", "reason2"]
    }
    """
    try:
        if not request.is_json:
            return jsonify({"success": False, "error": "Content-Type must be application/json"}), 400
        
        data = request.get_json()
        
        # Validate required fields
        required = ['invite_id', 'student_id', 'mentor_id', 'match_score', 'reasons']
        for field in required:
            if field not in data:
                return jsonify({"success": False, "error": f"Missing required field: {field}"}), 400
        
        # This would fetch from database in production
        # For now, mock data structure is expected from frontend
        invite_id = data['invite_id']
        student_data = data.get('student_data', {})
        mentor_data = data.get('mentor_data', {})
        match_score = data['match_score']
        reasons = data['reasons']
        
        # Generate unique token
        token = email_service.generate_token()
        token_expires = datetime.now() + timedelta(days=30)
        
        # Create accept/reject URLs
        accept_url = f"{Config.BACKEND_URL}/api/invite/accept/{token}"
        reject_url = f"{Config.BACKEND_URL}/api/invite/reject/{token}"
        
        # Send email
        success = email_service.send_invite_email(
            mentor_email=mentor_data.get('email'),
            mentor_name=f"{mentor_data.get('first_name')} {mentor_data.get('last_name')}",
            student_data=student_data,
            match_score=match_score,
            reasons=reasons,
            accept_url=accept_url,
            reject_url=reject_url
        )
        
        if success:
            logger.info(f"Invite email sent successfully for invite {invite_id}")
            return jsonify({
                "success": True,
                "token": token,
                "expires_at": token_expires.isoformat()
            }), 200
        else:
            return jsonify({"success": False, "error": "Failed to send email"}), 500
            
    except Exception as e:
        logger.error(f"Error in send_invite_email: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/invite/accept/<token>', methods=['GET'])
def accept_invite(token: str):
    """Handle mentor accepting an invite via email link"""
    try:
        # In production, this would:
        # 1. Validate token from database
        # 2. Check expiration
        # 3. Update invite status
        # 4. Send notification to student
        # 5. Redirect to confirmation page
        
        logger.info(f"Invite accepted via token: {token}")
        
        # For now, return success page HTML
        return '''
        <!DOCTYPE html>
        <html>
        <head>
            <title>Match Accepted</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    margin: 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }
                .card {
                    background: white;
                    padding: 40px;
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                    text-align: center;
                    max-width: 500px;
                }
                h1 { color: #10b981; margin: 0 0 20px 0; }
                p { color: #4b5563; line-height: 1.6; }
                .emoji { font-size: 48px; margin-bottom: 20px; }
                a {
                    display: inline-block;
                    margin-top: 20px;
                    padding: 12px 24px;
                    background: #667eea;
                    color: white;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 600;
                }
            </style>
        </head>
        <body>
            <div class="card">
                <div class="emoji">🎉</div>
                <h1>Match Accepted!</h1>
                <p>Thank you for accepting this mentorship match. The student has been notified and will reach out to you soon to schedule your first meeting.</p>
                <a href="http://localhost:8080">Go to Platform</a>
            </div>
        </body>
        </html>
        ''', 200
        
    except Exception as e:
        logger.error(f"Error accepting invite: {str(e)}")
        return f"Error: {str(e)}", 500


@app.route('/api/invite/reject/<token>', methods=['GET'])
def reject_invite(token: str):
    """Handle mentor declining an invite via email link"""
    try:
        # In production, this would:
        # 1. Validate token from database
        # 2. Check expiration
        # 3. Update invite status to rejected
        # 4. Send notification to student
        # 5. Redirect to confirmation page
        
        logger.info(f"Invite rejected via token: {token}")
        
        # For now, return confirmation page HTML
        return '''
        <!DOCTYPE html>
        <html>
        <head>
            <title>Match Declined</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    margin: 0;
                    background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
                }
                .card {
                    background: white;
                    padding: 40px;
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                    text-align: center;
                    max-width: 500px;
                }
                h1 { color: #6b7280; margin: 0 0 20px 0; }
                p { color: #4b5563; line-height: 1.6; }
                .emoji { font-size: 48px; margin-bottom: 20px; }
                a {
                    display: inline-block;
                    margin-top: 20px;
                    padding: 12px 24px;
                    background: #667eea;
                    color: white;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 600;
                }
            </style>
        </head>
        <body>
            <div class="card">
                <div class="emoji">👋</div>
                <h1>Match Declined</h1>
                <p>We understand. The student has been notified. Thank you for your time, and we hope to match you with another student in the future.</p>
                <a href="http://localhost:8080">Go to Platform</a>
            </div>
        </body>
        </html>
        ''', 200
        
    except Exception as e:
        logger.error(f"Error rejecting invite: {str(e)}")
        return f"Error: {str(e)}", 500


if __name__ == '__main__':
    try:
        # Validate configuration
        Config.validate()
        logger.info("Configuration validated successfully")
        logger.info(f"Starting Flask server on port {Config.FLASK_PORT}")
        
        # Run Flask app
        app.run(
            host='0.0.0.0',
            port=Config.FLASK_PORT,
            debug=True
        )
        
    except Exception as e:
        logger.error(f"Failed to start Flask server: {str(e)}")
        raise
