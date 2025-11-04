import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Sparkles, CheckCircle, Loader2, X, UserCheck, Users, Clock, ThumbsUp, ThumbsDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { calculateMatch, ScoredMatch } from "@/utils/matchingAlgorithm";
import { Header } from "@/components/Header";

const Match = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  
  // For students and mentors
  const [availableMatches, setAvailableMatches] = useState<ScoredMatch[]>([]);
  const [receivedInvites, setReceivedInvites] = useState<any[]>([]);
  const [sentInvites, setSentInvites] = useState<any[]>([]);
  
  // For facilitators
  const [allInvites, setAllInvites] = useState<any[]>([]);

  useEffect(() => {
    if (!user || !profile) {
      toast.error("Please log in to continue");
      navigate("/auth/login");
      return;
    }

    loadData();
  }, [user, profile, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (profile?.role === "STUDENT") {
        await loadStudentData();
      } else if (profile?.role === "MENTOR") {
        await loadMentorData();
      } else if (profile?.role === "FACILITATOR") {
        await loadFacilitatorData();
      }
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadStudentData = async () => {
    // Get student profile
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

    setCurrentUserProfile(studentData);

    // Get all mentors
    const { data: mentors, error: mentorsError } = await supabase
      .from("mentors")
      .select("*");

    if (mentorsError) throw mentorsError;

    // Get all invites involving this student
    const { data: invites, error: invitesError } = await supabase
      .from("invites")
      .select("*")
      .eq("student_id", studentData.id);

    if (invitesError) throw invitesError;

    // Filter out mentors that have rejected or been rejected
    const rejectedMentorIds = new Set(
      invites
        ?.filter(inv => inv.status === 'rejected_by_student' || inv.status === 'rejected_by_mentor')
        .map(inv => inv.mentor_id)
    );

    const availableMentors = mentors?.filter(m => !rejectedMentorIds.has(m.id)) || [];

    // Calculate matches
    const scoredMatches = calculateMatch(studentData, availableMentors);
    setAvailableMatches(scoredMatches.slice(0, 10));

    // Separate received and sent invites
    const received = invites?.filter(inv => 
      inv.created_by === 'mentor' && 
      inv.status !== 'rejected_by_student' &&
      inv.status !== 'rejected_by_mentor'
    ) || [];
    
    const sent = invites?.filter(inv => 
      inv.created_by === 'student' || inv.created_by === 'system'
    ) || [];

    // Get mentor details for received invites
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
  };

  const loadMentorData = async () => {
    // Get mentor profile
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

    setCurrentUserProfile(mentorData);

    // Get all students
    const { data: students, error: studentsError } = await supabase
      .from("students")
      .select("*");

    if (studentsError) throw studentsError;

    // Get all invites involving this mentor
    const { data: invites, error: invitesError } = await supabase
      .from("invites")
      .select("*")
      .eq("mentor_id", mentorData.id);

    if (invitesError) throw invitesError;

    // Filter out students that have rejected or been rejected
    const rejectedStudentIds = new Set(
      invites
        ?.filter(inv => inv.status === 'rejected_by_student' || inv.status === 'rejected_by_mentor')
        .map(inv => inv.student_id)
    );

    const availableStudents = students?.filter(s => !rejectedStudentIds.has(s.id)) || [];

    // Calculate matches (reverse: mentor looking at students)
    const scoredMatches = availableStudents.map(student => {
      // Simple scoring based on shared interests, languages, etc.
      let score = 0;
      const reasons: string[] = [];

      // Check languages
      const sharedLanguages = mentorData.languages?.filter((lang: string) => 
        student.languages?.includes(lang)
      ) || [];
      if (sharedLanguages.length > 0) {
        score += sharedLanguages.length * 15;
        reasons.push(`Speak ${sharedLanguages.join(", ")}`);
      }

      // Check interests/skills
      const sharedInterests = mentorData.skills?.filter((skill: string) => 
        student.interests?.includes(skill)
      ) || [];
      if (sharedInterests.length > 0) {
        score += sharedInterests.length * 20;
        reasons.push(`Shared interests in ${sharedInterests.slice(0, 2).join(", ")}`);
      }

      // Check location
      if (mentorData.city === student.city) {
        score += 10;
        reasons.push(`Both in ${mentorData.city}`);
      }

      // Check meeting preference
      if (mentorData.meeting_pref === student.meeting_pref || 
          mentorData.meeting_pref === 'both' || 
          student.meeting_pref === 'both') {
        score += 5;
      }

      return {
        student,
        score: Math.min(score, 100),
        reasons: reasons.length > 0 ? reasons : ["Potential good match"]
      };
    }).sort((a, b) => b.score - a.score);

    setAvailableMatches(scoredMatches.slice(0, 10) as any);

    // Separate received and sent invites
    const received = invites?.filter(inv => 
      inv.created_by === 'student' && 
      inv.status !== 'rejected_by_student' &&
      inv.status !== 'rejected_by_mentor'
    ) || [];
    
    const sent = invites?.filter(inv => 
      inv.created_by === 'mentor'
    ) || [];

    // Get student details for received invites
    if (received.length > 0) {
      const studentIds = received.map(inv => inv.student_id);
      const { data: studentDetails } = await supabase
        .from("students")
        .select("*")
        .in("id", studentIds);

      setReceivedInvites(received.map(inv => ({
        ...inv,
        student: studentDetails?.find(s => s.id === inv.student_id)
      })));
    }

    setSentInvites(sent);
  };

  const loadFacilitatorData = async () => {
    // Get all invites with student and mentor details
    const { data: invites, error: invitesError } = await supabase
      .from("invites")
      .select("*")
      .order("created_at", { ascending: false });

    if (invitesError) throw invitesError;

    // Get all students and mentors
    const studentIds = [...new Set(invites?.map(inv => inv.student_id) || [])];
    const mentorIds = [...new Set(invites?.map(inv => inv.mentor_id) || [])];

    const { data: students } = await supabase
      .from("students")
      .select("*")
      .in("id", studentIds);

    const { data: mentors } = await supabase
      .from("mentors")
      .select("*")
      .in("id", mentorIds);

    setAllInvites(invites?.map(inv => ({
      ...inv,
      student: students?.find(s => s.id === inv.student_id),
      mentor: mentors?.find(m => m.id === inv.mentor_id)
    })) || []);
  };

  const handleSendInvite = async (targetId: string, targetName: string, score: number, reasons: string[]) => {
    if (!currentUserProfile) return;

    try {
      const isStudent = profile?.role === "STUDENT";
      const inviteData = {
        student_id: isStudent ? currentUserProfile.id : targetId,
        mentor_id: isStudent ? targetId : currentUserProfile.id,
        score,
        reasons,
        status: 'proposed',
        created_by: isStudent ? 'student' : 'mentor',
      };

      const { error } = await supabase
        .from("invites")
        .insert(inviteData);

      if (error) throw error;

      toast.success(`Match request sent to ${targetName}!`);
      await loadData();
    } catch (error: any) {
      console.error("Error sending invite:", error);
      if (error.code === '23505') {
        toast.error("You've already sent a request to this person");
      } else {
        toast.error("Failed to send invite. Please try again.");
      }
    }
  };

  const handleAcceptInvite = async (inviteId: string) => {
    try {
      const isStudent = profile?.role === "STUDENT";
      const updateData = isStudent
        ? { accepted_by_student: true, status: 'accepted_by_student' }
        : { accepted_by_mentor: true, status: 'accepted_by_mentor' };

      const { error } = await supabase
        .from("invites")
        .update(updateData)
        .eq("id", inviteId);

      if (error) throw error;

      toast.success("Match accepted! Awaiting facilitator approval.");
      await loadData();
    } catch (error: any) {
      console.error("Error accepting invite:", error);
      toast.error("Failed to accept invite. Please try again.");
    }
  };

  const handleRejectInvite = async (inviteId: string) => {
    try {
      const isStudent = profile?.role === "STUDENT";
      const status = isStudent ? 'rejected_by_student' : 'rejected_by_mentor';

      const { error } = await supabase
        .from("invites")
        .update({ status })
        .eq("id", inviteId);

      if (error) throw error;

      toast.info("Match declined.");
      await loadData();
    } catch (error: any) {
      console.error("Error rejecting invite:", error);
      toast.error("Failed to reject invite. Please try again.");
    }
  };

  const handleFacilitatorAction = async (inviteId: string, action: 'approve' | 'reject' | 'notify') => {
    try {
      if (action === 'approve') {
        const { error } = await supabase
          .from("invites")
          .update({ status: 'confirmed' })
          .eq("id", inviteId);

        if (error) throw error;
        toast.success("Match confirmed!");
      } else if (action === 'reject') {
        const { error } = await supabase
          .from("invites")
          .update({ status: 'rejected_by_facilitator' })
          .eq("id", inviteId);

        if (error) throw error;
        toast.info("Match rejected.");
      } else if (action === 'notify') {
        // Here you could send notifications
        toast.success("Notification sent to evaluate the match!");
      }

      await loadData();
    } catch (error: any) {
      console.error("Error with facilitator action:", error);
      toast.error("Failed to perform action. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-lg text-muted-foreground">Loading matches...</p>
        </div>
      </div>
    );
  }

  // Render for Facilitators
  if (profile?.role === "FACILITATOR") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Match Management</h1>
              <p className="text-muted-foreground">Review and manage all mentorship matches</p>
            </div>

            <Tabs defaultValue="pending" className="space-y-6">
              <TabsList>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="accepted">Accepted</TabsTrigger>
                <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>

              {['pending', 'accepted', 'confirmed', 'rejected'].map(status => (
                <TabsContent key={status} value={status} className="space-y-4">
                  {allInvites
                    .filter(inv => {
                      if (status === 'pending') return inv.status === 'proposed';
                      if (status === 'accepted') return inv.status.includes('accepted_by');
                      if (status === 'confirmed') return inv.status === 'confirmed';
                      if (status === 'rejected') return inv.status.includes('rejected');
                      return false;
                    })
                    .map(invite => (
                      <Card key={invite.id} className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                              <div>
                                <h3 className="font-bold text-lg">
                                  {invite.student?.first_name} {invite.student?.last_name}
                                </h3>
                                <p className="text-sm text-muted-foreground">Student</p>
                              </div>
                              <Users className="w-6 h-6 text-muted-foreground" />
                              <div>
                                <h3 className="font-bold text-lg">
                                  {invite.mentor?.first_name} {invite.mentor?.last_name}
                                </h3>
                                <p className="text-sm text-muted-foreground">Mentor</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {new Date(invite.created_at).toLocaleDateString()}
                              </div>
                              <Badge variant="outline">{invite.score}% Match</Badge>
                              <Badge>{invite.created_by}</Badge>
                            </div>

                            {invite.reasons && invite.reasons.length > 0 && (
                              <div className="space-y-1">
                                <p className="text-sm font-semibold">Match Reasons:</p>
                                {invite.reasons.map((reason: string, idx: number) => (
                                  <div key={idx} className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span>{reason}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2">
                            {status === 'pending' && (
                              <Button
                                onClick={() => handleFacilitatorAction(invite.id, 'notify')}
                                variant="outline"
                                size="sm"
                              >
                                Notify to Evaluate
                              </Button>
                            )}
                            {status === 'accepted' && (
                              <>
                                <Button
                                  onClick={() => handleFacilitatorAction(invite.id, 'approve')}
                                  size="sm"
                                  className="gap-2"
                                >
                                  <ThumbsUp className="w-4 h-4" />
                                  Approve Match
                                </Button>
                                <Button
                                  onClick={() => handleFacilitatorAction(invite.id, 'reject')}
                                  variant="destructive"
                                  size="sm"
                                  className="gap-2"
                                >
                                  <ThumbsDown className="w-4 h-4" />
                                  Reject Match
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}

                  {allInvites.filter(inv => {
                    if (status === 'pending') return inv.status === 'proposed';
                    if (status === 'accepted') return inv.status.includes('accepted_by');
                    if (status === 'confirmed') return inv.status === 'confirmed';
                    if (status === 'rejected') return inv.status.includes('rejected');
                    return false;
                  }).length === 0 && (
                    <Card className="p-12 text-center">
                      <p className="text-muted-foreground">No matches in this category</p>
                    </Card>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </div>
    );
  }

  // Render for Students and Mentors
  const isStudent = profile?.role === "STUDENT";
  const targetType = isStudent ? "mentor" : "student";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Find Your {isStudent ? "Mentor" : "Mentee"}</h1>
            <p className="text-muted-foreground">
              {isStudent 
                ? "Connect with experienced mentors who can guide your journey" 
                : "Find motivated students to mentor and inspire"}
            </p>
          </div>

          <Tabs defaultValue="discover" className="space-y-6">
            <TabsList>
              <TabsTrigger value="discover">Discover</TabsTrigger>
              <TabsTrigger value="received">
                Received ({receivedInvites.length})
              </TabsTrigger>
              <TabsTrigger value="sent">
                Sent ({sentInvites.length})
              </TabsTrigger>
            </TabsList>

            {/* Discover Tab */}
            <TabsContent value="discover" className="space-y-6">
              {availableMatches.length === 0 ? (
                <Card className="p-12 text-center">
                  <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">No matches found</h2>
                  <p className="text-muted-foreground">
                    Check back later for new {targetType}s!
                  </p>
                </Card>
              ) : (
                availableMatches.map((match: any) => {
                  const profile = isStudent ? match.mentor : match.student;
                  const alreadySent = sentInvites.some(inv => 
                    isStudent ? inv.mentor_id === profile.id : inv.student_id === profile.id
                  );

                  return (
                    <Card key={profile.id} className="p-6 card-hover">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-2xl font-bold">
                                {profile.first_name} {profile.last_name}
                              </h3>
                              {profile.role && (
                                <p className="text-muted-foreground">
                                  {profile.role} {profile.employer && `at ${profile.employer}`}
                                </p>
                              )}
                              {profile.school && (
                                <p className="text-muted-foreground">{profile.school}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10">
                              <Sparkles className="w-4 h-4 text-primary" />
                              <span className="font-bold text-primary">{match.score}% Match</span>
                            </div>
                          </div>

                          {profile.bio && (
                            <p className="text-sm text-muted-foreground mb-4">{profile.bio}</p>
                          )}

                          {/* Skills/Interests */}
                          <div className="mb-4">
                            <p className="text-sm font-semibold mb-2">
                              {isStudent ? "Skills & Expertise" : "Interests"}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {(isStudent ? profile.skills : profile.interests)?.slice(0, 5).map((item: string) => (
                                <Badge key={item} variant="outline">{item}</Badge>
                              ))}
                            </div>
                          </div>

                          {/* Languages */}
                          <div className="mb-4">
                            <p className="text-sm font-semibold mb-2">Languages</p>
                            <div className="flex flex-wrap gap-2">
                              {profile.languages?.map((lang: string) => (
                                <Badge key={lang} variant="secondary">{lang}</Badge>
                              ))}
                            </div>
                          </div>

                          {/* Match Reasons */}
                          <div>
                            <p className="text-sm font-semibold mb-2">Why this match?</p>
                            <div className="space-y-1">
                              {match.reasons.map((reason: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  <span>{reason}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="md:w-40">
                          {alreadySent ? (
                            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 text-green-700 font-semibold text-sm">
                              <CheckCircle className="w-5 h-5" />
                              <span>Invite Sent</span>
                            </div>
                          ) : (
                            <Button
                              onClick={() => handleSendInvite(
                                profile.id,
                                `${profile.first_name} ${profile.last_name}`,
                                match.score,
                                match.reasons
                              )}
                              className="w-full btn-primary gap-2"
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

            {/* Received Invites Tab */}
            <TabsContent value="received" className="space-y-4">
              {receivedInvites.length === 0 ? (
                <Card className="p-12 text-center">
                  <UserCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">No invites yet</h2>
                  <p className="text-muted-foreground">
                    You'll see invites from {targetType}s here
                  </p>
                </Card>
              ) : (
                receivedInvites.map(invite => {
                  const profile = isStudent ? invite.mentor : invite.student;
                  
                  return (
                    <Card key={invite.id} className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-1">
                            {profile?.first_name} {profile?.last_name}
                          </h3>
                          {profile?.role && (
                            <p className="text-muted-foreground mb-4">
                              {profile.role} {profile.employer && `at ${profile.employer}`}
                            </p>
                          )}
                          
                          <Badge variant="outline" className="mb-4">{invite.score}% Match</Badge>

                          {invite.reasons && invite.reasons.length > 0 && (
                            <div className="space-y-1">
                              {invite.reasons.map((reason: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  <span>{reason}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAcceptInvite(invite.id)}
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
                  );
                })
              )}
            </TabsContent>

            {/* Sent Invites Tab */}
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
                        <h3 className="text-lg font-bold mb-1">
                          Invite sent
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(invite.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge>
                        {invite.status === 'proposed' ? 'Pending' :
                         invite.status.includes('accepted') ? 'Accepted' :
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
    </div>
  );
};

export default Match;
