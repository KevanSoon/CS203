"use client";

import Link from "next/link";
import { useState } from "react";

interface SignUpForm {
  username: string;
  email: string;
  password: string;
  confirmpassword: string;
}

interface FormErrors {
  username?: string;
  email?:string;
  password?: string;
  confirmpassword?: string;
}

export default function SignUp() {
  const[form, setForm] = useState<SignUpForm>({
    username: "",
    email: "",
    password: "",
    confirmpassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  function handleChange(e: React.ChangeEvent<HTMLInputElement>){
    setForm({...form, [e.target.name]: e.target.value});
  }

  function handleSubmit(e: React.FormEvent){
    e.preventDefault();

    const newErrors: FormErrors = {};
    
    // other error for username -- username already taken 
    if(!form.username) newErrors.username = "Don't shy la, put your name!";

    if(!form.email) newErrors.email = "Send to where ah? My carrier pigeon on leave leh.";

    if(!form.password) newErrors.password = "Don't let people fanum tax your account. Faster set your password la!";

    if (form.password !== form.confirmpassword) {
      newErrors.confirmpassword = "Eh the password not the same leh. Try again.";
    }

    setErrors(newErrors);
    
    if(Object.keys(newErrors).length === 0){
      console.log("Submitting: ", form);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FCFBF7] p-4 font-sans text-slate-800">
        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100">
        
        {/* Brand Header */}
        <div className="mb-8 text-center">
          <h2 className="text-xl font-bold text-[#9D94EB] mb-2 tracking-tight">Simi Slang</h2>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Join the <span className="text-[#9D94EB]">Fam.</span>
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            Start decoding Gen Alpha slang today.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Username Input */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 ml-1">Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="e.g. SkibidiRizzler"
              className={`w-full border-2 border-slate-100 bg-slate-50/50 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#9D94EB] focus:bg-white focus:ring-4 focus:ring-[#9D94EB]/10 transition-all duration-200
                ${errors.username ? "border-red-400 bg-red-50" : "border-slate-100 bg-slate-50/50 focus:border-[#9D94EB] focus:ring-[#9D94EB]/10"}`}
            />

            {errors.username && (
              <p className="text-sm text-red-500 ml-1 mt-1">{errors.username}</p>
            )}
          </div>

          {/* Email Input */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 ml-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="skibidi@example.com"
              className={`w-full border-2 border-slate-100 bg-slate-50/50 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#9D94EB] focus:bg-white focus:ring-4 focus:ring-[#9D94EB]/10 transition-all duration-200
                        ${errors.email ? "border-red-400 bg-red-50" : "border-slate-100 bg-slate-50/50 focus:border-[#9D94EB] focus:ring-[#9D94EB]/10"}`}

            />
            {errors.email && (
              <p className="text-sm text-red-500 ml-1 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`w-full border-2 border-slate-100 bg-slate-50/50 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#9D94EB] focus:bg-white focus:ring-4 focus:ring-[#9D94EB]/10 transition-all duration-200
                        ${errors.password ? "border-red-400 bg-red-50" : "border-slate-100 bg-slate-50/50 focus:border-[#9D94EB] focus:ring-[#9D94EB]/10"}`}

            />
            {errors.password && (
              <p className="text-sm text-red-500 ml-1 mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Input */}
            <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 ml-1">Confirm Password</label>
            <input
              type="password"
              name="confirmpassword"
              value={form.confirmpassword}
              onChange={handleChange}
              placeholder="••••••••"
              className={`w-full border-2 border-slate-100 bg-slate-50/50 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#9D94EB] focus:bg-white focus:ring-4 focus:ring-[#9D94EB]/10 transition-all duration-200
                        ${errors.confirmpassword ? "border-red-400 bg-red-50" : "border-slate-100 bg-slate-50/50 focus:border-[#9D94EB] focus:ring-[#9D94EB]/10"}`}

            />
            {errors.confirmpassword && (
              <p className="text-sm text-red-500 ml-1 mt-1">{errors.confirmpassword}</p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-[#9D94EB] text-white font-bold text-lg
              hover:bg-[#7f75d4] transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sign Up
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">
            Already catch no ball?{" "}
            <Link 
              href="/login" 
              className="font-bold text-[#9D94EB] hover:text-[#7f75d4] hover:underline decoration-2 underline-offset-2 transition-colors"
            >
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

