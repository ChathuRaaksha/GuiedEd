import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const FacilitatorOnboarding = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    org: "",
    role: "",
    city: "",
    maxMatches: "10",
    notes: "",
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.org) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const { error } = await supabase
        .from("facilitators")
        .insert({
          name: formData.name,
          email: formData.email,
          org: formData.org,
          role: formData.role || null,
          city: formData.city || null,
          max_matches: parseInt(formData.maxMatches),
          notes: formData.notes || null,
        });

      if (error) throw error;

      toast.success("Thank you! We'll contact you soon with access details.");
    } catch (error: any) {
      console.error("Error creating facilitator profile:", error);
      toast.error(error.message || "Failed to create profile. Please try again.");
    }
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
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-4xl font-bold mb-3">Facilitator Access</h1>
            <p className="text-lg text-muted-foreground">
              Help supervise and ensure quality mentorship connections in your school or organization
            </p>
          </div>

          <div className="bg-card p-8 rounded-2xl border border-border space-y-6">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Your full name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="your.email@school.edu"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="org">Organization *</Label>
              <Input
                id="org"
                value={formData.org}
                onChange={(e) => handleInputChange("org", e.target.value)}
                placeholder="School or organization name"
                className="mt-1"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role">Your Role</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => handleInputChange("role", e.target.value)}
                  placeholder="e.g., Counselor, Coordinator"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="City"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="maxMatches">Expected number of student matches</Label>
              <Input
                id="maxMatches"
                type="number"
                value={formData.maxMatches}
                onChange={(e) => handleInputChange("maxMatches", e.target.value)}
                placeholder="10"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="notes">Additional notes (optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Tell us about your needs and how you plan to use GuidEd..."
                className="mt-1 min-h-[100px]"
              />
            </div>

            <div className="bg-secondary/30 p-4 rounded-xl">
              <h3 className="font-medium mb-2">What facilitators do:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Review and approve student and mentor matches</li>
                <li>• Monitor mentorship progress</li>
                <li>• Ensure quality and safety of connections</li>
                <li>• Provide support when needed</li>
              </ul>
            </div>

            <Button onClick={handleSubmit} className="btn-primary w-full">
              Request Access
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilitatorOnboarding;
