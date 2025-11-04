import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

export const Header = () => {
  const { user, profile, signOut } = useAuth();

  return (
    <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/">
          <img src={logo} alt="GuidEd" className="h-10" />
        </Link>
        <nav className="flex items-center gap-4">
          {user && profile ? (
            <>
              <span className="text-sm font-medium px-4 py-2 rounded-full bg-primary/10 text-primary uppercase">
                {profile.role}
              </span>
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="w-4 h-4" />
                  Profile
                </Button>
              </Link>
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
