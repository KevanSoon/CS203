"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/app/api/api"

type FriendDto = {
  id: number;
  username: string;
  profilePictureUrl?: string;
};

type Props = {
  friend: FriendDto;
  onCancel?: () => void;
};

export default function OutgoingFriendCard({ friend, onCancel }: Props) {
  const router = useRouter();
  const [hover, setHover] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCancel = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setLoading(true);
      await api.delete(`/api/friendship/pending/outgoing/${friend.id}`);
      toast.success("Friend request cancelled");
      if (onCancel) await onCancel();
    } catch {
      toast.error("Failed to cancel request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={() => router.push(`/profile/${friend.id}`)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 cursor-pointer"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-2xl bg-white">
          {friend.profilePictureUrl ? (
            <img src={friend.profilePictureUrl} alt={friend.username} className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center font-bold text-[#6C63FF]">
              {friend.username[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <p className="text-sm font-bold text-amber-700 truncate max-w-[140px]">{friend.username}</p>
      </div>

      <button
        onClick={handleCancel}
        disabled={loading}
        className={`rounded-md border border-red-200 bg-red-50 px-2 text-xs font-semibold text-red-600 transition-opacity duration-200 hover:bg-red-100 ${
          hover ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {loading ? "..." : "Cancel"}
      </button>
    </div>
  );
}