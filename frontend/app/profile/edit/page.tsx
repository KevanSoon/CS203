"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PencilLine, Upload, CheckCircle, XCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const BACKEND_PUBLIC_BASE = "http://localhost:8080";

type ProfileResponse = {
  username?: string;
  email?: string;
  profilePictureUrl?: string;
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

const validateUsername = (username: string): string | undefined => {
  if (!username) return "Username cannot be empty.";
  if (username.length < 3) return "Username too short (min 3 characters).";
  if (username.length > 30) return "Username too long (max 30 characters).";
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return "Only letters, numbers, underscores allowed.";
  return undefined;
};

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "error";

export default function EditProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  // original values from server
  const [origUsername, setOrigUsername] = useState("");
  const [origEmail, setOrigEmail] = useState("");
  const [origProfilePictureUrl, setOrigProfilePictureUrl] = useState("");

  // editable fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);

  // username availability
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setPageError("");

      try {
        const res = await fetch("/api/profile", { cache: "no-store" });
        const data: any = await res.json().catch(() => ({}));

        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        if (!res.ok) throw new Error(data?.message || data?.error || "Failed to load profile");

        const p = data as ProfileResponse;
        const u = p.username ?? "";
        const e = p.email ?? "";
        const pic = p.profilePictureUrl ?? "";

        setOrigUsername(u);
        setOrigEmail(e);
        setOrigProfilePictureUrl(pic);

        setUsername(u);
        setEmail(e);
        setProfilePictureUrl(pic);
      } catch (e: any) {
        setPageError(e?.message || "Failed to load profile");
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

  // debounced username availability check
  const checkUsernameAvailability = useCallback(async (value: string) => {
    if (!value || validateUsername(value)) {
      setUsernameStatus("idle");
      return;
    }
    // if unchanged from original, treat as fine — no network call needed
    if (value === origUsername) {
      setUsernameStatus("idle");
      return;
    }
    setUsernameStatus("checking");
    try {
      const res = await fetch(`/api/users/check-username?username=${encodeURIComponent(value)}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsernameStatus(data.available ? "available" : "taken");
    } catch {
      setUsernameStatus("error");
    }
  }, [origUsername]);

  const onUsernameChange = (value: string) => {
    setUsername(value);
    setUsernameStatus("idle");

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      checkUsernameAvailability(value.trim());
    }, 600);
  };

  // --- derived validation ---
  const usernameErr = useMemo(() => validateUsername(username.trim()), [username]);
  const emailErr = useMemo(() => validateEmail(email.trim()), [email]);

  const passwordErr = useMemo(() => {
    if (!password) return undefined;
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
    if (imageFile.size > 5 * 1024 * 1024) return "Image too big leh. Max 5MB.";
    return undefined;
  }, [imageFile]);

  // --- change detection ---
  const hasChanges = useMemo(() => {
    if (username.trim() !== origUsername) return true;
    if (email.trim() !== origEmail) return true;
    if (imageFile !== null) return true;
    if (password) return true;
    return false;
  }, [username, origUsername, email, origEmail, imageFile, password]);

  const usernameOk = useMemo(() => {
    const trimmed = username.trim();
    if (trimmed === origUsername) return true; // unchanged = fine
    if (usernameErr) return false;
    if (usernameStatus === "error") return false;
    return usernameStatus === "available";
  }, [username, origUsername, usernameErr, usernameStatus]);

  const canSave = useMemo(() => {
    if (!hasChanges) return false;
    if (!usernameOk) return false;
    if (emailErr) return false;
    if (imageErr) return false;
    if (password) {
      if (passwordErr) return false;
      if (confirmErr) return false;
    }
    return true;
  }, [hasChanges, usernameOk, emailErr, imageErr, password, passwordErr, confirmErr]);

  const existingPic =
    profilePictureUrl && profilePictureUrl.startsWith("/")
      ? `${BACKEND_PUBLIC_BASE}${profilePictureUrl}`
      : profilePictureUrl;

  const shownPic = previewUrl || existingPic;
  const initial = (username?.[0] || "?").toUpperCase();

  const onPickImage: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0] || null;
    setPageError("");

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
    if (!canSave) return;

    const formData = new FormData();
    formData.append("username", username.trim());
    formData.append("email", email.trim());
    if (password) formData.append("password", password);
    if (imageFile) formData.append("profileImage", imageFile);

    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        body: formData,
      });

      const data: any = await res.json().catch(() => ({}));

      if (res.status === 401) {
        router.replace("/login");
        return;
      }
      if (!res.ok) throw new Error(data?.message || data?.error || "Failed to update profile");

      toast.success("Update Successful");
      router.push("/profile");
    } catch (e: any) {
      setPageError(e?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#F2F0FF]">
        <div className="text-slate-600 font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-[#F2F0FF] via-white to-white px-5 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Top card */}
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

          {/* Username */}
          <div className="mb-4">
            <label className="text-sm font-bold text-slate-700">Username</label>
            <div className="relative mt-2">
              <input
                value={username}
                onChange={(e) => onUsernameChange(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
                type="text"
                placeholder="Enter username"
                maxLength={30}
              />
              {/* status icon */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {usernameStatus === "checking" && (
                  <Loader2 size={16} className="animate-spin text-slate-400" />
                )}
                {usernameStatus === "available" && (
                  <CheckCircle size={16} className="text-green-500" />
                )}
                {usernameStatus === "taken" && (
                  <XCircle size={16} className="text-red-500" />
                )}
              </div>
            </div>
            {usernameErr && username.trim() !== origUsername && (
              <p className="mt-2 text-xs font-semibold text-red-600">{usernameErr}</p>
            )}
            {!usernameErr && usernameStatus === "taken" && (
              username.trim() === origUsername
                ? <p className="mt-2 text-xs font-semibold text-slate-400">No changes detected.</p>
                : <p className="mt-2 text-xs font-semibold text-red-600">Username taken leh. Please come up with another one!</p>
            )}
            {!usernameErr && usernameStatus === "available" && (
              <p className="mt-2 text-xs font-semibold text-green-600">Username is available!</p>
            )}
            {!usernameErr && usernameStatus === "error" && (
              <p className="mt-2 text-xs font-semibold text-amber-600">Could not check username availability. Try again.</p>
            )}
          </div>

          {/* Upload image */}
          <div className="mb-4">
            <label className="text-sm font-bold text-slate-700">Profile picture</label>
            <div className="mt-2 flex items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
                <Upload size={16} />
                Choose image
                <input type="file" accept="image/*" onChange={onPickImage} className="hidden" />
              </label>
              {imageFile ? (
                <span className="text-sm text-slate-600 truncate">{imageFile.name}</span>
              ) : (
                <span className="text-sm text-slate-500">No new image selected</span>
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

          {/* No changes hint */}
          {!hasChanges && (
            <p className="mb-4 text-center text-xs text-slate-400">Make a change to enable saving.</p>
          )}

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
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-[#6C63FF] to-[#9D94EB] px-4 py-3 text-sm font-bold text-white shadow-[0_10px_25px_rgba(108,99,255,0.25)] disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
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
