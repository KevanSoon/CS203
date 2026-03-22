"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/app/api/api";

type Step = "email" | "otp" | "password";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [cooldown, setCooldown] = useState(0);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    otp?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const router = useRouter();

  // Step 1 — send OTP
  const handleSendOtp = async () => {
    setErrors({});
    if (!email.trim()) {
      setErrors({ email: "Email is required" });
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/api/auth/forgot-password", { email });
      toast.success("OTP sent! Check your inbox 📬");
      setStep("otp");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 — verify OTP
  const handleVerifyOtp = async () => {
    setErrors({});
    if (!otp.trim()) {
      setErrors({ otp: "OTP is required" });
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/api/auth/verify-otp", { email, otp });
      toast.success("OTP verified ✅");
      setStep("password");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid OTP. Try again.");
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setErrors({});
    setOtp("");
    setIsLoading(true);
    try {
      await api.post("/api/auth/forgot-password", { email });
      toast.success("New OTP sent! 📬");
      startCooldown();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to resend. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3 — reset password
  const handleResetPassword = async () => {
    setErrors({});
    const newErrors: typeof errors = {};

    if (!newPassword) {
        newErrors.password = "Don't let people fanum tax your account. Faster set your password la!";
    } else if (newPassword.length < 8) {
        newErrors.password = "Password too short! Need at least 8 characters.";
    } else if (newPassword.length > 100) {
        newErrors.password = "Password too long leh! Max 100 characters only.";
    } else if (!/(?=.*[a-z])/.test(newPassword)) {
        newErrors.password = "Password must have at least one small letter (a-z).";
    } else if (!/(?=.*[A-Z])/.test(newPassword)) {
        newErrors.password = "Password must have at least one capital letter (A-Z).";
    } else if (!/(?=.*\d)/.test(newPassword)) {
        newErrors.password = "Password must have at least one number (0-9).";
    }

    if (!confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
        newErrors.confirmPassword = "Eh the password not the same leh. Try again.";
    }

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
    }

    setIsLoading(true);
    try {
        await api.post("/api/auth/reset-password", {
        email,
        otp,
        password: newPassword,
        });
        toast.success("Password reset! Go log in 🔓");
        router.push("/login");
    } catch (err: any) {
        toast.error(err.response?.data?.message || "Reset failed. Try again.");
    } finally {
        setIsLoading(false);
    }
    };

  const inputClass = (hasError?: string) =>
    `w-full border-2 rounded-xl px-4 py-3
    ${hasError ? "border-red-500" : "border-slate-100"}
    bg-slate-50/50 placeholder:text-slate-400
    focus:outline-none focus:border-[#9D94EB]
    focus:ring-4 focus:ring-[#9D94EB]/10 transition-all`;

  const stepLabels: Record<Step, { heading: string; sub: string }> = {
    email: {
      heading: "Forgot your password?",
      sub: "No cap, it happens. Drop your email and we'll sort it out.",
    },
    otp: {
      heading: "Check your inbox 👀",
      sub: "We slid a code into your email. Enter it below.",
    },
    password: {
      heading: "New password, who dis?",
      sub: "Make it hard to guess. No 'password123' energy.",
    },
  };

  const startCooldown = () => {
  setCooldown(60);
  const interval = setInterval(() => {
    setCooldown((prev) => {
      if (prev <= 1) {
        clearInterval(interval);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FCFBF7] p-4 font-sans text-slate-800">
      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 space-y-6">

        {/* Header */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-[#9D94EB] mb-2 tracking-tight">
            Simi Slang
          </h2>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {stepLabels[step].heading}
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            {stepLabels[step].sub}
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2">
          {(["email", "otp", "password"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  step === s
                    ? "bg-[#9D94EB] scale-125"
                    : ["email", "otp", "password"].indexOf(step) > i
                    ? "bg-[#9D94EB] opacity-40"
                    : "bg-slate-200"
                }`}
              />
              {i < 2 && <div className="w-6 h-px bg-slate-200" />}
            </div>
          ))}
        </div>

        <div className="space-y-5">

          {/* Step 1 — Email */}
          {step === "email" && (
            <div className="space-y-1">
              <label className="text-sm font-semibold ml-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                disabled={isLoading}
                placeholder="yourname@example.com"
                className={inputClass(errors.email)}
              />
              {errors.email && (
                <p className="text-red-500 text-xs ml-1">{errors.email}</p>
              )}
            </div>
          )}

          {/* Step 2 — OTP */}
          {step === "otp" && (
            <div className="space-y-1">
              <label className="text-sm font-semibold ml-1">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                disabled={isLoading}
                placeholder="6-digit code"
                maxLength={6}
                className={inputClass(errors.otp)}
              />
              {errors.otp && (
                <p className="text-red-500 text-xs ml-1">{errors.otp}</p>
              )}
              <p className="text-slate-400 text-xs ml-1 pt-1">
                Code sent to{" "}
                <span className="font-semibold text-slate-600">{email}</span>
              </p>
            </div>
          )}

          {/* Step 3 — New password */}
          {step === "password" && (
            <>
              <div className="space-y-1">
                <label className="text-sm font-semibold ml-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                  placeholder="Make it sigma-level secure"
                  className={inputClass(errors.password)}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs ml-1">{errors.password}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold ml-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                  disabled={isLoading}
                  placeholder="Type it again, no cap"
                  className={inputClass(errors.confirmPassword)}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs ml-1">{errors.confirmPassword}</p>
                )}
              </div>
            </>
          )}

          {/* Primary button */}
          <button
            onClick={
              step === "email"
                ? handleSendOtp
                : step === "otp"
                ? handleVerifyOtp
                : handleResetPassword
            }
            disabled={isLoading}
            className="w-full h-12 rounded-xl bg-[#9D94EB] text-white font-bold text-lg
              hover:bg-[#7f75d4] transition-colors disabled:opacity-50"
          >
            {isLoading
              ? "Hang on… ⏳"
              : step === "email"
              ? "Send the code 📨"
              : step === "otp"
              ? "Verify code ✅"
              : "Reset password 🔑"}
          </button>

          {/* Resend OTP (only on OTP step) */}
          {step === "otp" && (
            <button
            onClick={handleResendOtp}
            disabled={isLoading || cooldown > 0}
            className="w-full h-10 rounded-xl border-2 border-slate-100 text-slate-500
                font-semibold text-sm hover:border-[#9D94EB] hover:text-[#9D94EB]
                transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">
            Actually remember it?{" "}
            <Link href="/login" className="font-bold text-[#9D94EB] hover:underline">
              Log back in
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}