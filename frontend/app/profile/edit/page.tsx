"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PencilLine, Upload } from "lucide-react";

const BACKEND_PUBLIC_BASE =
  process.env.NEXT_PUBLIC_BACKEND_PUBLIC_BASE || "http://localhost:8080";

type ProfileResponse = {
  username?: string;
  email?: string;
  profilePictureUrl?: string; // "/uploads/profile/alice.jpg"
};

const validateUsername = (u: string): string | undefined => {
  const username = u.trim();
  if (!username) return "Username cannot be empty leh.";
  if (username.length < 3) return "Username too short leh. Min 3 characters.";
  if (username.length > 50) return "Username too long leh. Max 50 characters.";
  if (!/^[a-zA-Z0-9_]+$/.test(username))
    return "Username can only be letters, numbers, underscore (_) only.";
  return undefined;
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
  if (!password)
    return "Don't let people fanum tax your account. Faster set your password la!";
  if (password.length < 8)
    return "Password too short! Need at least 8 characters.";
  if (password.length > 100)
    return "Password too long leh! Max 100 characters only.";
  if (!/(?=.*[a-z])/.test(password))
    return "Password must have at least one small letter (a-z).";
  if (!/(?=.*[A-Z])/.test(password))
    return "Password must have at least one capital letter (A-Z).";
  if (!/(?=.*\d)/.test(password))
    return "Password must have at least one number (0-9).";
  return undefined;
};

export default function EditProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [username, setUsername] = useState("");
  const [originalUsername, setOriginalUsername] = useState("");

  const [email, setEmail] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");

  const [profilePictureUrl, setProfilePictureUrl] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);

  // ✅ NEW: username availability state
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameTaken, setUsernameTaken] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setPageError("");
      setSuccessMsg("");

      try {
        const res = await fetch("/api/profile", { cache: "no-store" });
        const data: any = await res.json().catch(() => ({}));

        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        if (!res.ok)
          throw new Error(data?.message || data?.error || "Failed to load profile");

        const p = data as ProfileResponse;

        setUsername(p.username ?? "");
        setOriginalUsername(p.username ?? "");

        setEmail(p.email ?? "");
        setOriginalEmail(p.email ?? "");

        setProfilePictureUrl(p.profilePictureUrl ?? "");
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

  const usernameErr = useMemo(() => validateUsername(username), [username]);
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
    if (!imageFile.type.startsWith("image/"))
      return "Please upload an image file leh.";
    const maxMb = 5;
    if (imageFile.size > maxMb * 1024 * 1024)
      return `Image too big leh. Max ${maxMb}MB.`;
    return undefined;
  }, [imageFile]);

  const hasUsernameChange = useMemo(
    () => username.trim() !== originalUsername.trim(),
    [username, originalUsername]
  );

  const hasEmailChange = useMemo(
    () => email.trim() !== originalEmail.trim(),
    [email, originalEmail]
  );

  const hasImageChange = useMemo(() => imageFile !== null, [imageFile]);

  const hasPasswordChange = useMemo(() => password.length > 0, [password]);

  const somethingChanged = useMemo(
    () => hasUsernameChange || hasEmailChange || hasImageChange || hasPasswordChange,
    [hasUsernameChange, hasEmailChange, hasImageChange, hasPasswordChange]
  );

  // ✅ NEW: Check if username is available (debounced)
  useEffect(() => {
    // if username invalid, don't check backend
    if (usernameErr) {
      setUsernameTaken(false);
      setCheckingUsername(false);
      return;
    }

    // if unchanged from original, it's okay
    if (!hasUsernameChange) {
      setUsernameTaken(false);
      setCheckingUsername(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setCheckingUsername(true);

        const res = await fetch(
          `/api/username-available?username=${encodeURIComponent(username.trim())}`,
          { cache: "no-store" }
        );

        const data: any = await res.json().catch(() => ({}));
        const available = !!data?.available;

        setUsernameTaken(!available);
      } catch (e) {
        // If check fails, safest is to prevent saving (optional)
        setUsernameTaken(true);
      } finally {
        setCheckingUsername(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username, usernameErr, hasUsernameChange]);

  const canSave = useMemo(() => {
    if (!somethingChanged) return false;

    if (usernameErr) return false;
    if (hasUsernameChange && (checkingUsername || usernameTaken)) return false;

    if (emailErr) return false;
    if (imageErr) return false;

    if (password) {
      if (passwordErr) return false;
      if (confirmErr) return false;
    }

    return true;
  }, [
    somethingChanged,
    usernameErr,
    hasUsernameChange,
    checkingUsername,
    usernameTaken,
    emailErr,
    imageErr,
    password,
    passwordErr,
    confirmErr,
  ]);

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

    // ✅ only send changed fields
    if (hasEmailChange) formData.append("email", email.trim());
    if (hasUsernameChange) formData.append("username", username.trim());

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

      if (!res.ok) {
        throw new Error(data?.message || data?.error || "Failed to update profile");
      }

      // ✅ redirect after success
      router.push("/dashboard");
    } catch (e: any) {
      setPageError(e?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const initial = (username?.[0] || "?").toUpperCase();

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

            <h1 className="text-2xl font-extrabold tracking-tight">
              {username || "User"}
            </h1>
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

          {/* Username editable */}
          <div className="mb-4">
            <label className="text-sm font-bold text-slate-700">
              Username {hasUsernameChange ? "(changed)" : ""}
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
            />

            {usernameErr && (
              <p className="mt-2 text-xs font-semibold text-red-600">
                {usernameErr}
              </p>
            )}

            {!usernameErr && hasUsernameChange && usernameTaken && (
              <p className="mt-2 text-xs font-semibold text-red-600">
                Username already in use. Try another.
              </p>
            )}

            {!usernameErr && hasUsernameChange && !usernameTaken && !checkingUsername && (
              <p className="mt-2 text-xs font-semibold text-green-600">
                Username available ✓
              </p>
            )}

            {checkingUsername && (
              <p className="mt-2 text-xs text-slate-500">Checking username...</p>
            )}

            <p className="mt-2 text-xs text-slate-500">
              3–50 chars. Letters, numbers, underscore only.
            </p>
          </div>

          {/* Upload image */}
          <div className="mb-4">
            <label className="text-sm font-bold text-slate-700">
              Profile picture
            </label>

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

            {imageErr && (
              <p className="mt-2 text-xs font-semibold text-red-600">{imageErr}</p>
            )}
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
            {emailErr && (
              <p className="mt-2 text-xs font-semibold text-red-600">{emailErr}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="text-sm font-bold text-slate-700">
              New Password
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
              type="password"
              placeholder="Leave blank to keep current password"
            />
            {password && passwordErr && (
              <p className="mt-2 text-xs font-semibold text-red-600">
                {passwordErr}
              </p>
            )}
          </div>

          {/* Confirm password */}
          <div className="mb-6">
            <label className="text-sm font-bold text-slate-700">
              Confirm Password
            </label>
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#6C63FF]/30 disabled:bg-slate-50"
              type="password"
              placeholder="Re-enter new password"
              disabled={!password}
            />
            {password && confirmErr && (
              <p className="mt-2 text-xs font-semibold text-red-600">
                {confirmErr}
              </p>
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
