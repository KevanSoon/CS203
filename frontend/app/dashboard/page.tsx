"use client";

import { useEffect, useMemo, useState } from "react";
import LessonCard from "@/app/dashboard/components/LessonCard";
import { Sidebar } from "@/app/components/Sidebar";
import { api } from "@/app/api/api";
import FilterSearch from "@/app/components/FilterSearch";
import { useProgressStore, isDashboardStale, DashboardProgress } from "@/app/store/ProgressStore";
import toast from "react-hot-toast";
import { Flame, X } from "lucide-react";

interface LessonSummary {
	id: number;
	title: string;
	description: string;
	createdBy: string;
	createdAt: string;
	tags: string | null;
	lessonPictureUrl: string | null;
	deletedAt: string | null;
	status: "approved" | "suspended";
}

interface MergedLesson {
	lessonId: number;
	title: string;
	description: string;
	lessonPictureUrl: string | null;
	tags: string | null;
	status: "in_progress" | "completed" | "not_started";
	lessonStatus: "approved" | "suspended";
	progressPercent: number;
	deletedAt: string | null;
}

function parseTags(tags?: string | null): string[] {
	if (!tags) return [];
	return tags
		.split(",")
		.map((t) => t.trim())
		.filter(Boolean);
}

function normalize(s: string) {
	return s.trim().toLowerCase();
}

function getDashboardTitle(title: string, deletedAt?: string | null): string {
	const marker = "_deletedat_";
	const markerIndex = title.indexOf(marker);
	const baseTitle = markerIndex > 0 ? title.slice(0, markerIndex) : title;
	return deletedAt ? `${baseTitle} (Deleted)` : baseTitle;
}

