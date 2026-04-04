"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, X } from "lucide-react";
import { api } from "@/app/api/api";
import toast from "react-hot-toast";

interface Props {
  lessonId: number | null;
  chapters: { id: number; title: string }[];
  onClose: () => void;
}

export function ReportModal({ lessonId, chapters, onClose }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [chapterId, setChapterId] = useState<number | "">("");
  const [priority, setPriority] = useState("medium");
  const [loading, setLoading] = useState(false);

  const isFormValid = title.trim() !== "" && description.trim() !== "";

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please provide a title.");
      return;
    }

    if (!description.trim()) {
      toast.error("Please provide a description.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/api/report/user", {
        title,
        description,
        status: "reported",
        type: priority,
        lessonId,
        chapterId: chapterId || null,
      });

      toast.success("Report submitted successfully.");
      setDescription("");
      onClose();
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4"
      onMouseDown={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg bg-card border border-red-200 rounded-lg shadow-lg p-6 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X />
        </button>

        <p className="text-xs text-muted-foreground mb-2">
          Fields marked with <span className="text-red-500 font-semibold">*</span> are required.
        </p>

        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="text-red-600" />
          <h2 className="text-xl font-bold text-red-600">
            Report Lesson Issue
          </h2>
        </div>

        <form onSubmit={submitReport} className="space-y-4">

          <div>
            <label className="text-sm font-medium">
              Issue Title
              <span className="text-red-500">*</span>
            </label>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mt-1 border border-red-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-md p-2"
              placeholder="Short summary of the issue"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Chapter (optional)
            </label>

            <select
              value={chapterId}
              onChange={(e) =>
                setChapterId(e.target.value ? Number(e.target.value) : "")
              }
              className="w-full mt-1 border rounded-md p-2"
            >
              <option value="">Entire Lesson</option>
              {chapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">
              Severity
            </label>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full mt-1 border rounded-md p-2"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">
              Description
              <span className="text-red-500">*</span>
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-1 border border-red-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-md p-2 h-28"
              placeholder="Explain the issue in detail..."
            />
          </div>

          <button
            disabled={loading || !isFormValid}
            className={`px-4 py-2 rounded-lg text-white transition 
              ${loading || !isFormValid ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}            
          >
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>
    </div>
  );
}