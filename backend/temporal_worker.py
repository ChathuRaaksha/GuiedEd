import asyncio
import logging
from temporalio.client import Client
from temporalio.worker import Worker
from config import Config
from workflows import CVAnalysisWorkflow, MatchingWorkflow
from activities import (
    analyze_cv_with_llm,
    geocode_postcodes,
    calculate_mentor_matches,
    validate_matching_data
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def main():
    """
    Start the Temporal worker that will execute workflows and activities.
    """
    try:
        # Validate configuration
        Config.validate()
        logger.info("Configuration validated successfully")
        
        # Connect to Temporal server
        logger.info(f"Connecting to Temporal at {Config.TEMPORAL_HOST}")
        client = await Client.connect(
            Config.TEMPORAL_HOST,
            namespace=Config.TEMPORAL_NAMESPACE
        )
        logger.info("Successfully connected to Temporal server")
        
        # Create and run worker
        logger.info(f"Starting worker on task queue: {Config.TEMPORAL_TASK_QUEUE}")
        worker = Worker(
            client,
            task_queue=Config.TEMPORAL_TASK_QUEUE,
            workflows=[CVAnalysisWorkflow, MatchingWorkflow],
            activities=[
                analyze_cv_with_llm,
                geocode_postcodes,
                calculate_mentor_matches,
                validate_matching_data
            ],
        )
        
        logger.info("Worker started successfully. Press Ctrl+C to stop.")
        await worker.run()
        
    except KeyboardInterrupt:
        logger.info("Worker stopped by user")
    except Exception as e:
        logger.error(f"Worker failed to start: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(main())
