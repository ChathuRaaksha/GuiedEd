import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Loader2, X, CheckCircle, Clock, AlertCircle, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { ScoreBar } from "@/components/match/ScoreBar";
import { ReasonChips } from "@/components/match/ReasonChips";
import { MeetingModal } from "@/components/match/MeetingModal";
import { Skeleton } from "@/components/ui/skeleton";

const MentorMatches = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [mentorProfile, setMentorProfile] = useState<any>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [confirmed, setConfirmed] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [meetingModal, setMeetingModal] = useState<{ open: boolean; studentId: string; mentorId: string } | null>(null);

  useEffect(() => {
    if (!user || !profile) {
      toast.error("Please log in to continue");
      navigate("/auth/login");
      return;
    }

    if (profile.role !== "MENTOR") {
      navigate("/match");
      return;
    }

    loadData();
  }, [user, profile, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: mentorData, error: mentorError } = await supabase
        .from("mentors")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (mentorError) throw mentorError;
      if (!mentorData) {
        toast.error("Please complete your mentor profile first");
        navigate("/onboarding/mentor");
        return;
      }

      setMentorProfile(mentorData);

      const { data: invites, error: invitesError } = await supabase
        .from("invites")
        .select("*")
        .eq("mentor_id", mentorData.id)
        .order("created_at", { ascending: false });

      if (invitesError) throw invitesError;

      const studentIds = [...new Set(invites?.map(inv => inv.student_id) || [])];
      const { data: students } = await supabase
        .from("students")
        .select("*")
        .in("id", studentIds);

      const invitesWithStudents = invites?.map(inv => ({
        ...inv,
        student: students?.find(s => s.id === inv.student_id)
      })) || [];

      setProposals(invitesWithStudents.filter(inv => 
        inv.status === 'proposed' || 
        inv.status === 'accepted_by_student' ||
        (inv.status === 'accepted_by_mentor' && !inv.accepted_by_student)
      ));
      
      setConfirmed(invitesWithStudents.filter(inv => inv.status === 'confirmed'));
      
      setHistory(invitesWithStudents.filter(inv => 
        inv.status.includes('rejected') || inv.status === 'expired'
      ));
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptProposal = async (inviteId: string, invite: any) => {
    try {
      const { error } = await supabase
        .from("invites")
        .update({ 
          accepted_by_mentor: true, 
          status: invite.accepted_by_student ? 'confirmed' : 'accepted_by_mentor' 
        })
        .eq("id", inviteId);

      if (error) throw error;

      if (invite.accepted_by_student) {
        toast.success("Match confirmed! Opening meeting scheduler...");
        setMeetingModal({ open: true, studentId: invite.student_id, mentorId: invite.mentor_id });
      } else {
        toast.success("Proposal accepted! Waiting for student confirmation.");
      }
      
      await loadData();
    } catch (error: any) {
      console.error("Error accepting proposal:", error);
      toast.error("Failed to accept proposal. Please try again.");
    }
  };

  const handleRejectProposal = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from("invites")
        .update({ status: 'rejected_by_mentor' })
        .eq("id", inviteId);

      if (error) throw error;

      toast.info("Proposal declined.");
      await loadData();
    } catch (error: any) {
      console.error("Error rejecting proposal:", error);
      toast.error("Failed to reject proposal. Please try again.");
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

  const waitingForMe = proposals.filter(inv => 
    inv.status === 'proposed' || inv.status === 'accepted_by_student'
  ).length;
  
  const waitingForStudent = proposals.filter(inv => 
    inv.status === 'accepted_by_mentor' && !inv.accepted_by_student
  ).length;

  const capacityUsed = confirmed.length;
  const capacityLeft = mentorProfile.max_students - capacityUsed;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">My Mentorship Matches</h1>
                <p className="text-muted-foreground text-lg">
                  Review and manage your student connections
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
                <Users className="w-5 h-5 text-primary" />
                <span className="font-semibold">
                  Capacity: {capacityUsed}/{mentorProfile.max_students}
                </span>
                {capacityLeft > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {capacityLeft} slot{capacityLeft !== 1 ? 's' : ''} left
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex gap-4">
              {waitingForMe > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                    {waitingForMe} waiting for your action
                  </span>
                </div>
              )}
              {waitingForStudent > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    {waitingForStudent} waiting for student
                  </span>
                </div>
              )}
            </div>
          </div>

          <Tabs defaultValue="proposals" className="space-y-6">
            <TabsList>
              <TabsTrigger value="proposals">Proposals ({proposals.length})</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmed ({confirmed.length})</TabsTrigger>
              <TabsTrigger value="history">History ({history.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="proposals" className="space-y-4">
              {proposals.length === 0 ? (
                <Card className="p-12 text-center">
                  <Mail className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">No proposals</h2>
                  <p className="text-muted-foreground">
                    You'll see student match requests here
                  </p>
                </Card>
              ) : (
                proposals.map(invite => {
                  const needsMyAction = invite.status === 'proposed' || invite.status === 'accepted_by_student';
                  
                  return (
                    <Card key={invite.id} className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <Avatar className="w-16 h-16">
                          <AvatarFallback className="text-xl">
                            {invite.student?.first_name?.[0]}{invite.student?.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-xl font-bold">
                                {invite.student?.first_name} {invite.student?.last_name}
                              </h3>
                              <p className="text-muted-foreground">
                                {invite.student?.education_level === 'high_school' ? 'High School' :
                                 invite.student?.education_level === 'middle_school' ? 'Middle School' : 'University'}
                                {invite.student?.school && ` • ${invite.student.school}`}
                              </p>
                            </div>
                            {needsMyAction && (
                              <Badge variant="destructive">Action Required</Badge>
                            )}
                          </div>

                          <ScoreBar score={invite.score} size="sm" />

                          {invite.student?.bio && (
                            <p className="text-sm text-muted-foreground">{invite.student.bio}</p>
                          )}

                          <div>
                            <p className="text-sm font-semibold mb-2">Interests</p>
                            <div className="flex flex-wrap gap-2">
                              {invite.student?.interests?.slice(0, 5).map((interest: string) => (
                                <Badge key={interest} variant="secondary">{interest}</Badge>
                              ))}
                            </div>
                          </div>

                          <ReasonChips reasons={invite.reasons || []} />
                        </div>

                        <div className="flex gap-2">
                          {needsMyAction ? (
                            <>
                              <Button
                                onClick={() => handleAcceptProposal(invite.id, invite)}
                                className="gap-2"
                                disabled={capacityLeft <= 0}
                              >
                                <CheckCircle className="w-4 h-4" />
                                Accept
                              </Button>
                              <Button
                                onClick={() => handleRejectProposal(invite.id)}
                                variant="outline"
                                className="gap-2"
                              >
                                <X className="w-4 h-4" />
                                Decline
                              </Button>
                            </>
                          ) : (
                            <Badge variant="secondary">Waiting for student</Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="confirmed" className="space-y-4">
              {confirmed.length === 0 ? (
                <Card className="p-12 text-center">
                  <CheckCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">No confirmed matches yet</h2>
                  <p className="text-muted-foreground">
                    Confirmed mentorships will appear here
                  </p>
                </Card>
              ) : (
                confirmed.map(invite => (
                  <Card key={invite.id} className="p-6">
                    <div className="flex items-center gap-6">
                      <Avatar className="w-16 h-16">
                        <AvatarFallback className="text-xl">
                          {invite.student?.first_name?.[0]}{invite.student?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <h3 className="text-xl font-bold">
                          {invite.student?.first_name} {invite.student?.last_name}
                        </h3>
                        <p className="text-muted-foreground">
                          {invite.student?.school}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Confirmed on {new Date(invite.updated_at).toLocaleDateString()}
                        </p>
                      </div>

                      <Badge className="bg-green-500">Active</Badge>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {history.length === 0 ? (
                <Card className="p-12 text-center">
                  <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">No history</h2>
                  <p className="text-muted-foreground">
                    Past proposals will appear here
                  </p>
                </Card>
              ) : (
                history.map(invite => (
                  <Card key={invite.id} className="p-6 opacity-60">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold">
                          {invite.student?.first_name} {invite.student?.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(invite.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {invite.status.includes('rejected_by_mentor') ? 'Declined by you' :
                         invite.status.includes('rejected_by_student') ? 'Declined by student' :
                         'Expired'}
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

export default MentorMatches;