export default function DashboardPage() {
	const [selected, setSelected] = useState("View Lessons");
	const [error, setError] = useState<string | null>(null);
	const [query, setQuery] = useState("");
	const [mode, setMode] = useState<"search" | "tag">("search");
	const [selectedTags, setSelectedTags] = useState<string[]>([]);

	const [lessons, setLessons] = useState<LessonSummary[]>([]);
	const { dashboardProgress, setDashboardProgress } = useProgressStore();
	const [loading, setLoading] = useState(true);
	const [showStreakBrokenModal, setShowStreakBrokenModal] = useState(false);

	useEffect(() => {
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === "Escape") setShowStreakBrokenModal(false);
		};
		if (showStreakBrokenModal) window.addEventListener("keydown", handleEsc);
		return () => window.removeEventListener("keydown", handleEsc);
	}, [showStreakBrokenModal]);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const [lessonsRes, progressRes] = await Promise.all([
					api.get<LessonSummary[]>("/api/lesson"),
					isDashboardStale() || dashboardProgress.length === 0
						? api.get<{ progress: DashboardProgress[]; streakBroken: boolean }>("/api/progress/dashboard")
						: Promise.resolve(null),
				]);

				setLessons(lessonsRes.data);

				if (progressRes) {
					setDashboardProgress(progressRes.data.progress);
					if (progressRes.data.streakBroken) setShowStreakBrokenModal(true);
				}
			} catch (err: unknown) {
				console.error(err);
				setError("Failed to load lessons.");
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	const merged: MergedLesson[] = useMemo(() => {
		const progressMap = new Map(dashboardProgress.map((p) => [p.lessonId, p]));
		return lessons.map((lesson) => {
			const progress = progressMap.get(lesson.id);
			return {
				lessonId: lesson.id,
				title: lesson.title,
				description: lesson.description,
				lessonPictureUrl: lesson.lessonPictureUrl,
				tags: lesson.tags,
				status: progress?.status ?? "not_started",
				lessonStatus: lesson.status,
				progressPercent: progress?.progressPercent ?? 0,
				deletedAt: lesson.deletedAt,
			};
		});
	}, [lessons, dashboardProgress]);

	const availableTags = useMemo(() => {
		const all = merged.flatMap((l) => parseTags(l.tags));
		return [...new Set(all)].sort();
	}, [merged]);

	const addTag = (tag: string) => {
		const cleaned = tag.trim();
		if (!cleaned) return;
		const exists = selectedTags.some((t) => normalize(t) === normalize(cleaned));
		if (exists) return;
		setSelectedTags((prev) => [...prev, cleaned]);
	};

	const removeTag = (tag: string) => {
		setSelectedTags((prev) => prev.filter((t) => t !== tag));
	};

	const clearAll = () => {
		setSelectedTags([]);
		setQuery("");
	};

	const filteredLessons = useMemo(() => {
		let result = merged;

		if (selectedTags.length > 0) {
			const selectedNorm = selectedTags.map(normalize);
			result = result.filter((lesson) => {
				const lessonTags = parseTags(lesson.tags).map(normalize);
				return selectedNorm.every((sel) => lessonTags.includes(sel));
			});
		}

		if (mode === "search" && query.trim()) {
			const q = normalize(query);
			result = result.filter((lesson) => normalize(lesson.title).includes(q) || normalize(lesson.description).includes(q));
		}

		return result;
	}, [merged, selectedTags, query, mode]);

	const handleDeleteProgress = async (lessonId: number) => {
		try {
			await api.delete(`/api/progress/lesson/${lessonId}`);
			setLessons((prev) => prev.map((l) => (l.id === lessonId ? { ...l, progressPercent: 0 } : l)));
			const newProgress = dashboardProgress.map((p) => (p.lessonId === lessonId ? { ...p, progressPercent: 0, status: "not_started" as "not_started" } : p));
			setDashboardProgress(newProgress);
		} catch (err) {
			toast.error("Failed to remove deleted lesson");
		}
	};

	const isFiltering = selectedTags.length > 0 || (mode === "search" && query.trim().length > 0);

	const inProgress = filteredLessons.filter((l) => l.status === "in_progress");
	const notStarted = filteredLessons.filter((l) => l.status === "not_started" && !l.deletedAt);
	const completed = filteredLessons.filter((l) => l.status === "completed" && !l.deletedAt);

	const renderSection = (title: string, items: MergedLesson[]) => {
		if (items.length === 0) return null;

		return (
			<div className="mt-10">
				<h2 className="text-lg font-bold mb-4 text-foreground">{title}</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{items.map((lesson) =>
						(lesson.deletedAt || lesson.lessonStatus == "suspended") && lesson.status == "in_progress" ? (
							(() => {
								const displayTitle = lesson.deletedAt
									? getDashboardTitle(lesson.title, lesson.deletedAt)
									: `${getDashboardTitle(lesson.title)} (Suspended)`;
								return (
							<div
								key={lesson.lessonId}
								className="group bg-card border border-border rounded-2xl overflow-hidden shadow-sm transition-all duration-300 cursor-pointer opacity-50 pointer-events-none grayscale md:hover:shadow-none md:hover:translate-y-0">
								<div className="overflow-hidden">
									<img src={lesson.lessonPictureUrl ?? "/images/questionmark.jpg"} alt={title} className="w-full object-cover h-44 sm:h-52 transition-transform duration-500" />
									<button
										className="absolute top-2 right-2 p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 pointer-events-auto"
										title="Remove this lesson"
										onClick={() => handleDeleteProgress(lesson.lessonId)}>
										X
									</button>
								</div>
								<div className="p-3 sm:p-4 space-y-3 flex flex-col">
									<div>
										<h3 className="text-sm sm:text-base font-bold leading-snug line-clamp-2">{displayTitle}</h3>
										<p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{lesson.description}</p>
									</div>
									<div className="space-y-2 mt-auto">
										<span className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
											In Progress
										</span>
										<div className="flex justify-between text-[11px] sm:text-xs font-semibold text-muted-foreground">
											<span>Completion</span>
											<span>{lesson.progressPercent}%</span>
										</div>
										<div className="w-full h-2 rounded-full bg-muted overflow-hidden">
											<div className="h-full bg-primary transition-all duration-700 ease-out" style={{ width: `${lesson.progressPercent}%` }} />
										</div>
									</div>
								</div>
							</div>
							);
							})()
						) : (
							<LessonCard
								key={lesson.lessonId}
								lessonId={lesson.lessonId}
								title={lesson.title}
								description={lesson.description}
								image={lesson.lessonPictureUrl ?? "/images/questionmark.jpg"}
								progress={lesson.progressPercent}
								status={lesson.status}
								tags={parseTags(lesson.tags)}
							/>
						),
					)}
				</div>
			</div>
		);
	};

	return (
		<div className="flex w-full bg-background text-foreground">
			<Sidebar selected={selected} setSelected={setSelected} />

			<div className="flex-1 px-6 py-12">
				<h1 className="text-3xl md:text-4xl font-black mb-2">Your Daily Grind 🔥</h1>
				<p className="text-sm text-muted-foreground mb-6">Enrolled &amp; Available Courses</p>

				<FilterSearch
					query={query}
					setQuery={setQuery}
					mode={mode}
					setMode={setMode}
					selectedTags={selectedTags}
					addTag={addTag}
					removeTag={removeTag}
					clearAll={clearAll}
					availableTags={availableTags}
				/>

				{error && <p className="text-red-500 mt-6">{error}</p>}

				{!error && isFiltering && filteredLessons.length === 0 && <p className="text-muted-foreground mt-6">No lessons found matching your search.</p>}

				{!error && !loading && merged.length === 0 && <p className="text-muted-foreground mt-6">No courses available yet.</p>}

				{renderSection("Continue Learning", inProgress)}
				{renderSection("Not Started", notStarted)}
				{renderSection("Completed", completed)}
			</div>

			{showStreakBrokenModal && (
				<div
					className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center"
					onClick={() => setShowStreakBrokenModal(false)}
				>
					<div
						onClick={(e) => e.stopPropagation()}
						className="bg-white w-full max-w-md rounded-2xl p-5 sm:p-6 shadow-xl animate-scaleIn relative mx-4"
					>
						<button
							onClick={() => setShowStreakBrokenModal(false)}
							className="absolute top-3 right-3 p-2 rounded-md hover:bg-slate-100"
							aria-label="Close"
						>
							<X size={18} />
						</button>

						<div className="flex flex-col items-center text-center gap-3 py-2">
							<span className="grid h-14 w-14 place-items-center rounded-2xl bg-orange-100 text-orange-500">
								<Flame size={28} />
							</span>
							<h3 className="text-xl font-extrabold text-slate-900">Your streak has ended</h3>
							<p className="text-sm text-slate-500 leading-relaxed">
								You missed a day and your daily streak has been reset to 0. Complete a lesson today to start a new streak!
							</p>
							<button
								onClick={() => setShowStreakBrokenModal(false)}
								className="mt-2 w-full rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#9D94EB] px-4 py-3 text-sm font-bold text-white shadow-[0_10px_25px_rgba(108,99,255,0.25)] hover:brightness-105 transition"
							>
								Let's go again!
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
