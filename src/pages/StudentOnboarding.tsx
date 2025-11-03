import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const INTEREST_OPTIONS = [
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

const StudentOnboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    grade: "",
    school: "",
    city: "",
    languages: [] as string[],
    interests: [] as string[],
    goals: "",
    meetingPref: "online",
    consent: false,
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: "languages" | "interests", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.grade) {
        toast.error("Please fill in all required fields");
        return;
      }
    }
    if (step === 2) {
      if (formData.languages.length === 0 || formData.interests.length === 0) {
        toast.error("Please select at least one language and interest");
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!formData.consent) {
      toast.error("Please accept the terms to continue");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("students")
        .insert({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          grade: parseInt(formData.grade),
          school: formData.school || null,
          city: formData.city || null,
          languages: formData.languages,
          interests: formData.interests,
          goals: formData.goals || null,
          meeting_pref: formData.meetingPref,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Profile created! Finding your perfect mentor...");
      setTimeout(() => {
        navigate(`/match?studentId=${data.id}&name=${formData.firstName}`);
      }, 1500);
    } catch (error: any) {
      console.error("Error creating student profile:", error);
      toast.error(error.message || "Failed to create profile. Please try again.");
    }
  };

  const progress = (step / 3) * 100;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border py-4">
        <div className="container mx-auto px-4">
          <img src={logo} alt="GuidEd" className="h-8" />
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Step {step} of 3
            </p>
          </div>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Hi 👋 I'm Ed – ready to help you find your mentor!
                </h1>
                <p className="text-muted-foreground">
                  Let's start with some basic information about you.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="Enter your first name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Enter your last name"
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
                  <Label htmlFor="grade">Grade *</Label>
                  <Input
                    id="grade"
                    type="number"
                    value={formData.grade}
                    onChange={(e) => handleInputChange("grade", e.target.value)}
                    placeholder="e.g., 10"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="school">School</Label>
                  <Input
                    id="school"
                    value={formData.school}
                    onChange={(e) => handleInputChange("school", e.target.value)}
                    placeholder="Your school name"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Where do you live?"
                  className="mt-1"
                />
              </div>

              <Button onClick={handleNext} className="btn-primary w-full group">
                Continue
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          )}

          {/* Step 2: Profile */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-3xl font-bold mb-2">Tell me about yourself</h1>
                <p className="text-muted-foreground">
                  This helps me find mentors who match your interests and speak your language.
                </p>
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

              <div>
                <Label className="mb-3 block">What are you interested in? *</Label>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => toggleArrayItem("interests", interest)}
                      className={`tag-chip ${
                        formData.interests.includes(interest)
                          ? "bg-primary text-primary-foreground"
                          : ""
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="goals">What are your goals?</Label>
                <Textarea
                  id="goals"
                  value={formData.goals}
                  onChange={(e) => handleInputChange("goals", e.target.value)}
                  placeholder="Tell me what you want to achieve... (e.g., explore careers in tech, improve leadership skills)"
                  className="mt-1 min-h-[100px]"
                />
              </div>

              <div className="flex gap-4">
                <Button onClick={handleBack} variant="outline" className="flex-1">
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Back
                </Button>
                <Button onClick={handleNext} className="btn-primary flex-1 group">
                  Continue
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Preferences */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-3xl font-bold mb-2">Almost done! 🎉</h1>
                <p className="text-muted-foreground">
                  Last step - let me know your meeting preferences.
                </p>
              </div>

              <div>
                <Label className="mb-3 block">How would you like to meet?</Label>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleInputChange("meetingPref", "online")}
                    className={`flex-1 p-4 rounded-2xl border-2 transition-all ${
                      formData.meetingPref === "online"
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <div className="text-2xl mb-2">💻</div>
                    <div className="font-medium">Online</div>
                  </button>
                  <button
                    onClick={() => handleInputChange("meetingPref", "in-person")}
                    className={`flex-1 p-4 rounded-2xl border-2 transition-all ${
                      formData.meetingPref === "in-person"
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <div className="text-2xl mb-2">🤝</div>
                    <div className="font-medium">In Person</div>
                  </button>
                  <button
                    onClick={() => handleInputChange("meetingPref", "both")}
                    className={`flex-1 p-4 rounded-2xl border-2 transition-all ${
                      formData.meetingPref === "both"
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <div className="text-2xl mb-2">✨</div>
                    <div className="font-medium">Both</div>
                  </button>
                </div>
              </div>

              <div className="bg-secondary/30 p-6 rounded-2xl">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="consent"
                    checked={formData.consent}
                    onCheckedChange={(checked) =>
                      handleInputChange("consent", checked)
                    }
                  />
                  <Label htmlFor="consent" className="text-sm cursor-pointer">
                    I agree to be matched with a mentor and understand that a facilitator 
                    will review the match. I consent to sharing my profile information for 
                    mentorship purposes.
                  </Label>
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleBack} variant="outline" className="flex-1">
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="btn-primary flex-1"
                  disabled={!formData.consent}
                >
                  Find My Mentor 🚀
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentOnboarding;
