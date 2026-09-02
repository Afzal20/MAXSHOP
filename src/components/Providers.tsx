"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

const clientId = "572994709476-63fcnvi3fesnjcnktnqlq81aes2hncjo.apps.googleusercontent.com";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
