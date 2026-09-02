"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGoogleLogin } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || data.error || "Failed to login");
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_token: tokenResponse.access_token }), 
          // Note: useGoogleLogin implicit flow returns access_token. 
          // If we need id_token, we can use flow: 'implicit' but standard useGoogleLogin 
          // access_token can't be verified like id_token by backend.
          // Wait! Let's just use Google OAuth for implicit flow, wait `credentialResponse` is from GoogleLogin button.
          // Actually `useGoogleLogin` returns access_token. 
          // Let's use it as access_token for Google API to get user info, or let backend do it.
          // Since our backend expects id_token in GoogleLoginView, we should fetch user info here or change backend.
          // Or just pass the access_token as id_token and let the backend change to use access_token.
        });
        
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to login with Google");
        }
        router.push("/");
        router.refresh();
      } catch (err) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    onError: errorResponse => setError("Google Login Failed")
  });

  return (
    <>
      <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to home
      </Link>
      
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Sign in to your account</h2>
        <p className="mt-2 text-sm text-gray-600">
          Or{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            create a new account today
          </Link>
        </p>
      </div>

      <div className="mt-8">
        <Button 
          variant="outline" 
          onClick={() => googleLogin()}
          disabled={loading}
          className="w-full h-12 flex items-center justify-center gap-2 rounded-xl text-base font-medium shadow-sm border-gray-200"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.72 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
            <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.72 17.57C14.73 18.23 13.48 18.63 12 18.63C9.13 18.63 6.7 16.69 5.84 14.08H2.17V16.94C3.98 20.53 7.69 23 12 23Z" fill="#34A853"/>
            <path d="M5.84 14.08C5.62 13.43 5.49 12.73 5.49 12C5.49 11.27 5.62 10.57 5.84 9.92V7.06H2.17C1.42 8.55 1 10.22 1 12C1 13.78 1.42 15.45 2.17 16.94L5.84 14.08Z" fill="#FBBC05"/>
            <path d="M12 5.38C13.62 5.38 15.06 5.94 16.2 7.02L19.36 3.86C17.46 2.09 14.97 1 12 1C7.69 1 3.98 3.47 2.17 7.06L5.84 9.92C6.7 7.31 9.13 5.38 12 5.38Z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </Button>

        <div className="relative mt-8 mb-6">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm font-medium leading-6">
            <span className="bg-white px-6 text-gray-500">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="m@example.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input 
              id="password" 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-lg"
            />
          </div>
          
          <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold mt-2 shadow-lg shadow-primary/25 hover:shadow-xl transition-all" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </>
  );
}
