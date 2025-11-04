import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { mentorOnboardingSchema } from "@/lib/validationSchemas";
import logo from "@/assets/logo.png";

const SKILL_OPTIONS = [
  "💻 Technology",
  "🎨 Art & Design",
  "🎵 Music",
  "⚽ Sports",
  "🏥 Healthcare",
  "🌍 Environment",
  "📚 Education",
  "💼 Business",
  "🔬 Science",
  "🎬 Media",
  "Mathematics",
  "Engineering",
  "Writing",
  "Leadership",
];

const HOBBY_OPTIONS = [
  "Reading",
  "Gaming",
  "Cooking",
  "Travel",
  "Photography",
  "Fitness",
  "Volunteering",
  "Gardening",
  "DIY Projects",
  "Collecting",
];

const LANGUAGE_OPTIONS = [
  "English",
  "Spanish",
  "French",
  "German",
  "Mandarin",
  "Swedish",
  "Arabic",
  "Other",
];

const MentorOnboarding = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: profile?.email || "",
    employer: "",
    role: "",
    bio: "",
    skills: [] as string[],
    hobbies: [] as string[],
    languages: [] as string[],
    agePref: "either",
    meetingPref: "either",
    maxStudents: "3",
    linkedinUrl: "",
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: "skills" | "hobbies" | "languages", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("You must be logged in to continue");
      return;
    }

    try {
      const validated = mentorOnboardingSchema.parse({
        ...formData,
        maxStudents: parseInt(formData.maxStudents),
        email: profile?.email || formData.email,
      });

      const { error } = await supabase
        .from("mentors")
        .insert({
          user_id: user.id,
          first_name: validated.firstName,
          last_name: validated.lastName,
          email: validated.email,
          employer: validated.employer || null,
          role: validated.role || null,
          bio: validated.bio || null,
          skills: validated.skills,
          hobbies: validated.hobbies || [],
          languages: validated.languages,
          age_pref: validated.agePref,
          meeting_pref: validated.meetingPref,
          max_students: validated.maxStudents,
          linkedin_url: validated.linkedinUrl || null,
        });

      if (error) throw error;

      toast.success("Thank you! Your mentor profile has been created successfully!");
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error: any) {
      console.error("Error creating mentor profile:", error);
      if (error.name === 'ZodError') {
        toast.error(error.issues[0].message);
      } else {
        toast.error(error.message || "Failed to create profile. Please try again.");
      }
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
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Become a Mentor 🌟</h1>
            <p className="text-xl text-muted-foreground">
              Share your experience and help guide the next generation
            </p>
          </div>

          <div className="space-y-8">
            {/* Basic Information */}
            <div className="bg-card p-8 rounded-3xl border">
              <h2 className="text-2xl font-bold mb-6">Basic Information</h2>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="Your first name"
                      className="mt-1 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Your last name"
                      className="mt-1 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="employer">Employer</Label>
                    <Input
                      id="employer"
                      value={formData.employer}
                      onChange={(e) => handleInputChange("employer", e.target.value)}
                      placeholder="Where do you work?"
                      className="mt-1 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Your Role</Label>
                    <Input
                      id="role"
                      value={formData.role}
                      onChange={(e) => handleInputChange("role", e.target.value)}
                      placeholder="e.g., Software Engineer"
                      className="mt-1 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Short Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Tell us about yourself and why you want to be a mentor..."
                    className="mt-1 min-h-[100px] rounded-xl"
                    maxLength={500}
                  />
                </div>

                <div>
                  <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                  <Input
                    id="linkedinUrl"
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => handleInputChange("linkedinUrl", e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="mt-1 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Expertise */}
            <div className="bg-card p-8 rounded-3xl border">
              <h2 className="text-2xl font-bold mb-6">Your Expertise</h2>
              <div className="space-y-6">
                <div>
                  <Label className="mb-3 block">Skills & Professional Interests *</Label>
                  <div className="flex flex-wrap gap-2">
                    {SKILL_OPTIONS.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleArrayItem("skills", skill)}
                        className={`tag-chip transition-all ${
                          formData.skills.includes(skill)
                            ? "bg-primary text-primary-foreground"
                            : ""
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block">Hobbies & Personal Interests</Label>
                  <div className="flex flex-wrap gap-2">
                    {HOBBY_OPTIONS.map((hobby) => (
                      <button
                        key={hobby}
                        type="button"
                        onClick={() => toggleArrayItem("hobbies", hobby)}
                        className={`tag-chip transition-all ${
                          formData.hobbies.includes(hobby)
                            ? "bg-accent text-accent-foreground"
                            : ""
                        }`}
                      >
                        {hobby}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block">Languages you speak *</Label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGE_OPTIONS.map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleArrayItem("languages", lang)}
                        className={`tag-chip transition-all ${
                          formData.languages.includes(lang)
                            ? "bg-accent text-accent-foreground"
                            : ""
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Mentoring Preferences */}
            <div className="bg-card p-8 rounded-3xl border">
              <h2 className="text-2xl font-bold mb-6">Mentoring Preferences</h2>
              <div className="space-y-6">
                <div>
                  <Label className="mb-3 block">Preferred Student Age/Grade</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => handleInputChange("agePref", "8")}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.agePref === "8"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-medium">Grade 8</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange("agePref", "9")}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.agePref === "9"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-medium">Grade 9</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange("agePref", "either")}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.agePref === "either"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-medium">Either</div>
                    </button>
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block">Meeting Preference</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => handleInputChange("meetingPref", "online")}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.meetingPref === "online"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="text-2xl mb-2">💻</div>
                      <div className="font-medium">Online</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange("meetingPref", "in_person")}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.meetingPref === "in_person"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="text-2xl mb-2">🤝</div>
                      <div className="font-medium">In Person</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange("meetingPref", "either")}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.meetingPref === "either"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="text-2xl mb-2">✨</div>
                      <div className="font-medium">Either</div>
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="maxStudents">Maximum Number of Students *</Label>
                  <Input
                    id="maxStudents"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.maxStudents}
                    onChange={(e) => handleInputChange("maxStudents", e.target.value)}
                    className="mt-1 rounded-xl"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    How many students can you mentor at once? (1-10)
                  </p>
                </div>
              </div>
            </div>

            <Button onClick={handleSubmit} className="btn-primary w-full h-14 text-lg">
              Complete Mentor Profile
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorOnboarding;
