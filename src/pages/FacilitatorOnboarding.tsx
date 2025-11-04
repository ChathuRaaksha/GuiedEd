import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { facilitatorOnboardingSchema } from "@/lib/validationSchemas";
import logo from "@/assets/logo.png";

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

const FacilitatorOnboarding = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: profile?.email || "",
    org: "",
    role: "",
    city: "",
    postcode: "",
    maxMatches: "50",
    notes: "",
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("You must be logged in to continue");
      return;
    }

    try {
      const validated = facilitatorOnboardingSchema.parse({
        ...formData,
        maxMatches: parseInt(formData.maxMatches),
        email: profile?.email || formData.email,
      });

      const { error } = await supabase
        .from("facilitators")
        .insert({
          user_id: user.id,
          first_name: validated.firstName,
          last_name: validated.lastName,
          email: validated.email,
          org: validated.org,
          role: validated.role,
          city: validated.city,
          postcode: validated.postcode,
          max_matches: validated.maxMatches,
          notes: validated.notes || null,
        });

      if (error) throw error;

      toast.success("Thank you! Your facilitator profile has been created. Welcome to the team!");
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error: any) {
      console.error("Error creating facilitator profile:", error);
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
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold mb-4">
              <Shield className="w-5 h-5" />
              Facilitator Registration
            </div>
            <h1 className="text-4xl font-bold mb-4">Join as a Facilitator</h1>
            <p className="text-xl text-muted-foreground">
              Help coordinate and oversee meaningful mentorship connections
            </p>
          </div>

          <div className="bg-card p-8 rounded-3xl border space-y-6">
            <div className="bg-secondary/30 p-6 rounded-2xl">
              <h3 className="font-semibold mb-3">Facilitator Responsibilities:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Review and approve mentor-student match proposals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Schedule and coordinate initial meetings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Monitor ongoing mentorship relationships</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Provide support and guidance when needed</span>
                </li>
              </ul>
            </div>

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
                <Label htmlFor="org">Organization *</Label>
                <Input
                  id="org"
                  value={formData.org}
                  onChange={(e) => handleInputChange("org", e.target.value)}
                  placeholder="NGO, school, or municipality"
                  className="mt-1 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="role">Your Role *</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => handleInputChange("role", e.target.value)}
                  placeholder="e.g., School Counselor, Coordinator"
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

            <div>
              <Label htmlFor="maxMatches">Maximum Matches to Oversee *</Label>
              <Input
                id="maxMatches"
                type="number"
                min="1"
                max="500"
                value={formData.maxMatches}
                onChange={(e) => handleInputChange("maxMatches", e.target.value)}
                className="mt-1 rounded-xl"
              />
              <p className="text-sm text-muted-foreground mt-1">
                How many mentor-student matches can you effectively oversee?
              </p>
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Tell us about your experience, qualifications, or any other relevant information..."
                className="mt-1 min-h-[120px] rounded-xl"
                maxLength={500}
              />
            </div>

            <Button onClick={handleSubmit} className="btn-primary w-full h-14 text-lg">
              Request Facilitator Access
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilitatorOnboarding;
