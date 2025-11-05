# GuiedEd - AI-Powered Student-Mentor Matching Platform

A full-stack web application that intelligently connects students with mentors using AI-powered matching algorithms, Temporal workflow orchestration, and real-time collaboration features.

## 🎯 Overview

GuiedEd is an advanced mentorship platform designed to bridge the gap between students seeking guidance and experienced mentors willing to share their expertise. The platform uses sophisticated AI algorithms to analyze student profiles, interests, and goals to match them with the most compatible mentors.

## ✨ Key Features

### 🤖 AI-Powered Matching
- **Intelligent Algorithm**: Multi-criteria scoring system that evaluates interests, languages, education level, location proximity, and career goals
- **LLM Integration**: Uses OpenRouter API with Google Gemini to generate personalized match reasoning
- **Temporal Workflows**: Reliable, fault-tolerant matching process with automatic retries and error handling
- **Real-time Processing**: Async workflow execution for fast, scalable matching

### 👥 User Management
- **Role-Based Access Control (RBAC)**: Four distinct user roles (Student, Mentor, Facilitator, Admin)
- **Supabase Authentication**: Secure email/password authentication with JWT tokens
- **Row-Level Security**: Database-level access control ensuring data privacy
- **Profile Management**: Comprehensive user profiles with skills, interests, and preferences

### 📊 Matching System
- **Smart Scoring**: Weighted scoring across multiple dimensions:
  - Interests alignment (25%)
  - Language compatibility (15%)
  - Bio/goals semantic matching (25%)
  - Subject expertise (15%)
  - Education level compatibility (10%)
  - Meeting preference (5%)
  - Geographic proximity (5%)
- **Top 10 AI Reasoning**: Personalized explanations for why each mentor is a great fit
- **Mock Mentor Database**: 15+ diverse mentor profiles for testing and demonstration

### 💬 Communication Features
- **Invitation System**: Students can send match requests to mentors
- **Email Notifications**: Automated email system for invitations and updates
- **Meeting Scheduler**: Built-in calendar integration for scheduling mentor sessions
- **Status Tracking**: Real-time status updates (proposed, accepted, confirmed, rejected)

### 📈 Workflow Orchestration
- **Temporal Integration**: Production-grade workflow engine for:
  - CV analysis and interest extraction
  - Multi-step matching process
  - Geocoding and distance calculations
  - Reliable retry policies with exponential backoff
- **Activity Separation**: Clean separation of concerns with dedicated activities
- **Monitoring**: Temporal UI for workflow visibility and debugging

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing-fast development
- **TanStack Router** for type-safe routing
- **Shadcn/UI** + **Tailwind CSS** for beautiful, accessible UI components
- **React Query** for efficient data fetching and caching
- **Sonner** for toast notifications

### Backend
- **Flask** (Python) REST API
- **Temporal** workflow orchestration
- **OpenRouter API** for LLM integrations
- **Supabase** for PostgreSQL database and authentication
- **Geocoding Services** for location-based matching

### Database
- **PostgreSQL** (via Supabase)
- **Row-Level Security (RLS)** policies
- Comprehensive schema with:
  - Users and profiles
  - Students, mentors, facilitators
  - Invitations and meetings
  - Interest and subject taxonomies

### Infrastructure
- **Temporal Server** for workflow management
- **Python Virtual Environment** for dependency isolation
- **CORS-enabled** API for secure cross-origin requests
- **Environment-based Configuration** for different deployment stages

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.14+
- Temporal CLI
- Supabase account
- OpenRouter API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/ChathuRaaksha/GuiedEd.git
cd GuiedEd
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Set up backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

4. **Configure environment variables**

Create `.env` in the root directory:
```env
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_public_key
VITE_SUPABASE_URL=your_supabase_url
```

Create `backend/.env`:
```env
OPENROUTER_API_KEY=your_openrouter_key
TEMPORAL_HOST=localhost:7233
TEMPORAL_NAMESPACE=default
FLASK_PORT=5001
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

5. **Start Temporal server**
```bash
temporal server start-dev
```

6. **Start backend services**
```bash
# Terminal 1: Flask API
cd backend
source venv/bin/activate
python app.py

