import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ArrowLeft, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
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
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    employer: "",
    role: "",
    bio: "",
    skills: [] as string[],
    languages: [] as string[],
    agePref: "any",
    meetingPref: "both",
    maxStudents: "1",
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: "skills" | "languages", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.skills.length === 0 || formData.languages.length === 0) {
      toast.error("Please select at least one skill and language");
      return;
    }

    console.log("Mentor form submitted:", formData);
    toast.success("Thank you! Your mentor profile has been created. We'll be in touch soon!");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <img src={logo} alt="GuidEd" className="h-8" />
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Back to home
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-3">Become a Mentor</h1>
            <p className="text-lg text-muted-foreground">
              Make a difference in a student's life by sharing your experience and guidance
            </p>
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-card p-6 rounded-2xl border border-border">
              <h2 className="text-xl font-bold mb-4">About You</h2>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="First name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Last name"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="your.email@example.com"
                    className="mt-1"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="employer">Employer</Label>
                    <Input
                      id="employer"
                      value={formData.employer}
                      onChange={(e) => handleInputChange("employer", e.target.value)}
                      placeholder="Company name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={formData.role}
                      onChange={(e) => handleInputChange("role", e.target.value)}
                      placeholder="Your job title"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Tell students about yourself</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Share your background, passions, and why you want to mentor..."
                    className="mt-1 min-h-[100px]"
                  />
                </div>
              </div>
            </div>

            {/* Skills & Languages */}
            <div className="bg-card p-6 rounded-2xl border border-border">
              <h2 className="text-xl font-bold mb-4">Your Expertise</h2>
              <div className="space-y-4">
                <div>
                  <Label className="mb-3 block">Areas you can help with *</Label>
                  <div className="flex flex-wrap gap-2">
                    {SKILL_OPTIONS.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => toggleArrayItem("skills", skill)}
                        className={`tag-chip ${
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
                  <Label className="mb-3 block">Languages you speak *</Label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGE_OPTIONS.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => toggleArrayItem("languages", lang)}
                        className={`tag-chip ${
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

            {/* Preferences */}
            <div className="bg-card p-6 rounded-2xl border border-border">
              <h2 className="text-xl font-bold mb-4">Mentoring Preferences</h2>
              <div className="space-y-4">
                <div>
                  <Label className="mb-3 block">Student age preference</Label>
                  <div className="flex gap-3">
                    {["High School", "College", "Any"].map((pref) => (
                      <button
                        key={pref}
                        onClick={() => handleInputChange("agePref", pref.toLowerCase())}
                        className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                          formData.agePref === pref.toLowerCase()
                            ? "border-primary bg-primary/5"
                            : "border-border"
                        }`}
                      >
                        {pref}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block">Meeting format</Label>
                  <div className="flex gap-3">
                    {[
                      { value: "online", label: "Online", emoji: "💻" },
                      { value: "in-person", label: "In Person", emoji: "🤝" },
                      { value: "both", label: "Both", emoji: "✨" },
                    ].map(({ value, label, emoji }) => (
                      <button
                        key={value}
                        onClick={() => handleInputChange("meetingPref", value)}
                        className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                          formData.meetingPref === value
                            ? "border-primary bg-primary/5"
                            : "border-border"
                        }`}
                      >
                        <div className="text-2xl mb-1">{emoji}</div>
                        <div className="text-sm font-medium">{label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="maxStudents">Maximum students you can mentor</Label>
                  <Input
                    id="maxStudents"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.maxStudents}
                    onChange={(e) => handleInputChange("maxStudents", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <Button onClick={handleSubmit} className="btn-primary w-full">
              Submit Application
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorOnboarding;
