import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, MapPin, Briefcase, GraduationCap, Languages, Heart, Trophy, Edit, Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";

const LANGUAGE_OPTIONS = [
  "English", "Spanish", "French", "German", "Mandarin", "Swedish", "Arabic",
  "Portuguese", "Italian", "Russian", "Japanese", "Korean", "Hindi", "Dutch",
  "Polish", "Turkish", "Norwegian", "Danish", "Finnish", "Other"
];

const INTEREST_OPTIONS = [
  "📰 News", "⚽ Sports", "🎵 Music", "💃 Dance", "⭐ Celebrity", "💑 Relationships",
  "🎬 Movies & TV", "💻 Technology", "💼 Business & Finance", "🪙 Cryptocurrency",
  "🎯 Career", "🎮 Gaming", "💪 Health & Fitness", "✈️ Travel", "🍕 Food",
  "💄 Beauty", "👗 Fashion", "🌲 Nature & Outdoors", "🐾 Pets", "🏡 Home & Garden",
  "🎨 Art", "🎌 Anime", "😂 Memes", "📚 Education", "🔬 Science", "🕊️ Religion",
  "🛍️ Shopping", "🚗 Cars", "✈️ Aviation", "🏍️ Motorcycles"
];

const SUBJECT_OPTIONS = [
  "🔢 Mathematics", "🔬 Science", "💻 Technology", "⚙️ Engineering",
  "📖 English", "📜 History", "🌍 Geography", "🎨 Art", "🎵 Music", "🏃 Physical Education"
];

const HOBBY_OPTIONS = [
  "📚 Reading", "🎮 Gaming", "🍳 Cooking", "✈️ Travel", "📸 Photography",
  "💪 Fitness", "🤝 Volunteering", "🌱 Gardening", "🔨 DIY Projects", "🏆 Collecting"
];

const SWEDISH_CITIES = [
  "Stockholm", "Gothenburg", "Malmö", "Uppsala", "Västerås", "Örebro",
  "Linköping", "Helsingborg", "Jönköping", "Norrköping", "Lund", "Umeå", "Gävle", "Other"
];

