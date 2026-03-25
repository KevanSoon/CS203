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
	onDeleted: (id: number) => void;
}

export function DeleteModal({ open, onClose, lesson, setDeleteModalOpen, setLessonToDelete, onDeleted }: DeleteModalProps) {
	const [input, setInput] = useState("");

	useEffect(() => {
		if (!open) setInput("");
	}, [open]);

	const getLessonLabel = (status?: string | null) => {
		if (status === "saved") return "draft";
		if (status === "pending" || status === "rejected") return "lesson application";
		return "lesson";
	};

	const label = getLessonLabel(lesson?.status);
	const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);

	async function handleDelete(id: number) {
		try {
			await api.delete(`/api/lesson/${id}`);
			onDeleted(id);
			toast.success(`${capitalizedLabel} deleted successfully`);
		} catch {
			toast.error(`${capitalizedLabel} deletion failed`);
		}
	}

	if (!open) return null;

	const isMatch = input === (lesson?.title ?? "");

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
			<div className="bg-white p-6 rounded shadow-lg" onClick={(e) => e.stopPropagation()}>
				<p className="font-semibold pb-3">
					Are you sure you want to delete {label} <b>{lesson?.title}</b>?<br />
				</p>
				<p>
					Please type <b>{lesson?.title}</b> to confirm:
				</p>
				<input className="mt-3 mb-2 w-full border rounded px-2 py-1" type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={`Type ${label} title`} />
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
