import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { GraduationCap, Users, Shield } from 'lucide-react';
import logo from '@/assets/logo.png';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type Role = 'STUDENT' | 'MENTOR' | 'FACILITATOR';

export default function Register() {
  const [step, setStep] = useState<'role' | 'details'>('role');
  const [role, setRole] = useState<Role | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const roles = [
    {
      value: 'STUDENT' as Role,
      label: 'Student',
      icon: GraduationCap,
      description: 'Find mentors to guide your journey',
    },
    {
      value: 'MENTOR' as Role,
      label: 'Mentor',
      icon: Users,
      description: 'Share your experience and help students grow',
    },
    {
      value: 'FACILITATOR' as Role,
      label: 'Facilitator',
      icon: Shield,
      description: 'Manage and coordinate mentorship programs',
    },
  ];

  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
    setStep('details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!role) {
      toast.error('Please select a role');
      return;
    }

    try {
      const validated = registerSchema.parse({ email, password, confirmPassword });
      setLoading(true);

      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            role: role,
          },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('This email is already registered. Please login instead.');
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (data.user) {
        toast.success('Account created! Redirecting to onboarding...');
        
        // Navigate to role-specific onboarding
        setTimeout(() => {
          navigate(`/onboarding/${role.toLowerCase()}`);
        }, 1000);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message);
      } else {
        toast.error('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <img src={logo} alt="GuidEd" className="h-12 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Create your account</h1>
          <p className="text-muted-foreground">Choose your role to get started</p>
        </div>

        {step === 'role' ? (
          <div className="grid md:grid-cols-3 gap-6">
            {roles.map((roleOption) => {
              const Icon = roleOption.icon;
              return (
                <Card
                  key={roleOption.value}
                  className="p-6 cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 border-2 hover:border-primary"
                  onClick={() => handleRoleSelect(roleOption.value)}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-2">{roleOption.label}</h3>
                      <p className="text-sm text-muted-foreground">{roleOption.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="max-w-md mx-auto p-8">
            <Button
              variant="ghost"
              onClick={() => setStep('role')}
              className="mb-4"
            >
              ← Back to role selection
            </Button>

            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold">
                {roles.find(r => r.value === role)?.icon && (
                  <div className="w-5 h-5">
                    {(() => {
                      const Icon = roles.find(r => r.value === role)!.icon;
                      return <Icon className="w-full h-full" />;
                    })()}
                  </div>
                )}
                {role}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="rounded-xl"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full rounded-xl h-12 font-semibold transition-all hover:scale-105"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <div className="text-center text-sm mt-6">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link to="/auth/login" className="text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
