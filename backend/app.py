from flask import Flask, request, jsonify
from flask_cors import CORS
import asyncio
import logging
from temporalio.client import Client
from config import Config
from workflows import CVAnalysisWorkflow

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
