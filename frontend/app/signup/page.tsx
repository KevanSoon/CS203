"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { api } from "@/app/api/api";
import { useSiteState } from "@/app/store/SiteStore";

interface SignUpForm {
  username: string;
  email: string;
  usertype: string;
  password: string;
  confirmpassword: string;
}

interface FormErrors {
  username?: string;
  email?:string;
  usertype?: string;
  password?: string;
  confirmpassword?: string;
}

// Validation functions matching backend RegisterRequest.java
const validateUsername = (username: string): string | undefined => {
  if (!username) return "Don't shy la, put your name!";
  if (username.length > 50) return "Username too long leh! Max 50 characters only.";
  if (!/^[a-zA-Z0-9_!@]+$/.test(username)) {
    return "Username can only have letters, numbers, _, !, and @.";
  }
  return undefined;
};

const validateEmail = (email: string): string | undefined => {
  if (!email) return "Send to where ah? My carrier pigeon on leave leh.";
  if (email.length > 100) return "Email too long leh! Max 100 characters only.";
  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Eh this email not correct leh. Check again!";
  }
  return undefined;
};

const validatePassword = (password: string): string | undefined => {
  if (!password) return "Don't let people fanum tax your account. Faster set your password la!";
  if (password.length < 8) return "Password too short! Need at least 8 characters.";
  if (password.length > 100) return "Password too long leh! Max 100 characters only.";
  if (!/(?=.*[a-z])/.test(password)) {
    return "Password must have at least one small letter (a-z).";
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return "Password must have at least one capital letter (A-Z).";
  }
  if (!/(?=.*\d)/.test(password)) {
    return "Password must have at least one number (0-9).";
  }
  return undefined;
};

const validateUserType = (usertype: string): string | undefined => {
  if (!usertype) return "Please select a user type.";
  if (!["user", "admin", "root"].includes(usertype)) {
    return "Invalid user type selected.";
  }
  return undefined;
};

