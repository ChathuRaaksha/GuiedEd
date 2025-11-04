# Quick Start Guide

Get your CV Analysis API with Temporal workflow up and running in minutes!

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

This will install:
- Flask (API framework)
- Temporal Python SDK
- OpenAI client (for OpenRouter)
- Other dependencies

### Step 2: Start Temporal Server

Open a **new terminal** and run:

```bash
docker run -p 7233:7233 -p 8233:8233 temporalio/auto-setup:latest
```

This starts:
- Temporal server on port 7233
- Temporal UI on port 8233

**Keep this terminal running!**

> 💡 If you don't have Docker, install it from https://www.docker.com/

### Step 3: Start Temporal Worker

Open a **new terminal** and run:

```bash
cd backend
python temporal_worker.py
```

You should see:
```
Configuration validated successfully
Connecting to Temporal at localhost:7233
Successfully connected to Temporal server
Starting worker on task queue: cv-analysis-queue
Worker started successfully. Press Ctrl+C to stop.
```

**Keep this terminal running!**

### Step 4: Start Flask API

Open a **new terminal** and run:

```bash
cd backend
python app.py
```

You should see:
```
Configuration validated successfully
Starting Flask server on port 5000
 * Running on http://0.0.0.0:5000
```

**Keep this terminal running!**

### Step 5: Test the API

Open a **fourth terminal** and run the test script:

```bash
cd backend
python test_api.py
```

Press Enter when prompted, and watch the tests run!

## 📊 Summary

You should now have **4 terminals running**:

1. **Temporal Server** (Docker)
2. **Temporal Worker** (Python)
3. **Flask API** (Python)
4. **Test Script** (Python) - runs once then exits

## 🎯 Quick Test with curl

```bash
# Test health
curl http://localhost:5000/health

# Test CV analysis
curl -X POST http://localhost:5000/api/analyze-cv \
  -H "Content-Type: application/json" \
  -d '{
    "cv_text": "Software engineer with expertise in blockchain and cryptocurrency. Loves gaming and technology."
  }'
```

## 🌐 Access Temporal UI

Open your browser and visit:
```
http://localhost:8233
```

Here you can:
- See all workflow executions
- View execution history
- Debug any issues
- Monitor system health

## 📝 API Endpoints

### 1. Health Check
```
GET http://localhost:5000/health
```

### 2. Analyze CV (Main endpoint)
```
POST http://localhost:5000/api/analyze-cv
Content-Type: application/json

{
  "cv_text": "Your CV text here..."
}
```

Returns:
```json
{
  "success": true,
  "interests": ["Technology", "Gaming", "Cryptocurrency"],
  "workflow_id": "cv-analysis-123..."
}
```

### 3. Get Available Interests
```
GET http://localhost:5000/api/interests
```

## 🔧 Troubleshooting

### Port Already in Use
If you see "port already in use" errors:

```bash
# Check what's using port 5000
lsof -i :5000

# Kill the process if needed
kill -9 <PID>
```

### Temporal Connection Failed
Make sure Docker container is running:

```bash
docker ps
```

You should see a container named `temporalio/auto-setup`.

### Module Not Found
Reinstall dependencies:

```bash
pip install -r requirements.txt --force-reinstall
```

### OpenRouter API Errors
Check your API key in `.env` file and ensure you have credits on OpenRouter.

## 🎉 Success!

If all tests pass, your CV Analysis API is ready!

You can now:
1. Integrate it with your frontend
2. Send CV text and get interest recommendations
3. Monitor workflows in Temporal UI
4. Scale with Temporal's distributed architecture

## 📚 Next Steps

- Read [README.md](README.md) for detailed documentation
- Explore Temporal UI at http://localhost:8233
- Customize the LLM model in `config.py`
- Add more interests to `data/interests.csv`

## 💡 Tips

- **Keep all 3 processes running** (Temporal, Worker, API)
- **Check logs** if something doesn't work
- **Use Temporal UI** to debug workflow issues
- **Test with various CV texts** to see different results

## 🆘 Need Help?

1. Check logs in each terminal
2. Visit Temporal UI (http://localhost:8233)
3. Review README.md for detailed docs
4. Ensure all prerequisites are installed
