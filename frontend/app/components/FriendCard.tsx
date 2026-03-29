"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { X, Flame } from "lucide-react";
import { api } from "@/app/api/api"

// ── Streak Tiers ─────────────────────────────────────────────────────────────
// Edit this to add/remove tiers or change thresholds and colours.
// Keep sorted by minStreak descending — highest tier first.

type StreakTier = {
  minStreak: number;
  badge: string;
  badgeText: string;
  cardBg: string;
  cardBorder: string;
  cardHover: string;
  flameColor: string;
  countColor: string;
  badgeBg: string;
  badgeTextColor: string;
};

const STREAK_TIERS: StreakTier[] = [
  {
    minStreak: 30,
    badge: "🌟",
    badgeText: "Legendary",
    cardBg: "bg-purple-50",
    cardBorder: "border-purple-300",
    cardHover: "hover:border-purple-400",
    flameColor: "text-purple-500",
    countColor: "text-purple-600",
    badgeBg: "bg-purple-100",
    badgeTextColor: "text-purple-700",
  },
  {
    minStreak: 14,
    badge: "🔥",
    badgeText: "On Fire",
    cardBg: "bg-red-50",
    cardBorder: "border-red-300",
    cardHover: "hover:border-red-400",
    flameColor: "text-red-500",
    countColor: "text-red-600",
    badgeBg: "bg-red-100",
    badgeTextColor: "text-red-700",
  },
  {
    minStreak: 7,
    badge: "🔆",
    badgeText: "Hot",
    cardBg: "bg-orange-50",
    cardBorder: "border-orange-200",
    cardHover: "hover:border-orange-300",
    flameColor: "text-orange-400",
    countColor: "text-orange-500",
    badgeBg: "bg-orange-100",
    badgeTextColor: "text-orange-600",
  },
];

const DEFAULT_STYLE = {
  cardBg: "bg-white",
  cardBorder: "border-slate-200",
  cardHover: "hover:border-[#6C63FF]/30",
  flameColor: "text-slate-300",
  countColor: "text-slate-400",
};

// ─────────────────────────────────────────────────────────────────────────────

type FriendDto = {
  id: number;
  username: string;
  profilePictureUrl?: string;
  streak: number;
  streakActiveToday: boolean;
};

type Props = {
  friend: FriendDto;
  rank: number;
  onRemove: (id: number) => void;
  readonly?: boolean;
};

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

export default function FriendCard({ friend, rank, onRemove, readonly = false }: Props) {
  const router = useRouter();
  const [isRemoving, setIsRemoving] = useState(false);

  const tier = STREAK_TIERS.find((t) => friend.streak >= t.minStreak) ?? null;
  const style = tier ?? DEFAULT_STYLE;

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRemoving) return;
    setIsRemoving(true);
    try {
      await api.delete(`/api/friendship/${friend.id}`);
      toast.success("Friend removed");
      onRemove(friend.id);
    } catch {
      toast.error("Failed to remove friend");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div
      onClick={() => router.push(`/profile/${friend.id}`)}
      className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 cursor-pointer transition hover:shadow-md
        ${style.cardBg} ${style.cardBorder} ${style.cardHover}`}
    >
      {/* Rank */}
      <span className="w-6 text-center text-sm font-black flex-shrink-0">
        {rank <= 2
          ? RANK_MEDALS[rank]
          : <span className="text-slate-300">#{rank + 1}</span>
        }
      </span>

      {/* Avatar */}
      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-2xl bg-white border border-slate-100">
        {friend.profilePictureUrl ? (
          <img src={friend.profilePictureUrl} alt={friend.username} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center font-bold text-[#6C63FF]">
            {friend.username[0]?.toUpperCase()}
          </div>
        )}
      </div>

      {/* Username */}
      <p className="flex-1 text-sm font-bold text-slate-900 truncate">{friend.username}</p>

      {/* Active today dot */}
      {friend.streakActiveToday && (
        <span className="h-2 w-2 rounded-full bg-green-400 flex-shrink-0" title="Completed a lesson today" />
      )}

      {/* Streak + tier badge */}
      <span className={`flex items-center gap-1 text-sm font-black flex-shrink-0 ${style.countColor}`}>
        <Flame size={14} className={style.flameColor} />
        {friend.streak}
        {tier && (
          <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${tier.badgeBg} ${tier.badgeTextColor}`}>
            {tier.badge} {tier.badgeText}
          </span>
        )}
      </span>

      {/* Remove button — hidden when readonly */}
      {!readonly && (
        <button
          onClick={handleRemove}
          disabled={isRemoving}
          className="
            opacity-0 scale-95
            group-hover:opacity-100 group-hover:scale-100
            transition-all duration-200
            flex items-center
            text-xs font-semibold
            px-3 py-1.5 rounded-lg
            bg-red-100 text-red-600
            hover:bg-red-200
            disabled:opacity-50
            flex-shrink-0
          "
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}