import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/app/api/api";
import { Lesson } from "../page";

interface DeleteModalProps {
	open: boolean;
	onClose: () => void;
	lesson: Lesson | null;
	setDeleteModalOpen: (state: boolean) => void;
	setLessonToDelete: (lesson: Lesson | null) => void;
	setLocalData: (updater: (prev: any[]) => any[]) => void;
}

export function DeleteModal({ open, onClose, lesson, setDeleteModalOpen, setLessonToDelete, setLocalData }: DeleteModalProps) {
	const [input, setInput] = useState("");

    useEffect(() => {
        if (!open) setInput("");
    }, [open]);

	async function handleDelete(id: number | null) {
		try {
			await api.delete(`/api/lesson/${id}`);
			setLocalData((prev) => prev.map((l) => (l.id === id ? { ...l, deletedAt: new Date().toISOString() } : l)));
			toast.success("Lesson has been deleted successfully");
		} catch {
			toast.error("Lesson deletion has failed");
		}
	}

	if (!open) return null;

	const isMatch = input === (lesson?.title ?? "");

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
			<div className="bg-white p-6 rounded shadow-lg" onClick={(e) => e.stopPropagation()}>
				<p className="font-semibold pb-3">
					Are you sure you want to delete lesson <b>{lesson?.title}</b>?<br />
				</p>
				<p>
					Please type <b>{lesson?.title}</b> to confirm:
				</p>
				<input className="mt-3 mb-2 w-full border rounded px-2 py-1" type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type lesson title" />
				<div className="flex gap-4 mt-4 justify-end">
					<button
						className="px-4 py-2 bg-muted text-foreground rounded"
						onClick={() => {
							setDeleteModalOpen(false);
							setLessonToDelete(null);
						}}>
						Cancel
					</button>
					<button
						className={`px-4 py-2 rounded text-white ${isMatch ? "bg-destructive" : "bg-gray-400 cursor-not-allowed"}`}
						disabled={!isMatch}
						onClick={async () => {
							if (typeof lesson?.id === "number" && isMatch) await handleDelete(lesson.id);
							setDeleteModalOpen(false);
							setLessonToDelete(null);
						}}>
						Delete
					</button>
				</div>
			</div>
		</div>
	);
}
export default DeleteModal;
