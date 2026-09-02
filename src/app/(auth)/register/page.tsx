"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGoogleLogin } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.password_confirmation) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/accounts/user/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || Object.values(data).join(", ") || "Failed to register");
      }

      // Automatically login after register
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      if (loginRes.ok) {
        router.push("/");
        router.refresh();
      } else {
        router.push("/login");
      }
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
        });
        
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to register with Google");
        }
        router.push("/");
        router.refresh();
      } catch (err) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    onError: errorResponse => setError("Google Registration Failed")
  });

  return (
    <>
      <Link href="/" className="inline-flex items-center text-[13px] font-bold uppercase text-[#666666] hover:text-[#dc3545] mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to home
      </Link>
      
      <div>
        <h2 className="text-2xl font-bold uppercase text-[#333333]">Create an account</h2>
        <p className="mt-2 text-[14px] text-[#666666]">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-[#dc3545] hover:underline">
            Sign in instead
          </Link>
        </p>
      </div>

      <div className="mt-8">
        <Button 
          variant="outline" 
          onClick={() => googleLogin()}
          disabled={loading}
          className="w-full h-12 flex items-center justify-center gap-2 rounded-none border border-[#e5e5e5] text-[14px] font-bold uppercase text-[#333333] hover:bg-[#f5f5f5]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.72 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
            <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.72 17.57C14.73 18.23 13.48 18.63 12 18.63C9.13 18.63 6.7 16.69 5.84 14.08H2.17V16.94C3.98 20.53 7.69 23 12 23Z" fill="#34A853"/>
            <path d="M5.84 14.08C5.62 13.43 5.49 12.73 5.49 12C5.49 11.27 5.62 10.57 5.84 9.92V7.06H2.17C1.42 8.55 1 10.22 1 12C1 13.78 1.42 15.45 2.17 16.94L5.84 14.08Z" fill="#FBBC05"/>
            <path d="M12 5.38C13.62 5.38 15.06 5.94 16.2 7.02L19.36 3.86C17.46 2.09 14.97 1 12 1C7.69 1 3.98 3.47 2.17 7.06L5.84 9.92C6.7 7.31 9.13 5.38 12 5.38Z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </Button>

        <div className="relative mt-8 mb-6">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-[#e5e5e5]" />
          </div>
          <div className="relative flex justify-center text-[12px] font-bold uppercase text-[#666666]">
            <span className="bg-white px-4">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-[13px] text-[#721c24] bg-[#f8d7da] border border-[#f5c6cb]">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-[13px] font-bold uppercase text-[#333333]">Username</Label>
            <Input 
              id="username" 
              placeholder="johndoe" 
              required 
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="h-12 rounded-none border-[#e5e5e5] focus-visible:ring-[#dc3545]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[13px] font-bold uppercase text-[#333333]">Email address</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="m@example.com" 
              required 
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-12 rounded-none border-[#e5e5e5] focus-visible:ring-[#dc3545]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[13px] font-bold uppercase text-[#333333]">Password</Label>
            <Input 
              id="password" 
              type="password" 
              required 
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="h-12 rounded-none border-[#e5e5e5] focus-visible:ring-[#dc3545]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password_confirmation" className="text-[13px] font-bold uppercase text-[#333333]">Confirm Password</Label>
            <Input 
              id="password_confirmation" 
              type="password" 
              required 
              value={formData.password_confirmation}
              onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
              className="h-12 rounded-none border-[#e5e5e5] focus-visible:ring-[#dc3545]"
            />
          </div>
          
          <Button type="submit" className="w-full h-12 bg-[#dc3545] hover:bg-[#c82333] text-white font-bold uppercase rounded-none mt-4 transition-colors disabled:opacity-50" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </div>
    </>
  );
}
