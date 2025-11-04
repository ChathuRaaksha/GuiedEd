import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Mail, Sparkles, CheckCircle, Loader2, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { calculateMatch, ScoredMatch } from "@/utils/matchingAlgorithm";
import logo from "@/assets/logo.png";

const Match = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<ScoredMatch[]>([]);
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sentInvites, setSentInvites] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadMatches() {
      if (!user) {
        toast.error("Please log in to continue");
        navigate("/auth/login");
        return;
      }

      try {
        // Fetch student data by user_id
        const { data: studentData, error: studentError } = await supabase
          .from("students")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (studentError) {
          if (studentError.code === 'PGRST116') {
            toast.error("Please complete your student profile first");
            navigate("/onboarding/student");
            return;
          }
          throw studentError;
        }

        setStudent(studentData);

        // Fetch all mentors
        const { data: mentors, error: mentorsError } = await supabase
          .from("mentors")
          .select("*");

        if (mentorsError) throw mentorsError;

        // Calculate matches
        const scoredMatches = calculateMatch(studentData, mentors || []);
        setMatches(scoredMatches.slice(0, 5)); // Top 5 matches

        // Check for existing invites
        const { data: existingInvites } = await supabase
          .from("invites")
          .select("mentor_id")
          .eq("student_id", studentData.id);

        if (existingInvites) {
          setSentInvites(new Set(existingInvites.map(inv => inv.mentor_id)));
        }
      } catch (error: any) {
        console.error("Error loading matches:", error);
        toast.error("Failed to load matches. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadMatches();
  }, [user, navigate]);

  const handleSendInvite = async (mentorId: string, mentorName: string, score: number, reasons: string[]) => {
    if (!student) {
      toast.error("Student data not found");
      return;
    }

    try {
      const { error } = await supabase
        .from("invites")
        .insert({
          student_id: student.id,
          mentor_id: mentorId,
          score,
          reasons,
          status: 'proposed',
          accepted_by_student: false,
          accepted_by_mentor: false,
          created_by: 'system',
        });

      if (error) throw error;

      setSentInvites(prev => new Set([...prev, mentorId]));
      toast.success(`Match proposal sent to ${mentorName}! A facilitator will review soon.`);
    } catch (error: any) {
      console.error("Error sending invite:", error);
      if (error.code === '23505') {
        toast.error("You've already sent an invite to this mentor");
      } else {
        toast.error("Failed to send invite. Please try again.");
      }
    }
  };

  const handleSkip = (mentorId: string) => {
    setMatches(prev => prev.filter(m => m.mentor.id !== mentorId));
    toast.info("Skipped this match");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-lg text-muted-foreground">Finding your perfect mentors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <img src={logo} alt="GuidEd" className="h-8" />
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold mb-4">
              <Sparkles className="w-5 h-5" />
              Your Perfect Matches
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Hi {student?.first_name}! 👋
            </h1>
            <p className="text-xl text-muted-foreground">
              I found {matches.length} amazing mentor{matches.length !== 1 ? 's' : ''} who match your interests and goals
            </p>
          </div>

          {/* Matches */}
          {matches.length === 0 ? (
            <Card className="p-12 text-center">
              <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">No matches found yet</h2>
              <p className="text-muted-foreground mb-6">
                We couldn't find mentors matching your profile right now. Try updating your interests or check back later!
              </p>
              <Link to="/onboarding/student">
                <Button className="btn-primary">
                  Update Profile
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-6">
              {matches.map((match) => {
                const isInviteSent = sentInvites.has(match.mentor.id);
                return (
                  <Card key={match.mentor.id} className="p-6 card-hover">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Mentor Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-2xl font-bold">
                              {match.mentor.first_name} {match.mentor.last_name}
                            </h3>
                            <p className="text-muted-foreground">
                              {match.mentor.role} {match.mentor.employer && `at ${match.mentor.employer}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="font-bold text-primary">{match.score}% Match</span>
                          </div>
                        </div>

                        {match.mentor.bio && (
                          <p className="text-sm text-muted-foreground mb-4">{match.mentor.bio}</p>
                        )}

                        {/* Skills */}
                        <div className="mb-4">
                          <p className="text-sm font-semibold mb-2">Skills & Expertise</p>
                          <div className="flex flex-wrap gap-2">
                            {match.mentor.skills.map((skill) => (
                              <span key={skill} className="tag-chip text-xs">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Languages */}
                        <div className="mb-4">
                          <p className="text-sm font-semibold mb-2">Languages</p>
                          <div className="flex flex-wrap gap-2">
                            {match.mentor.languages.map((lang) => (
                              <span key={lang} className="tag-chip text-xs bg-accent/10 text-accent">
                                {lang}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Match Reasons */}
                        <div className="mb-4">
                          <p className="text-sm font-semibold mb-2">Why this match?</p>
                          <div className="space-y-1">
                            {match.reasons.map((reason, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span>{reason}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex md:flex-col gap-3 md:w-40">
                        {isInviteSent ? (
                          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 text-green-700 font-semibold text-sm">
                            <CheckCircle className="w-5 h-5" />
                            <span>Invite Sent</span>
                          </div>
                        ) : (
                          <>
                            <Button
                              onClick={() => handleSendInvite(
                                match.mentor.id,
                                `${match.mentor.first_name} ${match.mentor.last_name}`,
                                match.score,
                                match.reasons
                              )}
                              className="flex-1 md:flex-none btn-primary"
                            >
                              <Mail className="w-4 h-4 mr-2" />
                              Send Invite
                            </Button>
                            <Button
                              onClick={() => handleSkip(match.mentor.id)}
                              variant="outline"
                              className="flex-1 md:flex-none rounded-xl"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Skip
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Next Steps */}
          <Card className="mt-12 p-8 bg-gradient-to-br from-primary/5 to-accent/5">
            <h2 className="text-2xl font-bold mb-4">What happens next?</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Review & Approval</h3>
                  <p className="text-sm text-muted-foreground">
                    A facilitator will review your match proposal and ensure it's a great fit
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Mentor Acceptance</h3>
                  <p className="text-sm text-muted-foreground">
                    Your chosen mentor will be notified and can accept the match
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">First Meeting</h3>
                  <p className="text-sm text-muted-foreground">
                    Once approved, your facilitator will schedule your first meeting!
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Match;
