import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Mail, Sparkles, Users, CheckCircle, Loader2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { calculateMatch, ScoredMatch } from "@/utils/matchingAlgorithm";
import logo from "@/assets/logo.png";

const Match = () => {
  const [searchParams] = useSearchParams();
  const studentId = searchParams.get("studentId");
  const studentName = searchParams.get("name") || "there";
  const [matches, setMatches] = useState<ScoredMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMatches() {
      if (!studentId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch student data
        const { data: student, error: studentError } = await supabase
          .from("students")
          .select("*")
          .eq("id", studentId)
          .single();

        if (studentError) throw studentError;

        // Fetch all mentors
        const { data: mentors, error: mentorsError } = await supabase
          .from("mentors")
          .select("*");

        if (mentorsError) throw mentorsError;

        // Calculate matches
        const scoredMatches = calculateMatch(student, mentors || []);
        setMatches(scoredMatches.slice(0, 5)); // Top 5 matches
      } catch (error: any) {
        console.error("Error loading matches:", error);
        toast.error("Failed to load matches. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadMatches();
  }, [studentId]);

  const handleSendInvite = async (mentorId: string, mentorName: string, score: number, reasons: string[]) => {
    if (!studentId) {
      toast.error("Student ID not found");
      return;
    }

    try {
      const { error } = await supabase
        .from("invites")
        .insert({
          student_id: studentId,
          mentor_id: mentorId,
          score,
          reasons,
        });

      if (error) throw error;

      toast.success(`Invite sent to ${mentorName}! A facilitator will review and connect you soon.`);
    } catch (error: any) {
      console.error("Error sending invite:", error);
      toast.error("Failed to send invite. Please try again.");
    }
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
                {loading ? (
                  <Loader2 className="w-6 h-6 text-accent animate-spin" />
                ) : (
                  <Sparkles className="w-6 h-6 text-accent" />
                )}
              </div>
              <div>
                {loading ? (
                  <>
                    <h1 className="text-3xl font-bold">Finding your perfect mentors...</h1>
                    <p className="text-muted-foreground">Ed is analyzing your profile</p>
                  </>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold">
                      {matches.length > 0 ? `Great news, ${studentName}! 🎉` : `Hi ${studentName}!`}
                    </h1>
                    <p className="text-muted-foreground">
                      {matches.length > 0 
                        ? `I found ${matches.length} amazing mentor${matches.length > 1 ? 's' : ''} who match your profile`
                        : "Try adding more interests to find better matches"}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Match Cards */}
          {!loading && matches.length > 0 && (
            <div className="space-y-6">
              {matches.map(({ mentor, score, reasons }) => (
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
                          {mentor.first_name} {mentor.last_name}
                        </h3>
                        <p className="text-muted-foreground">
                          {mentor.role} {mentor.employer ? `at ${mentor.employer}` : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {score}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Match Score
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">
                      {mentor.bio || "Excited to mentor students!"}
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
                        {reasons.map((reason, idx) => (
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
                        onClick={() => handleSendInvite(mentor.id, `${mentor.first_name} ${mentor.last_name}`, score, reasons)}
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
          )}

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
