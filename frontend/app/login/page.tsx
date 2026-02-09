"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSiteState } from "@/app/store/SiteStore";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const isLoading = useSiteState((s) => s.isLoading);
  const router = useRouter();

  const handleLogin = async () => {
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Important: send & receive cookies
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setError(errData.message || "Login failed");
        return;
      }

      // Login successful, redirect or reload
      router.push("/dashboard"); // Or wherever you want to go after login
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-card border border-border rounded-xl p-8 w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">Login</h1>

        {error && (
          <div className="bg-red-100 text-red-800 p-2 rounded-md text-sm">{error}</div>
        )}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border border-border rounded-lg px-3 py-2 bg-background"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-border rounded-lg px-3 py-2 bg-background"
        />

        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full bg-foreground text-white rounded-lg py-2 font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {isLoading ? "Logging in..." : "Log In"}
        </button>
      </div>
    </div>
  );
}
