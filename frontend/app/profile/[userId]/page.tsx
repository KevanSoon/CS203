"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/app/api/api";
import toast from "react-hot-toast";
import {
  Award,
  BookOpen,
  Flame,
  Users,
  ChevronDown,
  PencilLine,
  Search,
  X,
  BarChart2,
  UserCheck,
  UserPlus,
  Clock,
} from "lucide-react";
import { Sidebar } from "@/app/components/Sidebar";
import AddFriendButton from "@/app/components/AddFriendButton";
import OutgoingFriendCard from "@/app/components/OutgoingFriendCard";
import IncomingFriendCard from "@/app/components/IncomingFriendCard";
import FriendCard from "@/app/components/FriendCard";

// ── Types ─────────────────────────────────────────────────────────────────────

type OwnProfile = {
  id: number;
  username: string;
  email: string;
  profilePictureUrl?: string;
  streak: number;
  lastStreakDate?: string;
  totalCompletedLessons: number;
  streakBroken: boolean;
  usertype?: string;
};

type FriendDto = {
  id: number;
  username: string;
  profilePictureUrl?: string;
  streak: number;
  streakActiveToday: boolean;
};

type BasicUser = {
  id: number;
  username: string;
  profilePictureUrl?: string;
};

type VisitedProfile = {
  userId: number;
  username: string;
  profilePictureUrl?: string;
  streak: number;
  friendCount: number;
  isFriend: boolean;
  hasPendingRequest: boolean;
  hasIncomingRequest: boolean;
  commonFriends: BasicUser[];
  friendLeaderboard: FriendDto[];
};

type UserSearchResult = {
  id: number;
  username: string;
};

type AdminStats = {
  totalLessons: number;
  publishedLessons: number;
  totalAttempts: number;
  totalCompletions: number;
};

