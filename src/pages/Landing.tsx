import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Sparkles, Heart, CheckCircle, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import logo from "@/assets/logo.png";
import edIcon from "@/assets/ed-icon.png";
import jadyPhoto from "@/assets/team/jady.jpg";
import phuwitPhoto from "@/assets/team/phuwit.jpg";
import mariaPhoto from "@/assets/team/maria.png";
import rezaPhoto from "@/assets/team/reza.jpg";
import tobiasPhoto from "@/assets/team/tobias.jpeg";
import praneetPhoto from "@/assets/team/praneet.jpeg";
import supunPhoto from "@/assets/team/supun.jpg";

const Landing = () => {
  return <div className="min-h-screen bg-background">
      <Header />

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

      {/* Team Section */}
      <section id="team" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              <span className="text-primary">The Dream Team:</span>{" "}
              <span className="text-accent">SU Heroes</span>
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto text-lg">
              We are SU Heroes, a multidisciplinary team from Stockholm University who joined forces during the CHAS Academy AI-Assisted Workflow Coding Hackathon. Our shared mission is to make mentorship more accessible, inclusive, and fun through technology and human connection.
            </p>
            <div className="flex flex-col items-center gap-8">
              {/* First row - 4 people */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl">
                {[
                  { name: "Jady Pamella", role: "AI, Cybersecurity & IT Consultant", linkedin: "https://linkedin.com/in/jadypamella", photo: jadyPhoto },
                  { name: "Phuwit Vititayanon", role: "Data Scientist & AI Maker", linkedin: "https://linkedin.com/in/phuwit-vititayanon-4b6503157", photo: phuwitPhoto },
                  { name: "Maria Hellsen", role: "AI Business Consultant & Frontend Development Student", linkedin: "https://linkedin.com/in/maria-hellsen-9805723", photo: mariaPhoto },
                  { name: "Reza Rezvani", role: "Partnership Manager at My Dream Now", linkedin: "https://linkedin.com/in/reza-rezvani-bb699011b", photo: rezaPhoto },
                ].map((member, index) => (
                  <div
                    key={index}
                    className="bg-card p-6 rounded-3xl text-center card-hover group w-full max-w-xs"
                  >
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl" />
                      <img
                        src={member.photo}
                        alt={member.name}
                        className="w-full h-full rounded-full object-cover border-4 border-background shadow-lg relative z-10"
                      />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{member.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 min-h-[2.5rem]">
                      {member.role}
                    </p>
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-accent hover:text-primary transition-colors"
                    >
                      <Linkedin className="w-5 h-5" />
                      <span className="text-sm font-medium">LinkedIn</span>
                    </a>
                  </div>
                ))}
              </div>
              
              {/* Second row - 3 people centered */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl">
                {[
                  { name: "Tobias Nilsson", role: "Independent Consultant in Business & Requirements Analysis", linkedin: "https://linkedin.com/in/tobiasnilsson75", photo: tobiasPhoto },
                  { name: "Praneet Kala", role: "Digitalisation, Workflow Automation & Storytelling", linkedin: "https://linkedin.com/in/praneet-kala-0b165678", photo: praneetPhoto },
                  { name: "Supun Chathuranga", role: "AI & Fullstack Engineer", linkedin: "https://linkedin.com/in/supun-chathuranga-190372148", photo: supunPhoto },
                ].map((member, index) => (
                  <div
                    key={index}
                    className="bg-card p-6 rounded-3xl text-center card-hover group w-full max-w-xs"
                  >
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl" />
                      <img
                        src={member.photo}
                        alt={member.name}
                        className="w-full h-full rounded-full object-cover border-4 border-background shadow-lg relative z-10"
                      />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{member.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 min-h-[2.5rem]">
                      {member.role}
                    </p>
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-accent hover:text-primary transition-colors"
                    >
                      <Linkedin className="w-5 h-5" />
                      <span className="text-sm font-medium">LinkedIn</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
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
              <h4 className="font-bold mb-4">Quick Links</h4>
              <a href="#team" className="block text-sm text-muted-foreground hover:text-primary mb-2 transition-colors">
                Team
              </a>
              <Link to="/auth/register" className="block text-sm text-muted-foreground hover:text-primary mb-2 transition-colors">
                Get Started
              </Link>
            </div>
            <div>
              <h4 className="font-bold mb-4">Get Involved</h4>
              <Link to="/onboarding/mentor" className="block text-sm text-muted-foreground hover:text-primary mb-2 transition-colors">
                Become a Mentor →
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