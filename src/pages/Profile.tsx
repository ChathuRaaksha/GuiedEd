import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, MapPin, Briefcase, GraduationCap, Languages, Heart, Trophy, Calendar, FileText, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

const Profile = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !profile) {
      navigate("/auth/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        let data = null;
        
        if (profile.role === "STUDENT") {
          const { data: studentData, error } = await supabase
            .from("students")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();
          
          if (error) throw error;
          data = studentData;
        } else if (profile.role === "MENTOR") {
          const { data: mentorData, error } = await supabase
            .from("mentors")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();
          
          if (error) throw error;
          data = mentorData;
        } else if (profile.role === "FACILITATOR") {
          const { data: facilitatorData, error } = await supabase
            .from("facilitators")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();
          
          if (error) throw error;
          data = facilitatorData;
        }

        setProfileData(data);
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, profile, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getEducationLabel = (level: string) => {
    const labels: Record<string, string> = {
      middle_school: "Middle School",
      high_school: "High School",
      university: "University",
    };
    return labels[level] || level;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
          <p className="text-muted-foreground mb-6">
            Please complete your profile to continue.
          </p>
          <Button onClick={() => navigate(`/onboarding/${profile?.role?.toLowerCase()}`)}>
            Complete Profile
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border py-4 sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <img src={logo} alt="GuidEd" className="h-8 cursor-pointer" onClick={() => navigate("/")} />
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header Card */}
          <Card className="p-8 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {profileData.first_name || profileData.name} {profileData.last_name}
                  </h1>
                  <Badge variant="secondary" className="text-sm">
                    {profile?.role}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Contact Information */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Contact Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <span>{profileData.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <span>{profileData.city}{profileData.postcode ? `, ${profileData.postcode}` : ""}</span>
              </div>
            </div>
          </Card>

          {/* Student-specific sections */}
          {profile?.role === "STUDENT" && (
            <>
              <Card className="p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Education</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-5 h-5 text-muted-foreground" />
                    <span>{getEducationLabel(profileData.education_level)}</span>
                  </div>
                  {profileData.school && (
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-5 h-5 text-muted-foreground" />
                      <span>{profileData.school}</span>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Interests & Subjects</h2>
                <div className="space-y-4">
                  {profileData.interests && profileData.interests.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        Interests
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {profileData.interests.map((interest: string) => (
                          <Badge key={interest} variant="outline">{interest}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {profileData.subjects && profileData.subjects.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Trophy className="w-4 h-4" />
                        Subjects
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {profileData.subjects.map((subject: string) => (
                          <Badge key={subject} variant="outline">{subject}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {profileData.goals && (
                <Card className="p-6 mb-6">
                  <h2 className="text-xl font-bold mb-4">Goals</h2>
                  <p className="text-muted-foreground">{profileData.goals}</p>
                </Card>
              )}
            </>
          )}

          {/* Mentor-specific sections */}
          {profile?.role === "MENTOR" && (
            <>
              {(profileData.employer || profileData.role) && (
                <Card className="p-6 mb-6">
                  <h2 className="text-xl font-bold mb-4">Professional Information</h2>
                  <div className="space-y-3">
                    {profileData.employer && (
                      <div className="flex items-center gap-3">
                        <Briefcase className="w-5 h-5 text-muted-foreground" />
                        <span>{profileData.employer}</span>
                      </div>
                    )}
                    {profileData.role && (
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-muted-foreground" />
                        <span>{profileData.role}</span>
                      </div>
                    )}
                    {profileData.education_level && (
                      <div className="flex items-center gap-3">
                        <GraduationCap className="w-5 h-5 text-muted-foreground" />
                        <span>{getEducationLabel(profileData.education_level)}</span>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {profileData.bio && (
                <Card className="p-6 mb-6">
                  <h2 className="text-xl font-bold mb-4">About Me</h2>
                  <p className="text-muted-foreground">{profileData.bio}</p>
                </Card>
              )}

              <Card className="p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Skills & Hobbies</h2>
                <div className="space-y-4">
                  {profileData.skills && profileData.skills.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Trophy className="w-4 h-4" />
                        Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {profileData.skills.map((skill: string) => (
                          <Badge key={skill} variant="outline">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {profileData.hobbies && profileData.hobbies.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        Hobbies
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {profileData.hobbies.map((hobby: string) => (
                          <Badge key={hobby} variant="outline">{hobby}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Mentoring Preferences</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <span>Student Level: {getEducationLabel(profileData.age_pref)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <span>Meeting: {profileData.meeting_pref === "in_person" ? "In Person" : profileData.meeting_pref === "online" ? "Online" : "Either"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <span>Max Students: {profileData.max_students}</span>
                  </div>
                </div>
              </Card>

              {(profileData.linkedin_url || profileData.cv_url) && (
                <Card className="p-6 mb-6">
                  <h2 className="text-xl font-bold mb-4">Documents & Links</h2>
                  <div className="space-y-2">
                    {profileData.linkedin_url && (
                      <a href={profileData.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                        <User className="w-4 h-4" />
                        LinkedIn Profile
                      </a>
                    )}
                    {profileData.cv_url && (
                      <a href={profileData.cv_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                        <FileText className="w-4 h-4" />
                        View CV
                      </a>
                    )}
                  </div>
                </Card>
              )}
            </>
          )}

          {/* Facilitator-specific sections */}
          {profile?.role === "FACILITATOR" && (
            <>
              {(profileData.org || profileData.role) && (
                <Card className="p-6 mb-6">
                  <h2 className="text-xl font-bold mb-4">Organization</h2>
                  <div className="space-y-3">
                    {profileData.org && (
                      <div className="flex items-center gap-3">
                        <Briefcase className="w-5 h-5 text-muted-foreground" />
                        <span>{profileData.org}</span>
                      </div>
                    )}
                    {profileData.role && (
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-muted-foreground" />
                        <span>{profileData.role}</span>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              <Card className="p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Facilitator Settings</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <span>Max Matches: {profileData.max_matches}</span>
                  </div>
                </div>
              </Card>

              {profileData.notes && (
                <Card className="p-6 mb-6">
                  <h2 className="text-xl font-bold mb-4">Notes</h2>
                  <p className="text-muted-foreground">{profileData.notes}</p>
                </Card>
              )}
            </>
          )}

          {/* Languages (common for all) */}
          {profileData.languages && profileData.languages.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Languages className="w-5 h-5" />
                Languages
              </h2>
              <div className="flex flex-wrap gap-2">
                {profileData.languages.map((language: string) => (
                  <Badge key={language} variant="secondary">{language}</Badge>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
