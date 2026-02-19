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
} from "lucide-react";
import { Sidebar } from "@/app/components/Sidebar";

type Profile = {
  username: string;
  profilePictureUrl?: string;
};

// ✅ Mock learning progress
const MOCK_PROGRESS = {
  overallProgress: 65,
  lessonsCompleted: 12,
  totalHours: 24,
};

// ✅ Mock friends (with avatar + streak)
type Friend = {
  id: string;
  name: string;
  streakDays: number;
  avatarUrl: string;
};

const MOCK_FRIENDS: Friend[] = [
  { id: "1", name: "Alicia", streakDays: 12, avatarUrl: "https://i.pravatar.cc/120?img=32" },
  { id: "2", name: "Bryan", streakDays: 3, avatarUrl: "https://i.pravatar.cc/120?img=12" },
  { id: "3", name: "Cheryl", streakDays: 27, avatarUrl: "https://i.pravatar.cc/120?img=47" },
  { id: "4", name: "Darren", streakDays: 8, avatarUrl: "https://i.pravatar.cc/120?img=22" },
  { id: "5", name: "Eunice", streakDays: 1, avatarUrl: "https://i.pravatar.cc/120?img=5" },
];

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
          open ? "grid-rows-[1fr] opacity-100 mt-5" : "grid-rows-[0fr] opacity-0 mt-0"
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

  // ✅ profile from backend now
  const [profile, setProfile] = useState<Profile>({
    username: "",
    profilePictureUrl: "",
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      setProfileError("");
      setIsLoadingProfile(true);

      try {
        const res = await fetch("/api/profile", { cache: "no-store" });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data?.message || data?.error || "Failed to load profile");
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

    loadProfile();
  }, []);

  const name = isLoadingProfile ? "Loading..." : profile.username || "User";
  const profilePic = profile.profilePictureUrl || "";

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "LAST WARNING 🚨\n\nDeleting your account is forever.\nNo undo."
    );
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      setDeleteError("");

      const res = await axios.delete("/api/profile/delete");

      if (res.data?.success) {
        router.replace("/");
      } else {
        throw new Error("Delete failed. L.");
      }
    } catch (err: any) {
      setDeleteError(
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        "Delete failed. L."
      );
    } finally {
      setIsDeleting(false);
    }

  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar selected={selected} setSelected={setSelected} />
      <div className="flex-1 overflow-auto bg-linear-to-b from-[#F2F0FF] via-white to-white font-sans text-slate-900">
        {/* Hero */}
        <div className="relative h-52 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-[#CFCBFF] via-[#DCD8FF] to-[#F2F0FF]" />
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/25 blur-2xl" />
          <div className="absolute -bottom-28 -right-24 h-80 w-80 rounded-full bg-white/20 blur-2xl" />
        </div>

        <div className="-mt-16 px-5 pb-12">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* LEFT — Profile */}
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

                    <h1 className="text-2xl font-extrabold tracking-tight">{name}</h1>
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

              {/* RIGHT — Progress + Friends (mock) */}
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
                      {MOCK_FRIENDS.length}
                    </span>
                  }
                  defaultOpen={true}
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {MOCK_FRIENDS.map((friend) => (
                      <div
                        key={friend.id}
                        className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-slate-200 flex-shrink-0">
                            <Image
                              src={friend.avatarUrl}
                              alt={`${friend.name} avatar`}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-extrabold text-slate-900">
                              {friend.name}
                            </p>
                            <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#FFF4E8] px-2.5 py-1 text-xs font-semibold text-[#B45309]">
                              <Flame size={14} />
                              {friend.streakDays} day streak
                            </div>
                          </div>
                        </div>

                        <span className="text-slate-300 text-xl leading-none">›</span>
                      </div>
                    ))}
                  </div>
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
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isDeleting ? "Deleting..." : "Delete Account"}
                      </button>
                    </div>

                    {deleteError && (
                      <div className="mt-4 rounded-xl border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-600">
                        {deleteError}
                      </div>
                    )}
                  </div>
                </CollapsibleCard>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
