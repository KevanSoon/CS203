"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { api } from "@/app/api/api"; 
import { useSiteState } from "@/app/store/SiteStore";


export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    general?: string;
  }>({});

  const isLoading = useSiteState((s) => s.isLoading);
  const setUser = useSiteState((s) => s.setUser);
  const router = useRouter();

  const handleLogin = async () => {
    setErrors({});
    const newErrors: typeof errors = {};
    if (!username.trim()) {
      newErrors.username = "Username is required";
    }
    if (!password.trim()) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setPassword("");
      return;
    }

    try {
      const res = await api.post("/api/auth/login", {
        username,
        password,
      });

      const data = res.data;

      setUser({
        username: data.username,
        email: data.email,
        usertype: data.usertype,
      });

      toast.success("Login Successful")
      if (data.usertype === "user") {
        router.push("/dashboard");
      } else if (data.usertype === "admin") {
        router.push("/admin");
      } else if (data.usertype === "root") {
        router.push("/webadmin");
      }
    } catch (err: any) {
      setPassword("");

      if (err.response?.status === 400) {
        setErrors({ username: "Username does not exist" });
      } else if (err.response?.status === 401) {
        setErrors({ password: "Incorrect password" });
      } else {
        setErrors({ general: "Login failed. Please try again." });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FCFBF7] p-4 font-sans text-slate-800">
      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 space-y-6">

        <div className="text-center">
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

        <div className="space-y-5">

          <div className="space-y-1">
            <label className="text-sm font-semibold ml-1">
              Username
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              placeholder="SkibidiRizzler69"
              className={`w-full border-2 rounded-xl px-4 py-3
                ${errors.username ? "border-red-500" : "border-slate-100"}
                bg-slate-50/50 placeholder:text-slate-400
                focus:outline-none focus:border-[#9D94EB]
                focus:ring-4 focus:ring-[#9D94EB]/10 transition-all`}
            />
            {errors.username && (
              <p className="text-red-500 text-xs ml-1">
                {errors.username}
              </p>
            )}
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
              className={`w-full border-2 rounded-xl px-4 py-3
                ${errors.password ? "border-red-500" : "border-slate-100"}
                bg-slate-50/50 placeholder:text-slate-400
                focus:outline-none focus:border-[#9D94EB]
                focus:ring-4 focus:ring-[#9D94EB]/10 transition-all`}
            />
            {errors.password && (
              <p className="text-red-500 text-xs ml-1">
                {errors.password}
              </p>
            )}
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full h-12 rounded-xl bg-[#9D94EB] text-white font-bold text-lg
              hover:bg-[#7f75d4] transition-colors disabled:opacity-50"
          >
            {isLoading ? "Loading… don’t blink 👀" : "Let me in 😤"}
          </button>

          {errors.general && (
            <p className="text-red-500 text-sm text-center">
              {errors.general}
            </p>
          )}
        </div>

        <div className="pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">
            First time here?{" "}
            <Link
              href="/signup"
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
