"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Pencil, Camera, BookOpen, Clock, Award } from "lucide-react";
import Image from "next/image";

interface UpdateProfileForm {
  username: string;
  email: string;
  password: string;
  confirmpassword: string;
  profilePic: string;
}

// --- Mock Data ---
const MOCK_STATS = {
  overallProgress: 65,
  lessonsCompleted: 12,
  totalHours: 24,
};

const MOCK_HISTORY = [
  { id: 1, title: "Intro to Brainrot 101", date: "2024-05-20", score: "90%" },
  { id: 2, title: "Advanced Slang Mastery", date: "2024-05-18", score: "100%" },
  { id: 3, title: "Gaming Culture and Slangs", date: "2024-05-15", score: "75%" },
];

export default function UpdateProfile() {
  const [form, setForm] = useState<UpdateProfileForm>({
    username: "SkibidiStudent",
    email: "",
    password: "",
    confirmpassword: "",
    profilePic: "",
  });

  // ✅ use STATE instead of ref so it is safe during render
  const [originalForm, setOriginalForm] = useState<UpdateProfileForm>({
    username: "SkibidiStudent",
    email: "",
    password: "",
    confirmpassword: "",
    profilePic: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);

  const usernameInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingUsername) {
      usernameInputRef.current?.focus();
    }
  }, [isEditingUsername]);

  // ✅ safe — no refs used
  function hasChanges(): boolean {
    return (
      form.username !== originalForm.username ||
      form.email !== originalForm.email ||
      form.profilePic !== originalForm.profilePic ||
      form.password !== ""
    );
  }

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setForm({ ...form, profilePic: imageUrl });
    }
  };

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(false);

    const newErrors: Record<string, string> = {};

    if (!form.username) newErrors.username = "Cannot be anonymous la!";

    if (form.password && form.password !== form.confirmpassword) {
      newErrors.confirmpassword = "Eh the password not the same leh.";
    }

    if (!hasChanges()) {
      newErrors.nochange = "Please update at least one field before saving.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log("Saving changes:", form);

      // simulate save → update original snapshot
      setOriginalForm({
        ...form,
        password: "",
        confirmpassword: "",
      });

      // clear password fields after save
      setForm((prev) => ({ ...prev, password: "", confirmpassword: "" }));

      setSuccess(true);
    }
  }

  return (
    <div className="min-h-screen bg-[#FCFBF7] p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 h-fit">
          <div className="flex flex-col items-center text-center mb-8">
            <div onClick={handleImageClick} className="relative mb-4 group cursor-pointer">
              <div className="w-24 h-24 rounded-full border-4 border-[#9D94EB] overflow-hidden bg-slate-100 flex items-center justify-center text-5xl shadow-sm">
                {form.profilePic ? (
                  <Image src={form.profilePic} alt="Profile" fill className="object-cover" unoptimized />
                ) : (
                  "👩🏼‍🦳"
                )}
              </div>
              <div className="absolute bottom-0 right-0 bg-[#9D94EB] p-2 rounded-full border-4 border-white text-white">
                <Camera size={14} />
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
            </div>

            <div className="flex items-center gap-2">
              {isEditingUsername ? (
                <input
                  ref={usernameInputRef}
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  onBlur={() => setIsEditingUsername(false)}
                  onKeyDown={(e) => e.key === "Enter" && setIsEditingUsername(false)}
                  className="text-xl font-extrabold border-b-2 border-[#9D94EB] bg-transparent outline-none text-center"
                />
              ) : (
                <>
                  <h1 className="text-xl font-extrabold">{form.username}</h1>
                  <button onClick={() => setIsEditingUsername(true)} className="p-1 hover:bg-slate-100 rounded-full">
                    <Pencil size={16} className="text-[#9D94EB]" />
                  </button>
                </>
              )}
            </div>
            {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
              <input
                type="email"
                name="email"
                placeholder="skibidi@example.com"
                value={form.email}
                onChange={handleChange}
                className="w-full border-2 border-slate-100 rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">New Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className="w-full border-2 border-slate-100 rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Confirm Password</label>
              <input
                type="password"
                name="confirmpassword"
                placeholder="••••••••"
                value={form.confirmpassword}
                onChange={handleChange}
                className={`w-full border-2 rounded-xl px-4 py-2.5 text-sm ${
                  errors.confirmpassword ? "border-red-400" : "border-slate-100"
                }`}
              />
              {errors.confirmpassword && (
                <p className="text-xs text-red-500">{errors.confirmpassword}</p>
              )}
            </div>

            {errors.nochange && (
              <p className="text-xs text-red-500 text-center">{errors.nochange}</p>
            )}

            <button
              type="submit"
              disabled={!hasChanges()}
              className="w-full h-11 rounded-xl bg-[#9D94EB] text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Changes
            </button>
          </form>

          {success && (
            <p className="text-center mt-4 text-green-600 font-bold text-sm">
              Profile updated successfully.
            </p>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-stone-100">
            <h2 className="text-lg font-extrabold mb-6 flex items-center gap-2">
              <Award size={22} /> Learning Progress
            </h2>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-bold">Overall Completion</span>
                  <span className="text-xl font-black">{MOCK_STATS.overallProgress}%</span>
                </div>
                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#9D94EB]"
                    style={{ width: `${MOCK_STATS.overallProgress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 flex gap-3">
                  <BookOpen size={20} />
                  <div>
                    <p className="text-xs">Lessons</p>
                    <p className="text-lg font-black">{MOCK_STATS.lessonsCompleted}</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 flex gap-3">
                  <Clock size={20} />
                  <div>
                    <p className="text-xs">Hours</p>
                    <p className="text-lg font-black">{MOCK_STATS.totalHours}h</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-stone-100">
            <h2 className="text-lg font-extrabold mb-6">Recent Lessons</h2>
            <div className="space-y-3">
              {MOCK_HISTORY.map((lesson) => (
                <div key={lesson.id} className="flex justify-between p-4 rounded-2xl border">
                  <div>
                    <h3 className="font-bold">{lesson.title}</h3>
                    <p className="text-xs text-slate-400">{lesson.date}</p>
                  </div>
                  <span className="font-black">{lesson.score}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link href="/dashboard" className="text-sm font-bold hover:underline">
                ← Back to User Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}