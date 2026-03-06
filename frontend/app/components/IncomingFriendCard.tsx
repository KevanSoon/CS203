"use client";

import RejectFriendButton from "./RejectFriendButton";

type FriendDto = {
  id: number;
  username: string;
};

export default function IncomingFriendCard({
  friend,
  onAccept,
  onReject,
}: {
  friend: FriendDto;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#6C63FF]/20 bg-[#F6F5FF] px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-2xl bg-white font-bold text-[#6C63FF]">
            {friend.username[0]?.toUpperCase()}
            </div>

            <p className="max-w-[140px] truncate text-sm font-bold">
            {friend.username}
            </p>
        </div>

        <div className="flex flex-wrap gap-2">
            <button
            onClick={() => onAccept(friend.id)}
            className="rounded-xl bg-[#6C63FF] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-105"
            >
            Accept
            </button>

            <RejectFriendButton requesterId={friend.id} onReject={onReject} />
        </div>
    </div>
  );
}