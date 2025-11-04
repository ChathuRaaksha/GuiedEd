import { Button } from "@/components/ui/button";
import { LogOut, User, Users, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

export const Header = () => {
  const { user, profile, signOut } = useAuth();

  const scrollToTeam = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const teamSection = document.getElementById('team');
    if (teamSection) {
      teamSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/">
            <img src={logo} alt="GuidEd" className="h-10" />
          </Link>
          <a 
            href="#team" 
            onClick={scrollToTeam}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Team
          </a>
        </div>
        <nav className="flex items-center gap-4">
          {user && profile ? (
            <>
              <span className="text-sm font-medium px-4 py-2 rounded-full bg-primary/10 text-primary uppercase">
                {profile.role}
              </span>
              {profile.role === "STUDENT" && (
                <Link to="/match">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Users className="w-4 h-4" />
                    Matches
                  </Button>
                </Link>
              )}
              {profile.role === "MENTOR" && (
                <Link to="/mentor/matches">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Users className="w-4 h-4" />
                    Matches
                  </Button>
                </Link>
              )}
              {profile.role === "FACILITATOR" && (
                <Link to="/facilitator/matches">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Users className="w-4 h-4" />
                    Matches
                  </Button>
                </Link>
              )}
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="w-4 h-4" />
                  Profile
                </Button>
              </Link>
              {profile.role === 'ADMIN' && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Shield className="w-4 h-4" />
                    Admin
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
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
  );
};
