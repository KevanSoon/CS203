"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Award,
  BookOpen,
  Clock,
  Flame,
  Users,
  ChevronDown,
  PencilLine,
  Search,
  X
} from "lucide-react";
import { Sidebar } from "@/app/components/Sidebar";

type Profile = {
  username: string;
  profilePictureUrl?: string;
};

type FriendDto = {
  username: string;
};

type UserSearchResult = {
  id: number;
  username: string;
};

// ✅ Mock learning progress (still mock)
const MOCK_PROGRESS = {
  overallProgress: 65,
  lessonsCompleted: 12,
  totalHours: 24,
};

function CollapsibleCard({
  title,
  icon,
  rightBadge,
  defaultOpen = true,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  rightBadge?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-lg font-extrabold">{title}</h2>
        </div>

        <div className="flex items-center gap-3">
          {rightBadge}
          <span
            className={`grid h-9 w-9 place-items-center rounded-2xl border border-slate-200 bg-white transition ${
              open ? "rotate-180" : "rotate-0"
            }`}
            aria-hidden="true"
          >
            <ChevronDown size={18} />
          </span>
        </div>
      </button>

      <div
        className={`grid transition-[grid-template-rows,opacity,margin-top] duration-300 ease-out ${
          open
            ? "grid-rows-[1fr] opacity-100 mt-5"
            : "grid-rows-[0fr] opacity-0 mt-0"
        }`}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [selected, setSelected] = useState("Profile");

  const [profile, setProfile] = useState<Profile>({
    username: "",
    profilePictureUrl: "",
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteErrors, setDeleteErrors] = useState<{
    password?: string;
    general?: string;
  }>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const isDeleteUnlocked = deletePassword.trim().length > 0;

  const [friends, setFriends] = useState<FriendDto[]>([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(true);
  const [friendsError, setFriendsError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      setProfileError("");
      setIsLoadingProfile(true);

      try {
        const res = await fetch("/api/profile", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(
            data?.message || data?.error || "Failed to load profile"
          );
        }

        setProfile({
          username: data?.username ?? "",
          profilePictureUrl: data?.profilePictureUrl ?? "",
        });
      } catch (e: any) {
        setProfileError(e?.message || "Something went wrong 💀");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    const loadFriends = async () => {
      setFriendsError("");
      setIsLoadingFriends(true);

      try {
        const res = await fetch("/api/friendship", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(
            data?.message || data?.error || "Failed to load friends"
          );
        }

        setFriends(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setFriendsError(e?.message || "Failed to load friends");
        setFriends([]);
      } finally {
        setIsLoadingFriends(false);
      }
    };

    loadProfile();
    loadFriends();
  }, []);

  const name = isLoadingProfile ? "Loading..." : profile.username || "User";
  const profilePic = profile.profilePictureUrl || "";

  const handleDeleteAccount = async () => {
    setDeleteErrors({});

    if (!deletePassword.trim()) {
      setDeleteErrors({ password: "Put your password leh." });
      return;
    }

    try {
      setIsDeleting(true);

      const res = await axios.delete("/api/profile/delete", {
        data: { password: deletePassword },
      });

      if (res.status === 204) {
        router.replace("/");
      }
    } catch (err: any) {
      setDeletePassword("");

      if (err.response?.status === 400) {
        setDeleteErrors({ password: "Wrong eh how." });
      } else {
        setDeleteErrors({
          general: "Something went wrong. Try again later.",
        });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSearchUser = async () => {
    const q = searchQuery.trim();
    if (!q) return;
    setIsSearching(true);
    setSearchError("");
    setSearchResults([]);
    try {
      const res = await fetch(`/api/users/search?username=${encodeURIComponent(q)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || data?.error || "No users found");
      const results = Array.isArray(data) ? data : data.username ? [{ id: data.id, username: data.username }] : [];
      setSearchResults(results);
      if (results.length === 0) setSearchError("No users found matching that username.");
    } catch (e: any) {
      setSearchError(e?.message || "No users found");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar selected={selected} setSelected={setSelected} />

      <div className="flex-1 overflow-auto bg-linear-to-b from-[#F2F0FF] via-white to-white font-sans text-slate-900">
        <div className="relative h-52 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-[#CFCBFF] via-[#DCD8FF] to-[#F2F0FF]" />
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/25 blur-2xl" />
          <div className="absolute -bottom-28 -right-24 h-80 w-80 rounded-full bg-white/20 blur-2xl" />
        </div>

        <div className="-mt-16 px-5 pb-12">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="md:col-span-1">
                <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative -mt-12 mb-3">
                      <div className="h-28 w-28 rounded-full bg-white p-1 shadow-[0_14px_40px_rgba(0,0,0,0.18)]">
                        <div className="relative h-full w-full overflow-hidden rounded-full bg-slate-200 ring-4 ring-white">
                          {profilePic ? (
                            <Image
                              src={profilePic}
                              alt="Profile picture"
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-4xl">
                              🙂
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <h1 className="text-2xl font-extrabold tracking-tight">
                      {name}
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">Your profile</p>

                    <button
                      type="button"
                      onClick={() => router.push("/profile/edit")}
                      className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-[#6C63FF] to-[#9D94EB] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(108,99,255,0.25)] transition hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed"
                      disabled={isLoadingProfile}
                    >
                      <PencilLine size={16} />
                      Edit profile
                    </button>

                    {profileError && (
                      <div className="mt-5 w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        {profileError}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-6">
                <CollapsibleCard
                  title="Learning Progress"
                  icon={<Award size={20} className="text-[#6C63FF]" />}
                  rightBadge={
                    <span className="rounded-full bg-[#F3F1FF] px-3 py-1 text-xs font-semibold text-[#5B52D6]">
                      {MOCK_PROGRESS.overallProgress}%
                    </span>
                  }
                  defaultOpen={true}
                >
                  <div>
                    <div className="flex items-end justify-between">
                      <p className="text-sm font-semibold text-slate-600">
                        Overall Course Completion
                      </p>
                      <p className="text-2xl font-black text-[#6C63FF]">
                        {MOCK_PROGRESS.overallProgress}%
                      </p>
                    </div>

                    <div className="mt-3 h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#6C63FF]"
                        style={{ width: `${MOCK_PROGRESS.overallProgress}%` }}
                      />
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-[#F6F5FF] p-4 border border-slate-100">
                        <div className="flex items-center gap-3">
                          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white border border-slate-100 text-[#6C63FF]">
                            <BookOpen size={18} />
                          </span>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                              Lessons
                            </p>
                            <p className="text-xl font-black">
                              {MOCK_PROGRESS.lessonsCompleted}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-[#F6F5FF] p-4 border border-slate-100">
                        <div className="flex items-center gap-3">
                          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white border border-slate-100 text-[#6C63FF]">
                            <Clock size={18} />
                          </span>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                              Hours
                            </p>
                            <p className="text-xl font-black">
                              {MOCK_PROGRESS.totalHours}h
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CollapsibleCard>

                <CollapsibleCard
                  title="Friends"
                  icon={<Users size={20} className="text-[#6C63FF]" />}
                  rightBadge={
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {isLoadingFriends ? "..." : friends.length}
                    </span>
                  }
                  defaultOpen={true}
                >
                  <div className="flex gap-2 mb-5">
                    <div className="relative flex-1">
                      <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSearchUser();
                        }}
                        placeholder="Search by username..."
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 transition"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSearchUser}
                      disabled={isSearching || !searchQuery.trim()}
                      className="rounded-2xl bg-[#6C63FF] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSearching ? "..." : "Search"}
                    </button>
                  </div>

                  {searchError && (
                    <div className="mb-4 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                      <X size={15} className="flex-shrink-0" />
                      {searchError}
                    </div>
                  )}

                  {searchResults.length > 0 && (
                    <div className="mb-5">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#6C63FF]">
                        Search Results
                      </p>
                      <div className="flex flex-col gap-2">
                        {searchResults.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center gap-3 rounded-2xl border border-[#6C63FF]/20 bg-[#F6F5FF] px-4 py-3"
                          >
                            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white border border-[#6C63FF]/20 flex-shrink-0 font-extrabold text-[#6C63FF]">
                              {user.username[0]?.toUpperCase() ?? "?"}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-extrabold text-slate-900">
                                {user.username}
                              </p>
                              <p className="text-xs text-slate-400 mt-0.5">Simi Slang user</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 border-t border-slate-200" />
                    </div>
                  )}

                  {friendsError && (
                    <div className="mb-4 w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                      {friendsError}
                    </div>
                  )}

                  {searchResults.length > 0 && (
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Your Friends
                    </p>
                  )}

                  {isLoadingFriends ? (
                    <div className="text-sm text-slate-500">Loading friends...</div>
                  ) : friends.length === 0 ? (
                    <div className="text-sm text-slate-500">No friends yet.</div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {friends.map((friend) => {
                        const initial = (friend.username?.[0] || "?").toUpperCase();
                        return (
                          <div
                            key={friend.username}
                            className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 border border-slate-200 flex-shrink-0 font-extrabold text-slate-700">
                                {initial}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-extrabold text-slate-900">
                                  {friend.username}
                                </p>
                                <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#FFF4E8] px-2.5 py-1 text-xs font-semibold text-[#B45309]">
                                  <Flame size={14} />
                                  Friend
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CollapsibleCard>

                <CollapsibleCard
                  title="Danger Zone"
                  icon={<Flame size={20} className="text-red-500" />}
                  defaultOpen={false}
                >
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-red-700">
                          Delete your account
                        </h3>
                        <p className="mt-1 text-sm text-red-600">
                          This action is permanent. Your data will be erased forever.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setDeleteErrors({});
                          setDeletePassword("");
                          setShowDeleteModal(true);
                        }}
                        disabled={isDeleting}
                        className="rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isDeleting ? "Deleting..." : "Delete Account"}
                      </button>
                    </div>
                  </div>
                </CollapsibleCard>
      
                {showDeleteModal && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black/50">
                    <div className="bg-white p-8 rounded-3xl w-full max-w-md relative">
                      <h2 className="text-2xl font-extrabold text-red-600">
                        Delete you sure or not? 💀
                      </h2>

                      <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                        Once delete means delete liao hor.
                        All your data confirm gone. No undo, no Ctrl+Z, no comeback season.
                      </p>

                      <div className="mt-6 space-y-4">
                        <label className="text-sm font-semibold ml-1">
                          Password (last warning ah)
                        </label>

                        <input
                          type="password"
                          value={deletePassword}
                          onChange={(e) => {
                            setDeletePassword(e.target.value);
                            if (deleteErrors.password) {
                              setDeleteErrors({});
                            }
                          }}
                          className="w-full border rounded-xl px-4 py-3"
                          placeholder="Enter password"
                        />

                        {deleteErrors.password && (
                          <p className="text-red-500 text-xs mt-1">
                            {deleteErrors.password}
                          </p>
                        )}

                        {deleteErrors.general && (
                          <p className="text-red-500 text-sm mt-2">
                            {deleteErrors.general}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={() => {
                            setShowDeleteModal(false);
                            setDeletePassword("");
                            setDeleteErrors({});
                          }}
                          className="flex-1 border rounded-xl py-2"
                        >
                          Aiya cancel lah 😌
                        </button>

                        <div
                          className={`flex-1 transition-all duration-300 ${
                            isDeleteUnlocked
                              ? "opacity-100 translate-y-0"
                              : "opacity-0 translate-y-2 pointer-events-none"
                          }`}
                        >
                          <button
                            onClick={handleDeleteAccount}
                            disabled={isDeleting}
                            className="w-full bg-red-600 text-white rounded-xl py-2"
                          >
                            {isDeleting
                              ? "Deleting… bye bye 👋"
                              : "Confirm Delete 🫠"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}