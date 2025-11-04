"""
Comprehensive mock mentor data covering diverse scenarios and interests.
These mentors are designed to match various student profiles including:
- Specific career interests (software engineering, music, etc.)
- General exploration (students who don't know what they want)
- Various hobbies and interests (Taylor Swift, gaming, sports, etc.)
"""

MOCK_MENTORS = [
    {
        "id": "mentor-software-1",
        "education_level": "University",
        "postcode": "11122",
        "city": "Stockholm",
        "interests": ["Technology", "Gaming", "Science"],
        "languages": ["Swedish", "English"],
        "meeting_preference": "Both",
        "first_name": "Erik",
        "last_name": "Andersson",
        "bio": "Senior Software Engineer at Spotify with 10 years experience. I love coding, teaching, and helping young people discover tech careers. I specialize in web development, Python, and React.",
        "skills": ["Software Engineering", "Web Development", "Python", "JavaScript", "React", "Coding"]
    },
    {
        "id": "mentor-software-2",
        "education_level": "University",
        "postcode": "16440",
        "city": "Stockholm",
        "interests": ["Technology", "Business & Finance", "Gaming"],
        "languages": ["English", "Swedish", "German"],
        "meeting_preference": "Online",
        "first_name": "Lisa",
        "last_name": "Chen",
        "bio": "Tech entrepreneur and software developer. Founded two startups. I can help with programming, app development, and understanding the tech industry. Love working with students interested in computer science.",
        "skills": ["Software Engineering", "App Development", "Entrepreneurship", "Programming", "Computer Science"]
    },
    {
        "id": "mentor-music-1",
        "education_level": "High school",
        "postcode": "11835",
        "city": "Stockholm",
        "interests": ["Music", "Art", "Celebrity"],
        "languages": ["Swedish", "English"],
        "meeting_preference": "Both",
        "first_name": "Sofia",
        "last_name": "Bergström",
        "bio": "Music producer and artist manager. I've worked with several Swedish pop artists. Big fan of Taylor Swift! I can help students interested in music production, songwriting, or the music industry.",
        "skills": ["Music Production", "Songwriting", "Music Industry", "Pop Music", "Artist Management"]
    },
    {
        "id": "mentor-general-1",
        "education_level": "University",
        "postcode": "11153",
        "city": "Stockholm",
        "interests": ["Career", "Education", "Business & Finance"],
        "languages": ["Swedish", "English", "Spanish"],
        "meeting_preference": "Both",
        "first_name": "Johan",
        "last_name": "Svensson",
        "bio": "Career counselor and life coach. I help students explore different career paths and discover their passions. Perfect for students who don't know what they want yet - that's totally normal!",
        "skills": ["Career Counseling", "Life Coaching", "Career Exploration", "Personal Development"]
    },
    {
        "id": "mentor-taylor-swift-fan",
        "education_level": "High school",
        "postcode": "11122",
        "city": "Stockholm",
        "interests": ["Music", "Celebrity", "Fashion", "Shopping"],
        "languages": ["Swedish", "English"],
        "meeting_preference": "In person",
        "first_name": "Emma",
        "last_name": "Lindqvist",
        "bio": "Social media manager and content creator. Huge Swiftie! I create content about music, fashion, and pop culture. Can help students interested in social media, content creation, or the entertainment industry.",
        "skills": ["Social Media", "Content Creation", "Pop Culture", "Music Journalism", "Fashion"]
    },
    {
        "id": "mentor-science-1",
        "education_level": "University",
        "postcode": "11321",
        "city": "Stockholm",
        "interests": ["Science", "Technology", "Nature & Outdoors"],
        "languages": ["English", "Swedish", "Finnish"],
        "meeting_preference": "Both",
        "first_name": "Anna",
        "last_name": "Virtanen",
        "bio": "Biologist and environmental scientist. I research climate change and sustainability. Great for students interested in science, nature, environmental issues, or STEM careers.",
        "skills": ["Biology", "Environmental Science", "Research", "STEM", "Climate Science"]
    },
    {
        "id": "mentor-business-1",
        "education_level": "University",
        "postcode": "25225",
        "city": "Malmö",
        "interests": ["Business & Finance", "Career", "Technology"],
        "languages": ["Swedish", "English", "Danish"],
        "meeting_preference": "Online",
        "first_name": "Marcus",
        "last_name": "Hansen",
        "bio": "Business consultant and startup advisor. I help companies grow and can teach about business, entrepreneurship, marketing, and finance. Good fit for ambitious students!",
        "skills": ["Business Strategy", "Entrepreneurship", "Marketing", "Finance", "Consulting"]
    },
    {
        "id": "mentor-gaming-1",
        "education_level": "High school",
        "postcode": "16979",
        "city": "Stockholm",
        "interests": ["Gaming", "Technology", "Anime"],
        "languages": ["Swedish", "English", "Japanese"],
        "meeting_preference": "Online",
        "first_name": "Viktor",
        "last_name": "Johansson",
        "bio": "Professional game designer at a gaming studio. I create video games for a living! Can help students interested in game development, game design, or esports careers.",
        "skills": ["Game Design", "Game Development", "Gaming Industry", "Esports", "Animation"]
    },
    {
        "id": "mentor-arts-1",
        "education_level": "University",
        "postcode": "11145",
        "city": "Stockholm",
        "interests": ["Art", "Design", "Fashion", "Movies & TV"],
        "languages": ["Swedish", "English", "Italian"],
        "meeting_preference": "In person",
        "first_name": "Isabella",
        "last_name": "Rossi",
        "bio": "Graphic designer and art director. I work in advertising and design. Can mentor students interested in art, design, visual communication, or creative careers.",
        "skills": ["Graphic Design", "Art Direction", "Visual Design", "Creative Arts", "Advertising"]
    },
    {
        "id": "mentor-sports-1",
        "education_level": "High school",
        "postcode": "41101",
        "city": "Gothenburg",
        "interests": ["Sports", "Health & Fitness", "Travel"],
        "languages": ["Swedish", "English"],
        "meeting_preference": "In person",
        "first_name": "Oscar",
        "last_name": "Pettersson",
        "bio": "Former professional athlete, now sports coach and personal trainer. I can help students interested in sports, fitness, physical education, or sports management careers.",
        "skills": ["Sports Training", "Physical Fitness", "Sports Coaching", "Athletic Development", "Sports Management"]
    },
    {
        "id": "mentor-engineering-1",
        "education_level": "University",
        "postcode": "11122",
        "city": "Stockholm",
        "interests": ["Engineering", "Technology", "Science"],
        "languages": ["Swedish", "English", "German"],
        "meeting_preference": "Both",
        "first_name": "Lars",
        "last_name": "Andersson",
        "bio": "Mechanical engineer working on renewable energy projects. I design sustainable technologies. Perfect for students interested in engineering, physics, or making the world better through technology.",
        "skills": ["Mechanical Engineering", "Renewable Energy", "Engineering Design", "Physics", "Sustainability"]
    },
    {
        "id": "mentor-math-1",
        "education_level": "University",
        "postcode": "75000",
        "city": "Uppsala",
        "interests": ["Mathematics", "Science", "Education"],
        "languages": ["Swedish", "English"],
        "meeting_preference": "Both",
        "first_name": "Ingrid",
        "last_name": "Nilsson",
        "bio": "Mathematics professor and researcher. I love making math fun and accessible. Can help students with math, statistics, data science, or anyone who thinks they're 'not a math person'.",
        "skills": ["Mathematics", "Statistics", "Data Science", "Teaching", "Problem Solving"]
    },
    {
        "id": "mentor-entrepreneur-1",
        "education_level": "High school",
        "postcode": "11122",
        "city": "Stockholm",
        "interests": ["Business & Finance", "Career", "Technology"],
        "languages": ["Swedish", "English"],
        "meeting_preference": "Online",
        "first_name": "Alexander",
        "last_name": "Ek",
        "bio": "Young entrepreneur who started my first company at 19. Self-taught in business. Great for students who want to start their own business or learn entrepreneurship without a traditional path.",
        "skills": ["Entrepreneurship", "Business Development", "Startups", "Self-Learning", "Innovation"]
    },
    {
        "id": "mentor-psychology-1",
        "education_level": "University",
        "postcode": "11419",
        "city": "Stockholm",
        "interests": ["Relationships", "Health & Fitness", "Education"],
        "languages": ["Swedish", "English", "Norwegian"],
        "meeting_preference": "Both",
        "first_name": "Karin",
        "last_name": "Olsen",
        "bio": "Psychologist specializing in youth development. I help young people understand themselves, manage stress, and build confidence. Great for students exploring psychology or personal growth.",
        "skills": ["Psychology", "Youth Development", "Mental Health", "Counseling", "Personal Growth"]
    },
    {
        "id": "mentor-writer-1",
        "education_level": "University",
        "postcode": "11835",
        "city": "Stockholm",
        "interests": ["Movies & TV", "News", "Education"],
        "languages": ["Swedish", "English", "French"],
        "meeting_preference": "Online",
        "first_name": "Gustav",
        "last_name": "Bergman",
        "bio": "Journalist and author. I write for major Swedish newspapers and have published three books. Can help with writing, journalism, storytelling, or anyone who loves words.",
        "skills": ["Journalism", "Writing", "Storytelling", "Publishing", "Communications"]
    }
]


def get_mock_mentors():
    """Get all mock mentors"""
    return MOCK_MENTORS


def get_mentors_by_interest(interest: str):
    """Get mentors filtered by a specific interest"""
    return [m for m in MOCK_MENTORS if interest in m.get("interests", [])]


def get_mentor_by_id(mentor_id: str):
    """Get a specific mentor by ID"""
    return next((m for m in MOCK_MENTORS if m["id"] == mentor_id), None)
