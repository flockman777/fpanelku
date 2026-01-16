'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Server, Shield, Database } from 'lucide-react';

export default function FPanelPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token and redirect to dashboard
      localStorage.setItem('token', data.token);
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Auto login after registration
      localStorage.setItem('token', data.token);
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="w-full shadow-2xl border-0">
          <CardHeader className="space-y-1 text-center pb-4">
            <img
              src="/fpanellogo.jpeg"
              alt="FPanel Logo"
              className="object-contain mx-auto mb-2"
              style={{ width: '200px', height: '100px' }}
            />
            <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
            <CardDescription>
              to manage your hosting services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 pt-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      placeholder="admin@example.com"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      name="password"
                      type="password"
                      placeholder="•••••"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>

                  <div className="grid grid-cols-3 gap-3 pt-4">
                    <div className="flex flex-col items-center gap-1 p-3 bg-white/60 backdrop-blur rounded-lg border border-blue-100">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <h3 className="font-semibold text-xs text-gray-900">Secure</h3>
                    </div>
                    <div className="flex flex-col items-center gap-1 p-3 bg-white/60 backdrop-blur rounded-lg border border-blue-100">
                      <Database className="w-4 h-4 text-sky-600" />
                      <h3 className="font-semibold text-xs text-gray-900">Powerful</h3>
                    </div>
                    <div className="flex flex-col items-center gap-1 p-3 bg-white/60 backdrop-blur rounded-lg border border-blue-100">
                      <Server className="w-4 h-4 text-indigo-600" />
                      <h3 className="font-semibold text-xs text-gray-900">Simple</h3>
                    </div>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4 pt-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Full Name</Label>
                    <Input
                      id="register-name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      name="password"
                      type="password"
                      placeholder="•••••"
                      required
                      disabled={isLoading}
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm">Confirm Password</Label>
                    <Input
                      id="register-confirm"
                      name="confirmPassword"
                      type="password"
                      placeholder="•••••"
                      required
                      disabled={isLoading}
                      minLength={6}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>

                  <div className="grid grid-cols-3 gap-3 pt-4">
                    <div className="flex flex-col items-center gap-1 p-3 bg-white/60 backdrop-blur rounded-lg border border-blue-100">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <h3 className="font-semibold text-xs text-gray-900">Secure</h3>
                    </div>
                    <div className="flex flex-col items-center gap-1 p-3 bg-white/60 backdrop-blur rounded-lg border border-blue-100">
                      <Database className="w-4 h-4 text-sky-600" />
                      <h3 className="font-semibold text-xs text-gray-900">Powerful</h3>
                    </div>
                    <div className="flex flex-col items-center gap-1 p-3 bg-white/60 backdrop-blur rounded-lg border border-blue-100">
                      <Server className="w-4 h-4 text-indigo-600" />
                      <h3 className="font-semibold text-xs text-gray-900">Simple</h3>
                    </div>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 pt-6">
            <p className="text-xs text-center text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
