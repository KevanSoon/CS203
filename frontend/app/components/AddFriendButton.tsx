"use client";

import { useState } from "react";

type Props = {
  targetUserId: number;
  onSuccess?: () => void;
};

export default function AddFriendButton({ targetUserId, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleAddFriend = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/friendship/${targetUserId}`, {
        method: "POST",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = typeof data?.message === "object" 
          ? JSON.stringify(data.message) 
          : data?.message || data?.error || "Failed to send request";
          
        throw new Error(msg);
      }

      setSent(true);
      if (onSuccess) onSuccess();

    } catch (err: any) {
      setError(err.message || "Failed to send request");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <span className="text-xs font-semibold text-green-600">
        Request Sent ✓
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end">
      <button
        onClick={handleAddFriend}
        disabled={loading}
        className="rounded-xl bg-[#6C63FF] px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-105 disabled:opacity-50"
      >
        {loading ? "Sending..." : "Add Friend"}
      </button>

      {error && (
        <span className="text-xs text-red-500 mt-1">{error}</span>
      )}
    </div>
  );
}