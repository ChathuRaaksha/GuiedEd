import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Application configuration"""
    
    # OpenRouter API settings
    OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')
    OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'
    
    # LLM Model - Using Google Gemini 2.0 Flash for fast, cost-effective inference
    LLM_MODEL = 'google/gemini-2.0-flash-exp:free'
    
    # Temporal settings
    TEMPORAL_HOST = os.getenv('TEMPORAL_HOST', 'localhost:7233')
    TEMPORAL_NAMESPACE = os.getenv('TEMPORAL_NAMESPACE', 'default')
    TEMPORAL_TASK_QUEUE = 'cv-analysis-queue'
    
    # Flask settings
    FLASK_PORT = int(os.getenv('FLASK_PORT', 5000))
    
    # Data files
    INTERESTS_CSV_PATH = os.path.join(os.path.dirname(__file__), 'data', 'interests.csv')
    
    @classmethod
    def validate(cls):
        """Validate that required configuration is present"""
        if not cls.OPENROUTER_API_KEY:
            raise ValueError("OPENROUTER_API_KEY environment variable is required")
        return True
