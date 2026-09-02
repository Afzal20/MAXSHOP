"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/accounts/password-reset/enterOtp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || data.error || "Invalid OTP code");
      }

      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Link href="/forgot-password" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to reset request
      </Link>
      
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Verify OTP</h2>
        <p className="mt-2 text-sm text-gray-600">
          We've sent a 6-digit code to <span className="font-semibold text-gray-900">{email}</span>. Please enter it below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 mt-8">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
            {error}
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="otp">6-Digit Code</Label>
          <Input 
            id="otp" 
            type="text" 
            placeholder="123456" 
            required
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="h-11 rounded-lg tracking-widest text-lg font-mono text-center"
          />
        </div>
        
        <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl transition-all" disabled={loading}>
          {loading ? "Verifying..." : "Verify Code"}
        </Button>
      </form>
    </>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}
