import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { mentorOnboardingSchema } from "@/lib/validationSchemas";
import logo from "@/assets/logo.png";
import * as pdfjsLib from 'pdfjs-dist';

const SKILL_OPTIONS = [
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

const HOBBY_OPTIONS = [
  "📚 Reading",
  "🎮 Gaming",
  "🍳 Cooking",
  "✈️ Travel",
  "📸 Photography",
  "💪 Fitness",
  "🤝 Volunteering",
  "🌱 Gardening",
  "🔨 DIY Projects",
  "🏆 Collecting",
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
  { value: "high_school", label: "High School" },
  { value: "bachelor", label: "Bachelor" },
  { value: "master", label: "Master" },
  { value: "phd", label: "PhD" },
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

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const MentorOnboarding = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: profile?.email || "",
    educationLevel: "",
    city: "",
    postcode: "",
    employer: "",
    role: "",
    bio: "",
    talkAboutYourself: "",
    skills: [] as string[],
    hobbies: [] as string[],
    languages: [] as string[],
    agePref: "any",
    meetingPref: "either",
    maxStudents: "3",
    linkedinUrl: "",
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploadingCv, setUploadingCv] = useState(false);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }

      return fullText;
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      throw new Error('Failed to extract text from PDF');
    }
  };

  const analyzeCVWithBackend = async (cvText: string): Promise<any> => {
    try {
      const response = await fetch('http://localhost:5001/api/analyze-cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cv_text: cvText }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze CV');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error analyzing CV:', error);
      throw error;
    }
  };

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
      let cvUrl = "";
      let cvData = null;
      
      // Upload CV if provided
      if (cvFile) {
        setUploadingCv(true);
        toast.info("Uploading and analyzing your CV...");
        
        const fileExt = cvFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('cvs')
          .upload(fileName, cvFile);
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('cvs')
          .getPublicUrl(fileName);
        
        cvUrl = publicUrl;

        // Extract text and analyze CV for PDF files
        if (fileExt?.toLowerCase() === 'pdf') {
          try {
            const cvText = await extractTextFromPDF(cvFile);
            const analysisResult = await analyzeCVWithBackend(cvText);
            cvData = {
              interests: analysisResult.interests || [],
              analyzed_at: new Date().toISOString(),
            };
            toast.success("CV analyzed successfully!");
          } catch (error) {
            console.error("CV analysis failed:", error);
            toast.warning("CV uploaded but analysis failed. You can still continue.");
          }
        }
        
        setUploadingCv(false);
      }

      const validated = mentorOnboardingSchema.parse({
        ...formData,
        maxStudents: parseInt(formData.maxStudents),
        email: profile?.email || formData.email,
        cvUrl: cvUrl || undefined,
      });

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from("mentors")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      const mentorData = {
        user_id: user.id,
        first_name: validated.firstName,
        last_name: validated.lastName,
        email: validated.email,
        education_level: validated.educationLevel || null,
        city: validated.city,
        postcode: validated.postcode,
        employer: validated.employer || null,
        role: validated.role || null,
        bio: validated.bio || null,
        talk_about_yourself: validated.talkAboutYourself || null,
        skills: validated.skills,
        hobbies: validated.hobbies || [],
        languages: validated.languages,
        age_pref: validated.agePref,
        meeting_pref: validated.meetingPref,
        max_students: validated.maxStudents,
        linkedin_url: validated.linkedinUrl || null,
        cv_url: cvUrl || null,
        cv_data: cvData || null,
      };

      let error;
      if (existingProfile) {
        // Update existing profile
        const result = await supabase
          .from("mentors")
          .update(mentorData)
          .eq("user_id", user.id);
        error = result.error;
      } else {
        // Create new profile
        const result = await supabase
          .from("mentors")
          .insert(mentorData);
        error = result.error;
      }

      if (error) throw error;

      toast.success("Thank you! Your mentor profile has been created successfully!");
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error: any) {
      console.error("Error creating mentor profile:", error);
      setUploadingCv(false);
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
                    <Label htmlFor="educationLevel">Education Level</Label>
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
                  <Label htmlFor="talkAboutYourself">Talk about yourself</Label>
                  <Textarea
                    id="talkAboutYourself"
                    value={formData.talkAboutYourself}
                    onChange={(e) => handleInputChange("talkAboutYourself", e.target.value)}
                    placeholder="Share more about your interests, hobbies, and personality..."
                    className="mt-1 min-h-[100px] rounded-xl"
                    maxLength={500}
                  />
                </div>

                <div>
                  <Label htmlFor="cv">Upload CV (Optional)</Label>
                  <div className="mt-1">
                    <Input
                      id="cv"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            toast.error("File size must be less than 5MB");
                            e.target.value = "";
                            return;
                          }
                          setCvFile(file);
                          toast.success("CV selected successfully");
                        }
                      }}
                      className="rounded-xl cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, DOC, or DOCX format. Max 5MB
                    </p>
                    {cvFile && (
                      <p className="text-sm text-primary mt-2">✓ {cvFile.name}</p>
                    )}
                  </div>
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
                            ? "bg-accent text-primary border-2 border-primary font-semibold scale-105"
                            : "border border-border hover:border-accent"
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
                            ? "bg-accent text-primary border-2 border-primary font-semibold scale-105"
                            : "border border-border hover:border-accent"
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
                            ? "bg-accent text-primary border-2 border-primary font-semibold scale-105"
                            : "border border-border hover:border-accent"
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
                  <Label className="mb-3 block">Student Education Level Preference</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button
                      type="button"
                      onClick={() => handleInputChange("agePref", "middle_school")}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.agePref === "middle_school"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-medium">Middle School</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange("agePref", "high_school")}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.agePref === "high_school"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-medium">High School</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange("agePref", "university")}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.agePref === "university"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-medium">University</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange("agePref", "any")}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.agePref === "any"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-medium">Any</div>
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

            <Button 
              onClick={handleSubmit} 
              className="btn-primary w-full h-14 text-lg"
              disabled={uploadingCv}
            >
              {uploadingCv ? "Uploading CV..." : "Complete Mentor Profile"}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorOnboarding;
