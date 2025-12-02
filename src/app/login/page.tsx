
'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmail, resetPassword, getFriendlyAuthErrorMessage } from '@/firebase/auth/auth-client';

const ADMIN_EMAIL = "prempolai91@gmail.com";

export default function LoginPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/admin');
    }
  }, [user, isUserLoading, router]);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!auth) {
        const msg = "Authentication service is not available.";
        setError(msg);
        toast({ variant: 'destructive', title: 'Error', description: msg });
        return;
    }
    if (!email || !password) {
        setError("Please enter both email and password.");
        return;
    }
    if (email !== ADMIN_EMAIL) {
        setError("You are not authorized to access this panel.");
        return;
    }
    
    setIsLoading(true);
    
    signInWithEmail(auth, email, password)
        .then(() => {
            toast({
                variant: "success",
                title: "Login Successful",
                description: "Redirecting to admin panel...",
            });
            // The useEffect hook will handle the redirection after auth state changes.
        })
        .catch((e: any) => {
            const errorMessage = getFriendlyAuthErrorMessage(e);
            setError(errorMessage);
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: errorMessage,
            });
        })
        .finally(() => {
            setIsLoading(false);
        });
  };

  const handlePasswordReset = async () => {
    setError(null);
    if (!auth) {
        const msg = "Authentication service is not available.";
        setError(msg);
        toast({ variant: 'destructive', title: 'Error', description: msg });
        return;
    }
    if (!email) {
        setError("Please enter your email to reset the password.");
        return;
    }
     if (email !== ADMIN_EMAIL) {
        setError("Password reset is only available for the administrator.");
        return;
    }

    setIsLoading(true);

    try {
        await resetPassword(auth, email);
        toast({
            variant: "success",
            title: "Password Reset Email Sent",
            description: `An email has been sent to ${email} with instructions to reset your password.`
        });
    } catch (e: any) {
        const errorMessage = getFriendlyAuthErrorMessage(e);
        setError(errorMessage);
        toast({
            variant: "destructive",
            title: "Reset Failed",
            description: errorMessage,
        });
    } finally {
        setIsLoading(false);
    }
  };
  
  if (isUserLoading || (!isUserLoading && user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
         <div className="flex justify-center pt-6">
            <ShieldCheck className="w-12 h-12 text-primary" />
        </div>
        <CardHeader className="text-center">
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>Access your portfolio's content management panel.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input 
                  id="login-email" 
                  type="email" 
                  placeholder="m@example.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  disabled={isLoading}
                />
            </div>
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Password</Label>
                    <Button
                        variant="link"
                        type="button"
                        onClick={handlePasswordReset}
                        disabled={isLoading || !email}
                        className="px-0 h-auto text-sm"
                    >
                        Forgot Password?
                    </Button>
                </div>
                <Input 
                  id="login-password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(e); }}
                  disabled={isLoading}
                />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="animate-spin" /> : 'Sign In'}
            </Button>
          </form>
          <Button onClick={() => router.push('/')} variant="outline" className="w-full mt-4" disabled={isLoading}>
              <ArrowLeft className="h-4 w-4 mr-2"/>
              Back to Portfolio
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
