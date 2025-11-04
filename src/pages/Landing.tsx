import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Sparkles, Heart, CheckCircle, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";
import edIcon from "@/assets/ed-icon.png";

const Landing = () => {
  const { user, profile, signOut } = useAuth();

  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <img src={logo} alt="GuidEd" className="h-10" />
          <nav className="hidden md:flex items-center gap-6">
            {user && profile ? (
              <>
                <span className="text-sm font-medium px-4 py-2 rounded-full bg-primary/10 text-primary">
                  {profile.role}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={signOut}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth/register">
                  <Button size="sm" className="rounded-full">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <img src={logo} alt="GuidEd" className="h-16 md:h-20 mx-auto mb-8" />
          <div className="inline-block mb-6">
            <span className="tag-chip bg-accent/10 text-accent">
              <Sparkles className="w-4 h-4" />
              AI Powered Mentorship
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            AI mentorship that guides students toward their{" "}
            <span className="text-primary">dreams</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Students share interests. GuidEd connects them with mentors. Ed assists the journey and a facilitator supervises.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/register">
              <Button size="lg" className="btn-primary group">
                Start as Student
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/auth/register">
              <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-base">
                Join as Mentor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-secondary/30 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            How it Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-card p-8 rounded-3xl card-hover text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">1. Student Signs Up</h3>
              <p className="text-muted-foreground">
                Share your interests, goals, and what kind of mentor you're looking for.
              </p>
            </div>
            <div className="bg-card p-8 rounded-3xl card-hover text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">2. Ed Finds Matches</h3>
              <p className="text-muted-foreground">
                Our AI assistant analyzes your profile and suggests compatible mentors.
              </p>
            </div>
            <div className="bg-card p-8 rounded-3xl card-hover text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">3. Facilitator Connects</h3>
              <p className="text-muted-foreground">
                A human facilitator reviews and approves the match, ensuring quality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Ed */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-pink-100 rounded-3xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1">
                <div className="inline-block mb-4">
                  <span className="tag-chip bg-white/80">👋 Meet Ed</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
                  Your friendly AI mentor matchmaker
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  Ed is here to make finding the perfect mentor fun and easy. I analyze your interests, 
                  goals, and preferences to connect you with mentors who can truly help you grow.
                </p>
                <p className="text-lg text-gray-700">
                  Think of me as your personal guide. I am always learning and improving to make 
                  better matches every day!
                </p>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="w-64 h-64 bg-white rounded-3xl flex items-center justify-center shadow-lg">
                  <img src={edIcon} alt="Ed" className="h-32" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why it Matters */}
      <section className="bg-secondary/30 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Why it Matters
            </h2>
            <p className="text-center text-lg text-muted-foreground mb-12">
              Based on research from My Dream Now and similar initiatives
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-card p-6 rounded-2xl">
                <CheckCircle className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-bold mb-2">Students lack role models</h3>
                <p className="text-muted-foreground text-sm">
                  Many students don't have access to professionals who can guide their career choices.
                </p>
              </div>
              <div className="bg-card p-6 rounded-2xl">
                <CheckCircle className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-bold mb-2">Counselors are overloaded</h3>
                <p className="text-muted-foreground text-sm">
                  School counselors handle hundreds of students and need community support.
                </p>
              </div>
              <div className="bg-card p-6 rounded-2xl">
                <CheckCircle className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-bold mb-2">Companies want to help</h3>
                <p className="text-muted-foreground text-sm">
                  Employers want to give back but need structure and facilitation to do so effectively.
                </p>
              </div>
            </div>
            <p className="text-center text-lg font-medium mt-12">
              GuidEd bridges students, mentors, and schools to create meaningful connections.
            </p>
          </div>
        </div>
      </section>

      {/* Inspiration Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card p-8 md:p-12 rounded-3xl border border-border">
            <h3 className="text-2xl font-bold mb-4">Inspired by My Dream Now</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              My Dream Now creates inspiring meetings between students and working life. They help schools 
              connect with employers and volunteer role models through mentorship, classroom visits, and 
              study trips, helping students discover their strengths and future paths.
            </p>
            <a href="https://www.mydreamnow.se/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-medium inline-flex items-center gap-2">
              Learn more about My Dream Now
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary/30 border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div>
              <img src={logo} alt="GuidEd" className="h-8 mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                AI mentorship that guides students toward their dreams.
              </p>
              <p className="text-xs text-muted-foreground">
                Inspired by My Dream Now
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Get Involved</h4>
              <Link to="/onboarding/mentor" className="block text-sm text-muted-foreground hover:text-primary mb-2 transition-colors">
                Become a Mentor →
              </Link>
            </div>
            <div>
              <h4 className="font-bold mb-4">For Schools</h4>
              <Link to="/onboarding/facilitator" className="block text-sm text-muted-foreground hover:text-primary mb-2 transition-colors">
                Facilitator Access →
              </Link>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-sm text-muted-foreground">© 2025 GuidEd. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Landing;