// ── CollapsibleCard ───────────────────────────────────────────────────────────

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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { userId } = useParams();
  const router = useRouter();
  const [selected, setSelected] = useState("Profile");

  // Viewer identity
  const [ownProfile, setOwnProfile] = useState<OwnProfile | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Visited profile data
  const [visitedProfile, setVisitedProfile] = useState<VisitedProfile | null>(null);
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  // Own profile extras
  const [userType, setUserType] = useState("user");
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [friends, setFriends] = useState<FriendDto[]>([]);
  const [pendingFriends, setPendingFriends] = useState<FriendDto[]>([]);
  const [outgoingFriends, setOutgoingFriends] = useState<FriendDto[]>([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const [isLoadingPending, setIsLoadingPending] = useState(false);
  const [isLoadingOutgoing, setIsLoadingOutgoing] = useState(false);
  const [friendsError, setFriendsError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Delete account
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteErrors, setDeleteErrors] = useState<{ password?: string; general?: string }>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);

  // ── Loaders ────────────────────────────────────────────────────────────────

  const loadFriends = async () => {
    setIsLoadingFriends(true);
    setFriendsError("");
    try {
      const res = await api.get("/api/friendship/leaderboard");
      setFriends(Array.isArray(res.data) ? res.data : []);
    } catch {
      setFriendsError("Failed to load friends");
    } finally {
      setIsLoadingFriends(false);
    }
  };

  const loadPending = async () => {
    setIsLoadingPending(true);
    try {
      const res = await api.get("/api/friendship/pending");
      setPendingFriends(Array.isArray(res.data) ? res.data : []);
    } finally {
      setIsLoadingPending(false);
    }
  };

  const loadOutgoing = async () => {
    setIsLoadingOutgoing(true);
    try {
      const res = await api.get("/api/friendship/pending/outgoing");
      setOutgoingFriends(Array.isArray(res.data) ? res.data : []);
    } finally {
      setIsLoadingOutgoing(false);
    }
  };

  // ── Initial load ───────────────────────────────────────────────────────────

  useEffect(() => {
    const load = async () => {
        const targetId = Number(userId);
        try {
        const [ownRes, visitedRes] = await Promise.all([
            api.get("/api/profile"),
            api.get(`/api/profile/${targetId}`),
        ]);

        const own: OwnProfile = ownRes.data;
        setOwnProfile(own);

        const isSelf = own.id === targetId;
        setIsOwnProfile(isSelf);

        if (isSelf) {
            const resolvedType = own.usertype || "user";
            setUserType(resolvedType);

            await Promise.all([
            ...(resolvedType === "admin"
                ? [api.get("/api/lesson/admin/stats").then((r) => setAdminStats(r.data))]
                : [loadFriends(), loadPending(), loadOutgoing()]),
            ]);
        } else {
            setVisitedProfile(visitedRes.data);
        }
        } catch {
        router.replace("/profile");
        } finally {
        setIsLoading(false);
        }
    };

    load();
    }, [userId]);

  // ── Delete password debounce ───────────────────────────────────────────────

  useEffect(() => {
    if (!deletePassword.trim()) { setIsPasswordValid(false); return; }
    const t = setTimeout(() => verifyPassword(deletePassword), 200);
    return () => clearTimeout(t);
  }, [deletePassword]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleAcceptFriend = async (requesterId: number) => {
    const acceptedUser = pendingFriends.find((f) => f.id === requesterId);
    if (!acceptedUser) return;
    setPendingFriends((prev) => prev.filter((f) => f.id !== requesterId));
    setFriends((prev) => [...prev, acceptedUser]);
    try {
      await api.post(`/api/friendship/${requesterId}`);
      toast.success("Friend request accepted!");
    } catch {
      await Promise.all([loadFriends(), loadPending()]);
    }
  };

  const handleRemoveOwnFriend = (id: number) => {
    setFriends((prev) => prev.filter((f) => f.id !== id));
  };

  const handleAddFriend = async () => {
    if (!visitedProfile) return;
    setIsSendingRequest(true);
    try {
      await api.post(`/api/friendship/pending/outgoing/${visitedProfile.userId}`);
      setVisitedProfile((prev) => prev ? { ...prev, hasPendingRequest: true } : prev);
    } finally {
      setIsSendingRequest(false);
    }
  };

  const handleRemoveVisitedFriend = (id: number) => {
    setVisitedProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        isFriend: false,
        friendCount: prev.friendCount - 1,
        friendLeaderboard: prev.friendLeaderboard.filter((f) => f.id !== id),
      };
    });
  };

  const handleDeleteAccount = async () => {
    setDeleteErrors({});
    if (!deletePassword.trim()) { setDeleteErrors({ password: "Put your password leh." }); return; }
    try {
      setIsDeleting(true);
      await api.delete("/api/profile", { data: { password: deletePassword } });
      setShowDeleteModal(false);
      toast.success("Account deleted successfully.");
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setDeletePassword("");
      if (err.response?.status === 400) setDeleteErrors({ password: "Wrong password eh how." });
      else if (err.response?.status === 401) router.replace("/");
    } finally {
      setIsDeleting(false);
    }
  };

  const verifyPassword = async (password: string) => {
    if (!password.trim()) { setIsPasswordValid(false); return; }
    try {
      setIsVerifyingPassword(true);
      const res = await api.post("/api/profile", { password });
      if (res.data?.valid) { setIsPasswordValid(true); setDeleteErrors({}); }
      else { setIsPasswordValid(false); setDeleteErrors({ password: "Wrong password eh how." }); }
    } catch {
      setIsPasswordValid(false);
    } finally {
      setIsVerifyingPassword(false);
    }
  };

  const handleSearchUser = async () => {
    const q = searchQuery.trim();
    if (!q) return;
    setIsSearching(true);
    setSearchError("");
    setSearchResults([]);
    try {
      const res = await api.get("/api/users/search", { params: { username: q } });
      const results = Array.isArray(res.data) ? res.data : [];
      setSearchResults(results);
      if (results.length === 0) setSearchError("No users found matching that username.");
    } catch (e: any) {
      setSearchError(e?.response?.data?.message || "No users found");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAcceptFromProfile = async () => {
    if (!visitedProfile) return;
    try {
      await api.post(`/api/friendship/${visitedProfile.userId}`);
      setVisitedProfile((prev) => prev ? { ...prev, isFriend: true, hasIncomingRequest: false } : prev);
    } catch {
    }
  };

  const handleRejectFromProfile = async () => {
    if (!visitedProfile) return;
    try {
      await api.post(`/api/friendship/reject/${visitedProfile.userId}`);
      setVisitedProfile((prev) => prev ? { ...prev, hasIncomingRequest: false } : prev);
    } catch {
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────

  const isAdmin = userType === "admin";
  const displayUsername = isLoading ? "Loading..." : isOwnProfile ? ownProfile?.username : visitedProfile?.username;
  const displayPic = isOwnProfile ? (ownProfile?.profilePictureUrl ?? "") : (visitedProfile?.profilePictureUrl ?? "");
  const displayStreak = isOwnProfile ? (ownProfile?.streak ?? 0) : (visitedProfile?.streak ?? 0);

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar selected={selected} setSelected={setSelected} />
        
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar selected={selected} setSelected={setSelected} />

      <div className="flex-1 overflow-auto bg-linear-to-b from-[#F2F0FF] via-white to-white font-sans text-slate-900">
        {/* Banner */}
        <div className="relative h-52 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-[#CFCBFF] via-[#DCD8FF] to-[#F2F0FF]" />
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/25 blur-2xl" />
          <div className="absolute -bottom-28 -right-24 h-80 w-80 rounded-full bg-white/20 blur-2xl" />
        </div>

        <div className="-mt-16 px-5 pb-12">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

              {/* ── Left column ── */}
              <div className="md:col-span-1">

                {/* Avatar card */}
                <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative -mt-12 mb-3">
                      <div className="h-28 w-28 rounded-full bg-white p-1 shadow-[0_14px_40px_rgba(0,0,0,0.18)]">
                        <div className="relative h-full w-full overflow-hidden rounded-full bg-slate-200 ring-4 ring-white">
                          {displayPic ? (
                            <Image src={displayPic} alt="Profile picture" fill className="object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-4xl">🙂</div>
                          )}
                        </div>
                      </div>
                    </div>

                    <h1 className="text-2xl font-extrabold tracking-tight">{displayUsername}</h1>

                    {/* Role badge */}
                    <span
                      className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                        isOwnProfile && isAdmin ? "bg-[#FFF4E8] text-[#B45309]" : "bg-[#F3F1FF] text-[#5B52D6]"
                      }`}
                    >
                      {isOwnProfile && isAdmin ? (
                        <><BarChart2 size={12} /> Lesson Admin</>
                      ) : isOwnProfile ? "Your profile" : "Simi Slang user"}
                    </span>

                    {/* CTA */}
                    <div className="mt-4">
                    {isOwnProfile ? (
                      <button onClick={() => router.push("/profile/edit")} className="inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-[#6C63FF] to-[#9D94EB] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(108,99,255,0.25)] transition hover:brightness-105">
                        <PencilLine size={16} /> Edit profile
                      </button>
                    ) : visitedProfile?.isFriend ? (
                      <div className="flex flex-col items-center gap-2">
                        <span className="inline-flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-5 py-2 text-sm font-semibold text-green-700">
                          <UserCheck size={16} /> Friends
                        </span>
                        <button
                          onClick={() => handleRemoveVisitedFriend(visitedProfile.userId)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                        >
                          <X size={16} /> Remove Friend
                        </button>
                      </div>
                    ) : visitedProfile?.hasIncomingRequest ? (
                      <div className="flex gap-2">
                        <button
                          onClick={handleAcceptFromProfile}
                          className="inline-flex items-center gap-2 rounded-2xl bg-green-600 px-5 py-2 text-sm font-semibold text-white transition hover:brightness-105"
                        >
                          <UserCheck size={16} /> Accept
                        </button>
                        <button
                          onClick={handleRejectFromProfile}
                          className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                        >
                          <X size={16} /> Reject
                        </button>
                      </div>
                    ) : visitedProfile?.hasPendingRequest ? (
                      <span className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-500">
                        <Clock size={16} /> Request Sent
                      </span>
                    ) : (
                      <button
                        onClick={handleAddFriend}
                        disabled={isSendingRequest}
                        className="inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-[#6C63FF] to-[#9D94EB] px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(108,99,255,0.25)] transition hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <UserPlus size={16} />
                        {isSendingRequest ? "Sending..." : "Add Friend"}
                      </button>
                    )}
                    </div>
                  </div>
                </div>

                {/* Friends panel */}
                {!isAdmin && (
                  <div className="mt-3 rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <Users size={20} className="text-[#6C63FF]" />
                        <h2 className="text-lg font-extrabold">Friends</h2>
                      </div>
                      {!isOwnProfile && visitedProfile && (
                        <span className="text-xs font-semibold text-slate-400">{visitedProfile.friendCount}</span>
                      )}
                    </div>

                    {isOwnProfile ? (
                      <>
                        {/* Incoming */}
                        <div className="mb-8">
                          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#6C63FF]">Incoming Requests</p>
                          {isLoadingPending ? (
                            <p className="text-sm text-slate-500">Loading...</p>
                          ) : pendingFriends.length === 0 ? (
                            <p className="text-sm text-slate-500">No pending requests.</p>
                          ) : (
                            <div className="flex flex-col gap-3">
                              {pendingFriends.map((friend) => (
                                <IncomingFriendCard
                                  key={friend.id}
                                  friend={friend}
                                  onAccept={handleAcceptFriend}
                                  onReject={(id) => setPendingFriends((prev) => prev.filter((f) => f.id !== id))}
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Confirmed */}
                        <div>
                          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Your Friends</p>
                          {isLoadingFriends ? (
                            <p className="text-sm text-slate-500">Loading friends...</p>
                          ) : friends.length === 0 ? (
                            <p className="text-sm text-slate-500">No friends yet.</p>
                          ) : (
                            <div className="flex flex-col gap-3">
                              {friends.map((friend, index) => (
                                <FriendCard key={friend.id} friend={friend} rank={index} onRemove={handleRemoveOwnFriend} />
                              ))}
                            </div>
                          )}
                          {friendsError && <p className="text-sm text-red-500 mt-2">{friendsError}</p>}
                        </div>

                        {/* Outgoing */}
                        <div className="mt-8">
                          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Outgoing Requests</p>
                          {isLoadingOutgoing ? (
                            <p className="text-sm text-slate-500">Loading...</p>
                          ) : outgoingFriends.length === 0 ? (
                            <p className="text-sm text-slate-500">No outgoing requests.</p>
                          ) : (
                            <div className="flex flex-col gap-3">
                              {outgoingFriends.map((friend) => (
                                <OutgoingFriendCard key={friend.id} friend={friend} onCancel={loadOutgoing} />
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      /* Visited — read-only leaderboard */
                      visitedProfile?.friendLeaderboard.length === 0 ? (
                        <p className="text-sm text-slate-500">No friends yet.</p>
                      ) : (
                        <p className="text-sm text-slate-500">
                            {visitedProfile?.friendCount ?? 0} friend{visitedProfile?.friendCount !== 1 ? "s" : ""}
                        </p>
                        )
                    )}
                    
                  </div>
                )}
              </div>

              {/* ── Right column ── */}
              <div className="md:col-span-2 space-y-6">

                {/* Learning Progress */}
                {!isAdmin && (
                  <CollapsibleCard
                    title="Learning Progress"
                    icon={<Award size={20} className="text-[#6C63FF]" />}
                    defaultOpen={true}
                  >
                    <div className="grid grid-cols-2 gap-3">
                      {isOwnProfile && ownProfile && (
                        <div className="rounded-2xl bg-[#F6F5FF] p-4 border border-slate-100">
                          <div className="flex items-center gap-3">
                            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white border border-slate-100 text-[#6C63FF]">
                              <BookOpen size={18} />
                            </span>
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Lessons Completed</p>
                              <p className="text-xl font-black">{ownProfile.totalCompletedLessons ?? 0}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="rounded-2xl bg-[#F6F5FF] p-4 border border-slate-100">
                        <div className="flex items-center gap-3">
                          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white border border-slate-100 text-orange-500">
                            <Flame size={18} />
                          </span>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Daily Streak</p>
                            <p className="text-xl font-black">{displayStreak} day{displayStreak !== 1 ? "s" : ""}</p>
                          </div>
                        </div>
                      </div>

                      {!isOwnProfile && visitedProfile && (
                        <div className="rounded-2xl bg-[#F6F5FF] p-4 border border-slate-100">
                          <div className="flex items-center gap-3">
                            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white border border-slate-100 text-[#6C63FF]">
                              <Users size={18} />
                            </span>
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Friends</p>
                              <p className="text-xl font-black">{visitedProfile.friendCount}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CollapsibleCard>
                )}

                {/* Admin stats */}
                {isOwnProfile && isAdmin && (
                  <CollapsibleCard
                    title="Lesson Creation Stats"
                    icon={<BarChart2 size={20} className="text-[#6C63FF]" />}
                    rightBadge={
                      <span className="rounded-full bg-[#FFF4E8] px-3 py-1 text-xs font-semibold text-[#B45309]">Admin</span>
                    }
                  >
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Total Lessons", value: adminStats?.totalLessons, icon: <BookOpen size={18} /> },
                        { label: "Lessons Published", value: adminStats?.publishedLessons, icon: <BookOpen size={18} /> },
                        { label: "Users Attempted", value: adminStats?.totalAttempts, icon: <Users size={18} /> },
                        { label: "Total Completions", value: adminStats?.totalCompletions, icon: <Users size={18} /> },
                      ].map(({ label, value, icon }) => (
                        <div key={label} className="rounded-2xl bg-[#F6F5FF] p-4 border border-slate-100">
                          <div className="flex items-center gap-3">
                            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white border border-slate-100 text-[#6C63FF]">{icon}</span>
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
                              <p className="text-xl font-black">{value ?? "--"}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleCard>
                )}

                {/* Find Friends — own profile only */}
                {isOwnProfile && !isAdmin && (
                  <CollapsibleCard
                    title="Find Friends"
                    icon={<Users size={20} className="text-[#6C63FF]" />}
                    defaultOpen={true}
                  >
                    <div className="flex gap-2 mb-5">
                      <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleSearchUser(); }}
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
                        {searchError}
                      </div>
                    )}

                    {searchResults.length > 0 && (
                      <div className="mb-5">
                        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#6C63FF]">Search Results</p>
                        <div className="flex flex-col gap-2">
                          {searchResults.map((user) => (
                            <div
                              key={user.id}
                              className="flex items-center justify-between gap-3 rounded-2xl border border-[#6C63FF]/20 bg-[#F6F5FF] px-4 py-3"
                            >
                              <div
                                className="grid h-11 w-11 place-items-center rounded-2xl bg-white border border-[#6C63FF]/20 font-extrabold text-[#6C63FF] cursor-pointer"
                                onClick={() => router.push(`/profile/${user.id}`)}
                              >
                                {user.username[0]?.toUpperCase() ?? "?"}
                              </div>
                              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => router.push(`/profile/${user.id}`)}>
                                <p className="truncate text-sm font-extrabold text-slate-900">{user.username}</p>
                                <p className="text-xs text-slate-400">Simi Slang user</p>
                              </div>
                              {friends.some((f) => f.id === user.id) ? (
                                <span className="text-xs font-semibold text-green-600">Already Friends</span>
                              ) : pendingFriends.some((f) => f.id === user.id) ? (
                                <div className="flex gap-2">
                                  <button onClick={() => handleAcceptFriend(user.id)} className="text-xs font-semibold px-3 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700">Accept</button>
                                  <button
                                    onClick={async () => {
                                      try {
                                        await api.post(`/api/friendship/reject/${user.id}`);
                                        setPendingFriends((prev) => prev.filter((f) => f.id !== user.id));
                                      } catch {
                                        // error toast handled by interceptor
                                      }
                                    }}
                                    className="text-xs font-semibold px-3 py-1 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : outgoingFriends.some((f) => f.id === user.id) ? (
                                <AddFriendButton targetUserId={user.id} initialSent={true} onSuccess={loadOutgoing} />
                              ) : (
                                <AddFriendButton targetUserId={user.id} initialSent={false} onSuccess={loadOutgoing} />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CollapsibleCard>
                )}

                {/* Mutual friends — visited profile only */}
                {!isOwnProfile && visitedProfile && visitedProfile.commonFriends.length > 0 && (
                  <CollapsibleCard
                    title={`${visitedProfile.commonFriends.length} Mutual Friend${visitedProfile.commonFriends.length !== 1 ? "s" : ""}`}
                    icon={<Users size={20} className="text-[#6C63FF]" />}
                    defaultOpen={true}
                  >
                    <div className="flex flex-col gap-2">
                      {visitedProfile.commonFriends.map((u) => (
                        <div
                          key={u.id}
                          onClick={() => router.push(`/profile/${u.id}`)}
                          className="flex items-center gap-3 rounded-2xl border border-[#6C63FF]/15 bg-[#F6F5FF] px-4 py-3 cursor-pointer transition hover:bg-[#EEEEFF] hover:border-[#6C63FF]/30"
                        >
                          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-2xl bg-white border border-[#6C63FF]/20">
                            {u.profilePictureUrl ? (
                              <img src={u.profilePictureUrl} alt={u.username} className="h-full w-full object-cover" />
                            ) : (
                              <div className="grid h-full w-full place-items-center font-bold text-[#6C63FF]">{u.username[0]?.toUpperCase()}</div>
                            )}
                          </div>
                          <span className="flex-1 text-sm font-bold text-slate-800 truncate">{u.username}</span>
                          <span className="text-xs font-semibold text-[#6C63FF] bg-[#EEEEFF] px-2 py-1 rounded-full">Mutual</span>
                        </div>
                      ))}
                    </div>
                  </CollapsibleCard>
                )}

                {/* Danger Zone — own profile only */}
                {isOwnProfile && (
                  <CollapsibleCard
                    title="Danger Zone"
                    icon={<Flame size={20} className="text-red-500" />}
                    defaultOpen={false}
                  >
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <h3 className="text-sm font-bold text-red-700">Delete your account</h3>
                          <p className="mt-1 text-sm text-red-600">This action is permanent. Your data will be erased forever.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setDeleteErrors({}); setDeletePassword(""); setShowDeleteModal(true); }}
                          disabled={isDeleting}
                          className="rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isDeleting ? "Deleting..." : "Delete Account"}
                        </button>
                      </div>
                    </div>
                  </CollapsibleCard>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => { if (isDeleting) return; setShowDeleteModal(false); setDeletePassword(""); setDeleteErrors({}); }}
        >
          <div className="bg-white p-8 rounded-3xl w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-extrabold text-red-600">Delete you sure or not? 💀</h2>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Once delete means delete liao hor. All your data confirm gone. No undo, no Ctrl+Z, no comeback season.
            </p>
            <div className="mt-6 space-y-4">
              <label className="text-sm font-semibold ml-1">Password (last warning ah)</label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => { setDeletePassword(e.target.value); setIsPasswordValid(false); setDeleteErrors((prev) => ({ ...prev, password: undefined })); }}
                className="w-full border rounded-xl px-4 py-3"
                placeholder="Enter password"
              />
              <div className="min-h-[20px] mt-1">
                <p className={`text-red-500 text-xs font-bold transition-opacity duration-200 ${deleteErrors.password ? "opacity-100" : "opacity-0"}`}>
                  {deleteErrors.password ?? " "}
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowDeleteModal(false); setDeletePassword(""); setDeleteErrors({}); }}
                className="flex-1 border rounded-xl py-2"
              >
                Aiya cancel lah 😌
              </button>
              <div className={`flex-1 transition-opacity duration-300 ${isPasswordValid ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                <button
                  onClick={handleDeleteAccount}
                  disabled={!isPasswordValid || isDeleting}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 ease-out ${
                    isPasswordValid
                      ? "bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30 hover:shadow-red-700/40 hover:scale-[1.02] active:scale-[0.98]"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isDeleting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting account...
                    </span>
                  ) : isVerifyingPassword ? "Wan delete... bye bye 👋" : "Confirm Delete 🫠"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}