from datetime import timedelta
from temporalio import workflow
from temporalio.common import RetryPolicy

# Import activity
with workflow.unsafe.imports_passed_through():
    from activities import analyze_cv_with_llm

@workflow.defn
class CVAnalysisWorkflow:
    """
    Workflow for analyzing CV text and extracting matching interests.
    
    This workflow orchestrates the CV analysis process by calling the LLM activity
    and handling any errors or retries that may occur.
    """
    
    @workflow.run
    async def run(self, cv_text: str) -> dict:
        """
        Execute the CV analysis workflow.
        
        Args:
            cv_text: The CV text to analyze
            
        Returns:
            Dictionary containing the analysis results:
            {
                "success": bool,
                "interests": list[str],
                "error": str (optional)
            }
        """
        workflow.logger.info(f"Starting CV Analysis Workflow for text length: {len(cv_text)}")
        
        try:
            # Execute the LLM analysis activity with retry policy
            interests = await workflow.execute_activity(
                analyze_cv_with_llm,
                cv_text,
                start_to_close_timeout=timedelta(seconds=60),
                retry_policy=RetryPolicy(
                    initial_interval=timedelta(seconds=1),
                    maximum_interval=timedelta(seconds=10),
                    maximum_attempts=3,
                    backoff_coefficient=2.0,
                )
            )
            
            workflow.logger.info(f"Workflow completed successfully with {len(interests)} interests")
            
            return {
                "success": True,
                "interests": interests
            }
            
        except Exception as e:
            workflow.logger.error(f"Workflow failed with error: {str(e)}")
            
            return {
                "success": False,
                "interests": [],
                "error": str(e)
            }