export default function SignUp() {
  const[form, setForm] = useState<SignUpForm>({
    username: "",
    email: "",
    usertype: "user",
    password: "",
    confirmpassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState<string>("");
  
  // Get loading state from store
  const isLoading = useSiteState((state) => state.isLoading);

  // Check if all required fields are filled
  const isFormComplete = 
    form.username.trim() !== "" &&
    form.email.trim() !== "" &&
    form.usertype !== "" &&
    form.password !== "" &&
    form.confirmpassword !== "";

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>){
    const { name, value } = e.target;
    setForm({...form, [name]: value});
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors({...errors, [name]: undefined});
    }
    
    // Special handling: if password changes and confirmpassword has error, clear it
    // so user can see if they now match
    if (name === 'password' && errors.confirmpassword) {
      setErrors({...errors, confirmpassword: undefined});
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    let error: string | undefined;

    // Validate the field that just lost focus
    switch (name) {
      case 'username':
        error = validateUsername(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        // Also check if confirmpassword now matches
        if (!error && form.confirmpassword && value !== form.confirmpassword) {
          setErrors({...errors, password: undefined, confirmpassword: "Eh the password not the same leh. Try again."});
          return;
        }
        break;
      case 'confirmpassword':
        if (value !== form.password) {
          error = "Eh the password not the same leh. Try again.";
        }
        break;
      case 'usertype':
        error = validateUserType(value);
        break;
    }

    if (error) {
      setErrors({...errors, [name]: error});
    } else {
      // Clear the error if validation passed
      setErrors({...errors, [name]: undefined});
    }
  }

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault();

    const newErrors: FormErrors = {};
    
    // Validate all fields using the validation functions
    const usernameError = validateUsername(form.username);
    const emailError = validateEmail(form.email);
    const passwordError = validatePassword(form.password);
    const userTypeError = validateUserType(form.usertype);
    
    if (usernameError) newErrors.username = usernameError;
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;
    if (userTypeError) newErrors.usertype = userTypeError;
    
    // Check password confirmation
    if (form.password !== form.confirmpassword) {
      newErrors.confirmpassword = "Eh the password not the same leh. Try again.";
    }

    setErrors(newErrors);
    
    if(Object.keys(newErrors).length === 0){
      // Clear any previous general error
      setGeneralError("");
      
      try {
        // Call registration API route using the api instance
        // The api interceptors will automatically set isLoading to true
        const response = await api.post('/api/auth/register', {
          username: form.username,
          email: form.email,
          usertype: form.usertype,
          password: form.password,
        });

        // Success! Redirect to login page
        window.location.href = '/login';
        
      } catch (error: any) {
        // Handle errors from the backend
        const errorMessage = error.response?.data?.error || error.message || 'Registration failed';
        
        // Check if it's a field-specific error
        if (errorMessage.toLowerCase().includes('username')) {
          setErrors({ username: 'Username already taken lah!' });
        } else if (errorMessage.toLowerCase().includes('email')) {
          setErrors({ email: 'Email already registered leh!' });
        } else {
          // For general errors, set the general error state
          setGeneralError(errorMessage);
        }
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FCFBF7] p-4 font-sans text-slate-800">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#9D94EB]/30 border-t-[#9D94EB] rounded-full animate-spin"></div>
            <p className="text-slate-700 font-medium">Creating your account...</p>
          </div>
        </div>
      )}

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
              onBlur={handleBlur}
              disabled={isLoading}
              placeholder="e.g. SkibidiRizzler"
              className={`w-full border-2 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#9D94EB] focus:bg-white focus:ring-4 focus:ring-[#9D94EB]/10 transition-all duration-200
                ${errors.username ? "border-red-400 bg-red-50" : "border-slate-100 bg-slate-50/50 focus:border-[#9D94EB] focus:ring-[#9D94EB]/10"}
                ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
            />

            {!errors.username && (
              <p className="text-xs text-slate-500 ml-1 mt-1">Max 50 characters. Letters, numbers, _, !, @ only.</p>
            )}

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
              onBlur={handleBlur}
              disabled={isLoading}
              placeholder="skibidi@example.com"
              className={`w-full border-2 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#9D94EB] focus:bg-white focus:ring-4 focus:ring-[#9D94EB]/10 transition-all duration-200
                ${errors.email ? "border-red-400 bg-red-50" : "border-slate-100 bg-slate-50/50 focus:border-[#9D94EB] focus:ring-[#9D94EB]/10"}
                ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
            />

            {!errors.email && (
              <p className="text-xs text-slate-500 ml-1 mt-1">Max 100 characters. Must be a valid email.</p>
            )}

            {errors.email && (
              <p className="text-sm text-red-500 ml-1 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Select Dropdown */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 ml-1">User Type</label>
            <select
              name="usertype"
              value={form.usertype}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
              className={`w-full border-2 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#9D94EB] focus:bg-white focus:ring-4 focus:ring-[#9D94EB]/10 transition-all duration-200 appearance-none cursor-pointer
                ${errors.usertype ? "border-red-400 bg-red-50" : "border-slate-100 bg-slate-50/50 focus:border-[#9D94EB] focus:ring-[#9D94EB]/10"}
                ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <option value="" disabled className="text-slate-400 bg-white py-2">Select user type...</option>
              <option value="user" className="text-slate-800 bg-white py-2">User</option>
              <option value="admin" className="text-slate-800 bg-white py-2">Creator</option>
            </select>
            
            {errors.usertype && (
              <p className="text-sm text-red-500 ml-1 mt-1">{errors.usertype}</p>
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
              onBlur={handleBlur}
              disabled={isLoading}
              placeholder="••••••••"
              className={`w-full border-2 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#9D94EB] focus:bg-white focus:ring-4 focus:ring-[#9D94EB]/10 transition-all duration-200
                ${errors.password ? "border-red-400 bg-red-50" : "border-slate-100 bg-slate-50/50 focus:border-[#9D94EB] focus:ring-[#9D94EB]/10"}
                ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
            />

            {!errors.password && (
              <p className="text-xs text-slate-500 ml-1 mt-1">8-100 characters. Must have uppercase, lowercase, and number.</p>
            )}

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
              onBlur={handleBlur}
              disabled={isLoading}
              placeholder="••••••••"
              className={`w-full border-2 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#9D94EB] focus:bg-white focus:ring-4 focus:ring-[#9D94EB]/10 transition-all duration-200
                ${errors.confirmpassword ? "border-red-400 bg-red-50" : "border-slate-100 bg-slate-50/50 focus:border-[#9D94EB] focus:ring-[#9D94EB]/10"}
                ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
            />
            {errors.confirmpassword && (
              <p className="text-sm text-red-500 ml-1 mt-1">{errors.confirmpassword}</p>
            )}
          </div>

          {/* General Error Message */}
          {generalError && (
            <div className="p-4 rounded-xl bg-red-50 border-2 border-red-200">
              <p className="text-sm text-red-600 font-medium">{generalError}</p>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !isFormComplete}
              className="w-full h-12 rounded-xl bg-[#9D94EB] text-white font-bold text-lg
              hover:bg-[#7f75d4] transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing up...</span>
                </>
              ) : (
                "Sign Up"
              )}
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