const Profile = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<any>(null);
  const [editedData, setEditedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!user || !profile) {
      navigate("/auth/login");
      return;
    }

    fetchProfile();
  }, [user, profile, navigate]);

  const fetchProfile = async () => {
    try {
      let data = null;
      
      if (profile?.role === "STUDENT") {
        const { data: studentData, error } = await supabase
          .from("students")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (error) throw error;
        data = studentData;
      } else if (profile?.role === "MENTOR") {
        const { data: mentorData, error } = await supabase
          .from("mentors")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (error) throw error;
        data = mentorData;
      } else if (profile?.role === "FACILITATOR") {
        const { data: facilitatorData, error } = await supabase
          .from("facilitators")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (error) throw error;
        data = facilitatorData;
      }

      setProfileData(data);
      setEditedData(data);
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditedData({ ...profileData });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedData({ ...profileData });
    setIsEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const tableName = profile?.role === "STUDENT" ? "students" :
                        profile?.role === "MENTOR" ? "mentors" : "facilitators";

      const { error } = await supabase
        .from(tableName)
        .update(editedData)
        .eq("user_id", user.id);

      if (error) throw error;

      setProfileData({ ...editedData });
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setEditedData((prev: any) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: string, value: string) => {
    setEditedData((prev: any) => {
      const array = prev[field] || [];
      const exists = array.includes(value);
      return {
        ...prev,
        [field]: exists
          ? array.filter((item: string) => item !== value)
          : [...array, value],
      };
    });
  };

  const getEducationLabel = (level: string) => {
    const labels: Record<string, string> = {
      middle_school: "Middle School",
      high_school: "High School",
      university: "University",
      bachelor: "Bachelor",
      master: "Master",
      phd: "PhD",
      any: "Any",
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

  const displayData = isEditing ? editedData : profileData;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header with Edit Button */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">My Profile</h1>
            {!isEditing ? (
              <Button onClick={handleEdit} className="gap-2">
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleCancel} variant="outline" className="gap-2">
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </div>

          {/* Basic Information */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>First Name *</Label>
                {isEditing ? (
                  <Input
                    value={displayData.first_name || displayData.name || ""}
                    onChange={(e) => handleInputChange("first_name", e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-muted-foreground">{displayData.first_name || displayData.name}</p>
                )}
              </div>
              <div>
                <Label>Last Name *</Label>
                {isEditing ? (
                  <Input
                    value={displayData.last_name || ""}
                    onChange={(e) => handleInputChange("last_name", e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-muted-foreground">{displayData.last_name}</p>
                )}
              </div>
              <div>
                <Label>Email *</Label>
                <p className="mt-1 text-muted-foreground">{displayData.email}</p>
              </div>
              <div>
                <Label>City *</Label>
                {isEditing ? (
                  <Select value={displayData.city || ""} onValueChange={(value) => handleInputChange("city", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {SWEDISH_CITIES.map((city) => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="mt-1 text-muted-foreground">{displayData.city}</p>
                )}
              </div>
              <div>
                <Label>Postcode</Label>
                {isEditing ? (
                  <Input
                    value={displayData.postcode || ""}
                    onChange={(e) => handleInputChange("postcode", e.target.value)}
                    placeholder="e.g., 123 45"
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-muted-foreground">{displayData.postcode || "—"}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Languages */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Languages className="w-5 h-5" />
              Languages
            </h2>
            {isEditing ? (
              <div className="flex flex-wrap gap-2">
                {LANGUAGE_OPTIONS.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleArrayItem("languages", lang)}
                    className={`tag-chip transition-all ${
                      displayData.languages?.includes(lang)
                        ? "bg-accent text-primary border-2 border-primary font-semibold scale-105"
                        : "border border-border hover:border-accent"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {displayData.languages?.map((language: string) => (
                  <Badge key={language} variant="secondary">{language}</Badge>
                ))}
              </div>
            )}
          </Card>

          {/* Student-specific sections */}
          {profile?.role === "STUDENT" && (
            <>
              <Card className="p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Education</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Education Level *</Label>
                    {isEditing ? (
                      <Select value={displayData.education_level || ""} onValueChange={(value) => handleInputChange("education_level", value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="middle_school">Middle School</SelectItem>
                          <SelectItem value="high_school">High School</SelectItem>
                          <SelectItem value="university">University</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="mt-1 text-muted-foreground">{getEducationLabel(displayData.education_level)}</p>
                    )}
                  </div>
                  <div>
                    <Label>School</Label>
                    {isEditing ? (
                      <Input
                        value={displayData.school || ""}
                        onChange={(e) => handleInputChange("school", e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-muted-foreground">{displayData.school || "—"}</p>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="p-6 mb-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Interests *
                </h2>
                {isEditing ? (
                  <div className="flex flex-wrap gap-2">
                    {INTEREST_OPTIONS.map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleArrayItem("interests", interest)}
                        className={`tag-chip transition-all ${
                          displayData.interests?.includes(interest)
                            ? "bg-accent text-primary border-2 border-primary font-semibold scale-105"
                            : "border border-border hover:border-accent"
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {displayData.interests?.map((interest: string) => (
                      <Badge key={interest} variant="outline">{interest}</Badge>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="p-6 mb-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Favorite Subjects *
                </h2>
                {isEditing ? (
                  <div className="flex flex-wrap gap-2">
                    {SUBJECT_OPTIONS.map((subject) => (
                      <button
                        key={subject}
                        type="button"
                        onClick={() => toggleArrayItem("subjects", subject)}
                        className={`tag-chip transition-all ${
                          displayData.subjects?.includes(subject)
                            ? "bg-accent text-primary border-2 border-primary font-semibold scale-105"
                            : "border border-border hover:border-accent"
                        }`}
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {displayData.subjects?.map((subject: string) => (
                      <Badge key={subject} variant="outline">{subject}</Badge>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">About Me</h2>
                <div className="space-y-4">
                  <div>
                    <Label>Tell us about yourself</Label>
                    {isEditing ? (
                      <Textarea
                        value={displayData.bio || ""}
                        onChange={(e) => handleInputChange("bio", e.target.value)}
                        placeholder="Share something about yourself..."
                        className="mt-1 min-h-[100px]"
                        maxLength={500}
                      />
                    ) : (
                      <p className="mt-1 text-muted-foreground">{displayData.bio || "—"}</p>
                    )}
                  </div>
                  <div>
                    <Label>Your Goals</Label>
                    {isEditing ? (
                      <Textarea
                        value={displayData.goals || ""}
                        onChange={(e) => handleInputChange("goals", e.target.value)}
                        placeholder="What do you want to achieve?"
                        className="mt-1 min-h-[100px]"
                        maxLength={500}
                      />
                    ) : (
                      <p className="mt-1 text-muted-foreground">{displayData.goals || "—"}</p>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Meeting Preferences</h2>
                <div>
                  <Label>Meeting Type *</Label>
                  {isEditing ? (
                    <Select value={displayData.meeting_pref || "online"} onValueChange={(value) => handleInputChange("meeting_pref", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="in_person">In Person</SelectItem>
                        <SelectItem value="both">Either</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="mt-1 text-muted-foreground">
                      {displayData.meeting_pref === "in_person" ? "In Person" :
                       displayData.meeting_pref === "online" ? "Online" : "Either"}
                    </p>
                  )}
                </div>
              </Card>
            </>
          )}

          {/* Mentor-specific sections */}
          {profile?.role === "MENTOR" && (
            <>
              <Card className="p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Professional Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Employer</Label>
                    {isEditing ? (
                      <Input
                        value={displayData.employer || ""}
                        onChange={(e) => handleInputChange("employer", e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-muted-foreground">{displayData.employer || "—"}</p>
                    )}
                  </div>
                  <div>
                    <Label>Role</Label>
                    {isEditing ? (
                      <Input
                        value={displayData.role || ""}
                        onChange={(e) => handleInputChange("role", e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-muted-foreground">{displayData.role || "—"}</p>
                    )}
                  </div>
                  <div>
                    <Label>Education Level</Label>
                    {isEditing ? (
                      <Select value={displayData.education_level || ""} onValueChange={(value) => handleInputChange("education_level", value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high_school">High School</SelectItem>
                          <SelectItem value="bachelor">Bachelor</SelectItem>
                          <SelectItem value="master">Master</SelectItem>
                          <SelectItem value="phd">PhD</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="mt-1 text-muted-foreground">{getEducationLabel(displayData.education_level) || "—"}</p>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="p-6 mb-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Skills & Interests *
                </h2>
                {isEditing ? (
                  <div className="flex flex-wrap gap-2">
                    {INTEREST_OPTIONS.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleArrayItem("skills", skill)}
                        className={`tag-chip transition-all ${
                          displayData.skills?.includes(skill)
                            ? "bg-accent text-primary border-2 border-primary font-semibold scale-105"
                            : "border border-border hover:border-accent"
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {displayData.skills?.map((skill: string) => (
                      <Badge key={skill} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="p-6 mb-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Hobbies
                </h2>
                {isEditing ? (
                  <div className="flex flex-wrap gap-2">
                    {HOBBY_OPTIONS.map((hobby) => (
                      <button
                        key={hobby}
                        type="button"
                        onClick={() => toggleArrayItem("hobbies", hobby)}
                        className={`tag-chip transition-all ${
                          displayData.hobbies?.includes(hobby)
                            ? "bg-accent text-primary border-2 border-primary font-semibold scale-105"
                            : "border border-border hover:border-accent"
                        }`}
                      >
                        {hobby}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {displayData.hobbies?.map((hobby: string) => (
                      <Badge key={hobby} variant="outline">{hobby}</Badge>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">About Me</h2>
                <div className="space-y-4">
                  <div>
                    <Label>Bio</Label>
                    {isEditing ? (
                      <Textarea
                        value={displayData.bio || ""}
                        onChange={(e) => handleInputChange("bio", e.target.value)}
                        placeholder="Tell mentees about yourself..."
                        className="mt-1 min-h-[100px]"
                        maxLength={500}
                      />
                    ) : (
                      <p className="mt-1 text-muted-foreground">{displayData.bio || "—"}</p>
                    )}
                  </div>
                  <div>
                    <Label>Personal Story</Label>
                    {isEditing ? (
                      <Textarea
                        value={displayData.talk_about_yourself || ""}
                        onChange={(e) => handleInputChange("talk_about_yourself", e.target.value)}
                        placeholder="Share your story..."
                        className="mt-1 min-h-[100px]"
                        maxLength={500}
                      />
                    ) : (
                      <p className="mt-1 text-muted-foreground">{displayData.talk_about_yourself || "—"}</p>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Links</h2>
                <div className="space-y-4">
                  <div>
                    <Label>LinkedIn URL</Label>
                    {isEditing ? (
                      <Input
                        value={displayData.linkedin_url || ""}
                        onChange={(e) => handleInputChange("linkedin_url", e.target.value)}
                        placeholder="https://linkedin.com/in/yourprofile"
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-muted-foreground">{displayData.linkedin_url || "—"}</p>
                    )}
                  </div>
                  <div>
                    <Label>CV URL</Label>
                    {isEditing ? (
                      <Input
                        value={displayData.cv_url || ""}
                        onChange={(e) => handleInputChange("cv_url", e.target.value)}
                        placeholder="Link to your CV"
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-muted-foreground">{displayData.cv_url || "—"}</p>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Mentoring Preferences</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Preferred Student Level</Label>
                    {isEditing ? (
                      <Select value={displayData.age_pref || "any"} onValueChange={(value) => handleInputChange("age_pref", value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any</SelectItem>
                          <SelectItem value="middle_school">Middle School</SelectItem>
                          <SelectItem value="high_school">High School</SelectItem>
                          <SelectItem value="university">University</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="mt-1 text-muted-foreground">{getEducationLabel(displayData.age_pref)}</p>
                    )}
                  </div>
                  <div>
                    <Label>Meeting Type *</Label>
                    {isEditing ? (
                      <Select value={displayData.meeting_pref || "both"} onValueChange={(value) => handleInputChange("meeting_pref", value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="online">Online</SelectItem>
                          <SelectItem value="in_person">In Person</SelectItem>
                          <SelectItem value="both">Either</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="mt-1 text-muted-foreground">
                        {displayData.meeting_pref === "in_person" ? "In Person" :
                         displayData.meeting_pref === "online" ? "Online" : "Either"}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Max Students</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        min="1"
                        value={displayData.max_students || 1}
                        onChange={(e) => handleInputChange("max_students", parseInt(e.target.value))}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-muted-foreground">{displayData.max_students}</p>
                    )}
                  </div>
                </div>
              </Card>
            </>
          )}

          {/* Facilitator-specific sections */}
          {profile?.role === "FACILITATOR" && (
            <>
              <Card className="p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Organization</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Organization *</Label>
                    {isEditing ? (
                      <Input
                        value={displayData.org || ""}
                        onChange={(e) => handleInputChange("org", e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-muted-foreground">{displayData.org}</p>
                    )}
                  </div>
                  <div>
                    <Label>Role *</Label>
                    {isEditing ? (
                      <Input
                        value={displayData.role || ""}
                        onChange={(e) => handleInputChange("role", e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-muted-foreground">{displayData.role}</p>
                    )}
                  </div>
                  <div>
                    <Label>Max Matches</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        min="1"
                        value={displayData.max_matches || 10}
                        onChange={(e) => handleInputChange("max_matches", parseInt(e.target.value))}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-muted-foreground">{displayData.max_matches}</p>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Notes</h2>
                {isEditing ? (
                  <Textarea
                    value={displayData.notes || ""}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Any additional notes..."
                    className="mt-1 min-h-[100px]"
                  />
                ) : (
                  <p className="text-muted-foreground">{displayData.notes || "—"}</p>
                )}
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
