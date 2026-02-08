"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Bro forgot their username 💀");
      return;
    }

    if (!password.trim()) {
      setError("Password missing. This ain’t optional 😭");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:7860/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      console.log(username, password)
      console.log(res)

      if (!res.ok) {
        throw new Error("Invalid");
      }

      router.push("/dashboard");
    } catch {
      setError("Wrong combo. That was NOT very sigma of you.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FCFBF7] p-4 font-sans text-slate-800">
      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100">

        <div className="mb-8 text-center">
          <h2 className="text-xl font-bold text-[#9D94EB] mb-2 tracking-tight">
            Simi Slang
          </h2>
          <h1 className="text-3xl font-extrabold tracking-tight">
            You back already?
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            Lock in. Brainrot better be cooking.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-semibold ml-1">
              Username
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              placeholder="SkibidiRizzler69"
              className="w-full border-2 border-slate-100 bg-slate-50/50 rounded-xl px-4 py-3
              placeholder:text-slate-400 focus:outline-none focus:border-[#9D94EB]
              focus:ring-4 focus:ring-[#9D94EB]/10 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold ml-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              placeholder="Top secret sigma code"
              className="w-full border-2 border-slate-100 bg-slate-50/50 rounded-xl px-4 py-3
              placeholder:text-slate-400 focus:outline-none focus:border-[#9D94EB]
              focus:ring-4 focus:ring-[#9D94EB]/10 transition-all"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-[#9D94EB] text-white font-bold text-lg
              hover:bg-[#7f75d4] transition-colors
              disabled:opacity-50"
            >
              {isLoading ? "Loading… don’t blink 👀" : "Let me in 😤"}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">
            First time here?{" "}
            <Link
              href="/register"
              className="font-bold text-[#9D94EB] hover:underline"
            >
              Join the chaos
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}