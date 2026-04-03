"use client";

import { api } from "@/app/api/api";
import toast from "react-hot-toast";

export default function RejectFriendButton({
  requesterId,
  onReject,
}: {
  requesterId: number;
  onReject: (id: number) => void;
}) {
  const handleReject = async () => {
    try {
      await api.post(`/api/friendship/reject/${requesterId}`);
      toast.success("Friend request rejected");
      onReject(requesterId);
    } catch {
      toast.error("Failed to reject request");
    }
  };

  return (
    <button
      onClick={handleReject}
      className="rounded-xl bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600"
    >
      Reject
    </button>
  );
}