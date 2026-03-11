"use client";

import { useState } from "react";
import toast from "react-hot-toast";

type FriendDto = {
  id: number;
  username: string;
};

type Props = {
  friend: FriendDto;
  onCancel?: () => void;
};

export default function OutgoingFriendCard({ friend, onCancel }: Props) {
  const [hover, setHover] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/friendship/pending/outgoing/${friend.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to cancel request");

      toast.success("Friend request cancelled");
      if (onCancel) await onCancel();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-2xl bg-white font-bold text-amber-600">
          {friend.username[0]?.toUpperCase()}
        </div>

        <p className="text-sm font-bold text-amber-700 truncate max-w-[140px]">
          {friend.username}
        </p>
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