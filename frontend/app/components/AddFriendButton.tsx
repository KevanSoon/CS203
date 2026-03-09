"use client";

import { useState } from "react";
import toast from "react-hot-toast";

type Props = {
  targetUserId: number;
  initialSent: boolean; 
  onSuccess: () => Promise<void>; 
};

export default function AddFriendButton({
  targetUserId,
  initialSent,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [hover, setHover] = useState(false);
  const [error, setError] = useState("");

  const handleAddFriend = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/friendship/${targetUserId}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to send request");

      toast.success("Friend request sent!");
      await onSuccess(); 
    } catch (err: any) {
      const msg = err.message || "Failed to send request";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/friendship/${targetUserId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to cancel request");

      toast.success("Friend request cancelled");
      await onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel request");
    } finally {
      setLoading(false);
    }
  };

  if (initialSent) {
    return (
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="relative inline-block"
      >
        <span
          className={`text-xs font-semibold text-amber-600 transition-opacity duration-200 ${
            hover ? "opacity-0" : "opacity-100"
          }`}
        >
          Request Sent
        </span>

        <button
          onClick={handleCancel}
          disabled={loading}
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600 transition-opacity duration-200 hover:bg-red-100 ${
            hover ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {loading ? "..." : "Cancel"}
        </button>
      </div>
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
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </div>
  );
}