"use client";

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
        const res = await fetch(`/api/friendship/reject/${requesterId}`, {
            method: "POST",
        });

        if (res.status >= 200 && res.status < 300) {
            toast.success("Friend request rejected");
            onReject(requesterId);
            return;
        }

        toast.error(`Failed to reject request (status ${res.status})`);
    } catch (err) {
        console.error(err);
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