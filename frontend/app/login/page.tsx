"use client";

import { useState } from "react";
import { useSiteState } from "@/app/store/SiteStore";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<string>("");
  const isLoading = useSiteState((s) => s.isLoading);

  const handleLogin = async () => {
    setResult("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setResult("Error: " + (err instanceof Error ? err.message : String(err)));
    } finally {
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-card border border-border rounded-xl p-8 w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">Login (Temp)</h1>
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
        {result && (
          <pre className="bg-muted rounded-md p-3 text-xs overflow-auto max-h-60">
            {result}
          </pre>
        )}
      </div>
    </div>
  );
}
