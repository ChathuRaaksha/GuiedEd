from datetime import timedelta
from typing import Dict, List, Any
from temporalio import workflow
from temporalio.common import RetryPolicy

# Import activities
with workflow.unsafe.imports_passed_through():
    from activities import (
        analyze_cv_with_llm,
        geocode_postcodes, 
        calculate_mentor_matches,
        validate_matching_data
    )

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


@workflow.defn
class MatchingWorkflow:
    """
    Workflow for matching students with mentors.
    
    This workflow orchestrates the matching process by:
    1. Validating input data
    2. Geocoding postcodes to coordinates
    3. Running the matching algorithm
    4. Returning scored matches
    """
    
    @workflow.run
    async def run(self, matching_request: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the matching workflow.
        
        Args:
            matching_request: Dictionary containing student and mentors data
            
        Returns:
            Dictionary containing the matching results:
            {
                "success": bool,
                "suggest": [{"mentor_id": str, "score": int}, ...],
                "error": str (optional)
            }
        """
        workflow.logger.info("Starting Matching Workflow")
        
        try:
            # Step 1: Validate input data
            await workflow.execute_activity(
                validate_matching_data,
                matching_request,
                start_to_close_timeout=timedelta(seconds=10),
                retry_policy=RetryPolicy(
                    initial_interval=timedelta(seconds=1),
                    maximum_interval=timedelta(seconds=5),
                    maximum_attempts=2,
                    backoff_coefficient=2.0,
                )
            )
            
            workflow.logger.info("Input data validation passed")
            
            # Step 2: Prepare postcodes for geocoding
            student = matching_request['student']
            mentors = matching_request['mentors']
            
            postcodes = {'student': student['postcode']}
            for mentor in mentors:
                postcodes[mentor['id']] = mentor['postcode']
            
            workflow.logger.info(f"Preparing to geocode {len(postcodes)} postcodes")
            
            # Step 3: Geocode postcodes to coordinates
            coordinates = await workflow.execute_activity(
                geocode_postcodes,
                postcodes,
                start_to_close_timeout=timedelta(seconds=120),  # Longer timeout for API calls
                retry_policy=RetryPolicy(
                    initial_interval=timedelta(seconds=2),
                    maximum_interval=timedelta(seconds=10),
                    maximum_attempts=3,
                    backoff_coefficient=2.0,
                )
            )
            
            workflow.logger.info(f"Geocoded {len(coordinates)} postcodes successfully")
            
            # Step 4: Calculate matching scores (includes LLM reasoning generation)
            matches = await workflow.execute_activity(
                calculate_mentor_matches,
                args=(student, mentors, coordinates),
                start_to_close_timeout=timedelta(seconds=300),  # 5 minutes for multiple LLM calls
                retry_policy=RetryPolicy(
                    initial_interval=timedelta(seconds=2),
                    maximum_interval=timedelta(seconds=10),
                    maximum_attempts=2,
                    backoff_coefficient=2.0,
                )
            )
            
            workflow.logger.info(f"Matching workflow completed successfully with {len(matches)} matches")
            
            return {
                "success": True,
                "suggest": matches
            }
            
        except Exception as e:
            workflow.logger.error(f"Matching workflow failed with error: {str(e)}")
            
            return {
                "success": False,
                "suggest": [],
                "error": str(e)
            }