# Terminal 2: Temporal Worker
cd backend
source venv/bin/activate
python temporal_worker.py
```

7. **Start frontend**
```bash
npm run dev
```

8. **Access the application**
- Frontend: http://localhost:8080
- Backend API: http://localhost:5001
- Temporal UI: http://localhost:8233

## 📖 Usage

### For Students
1. Register with email/password and select "STUDENT" role
2. Complete onboarding:
   - Upload CV or manually enter interests
   - Select education level and location
   - Define career goals and meeting preferences
3. View AI-matched mentors with compatibility scores
4. Send invitation requests to top matches
5. Schedule meetings with accepted mentors

### For Mentors
1. Register with "MENTOR" role
2. Complete mentor profile:
   - Professional background and expertise
   - Skills and subjects you can teach
   - Availability and meeting preferences
3. Review student match requests
4. Accept/decline invitations
5. Schedule mentorship sessions

### For Facilitators
1. Oversee all matches in the system
2. View student and mentor profiles
3. Manage invitations and conflicts
4. Generate reports on matching success rates

## 🏗️ Project Structure

```
GuiedEd/
├── src/                          # Frontend source
│   ├── components/               # React components
│   │   ├── match/               # Matching UI components
│   │   ├── ui/                  # Shadcn UI components
│   │   └── Header.tsx           # Navigation header
│   ├── contexts/                # React contexts
│   │   └── AuthContext.tsx      # Authentication state
│   ├── data/                    # Static data
│   │   └── mockMentors.ts       # Mock mentor profiles
│   ├── integrations/            # External services
│   │   └── supabase/            # Supabase client & types
│   ├── pages/                   # Route pages
│   │   ├── auth/                # Login & registration
│   │   ├── StudentMatch.tsx     # Matching interface
│   │   └── *Onboarding.tsx      # Role-specific onboarding
│   ├── services/                # API services
│   │   ├── api.ts               # Backend API client
│   │   └── emailApi.ts          # Email service
│   ├── utils/                   # Utility functions
│   │   ├── dataMappers.ts       # Data transformation
│   │   └── matchingAlgorithm.ts # Frontend matching logic
│   └── App.tsx                  # Main application
├── backend/                     # Backend source
│   ├── activities.py            # Temporal activities
│   ├── workflows.py             # Temporal workflows
│   ├── matching.py              # Matching algorithm
│   ├── app.py                   # Flask REST API
│   ├── temporal_worker.py       # Temporal worker
│   ├── email_service.py         # Email notifications
│   ├── geocoding.py             # Location services
│   └── data/                    # Static data
│       └── interests.csv        # Interest taxonomy
├── supabase/                    # Database migrations
│   └── migrations/              # SQL migration files
└── public/                      # Static assets
```

## 🔑 Key APIs

### Backend Endpoints

#### Matching
- `POST /api/matching` - Execute full matching workflow
- `POST /api/match-with-mocks` - Match with mock mentors (demo)
- `POST /api/analyze-cv` - Extract interests from CV text

#### Data
- `GET /api/interests` - Get available interests list
- `GET /health` - Health check endpoint

#### Invitations
- `POST /api/send-invite-email` - Send invitation email
- `GET /api/invite/accept/<token>` - Accept invitation
- `GET /api/invite/reject/<token>` - Reject invitation

### Temporal Workflows

#### CVAnalysisWorkflow
Analyzes CV text and extracts relevant interests using LLM.

#### MatchingWorkflow
Orchestrates the complete matching process:
1. Validate input data
2. Geocode postcodes to coordinates
3. Calculate matching scores
4. Generate personalized reasoning

## 🔐 Security Features

- **Row-Level Security (RLS)**: Database-level access control
- **JWT Authentication**: Secure token-based auth
- **CORS Configuration**: Restricted cross-origin access
- **Input Validation**: Comprehensive validation on all endpoints
- **Environment Variables**: Sensitive data stored securely
- **Rate Limiting**: API rate limits to prevent abuse

## 📊 Database Schema

### Core Tables
- `profiles` - User profiles with role information
- `students` - Student-specific data
- `mentors` - Mentor-specific data
- `facilitators` - Facilitator-specific data
- `invites` - Match invitations and status
- `meetings` - Scheduled mentorship sessions
- `user_roles` - Role assignments

### Security
- RLS policies enforce data access rules
- Foreign key constraints maintain referential integrity
- Indexes optimize query performance

## 🧪 Testing

Run frontend tests:
```bash
npm test
```

Run backend tests:
```bash
cd backend
source venv/bin/activate
python test_matching.py
python test_temporal_only.py
```

## 🚀 Deployment

### Frontend
The frontend can be deployed to:
- Vercel
- Netlify
- AWS Amplify
- Any static hosting service

### Backend
Deploy the Flask API and Temporal worker to:
- AWS ECS/Fargate
- Google Cloud Run
- Heroku
- Railway

### Database
Supabase provides managed PostgreSQL hosting with automatic backups.

## 📝 Environment Variables

### Frontend (.env)
- `VITE_SUPABASE_PROJECT_ID` - Supabase project identifier
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Public API key
- `VITE_SUPABASE_URL` - Supabase project URL

### Backend (backend/.env)
- `OPENROUTER_API_KEY` - OpenRouter API key for LLM
- `TEMPORAL_HOST` - Temporal server address
- `TEMPORAL_NAMESPACE` - Temporal namespace
- `FLASK_PORT` - Flask server port
- `SMTP_USER` - Email sender address
- `SMTP_PASSWORD` - Email app password

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Supabase for the backend infrastructure
- Temporal for workflow orchestration
- OpenRouter for LLM API access
- Shadcn for beautiful UI components
- The open-source community

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

Built with ❤️ using React, TypeScript, Flask, Temporal, and Supabase
