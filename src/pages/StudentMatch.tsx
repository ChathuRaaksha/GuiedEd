import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Sparkles, Loader2, X, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { calculateMatch, ScoredMatch } from "@/utils/matchingAlgorithm";
import { Header } from "@/components/Header";
import { ScoreBar } from "@/components/match/ScoreBar";
import { ReasonChips } from "@/components/match/ReasonChips";
import { MeetingModal } from "@/components/match/MeetingModal";
import { Skeleton } from "@/components/ui/skeleton";
import { EdAIBanner } from "@/components/match/EdAIBanner";

const StudentMatch = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [availableMatches, setAvailableMatches] = useState<ScoredMatch[]>([]);
  const [receivedInvites, setReceivedInvites] = useState<any[]>([]);
  const [sentInvites, setSentInvites] = useState<any[]>([]);
  const [meetingModal, setMeetingModal] = useState<{ open: boolean; studentId: string; mentorId: string } | null>(null);

  useEffect(() => {
    if (!user || !profile) {
      toast.error("Please log in to continue");
      navigate("/auth/login");
      return;
    }

    if (profile.role !== "STUDENT") {
      navigate("/match");
      return;
    }

    loadData();
  }, [user, profile, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (studentError) throw studentError;
      if (!studentData) {
        toast.error("Please complete your student profile first");
        navigate("/onboarding/student");
        return;
      }

      setStudentProfile(studentData);

      const { data: mentors, error: mentorsError } = await supabase
        .from("mentors")
        .select("*");

      if (mentorsError) throw mentorsError;

      const { data: invites, error: invitesError } = await supabase
        .from("invites")
        .select("*")
        .eq("student_id", studentData.id);

      if (invitesError) throw invitesError;

      const rejectedMentorIds = new Set(
        invites
          ?.filter(inv => inv.status === 'rejected_by_student' || inv.status === 'rejected_by_mentor')
          .map(inv => inv.mentor_id)
      );

      const availableMentors = mentors?.filter(m => !rejectedMentorIds.has(m.id)) || [];
      const scoredMatches = calculateMatch(studentData, availableMentors);
      setAvailableMatches(scoredMatches); // Show ALL matches

      const received = invites?.filter(inv => 
        inv.created_by !== 'student' && 
        inv.status !== 'rejected_by_student' &&
        inv.status !== 'rejected_by_mentor'
      ) || [];
      
      const sent = invites?.filter(inv => 
        inv.created_by === 'student' || inv.created_by === 'system'
      ) || [];

      if (received.length > 0) {
        const mentorIds = received.map(inv => inv.mentor_id);
        const { data: mentorDetails } = await supabase
          .from("mentors")
          .select("*")
          .in("id", mentorIds);

        setReceivedInvites(received.map(inv => ({
          ...inv,
          mentor: mentorDetails?.find(m => m.id === inv.mentor_id)
        })));
      }

      setSentInvites(sent);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async (mentorId: string, score: number, reasons: string[]) => {
    if (!studentProfile) return;

    try {
      const { error } = await supabase
        .from("invites")
        .insert({
          student_id: studentProfile.id,
          mentor_id: mentorId,
          score,
          reasons,
          status: 'proposed',
          created_by: 'student',
        });

      if (error) throw error;

      toast.success("Match request sent!");
      await loadData();
    } catch (error: any) {
      console.error("Error sending invite:", error);
      if (error.code === '23505') {
        toast.error("You've already sent a request to this mentor");
      } else {
        toast.error("Failed to send invite. Please try again.");
      }
    }
  };

  const handleAcceptInvite = async (inviteId: string, invite: any) => {
    try {
      const { error } = await supabase
        .from("invites")
        .update({ 
          accepted_by_student: true, 
          status: invite.accepted_by_mentor ? 'confirmed' : 'accepted_by_student' 
        })
        .eq("id", inviteId);

      if (error) throw error;

      if (invite.accepted_by_mentor) {
        toast.success("Match confirmed! Opening meeting scheduler...");
        setMeetingModal({ open: true, studentId: invite.student_id, mentorId: invite.mentor_id });
      } else {
        toast.success("Match accepted! Waiting for mentor confirmation.");
      }
      
      await loadData();
    } catch (error: any) {
      console.error("Error accepting invite:", error);
      toast.error("Failed to accept invite. Please try again.");
    }
  };

  const handleRejectInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from("invites")
        .update({ status: 'rejected_by_student' })
        .eq("id", inviteId);

      if (error) throw error;

      toast.info("Match declined.");
      await loadData();
    } catch (error: any) {
      console.error("Error rejecting invite:", error);
      toast.error("Failed to reject invite. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto space-y-6">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-6 w-96" />
            <div className="space-y-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const waitingForMe = receivedInvites.filter(inv => inv.status === 'proposed').length;
  const waitingForOther = sentInvites.filter(inv => inv.status === 'proposed' || inv.status.includes('accepted_by')).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Find Your Mentor</h1>
            <p className="text-muted-foreground text-lg">
              Connect with experienced mentors who can guide your journey
            </p>
            
            <div className="flex gap-4 mt-4">
              {waitingForMe > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                    {waitingForMe} waiting for your action
                  </span>
                </div>
              )}
              {waitingForOther > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    {waitingForOther} waiting for other side
                  </span>
                </div>
              )}
            </div>
          </div>

          <EdAIBanner />

          <Tabs defaultValue="discover" className="space-y-6">
            <TabsList>
              <TabsTrigger value="discover">Discover</TabsTrigger>
              <TabsTrigger value="received">Received ({receivedInvites.length})</TabsTrigger>
              <TabsTrigger value="sent">Sent ({sentInvites.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="discover" className="space-y-6">
              {availableMatches.length === 0 ? (
                <Card className="p-12 text-center">
                  <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">No matches found</h2>
                  <p className="text-muted-foreground">Check back later for new mentors!</p>
                </Card>
              ) : (
                availableMatches.map((match) => {
                  const alreadySent = sentInvites.some(inv => inv.mentor_id === match.mentor.id);

                  return (
                    <Card key={match.mentor.id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex flex-col md:flex-row gap-6">
                        <Avatar className="w-20 h-20">
                          <AvatarFallback className="text-2xl">
                            {match.mentor.first_name[0]}{match.mentor.last_name[0]}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-4">
                          <div>
                            <h3 className="text-2xl font-bold">
                              {match.mentor.first_name} {match.mentor.last_name}
                            </h3>
                            <p className="text-muted-foreground">
                              {match.mentor.role} {match.mentor.employer && `at ${match.mentor.employer}`}
                            </p>
                          </div>

                          <ScoreBar score={match.score} />

                          {match.mentor.bio && (
                            <p className="text-sm text-muted-foreground">{match.mentor.bio}</p>
                          )}

                          <div>
                            <p className="text-sm font-semibold mb-2">Skills & Expertise</p>
                            <div className="flex flex-wrap gap-2">
                              {match.mentor.skills?.slice(0, 6).map((skill) => (
                                <Badge key={skill} variant="secondary">{skill}</Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-semibold mb-2">Languages</p>
                            <div className="flex flex-wrap gap-2">
                              {match.mentor.languages?.map((lang) => (
                                <Badge key={lang} variant="outline">{lang}</Badge>
                              ))}
                            </div>
                          </div>

                          <ReasonChips reasons={match.reasons} />

                          {match.firstOverlap && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              First available: {new Date(match.firstOverlap).toLocaleDateString()}
                            </div>
                          )}
                        </div>

                        <div className="md:w-40 flex flex-col gap-3">
                          {alreadySent ? (
                            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-semibold text-sm">
                              <CheckCircle className="w-5 h-5" />
                              <span>Invite Sent</span>
                            </div>
                          ) : (
                            <Button
                              onClick={() => handleSendInvite(match.mentor.id, match.score, match.reasons)}
                              className="w-full gap-2"
                            >
                              <Mail className="w-4 h-4" />
                              Send Invite
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="received" className="space-y-4">
              {receivedInvites.length === 0 ? (
                <Card className="p-12 text-center">
                  <Mail className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">No invites yet</h2>
                  <p className="text-muted-foreground">You'll see invites from mentors here</p>
                </Card>
              ) : (
                receivedInvites.map(invite => (
                  <Card key={invite.id} className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <Avatar className="w-16 h-16">
                        <AvatarFallback className="text-xl">
                          {invite.mentor?.first_name?.[0]}{invite.mentor?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="text-xl font-bold">
                            {invite.mentor?.first_name} {invite.mentor?.last_name}
                          </h3>
                          <p className="text-muted-foreground">
                            {invite.mentor?.role} {invite.mentor?.employer && `at ${invite.mentor.employer}`}
                          </p>
                        </div>

                        <ScoreBar score={invite.score} size="sm" />
                        <ReasonChips reasons={invite.reasons || []} />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAcceptInvite(invite.id, invite)}
                          className="gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Accept
                        </Button>
                        <Button
                          onClick={() => handleRejectInvite(invite.id)}
                          variant="outline"
                          className="gap-2"
                        >
                          <X className="w-4 h-4" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="sent" className="space-y-4">
              {sentInvites.length === 0 ? (
                <Card className="p-12 text-center">
                  <Mail className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">No sent invites</h2>
                  <p className="text-muted-foreground">
                    Start by sending invites in the Discover tab
                  </p>
                </Card>
              ) : (
                sentInvites.map(invite => (
                  <Card key={invite.id} className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-bold mb-1">Invite sent</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(invite.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={
                        invite.status === 'confirmed' ? 'default' :
                        invite.status.includes('accepted') ? 'secondary' : 'outline'
                      }>
                        {invite.status === 'proposed' ? 'Pending' :
                         invite.status === 'accepted_by_student' ? 'Waiting for mentor' :
                         invite.status === 'accepted_by_mentor' ? 'Waiting for you' :
                         invite.status === 'confirmed' ? 'Confirmed' : 'Rejected'}
                      </Badge>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {meetingModal && (
        <MeetingModal
          open={meetingModal.open}
          onOpenChange={(open) => setMeetingModal(open ? meetingModal : null)}
          studentId={meetingModal.studentId}
          mentorId={meetingModal.mentorId}
          onSuccess={loadData}
        />
      )}
    </div>
  );
};

export default StudentMatch;
