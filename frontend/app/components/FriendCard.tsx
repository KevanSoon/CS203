"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";

type FriendDto = {
  id: number;
  username: string;
};

type Props = {
  friend: FriendDto;
  onRemove: (id: number) => void;
};

export default function FriendCard({ friend, onRemove }: Props) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    if (isRemoving) return;

    setIsRemoving(true);

    try {
      const res = await fetch(`/api/friendship/${friend.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      toast.success("Friend removed");
      onRemove(friend.id);
    } catch {
      toast.error("Failed to remove friend");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:shadow-md hover:border-[#6C63FF]/30">
      
      <div className="flex items-center gap-3 min-w-0">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#F3F1FF] text-[#6C63FF] font-bold">
          {friend.username[0]?.toUpperCase()}
        </div>

        <p className="text-sm font-bold text-slate-900 truncate">
          {friend.username}
        </p>
      </div>

      <button
        onClick={handleRemove}
        disabled={isRemoving}
        className="
          opacity-0 scale-95
          group-hover:opacity-100 group-hover:scale-100
          transition-all duration-200
          flex items-center gap-1
          text-xs font-semibold
          px-3 py-1.5 rounded-lg
          bg-red-100 text-red-600
          hover:bg-red-200
          disabled:opacity-50
        "
      >
        <X size={14} />
      </button>
    </div>
  );
}