# CV Analysis Backend with Temporal Workflow

This backend system uses Temporal workflows to analyze CV text and recommend matching interests using an LLM (via OpenRouter).

## Architecture

- **Flask API**: REST API endpoint for CV analysis
- **Temporal Workflow**: Orchestrates the CV analysis process
- **LLM Integration**: Uses OpenRouter (Google Gemini 2.0 Flash) to analyze CV text
- **Interest Matching**: Matches CV content against predefined interests from CSV

## Prerequisites

1. **Python 3.8+**
2. **Temporal Server** (running locally)
3. **Docker** (for running Temporal)

## Setup Instructions

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Start Temporal Server

You need to have Temporal server running. The easiest way is using Docker:

```bash
docker run -p 7233:7233 temporalio/auto-setup:latest
```

This will start Temporal on `localhost:7233`.

Alternatively, you can use Temporal CLI:
```bash
brew install temporal
temporal server start-dev
```

### 3. Configure Environment Variables

The `.env` file is already configured with:
- OpenRouter API key
- Temporal connection settings
- Flask port

You can modify these if needed.

## Running the System

You need to run **TWO processes** simultaneously:

### Terminal 1: Start the Temporal Worker

```bash
cd backend
python temporal_worker.py
```

You should see:
```
Worker started successfully. Press Ctrl+C to stop.
```

### Terminal 2: Start the Flask API

```bash
cd backend
python app.py
```

You should see:
```
Starting Flask server on port 5000
* Running on http://0.0.0.0:5000
```

## API Endpoints

### 1. Health Check
```bash
GET http://localhost:5000/health
```

Response:
```json
{
  "status": "healthy",
  "service": "CV Analysis API"
}
```

### 2. Analyze CV
```bash
POST http://localhost:5000/api/analyze-cv
Content-Type: application/json

{
  "cv_text": "Experienced software engineer with 5 years in blockchain development. Passionate about cryptocurrency trading and decentralized applications. Active gamer and tech enthusiast."
}
```

Response:
```json
{
  "success": true,
  "interests": ["Technology", "Cryptocurrency", "Gaming", "Business & Finance"],
  "workflow_id": "cv-analysis-abc123..."
}
```

### 3. Get Available Interests
```bash
GET http://localhost:5000/api/interests
```

Response:
```json
{
  "interests": ["News", "Sports", "Music", "Dance", "Celebrity", ...]
}
```

## Testing with curl

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test CV analysis
curl -X POST http://localhost:5000/api/analyze-cv \
  -H "Content-Type: application/json" \
  -d '{
    "cv_text": "Software engineer specializing in AI and machine learning. Love reading tech news and playing video games in my free time."
  }'

# Get all interests
curl http://localhost:5000/api/interests
```

## Project Structure

```
backend/
├── app.py                 # Flask API server
├── workflows.py           # Temporal workflow definitions
├── activities.py          # Temporal activities (LLM calls)
├── temporal_worker.py     # Temporal worker process
├── config.py              # Configuration management
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables
├── README.md              # This file
└── data/
    └── interests.csv      # Predefined interests list
```

## How It Works

1. **Client sends CV text** → Flask API (`POST /api/analyze-cv`)
2. **Flask triggers Temporal workflow** → `CVAnalysisWorkflow`
3. **Workflow executes activity** → `analyze_cv_with_llm`
4. **Activity calls OpenRouter LLM** → Analyzes CV against interests
5. **Returns matched interests** → Back through workflow to API
6. **API responds to client** → JSON with interests list

## Temporal Features Used

- **Workflows**: Durable execution with state persistence
- **Activities**: Stateless functions with automatic retries
- **Retry Policies**: Automatic retry on failures (3 attempts)
- **Timeouts**: 60-second activity timeout
- **Observability**: Full execution history in Temporal UI

## Accessing Temporal UI

Once Temporal server is running, visit:
```
http://localhost:8233
```

Here you can:
- View workflow executions
- See activity logs
- Debug failures
- Monitor system health

## Error Handling

- **Invalid input**: Returns 400 with error message
- **LLM failures**: Automatic retries (up to 3 attempts)
- **Workflow failures**: Returns 500 with error details
- **JSON parsing errors**: Fallback text extraction

## Troubleshooting

### "Connection refused" error
- Make sure Temporal server is running on `localhost:7233`
- Check Docker container status: `docker ps`

### "Worker not processing workflows"
- Ensure worker is running: `python temporal_worker.py`
- Check task queue name matches in config

### "OpenRouter API error"
- Verify API key in `.env` file
- Check OpenRouter account has credits

### "Module not found" errors
- Install dependencies: `pip install -r requirements.txt`
- Ensure Python 3.8+ is being used

## Next Steps

To integrate with frontend:
1. Frontend sends CV text to `POST /api/analyze-cv`
2. Receives list of matching interests
3. Can display/use interests for user profile

## Notes

- The system waits for workflow completion (synchronous)
- Each analysis is tracked with a unique workflow ID
- All executions are logged and visible in Temporal UI
- LLM model can be changed in `config.py`
