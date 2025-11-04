import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Users, Bell, Calendar, ThumbsUp, ThumbsDown, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { ScoreBar } from "@/components/match/ScoreBar";
import { ReasonChips } from "@/components/match/ReasonChips";
import { MeetingModal } from "@/components/match/MeetingModal";
import { Skeleton } from "@/components/ui/skeleton";

const FacilitatorMatches = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [facilitatorProfile, setFacilitatorProfile] = useState<any>(null);
  const [allInvites, setAllInvites] = useState<any[]>([]);
  const [filteredInvites, setFilteredInvites] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSchool, setFilterSchool] = useState<string>("all");
  const [meetingModal, setMeetingModal] = useState<{ open: boolean; studentId: string; mentorId: string } | null>(null);

  useEffect(() => {
    if (!user || !profile) {
      toast.error("Please log in to continue");
      navigate("/auth/login");
      return;
    }

    if (profile.role !== "FACILITATOR") {
      navigate("/match");
      return;
    }

    loadData();
  }, [user, profile, navigate]);

  useEffect(() => {
    applyFilters();
  }, [allInvites, filterStatus, filterSchool]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: facilitatorData, error: facilitatorError } = await supabase
        .from("facilitators")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (facilitatorError) throw facilitatorError;
      if (!facilitatorData) {
        toast.error("Please complete your facilitator profile first");
        navigate("/onboarding/facilitator");
        return;
      }

      setFacilitatorProfile(facilitatorData);

      const { data: invites, error: invitesError } = await supabase
        .from("invites")
        .select("*")
        .order("created_at", { ascending: false });

      if (invitesError) throw invitesError;

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

      const invitesWithDetails = invites?.map(inv => ({
        ...inv,
        student: students?.find(s => s.id === inv.student_id),
        mentor: mentors?.find(m => m.id === inv.mentor_id)
      })) || [];

      setAllInvites(invitesWithDetails);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allInvites];

    if (filterStatus !== "all") {
      filtered = filtered.filter(inv => {
        if (filterStatus === "waiting") return inv.status === 'proposed';
        if (filterStatus === "accepted") return inv.status.includes('accepted_by');
        if (filterStatus === "confirmed") return inv.status === 'confirmed';
        if (filterStatus === "rejected") return inv.status.includes('rejected');
        return true;
      });
    }

    if (filterSchool !== "all") {
      filtered = filtered.filter(inv => inv.student?.school === filterSchool);
    }

    setFilteredInvites(filtered);
  };

  const handleApprove = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from("invites")
        .update({ status: 'confirmed' })
        .eq("id", inviteId);

      if (error) throw error;
      toast.success("Match confirmed!");
      await loadData();
    } catch (error: any) {
      console.error("Error approving match:", error);
      toast.error("Failed to approve match. Please try again.");
    }
  };

  const handleReject = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from("invites")
        .update({ status: 'rejected_by_facilitator' })
        .eq("id", inviteId);

      if (error) throw error;
      toast.info("Match rejected.");
      await loadData();
    } catch (error: any) {
      console.error("Error rejecting match:", error);
      toast.error("Failed to reject match. Please try again.");
    }
  };

  const handleNudge = async (inviteId: string, target: 'student' | 'mentor') => {
    // In a real implementation, this would send a notification
    toast.success(`Reminder sent to ${target}!`);
  };

  const handleBookMeeting = (studentId: string, mentorId: string) => {
    setMeetingModal({ open: true, studentId, mentorId });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-7xl mx-auto space-y-6">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-6 w-96" />
            <div className="space-y-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const schools = [...new Set(allInvites.map(inv => inv.student?.school).filter(Boolean))];
  const waitingForResponse = allInvites.filter(inv => 
    inv.status === 'proposed' || inv.status.includes('accepted_by')
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Match Management Console</h1>
            <p className="text-muted-foreground text-lg">
              Supervise and facilitate all mentorship connections
            </p>

            <div className="flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 w-fit">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                {waitingForResponse} matches need attention
              </span>
            </div>
          </div>

          <div className="mb-6 flex gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="waiting">Waiting for Response</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Select value={filterSchool} onValueChange={setFilterSchool}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by school" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schools</SelectItem>
                {schools.map(school => (
                  <SelectItem key={school} value={school as string}>{school}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredInvites.length === 0 ? (
              <Card className="p-12 text-center">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">No matches found</h2>
                <p className="text-muted-foreground">
                  Adjust your filters or wait for new matches
                </p>
              </Card>
            ) : (
              filteredInvites.map(invite => {
                const daysSinceUpdate = Math.floor(
                  (new Date().getTime() - new Date(invite.updated_at).getTime()) / (1000 * 60 * 60 * 24)
                );
                const needsNudge = daysSinceUpdate > 2 && invite.status !== 'confirmed';

                return (
                  <Card key={invite.id} className="p-6">
                    <div className="flex gap-6">
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback>
                            {invite.student?.first_name?.[0]}{invite.student?.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-bold">
                            {invite.student?.first_name} {invite.student?.last_name}
                          </h4>
                          <p className="text-sm text-muted-foreground">{invite.student?.school}</p>
                        </div>
                      </div>

                      <Users className="w-6 h-6 text-muted-foreground flex-shrink-0" />

                      <div className="flex items-center gap-4 flex-1">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback>
                            {invite.mentor?.first_name?.[0]}{invite.mentor?.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-bold">
                            {invite.mentor?.first_name} {invite.mentor?.last_name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {invite.mentor?.role} at {invite.mentor?.employer}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col justify-between items-end gap-3 min-w-[280px]">
                        <div className="flex items-center gap-3 w-full justify-end">
                          <ScoreBar score={invite.score} size="sm" />
                          <Badge variant={
                            invite.status === 'confirmed' ? 'default' :
                            invite.status.includes('accepted') ? 'secondary' :
                            invite.status === 'proposed' ? 'outline' : 'destructive'
                          }>
                            {invite.status === 'proposed' ? 'Pending' :
                             invite.status === 'accepted_by_student' ? 'Student accepted' :
                             invite.status === 'accepted_by_mentor' ? 'Mentor accepted' :
                             invite.status === 'confirmed' ? 'Confirmed' : 'Rejected'}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Updated {daysSinceUpdate}d ago</span>
                          {needsNudge && <Badge variant="outline" className="text-xs">Needs nudge</Badge>}
                        </div>

                        <div className="flex gap-2">
                          {invite.status.includes('accepted_by') && (
                            <>
                              <Button
                                onClick={() => handleApprove(invite.id)}
                                size="sm"
                                className="gap-1"
                              >
                                <ThumbsUp className="w-3 h-3" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleReject(invite.id)}
                                variant="destructive"
                                size="sm"
                                className="gap-1"
                              >
                                <ThumbsDown className="w-3 h-3" />
                                Reject
                              </Button>
                            </>
                          )}
                          
                          {invite.status === 'confirmed' && (
                            <Button
                              onClick={() => handleBookMeeting(invite.student_id, invite.mentor_id)}
                              size="sm"
                              variant="outline"
                              className="gap-1"
                            >
                              <Calendar className="w-3 h-3" />
                              Book Meeting
                            </Button>
                          )}

                          {needsNudge && invite.status !== 'confirmed' && (
                            <Button
                              onClick={() => handleNudge(
                                invite.id, 
                                invite.status === 'accepted_by_mentor' ? 'student' : 'mentor'
                              )}
                              size="sm"
                              variant="outline"
                              className="gap-1"
                            >
                              <Bell className="w-3 h-3" />
                              Nudge
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {invite.reasons && invite.reasons.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <ReasonChips reasons={invite.reasons} />
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>

      {meetingModal && (
        <MeetingModal
          open={meetingModal.open}
          onOpenChange={(open) => setMeetingModal(open ? meetingModal : null)}
          studentId={meetingModal.studentId}
          mentorId={meetingModal.mentorId}
          facilitatorId={facilitatorProfile?.id}
          onSuccess={loadData}
        />
      )}
    </div>
  );
};

export default FacilitatorMatches;
