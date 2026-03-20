"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PencilLine, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/app/api/api";

const BACKEND_PUBLIC_BASE = "http://localhost:8080";

type ProfileResponse = {
  username?: string;
  email?: string;
  profilePictureUrl?: string; // "/uploads/profile/alice.jpg"
};

const validateEmail = (email: string): string | undefined => {
  if (!email) return "Send to where ah? My carrier pigeon on leave leh.";
  if (email.length > 100) return "Email too long leh! Max 100 characters only.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Eh this email not correct leh. Check again!";
  }
  return undefined;
};

const validatePassword = (password: string): string | undefined => {
  if (!password) return "Don't let people fanum tax your account. Faster set your password la!";
  if (password.length < 8) return "Password too short! Need at least 8 characters.";
  if (password.length > 100) return "Password too long leh! Max 100 characters only.";
  if (!/(?=.*[a-z])/.test(password)) return "Password must have at least one small letter (a-z).";
  if (!/(?=.*[A-Z])/.test(password)) return "Password must have at least one capital letter (A-Z).";
  if (!/(?=.*\d)/.test(password)) return "Password must have at least one number (0-9).";
  return undefined;
};

export default function EditProfilePage() {
  const router = useRouter();

  const [pageError, setPageError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setPageError("");
      setSuccessMsg("");

      try {
        const res = await api.get("/api/profile");
        const p = res.data as ProfileResponse;
        setUsername(p.username ?? "");
        setEmail(p.email ?? "");
        setProfilePictureUrl(p.profilePictureUrl ?? "");
      } catch (e: any) {
        if (e?.response?.status === 401) { router.replace("/login"); return; }
        setPageError(e?.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  // cleanup blob URL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const emailErr = useMemo(() => validateEmail(email.trim()), [email]);

  const passwordErr = useMemo(() => {
    if (!password) return undefined; // optional
    return validatePassword(password);
  }, [password]);

  const confirmErr = useMemo(() => {
    if (!password) return undefined;
    if (!confirmPassword) return "Confirm password cannot be empty.";
    if (confirmPassword !== password) return "Passwords do not match.";
    return undefined;
  }, [password, confirmPassword]);

  const imageErr = useMemo(() => {
    if (!imageFile) return undefined;
    if (!imageFile.type.startsWith("image/")) return "Please upload an image file leh.";
    // optional size limit
    const maxMb = 5;
    if (imageFile.size > maxMb * 1024 * 1024) return `Image too big leh. Max ${maxMb}MB.`;
    return undefined;
  }, [imageFile]);

  const canSave = useMemo(() => {
    if (emailErr) return false;
    if (imageErr) return false;
    if (password) {
      if (passwordErr) return false;
      if (confirmErr) return false;
    }
    return true;
  }, [emailErr, imageErr, password, passwordErr, confirmErr]);

  const existingPic =
    profilePictureUrl && profilePictureUrl.startsWith("/")
      ? `${BACKEND_PUBLIC_BASE}${profilePictureUrl}`
      : profilePictureUrl;

  const shownPic = previewUrl || existingPic;

  const onPickImage: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0] || null;
    setPageError("");
    setSuccessMsg("");

    if (!file) {
      setImageFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
      return;
    }

    setImageFile(file);

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const onSave = async () => {
    setPageError("");
    setSuccessMsg("");

    if (!canSave) return;

    const formData = new FormData();
    formData.append("email", email.trim());

    // only send password if user typed it
    if (password) formData.append("password", password);

    // send image if selected
    if (imageFile) formData.append("profileImage", imageFile);

    setSaving(true);
    try {
      await api.patch("/api/profile", formData);
      toast.success("Update Successful");
      router.push("/profile");
    } catch (e: any) {
      if (e?.response?.status === 401) { router.replace("/login"); return; }
      setPageError(e?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const initial = (username?.[0] || "?").toUpperCase();

  if (loading) return <div className="min-h-screen bg-linear-to-b from-[#F2F0FF] via-white to-white" />;


  return (
    <div className="min-h-screen bg-linear-to-b from-[#F2F0FF] via-white to-white px-5 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Top card (username + picture) */}
        <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur">
          <div className="flex flex-col items-center text-center">
            <div className="relative -mt-12 mb-3">
              <div className="h-28 w-28 rounded-full bg-white p-1 shadow-[0_14px_40px_rgba(0,0,0,0.18)]">
                <div className="relative h-full w-full overflow-hidden rounded-full bg-slate-200 ring-4 ring-white">
                  {shownPic ? (
                    <Image
                      src={shownPic}
                      alt="Profile picture"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl">
                      {initial}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight">{username || "User"}</h1>
            <p className="mt-1 text-sm text-slate-500">Edit your profile</p>
          </div>
        </div>

        {/* Form card */}
        <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur">
          {pageError && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {pageError}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
              {successMsg}
            </div>
          )}

          {/* Username read-only */}
          <div className="mb-4">
            <label className="text-sm font-bold text-slate-700">Username (cannot change)</label>
            <input
              value={username}
              readOnly
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 outline-none"
            />
          </div>

          {/* Upload image */}
          <div className="mb-4">
            <label className="text-sm font-bold text-slate-700">Profile picture</label>

            <div className="mt-2 flex items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
                <Upload size={16} />
                Choose image
                <input
                  type="file"
                  accept="image/*"
                  onChange={onPickImage}
                  className="hidden"
                />
              </label>

              {imageFile ? (
                <span className="text-sm text-slate-600 truncate">
                  {imageFile.name}
                </span>
              ) : (
                <span className="text-sm text-slate-500">
                  No new image selected
                </span>
              )}
            </div>

            {imageErr && <p className="mt-2 text-xs font-semibold text-red-600">{imageErr}</p>}
            <p className="mt-2 text-xs text-slate-500">Max 5MB. Image only.</p>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="text-sm font-bold text-slate-700">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
              type="email"
              placeholder="you@example.com"
            />
            {emailErr && <p className="mt-2 text-xs font-semibold text-red-600">{emailErr}</p>}
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="text-sm font-bold text-slate-700">New Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
              type="password"
              placeholder="Leave blank to keep current password"
            />
            {password && passwordErr && (
              <p className="mt-2 text-xs font-semibold text-red-600">{passwordErr}</p>
            )}
          </div>

          {/* Confirm password */}
          <div className="mb-6">
            <label className="text-sm font-bold text-slate-700">Confirm Password</label>
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#6C63FF]/30 disabled:bg-slate-50"
              type="password"
              placeholder="Re-enter new password"
              disabled={!password}
            />
            {password && confirmErr && (
              <p className="mt-2 text-xs font-semibold text-red-600">{confirmErr}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onSave}
              disabled={!canSave || saving}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-[#6C63FF] to-[#9D94EB] px-4 py-3 text-sm font-bold text-white shadow-[0_10px_25px_rgba(108,99,255,0.25)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <PencilLine size={16} />
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
