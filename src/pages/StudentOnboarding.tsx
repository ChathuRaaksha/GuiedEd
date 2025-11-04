import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { studentOnboardingSchema } from "@/lib/validationSchemas";
import logo from "@/assets/logo.png";

const SUBJECT_OPTIONS = [
  "🔢 Mathematics",
  "🔬 Science",
  "💻 Technology",
  "⚙️ Engineering",
  "📖 English",
  "📜 History",
  "🌍 Geography",
  "🎨 Art",
  "🎵 Music",
  "🏃 Physical Education",
];

const INTEREST_OPTIONS = [
  "📰 News",
  "⚽ Sports",
  "🎵 Music",
  "💃 Dance",
  "⭐ Celebrity",
  "💑 Relationships",
  "🎬 Movies & TV",
  "💻 Technology",
  "💼 Business & Finance",
  "🪙 Cryptocurrency",
  "🎯 Career",
  "🎮 Gaming",
  "💪 Health & Fitness",
  "✈️ Travel",
  "🍕 Food",
  "💄 Beauty",
  "👗 Fashion",
  "🌲 Nature & Outdoors",
  "🐾 Pets",
  "🏡 Home & Garden",
  "🎨 Art",
  "🎌 Anime",
  "😂 Memes",
  "📚 Education",
  "🔬 Science",
  "🕊️ Religion",
  "🛍️ Shopping",
  "🚗 Cars",
  "✈️ Aviation",
  "🏍️ Motorcycles",
];

const LANGUAGE_OPTIONS = [
  "English",
  "Spanish",
  "French",
  "German",
  "Mandarin",
  "Swedish",
  "Arabic",
  "Portuguese",
  "Italian",
  "Russian",
  "Japanese",
  "Korean",
  "Hindi",
  "Dutch",
  "Polish",
  "Turkish",
  "Norwegian",
  "Danish",
  "Finnish",
  "Other",
];

const EDUCATION_LEVELS = [
  { value: "middle_school", label: "Middle School" },
  { value: "high_school", label: "High School" },
  { value: "university", label: "University" },
];

const SWEDISH_CITIES = [
  "Stockholm",
  "Gothenburg",
  "Malmö",
  "Uppsala",
  "Västerås",
  "Örebro",
  "Linköping",
  "Helsingborg",
  "Jönköping",
  "Norrköping",
  "Lund",
  "Umeå",
  "Gävle",
  "Other",
];

const StudentOnboarding = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: profile?.email || "",
    educationLevel: "",
    school: "",
    city: "",
    postcode: "",
    languages: [] as string[],
    subjects: [] as string[],
    interests: [] as string[],
    goals: "",
    talkAboutYourself: "",
    meetingPref: "online",
    consent: false,
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: "languages" | "subjects" | "interests", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.educationLevel || !formData.school || !formData.city || !formData.postcode) {
        toast.error("Please fill in all required fields");
        return;
      }
    }
    if (step === 2) {
      if (formData.languages.length === 0 || formData.subjects.length === 0 || formData.interests.length === 0) {
        toast.error("Please select at least one language, subject, and interest");
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
      toast.error("Please accept the consent to continue");
      return;
    }

    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    try {
      // Validate with Zod schema
      const validatedData = studentOnboardingSchema.parse(formData);

      const { error } = await supabase.from("students").insert({
        user_id: user.id,
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        email: validatedData.email,
        education_level: validatedData.educationLevel,
        school: validatedData.school,
        city: validatedData.city,
        postcode: validatedData.postcode,
        languages: validatedData.languages,
        subjects: validatedData.subjects,
        interests: validatedData.interests,
        goals: validatedData.goals || null,
        bio: validatedData.talkAboutYourself || null,
        meeting_pref: validatedData.meetingPref,
      });

      if (error) throw error;

      toast.success("Profile created! Finding your matches...");
      navigate("/match");
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const firstError = error.errors[0];
        toast.error(firstError.message);
      } else {
        console.error("Error saving profile:", error);
        toast.error("Failed to save profile. Please try again.");
      }
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
                  Hi 👋 I'm Ed, ready to help you find your mentor!
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
                    className="mt-1 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Enter your last name"
                    className="mt-1 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="educationLevel">Education Level *</Label>
                  <Select value={formData.educationLevel} onValueChange={(value) => handleInputChange("educationLevel", value)}>
                    <SelectTrigger className="mt-1 rounded-xl">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {EDUCATION_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="school">School *</Label>
                  <Input
                    id="school"
                    value={formData.school}
                    onChange={(e) => handleInputChange("school", e.target.value)}
                    placeholder="Your school name"
                    className="mt-1 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postcode">Postcode *</Label>
                  <Input
                    id="postcode"
                    value={formData.postcode}
                    onChange={(e) => handleInputChange("postcode", e.target.value)}
                    placeholder="e.g., 123 45"
                    className="mt-1 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Select value={formData.city} onValueChange={(value) => handleInputChange("city", value)}>
                    <SelectTrigger className="mt-1 rounded-xl">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {SWEDISH_CITIES.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                      type="button"
                      onClick={() => toggleArrayItem("languages", lang)}
                      className={`tag-chip transition-all ${
                        formData.languages.includes(lang)
                          ? "bg-accent text-primary border-2 border-primary font-semibold scale-105"
                          : "border border-border hover:border-accent"
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
                      type="button"
                      onClick={() => toggleArrayItem("interests", interest)}
                      className={`tag-chip transition-all ${
                        formData.interests.includes(interest)
                          ? "bg-accent text-primary border-2 border-primary font-semibold scale-105"
                          : "border border-border hover:border-accent"
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-3 block">Favorite school subjects *</Label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECT_OPTIONS.map((subject) => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => toggleArrayItem("subjects", subject)}
                      className={`tag-chip transition-all ${
                        formData.subjects.includes(subject)
                          ? "bg-accent text-primary border-2 border-primary font-semibold scale-105"
                          : "border border-border hover:border-accent"
                      }`}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="talkAboutYourself">Talk about yourself</Label>
                <Textarea
                  id="talkAboutYourself"
                  value={formData.talkAboutYourself}
                  onChange={(e) => handleInputChange("talkAboutYourself", e.target.value)}
                  placeholder="Share something about yourself... (e.g., your hobbies, what you enjoy doing)"
                  className="mt-1 min-h-[100px] rounded-xl"
                  maxLength={500}
                />
              </div>

              <div>
                <Label htmlFor="goals">What are your goals?</Label>
                <Textarea
                  id="goals"
                  value={formData.goals}
                  onChange={(e) => handleInputChange("goals", e.target.value)}
                  placeholder="Tell me what you want to achieve... (e.g., explore careers in tech, improve leadership skills)"
                  className="mt-1 min-h-[100px] rounded-xl"
                  maxLength={500}
                />
              </div>

              <div className="flex gap-4">
                <Button onClick={handleBack} variant="outline" className="flex-1 rounded-xl">
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
                    type="button"
                    onClick={() => handleInputChange("meetingPref", "online")}
                    className={`flex-1 p-4 rounded-2xl border-2 transition-all ${
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
                    className={`flex-1 p-4 rounded-2xl border-2 transition-all ${
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
                    className={`flex-1 p-4 rounded-2xl border-2 transition-all ${
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
                <Button onClick={handleBack} variant="outline" className="flex-1 rounded-xl">
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
