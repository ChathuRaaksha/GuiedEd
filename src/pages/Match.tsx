import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Mail, Sparkles, Users, CheckCircle } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

// Mock mentor data - will be replaced with real data from Lovable Cloud
const MOCK_MENTORS = [
  {
    id: "1",
    firstName: "Sarah",
    lastName: "Chen",
    role: "Software Engineer",
    employer: "Tech Corp",
    bio: "Passionate about helping students discover tech careers",
    skills: ["💻 Technology", "🎨 Art & Design"],
    languages: ["English", "Mandarin"],
    score: 92,
    reasons: ["3 shared interests", "Common language", "Available next week"],
  },
  {
    id: "2",
    firstName: "Marcus",
    lastName: "Johnson",
    role: "Product Designer",
    employer: "Design Studio",
    bio: "Former student mentor, loves creative problem solving",
    skills: ["🎨 Art & Design", "💼 Business"],
    languages: ["English", "Spanish"],
    score: 88,
    reasons: ["2 shared interests", "Design expertise", "Flexible schedule"],
  },
  {
    id: "3",
    firstName: "Amira",
    lastName: "Hassan",
    role: "Healthcare Professional",
    employer: "City Hospital",
    bio: "Dedicated to inspiring future healthcare workers",
    skills: ["🏥 Healthcare", "🔬 Science"],
    languages: ["English", "Arabic"],
    score: 85,
    reasons: ["Healthcare interest match", "Mentored 5+ students", "Patient teaching experience"],
  },
];

const Match = () => {
  const [searchParams] = useSearchParams();
  const studentName = searchParams.get("name") || "there";

  const handleSendInvite = (mentorName: string) => {
    toast.success(`Invite sent to ${mentorName}! A facilitator will review and connect you soon.`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border py-4">
        <div className="container mx-auto px-4">
          <img src={logo} alt="GuidEd" className="h-8" />
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to home
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  Great news, {studentName}! 🎉
                </h1>
                <p className="text-muted-foreground">
                  I found {MOCK_MENTORS.length} amazing mentors who match your profile
                </p>
              </div>
            </div>
          </div>

          {/* Match Cards */}
          <div className="space-y-6">
            {MOCK_MENTORS.map((mentor) => (
              <Card key={mentor.id} className="p-6 card-hover">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <Users className="w-10 h-10 text-primary" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-grow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold">
                          {mentor.firstName} {mentor.lastName}
                        </h3>
                        <p className="text-muted-foreground">
                          {mentor.role} at {mentor.employer}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {mentor.score}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Match Score
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">
                      {mentor.bio}
                    </p>

                    {/* Skills */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {mentor.skills.map((skill) => (
                          <span key={skill} className="tag-chip bg-primary/10 text-primary">
                            {skill}
                          </span>
                        ))}
                        {mentor.languages.map((lang) => (
                          <span key={lang} className="tag-chip">
                            🗣️ {lang}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Match Reasons */}
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-2">Why this is a great match:</div>
                      <div className="space-y-1">
                        {mentor.reasons.map((reason, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                            {reason}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleSendInvite(`${mentor.firstName} ${mentor.lastName}`)}
                        className="btn-primary"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Send Invite
                      </Button>
                      <Button variant="outline">
                        Skip
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Next Steps */}
          <Card className="mt-8 p-6 bg-accent/5 border-accent/20">
            <h3 className="font-bold mb-3">What happens next?</h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-bold text-accent">1.</span>
                <span>You send an invite to mentors you're interested in</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-accent">2.</span>
                <span>A facilitator reviews and approves the match</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-accent">3.</span>
                <span>Both you and your mentor get notified to schedule your first meeting</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-accent">4.</span>
                <span>Ed assists throughout your mentorship journey! 🚀</span>
              </li>
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Match;
