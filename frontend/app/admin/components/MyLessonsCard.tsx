import { useEffect, useState, useMemo } from "react";
import { BookOpen, Pencil, Trash2, ChevronDown, BadgeAlert, Star, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Lesson } from "@/app/admin/page";
import { parseTags, getVisibleTags } from "@/app/utils/tags";
import { Report, ReportType } from "@/app/webadmin/page";
import { ReportsModal } from "./ReportModal";
import DeleteModal from "./DeleteModal";

// ── Types ─────────────────────────────────────────────────────────────────────

type FilterValue = "pending" | "rejected";
type StarFilter = 0 | 1 | 2 | 3 | 4 | 5;

export interface Review {
	id: string;
	username: string;
	profilePictureUrl: string | null;
	rating: 1 | 2 | 3 | 4 | 5;
	feedback: string;
	createdAt: string;
}

interface MyLessonsCardProps {
	title: string;
	data: Lesson[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function severityBadgeClass(type: ReportType | null): string {
	if (type === "critical") return "border-destructive/30 bg-destructive/10 text-destructive";
	if (type === "high")     return "border-warning/30 bg-warning/10 text-warning";
	if (type === "medium")   return "border-accent/30 bg-accent/10 text-accent";
	return "border-border bg-muted/40 text-foreground";
}

const severityRank: Record<ReportType, number> = {
	critical: 4,
	high: 3,
	medium: 2,
	low: 1,
};

function getInitials(username: string): string {
	return username
		.split(/\s+/)
		.slice(0, 2)
		.map((w) => w[0]?.toUpperCase() ?? "")
		.join("");
}

function StarDisplay({ value, size = 11 }: { value: number; size?: number }) {
	return (
		<div className="flex gap-0.5">
			{[1, 2, 3, 4, 5].map((i) => (
				<Star
					key={i}
					size={size}
					className={i <= value ? "fill-amber-400 text-amber-400" : "fill-muted text-muted-foreground/30"}
				/>
			))}
		</div>
	);
}

function AvatarCircle({ username, avatarUrl }: { username: string; avatarUrl: string | null }) {
	const colours = [
		"bg-violet-100 text-violet-800",
		"bg-teal-100 text-teal-800",
		"bg-orange-100 text-orange-800",
		"bg-blue-100 text-blue-800",
		"bg-pink-100 text-pink-800",
	];
	const idx = (username.charCodeAt(0) ?? 0) % colours.length;

	if (avatarUrl) {
		return <img src={avatarUrl} alt={username} className="w-6 h-6 rounded-full object-cover shrink-0" />;
	}
	return (
		<div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium shrink-0 ${colours[idx]}`}>
			{getInitials(username)}
		</div>
	);
}

// ── Reviews panel ─────────────────────────────────────────────────────────────

const PREVIEW_COUNT = 3;
type FetchState = "idle" | "loading" | "done" | "error";

function ReviewsPanel({ lessonId }: { lessonId: string }) {
	const [fetchState, setFetchState] = useState<FetchState>("idle");
	const [reviews, setReviews] = useState<Review[]>([]);
	const [starFilter, setStarFilter] = useState<StarFilter>(0);
	const [feedbackOnly, setFeedbackOnly] = useState(false);
	const [showAll, setShowAll] = useState(false);

	useEffect(() => {
		if (!lessonId) return;
		let cancelled = false;
		setFetchState("loading");
		fetch(`/api/lesson/${lessonId}/reviews`, { credentials: "include" })
			.then((res) => {
				if (!res.ok) throw new Error("Failed to fetch");
				return res.json();
			})
			.then(({ reviews }: { reviews: Review[] }) => {
				if (!cancelled) {
					setReviews(reviews ?? []);
					setFetchState("done");
				}
			})
			.catch(() => {
				if (!cancelled) setFetchState("error");
			});
		return () => { cancelled = true; };
	}, [lessonId]);

	const filtered = useMemo(() => {
		let base = starFilter === 0
			? reviews
			: reviews.filter((r) => r.rating === starFilter);
		if (feedbackOnly) {
			base = base.filter((r) => r.feedback?.trim());
		}
		return [...base].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
	}, [reviews, starFilter, feedbackOnly]);

	const displayed = showAll ? filtered : filtered.slice(0, PREVIEW_COUNT);
	const hasMore = filtered.length > PREVIEW_COUNT;

	// Count helpers — always based on full reviews list, respecting the feedbackOnly toggle
	const baseForCount = feedbackOnly ? reviews.filter((r) => r.feedback?.trim()) : reviews;
	const countFor = (s: StarFilter) =>
		s === 0
			? baseForCount.length
			: baseForCount.filter((r) => r.rating === s).length;

	const feedbackCount = reviews.filter((r) => r.feedback?.trim()).length;

	// Average computed from ALL reviews
	const avg = reviews.length
		? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
		: 0;

	function handleStarFilter(s: StarFilter) {
		setStarFilter(s);
		setShowAll(false);
	}

	function handleFeedbackToggle() {
		setFeedbackOnly((v) => !v);
		setShowAll(false);
	}

	return (
		<div className="border-t border-border bg-muted/30 p-4">
			{fetchState === "loading" && (
				<div className="flex items-center justify-center py-5 gap-2 text-muted-foreground">
					<Loader2 className="h-4 w-4 animate-spin" />
					<span className="text-xs">Loading reviews…</span>
				</div>
			)}

			{fetchState === "error" && (
				<p className="text-xs text-destructive text-center py-4">Failed to load reviews.</p>
			)}

			{fetchState === "done" && reviews.length === 0 && (
				<p className="text-xs text-muted-foreground text-center py-4">No reviews yet.</p>
			)}

			{fetchState === "done" && reviews.length > 0 && (
				<>
					{/* Score + bar chart — based on all reviews */}
					<div className="flex items-start gap-5 mb-4">
						<div className="text-center min-w-[52px]">
							<p className="text-3xl font-semibold text-foreground leading-none">{avg.toFixed(1)}</p>
							<div className="flex gap-0.5 justify-center my-1">
								<StarDisplay value={Math.round(avg)} />
							</div>
							<p className="text-[10px] text-muted-foreground">
								{reviews.length} review{reviews.length !== 1 ? "s" : ""}
							</p>
						</div>
						<div className="flex-1 flex flex-col gap-1.5">
							{[5, 4, 3, 2, 1].map((s) => {
								const total = reviews.filter((r) => r.rating === s).length;
								const maxTotal = Math.max(...[1,2,3,4,5].map(n => reviews.filter(r=>r.rating===n).length), 1);
								return (
									<div key={s} className="flex items-center gap-1.5">
										<span className="text-[10px] text-muted-foreground w-4 text-right">{s}</span>
										<div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
											<div className="h-full bg-amber-400 rounded-full" style={{ width: `${Math.round(total / maxTotal * 100)}%` }} />
										</div>
										<span className="text-[10px] text-muted-foreground w-3">{total}</span>
									</div>
								);
							})}
						</div>
					</div>

					{/* Filter pills */}
					<div className="flex flex-wrap gap-1.5 mb-3">
						{/* Star filter pills */}
						{([0, 5, 4, 3, 2, 1] as StarFilter[]).map((s) => (
							<button
								key={s}
								type="button"
								onClick={() => handleStarFilter(s)}
								className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors
									${starFilter === s && !feedbackOnly
										? "bg-primary/10 text-primary border-primary/30"
										: "bg-background text-muted-foreground border-border hover:border-primary/30"
									}`}
							>
								{s === 0 ? "All" : `${s} ★`} {countFor(s)}
							</button>
						))}

						{/* Divider */}
						<span className="self-center h-4 w-px bg-border mx-0.5" />

						{/* Feedback only pill */}
						<button
							type="button"
							onClick={handleFeedbackToggle}
							className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors
								${feedbackOnly
									? "bg-primary/10 text-primary border-primary/30"
									: "bg-background text-muted-foreground border-border hover:border-primary/30"
								}`}
						>
							With Feedback {feedbackCount}
						</button>
					</div>

					{/* Review cards */}
					{filtered.length === 0 ? (
						<p className="text-xs text-muted-foreground text-center py-3">No reviews match this filter.</p>
					) : (
						<div className="flex flex-col gap-2">
							{displayed.map((review) => (
								<div key={review.id} className="bg-background rounded-lg border border-border px-3 py-2.5">
									<div className="flex items-center justify-between mb-1.5">
										<div className="flex items-center gap-2">
											<AvatarCircle username={review.username} avatarUrl={review.profilePictureUrl} />
											<div>
												<p className="text-xs font-medium text-foreground leading-none">{review.username}</p>
												<p className="text-[10px] text-muted-foreground mt-0.5">
													{new Date(review.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
												</p>
											</div>
										</div>
										<StarDisplay value={review.rating} />
									</div>
									{review.feedback?.trim() ? (
										<p className="text-[11px] text-muted-foreground leading-relaxed pl-8">{review.feedback}</p>
									) : (
										<p className="text-[11px] text-muted-foreground/50 leading-relaxed pl-8 italic">No written feedback.</p>
									)}
								</div>
							))}
						</div>
					)}

					{hasMore && (
						<button
							type="button"
							onClick={() => setShowAll((v) => !v)}
							className="mt-2.5 w-full rounded-md border border-border bg-background py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
						>
							{showAll ? "Show less" : `See all ${filtered.length} reviews`}
						</button>
					)}
				</>
			)}
		</div>
	);
}

// ── Main component ────────────────────────────────────────────────────────────

export const MyLessonsCard = ({ title, data }: MyLessonsCardProps) => {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(true);
	const [appFilter, setAppFilter] = useState<FilterValue>("pending");
	const [localData, setLocalData] = useState(data);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);
	const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

	const [isReportModalOpen, setIsReportModalOpen] = useState(false);
	const [selectedLessonTitle, setSelectedLessonTitle] = useState("");
	const [selectedReports, setSelectedReports] = useState<Report[]>([]);
	const [reportOverrides, setReportOverrides] = useState<Record<string, Report[]>>({});

	useEffect(() => { setLocalData(data); }, [data]);

	function openReportsModal(lessonTitle: string, reports?: unknown[]) {
		setSelectedLessonTitle(lessonTitle);
		setSelectedReports((reports ?? []) as Report[]);
		setIsReportModalOpen(true);
	}

	function closeReportsModal() {
		setIsReportModalOpen(false);
		setSelectedLessonTitle("");
		setSelectedReports([]);
	}

	function closeDeleteModal() {
		setDeleteModalOpen(false);
		setLessonToDelete(null);
	}

	function toggleLessonExpand(lessonId: string) {
		setExpandedLesson((prev) => (prev === lessonId ? null : lessonId));
	}

	function renderPendingTag(status: string) {
		const isPending = status.toLowerCase() === "pending";
		return (
			<span className={`ml-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${isPending ? "bg-warning-light text-warning-dark" : "bg-destructive-light text-destructive-dark"}`}>
				<span className={`h-1.5 w-1.5 rounded-full ${isPending ? "bg-warning" : "bg-destructive"}`} />
				{isPending ? "Pending" : "Rejected"}
			</span>
		);
	}

	function renderSuspendedTag() {
		return (
			<span className="ml-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-destructive-light text-destructive-dark">
				<span className="h-1.5 w-1.5 rounded-full bg-destructive" />
				Suspended
			</span>
		);
	}

	const displayData = useMemo(() => {
		if (title !== "Applications") return localData;
		return localData.filter((l) => (l.status ?? "").toLowerCase() === appFilter);
	}, [title, localData, appFilter]);

	function getHighestReportType(reports?: Array<{ type?: string | null }>): ReportType | null {
		if (!reports || reports.length === 0) return null;
		let highest: ReportType | null = null;
		for (const report of reports) {
			const t = (report.type ?? "").toLowerCase() as ReportType;
			if (!["critical", "high", "medium", "low"].includes(t)) continue;
			if (!highest || severityRank[t] > severityRank[highest]) highest = t;
		}
		return highest;
	}

	return (
		<div className="rounded-xl border border-border bg-card p-6 shadow-sm my-3">
			<button type="button" onClick={() => setIsOpen((prev) => !prev)} className="w-full flex items-center justify-between mb-6 text-left">
				<h3 className="text-lg font-semibold text-foreground">{title}</h3>
				<ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ease-in-out ${isOpen ? "rotate-180" : ""}`} />
			</button>

			{title === "Applications" && (
				<div className="mb-4 flex items-center gap-1 rounded-lg border border-border bg-background p-1 w-fit">
					{(["pending", "rejected"] as const).map((value) => (
						<button
							key={value}
							type="button"
							onClick={() => setAppFilter(value)}
							className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${appFilter === value ? (value === "pending" ? "bg-warning text-white" : "bg-destructive text-white") : "text-muted-foreground hover:text-foreground"}`}>
							{value[0].toUpperCase() + value.slice(1)}
						</button>
					))}
				</div>
			)}

			<div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100 mt-0" : "grid-rows-[0fr] opacity-0 -mt-2"}`}>
				<div className="overflow-hidden">
					<div className="space-y-4">
						{displayData.map((record, i) => {
							const tagsArray = parseTags(record.tags);
							const { visible: visibleTags, remaining } = getVisibleTags(tagsArray);
							const highestType = getHighestReportType(record.reports as Array<{ type?: string | null }>);
							const mergedReports = (reportOverrides[record.title] ?? record.reports ?? []) as Report[];
							const showUpdateDot = mergedReports.some((rep) => (rep.lastUpdate ?? "").toLowerCase() !== "admin");
							const isExpanded = expandedLesson === String(record.id);

							return (
								<div
									key={i}
									className={
										`rounded-lg border border-border transition-colors overflow-hidden` +
										(record.deletedAt ? " opacity-50 pointer-events-none grayscale" : "")
									}>

									{/* Card header — click to toggle reviews */}
									<div
										className="p-4 hover:bg-border/50 transition-colors cursor-pointer"
										onClick={() => toggleLessonExpand(String(record.id))}
									>
										<div className="flex items-start gap-3">
											<div className="hidden sm:block p-3 rounded-lg bg-primary/10 shrink-0">
												<BookOpen className="h-5 w-5 text-primary" />
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-start justify-between gap-2">
													<div className="flex-1">
														<p className="text-sm font-semibold text-foreground mb-1">
															{record.title}
															{record.deletedAt ? ` (Deleted on ${new Date(record.createdAt).toUTCString().slice(0, -4)})` : ""}
															{record.status === "suspended" && !record.deletedAt ? renderSuspendedTag() : null}
															{title === "Applications" ? renderPendingTag(record.status ?? "") : null}
														</p>
													</div>

													{/* Action buttons — stopPropagation prevents toggling expand */}
													<div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
														{record.status === "pending" ? (
															<>
																<button
																	title="Edit lesson"
																	className="p-2 text-muted-foreground hover:text-foreground transition-colors"
																	onClick={() => router.push(`/admin/create?edit=${encodeURIComponent(record.title)}`)}>
																	<Pencil className="h-4 w-4" />
																</button>
																<button className="p-2 text-muted-foreground hover:text-destructive transition-colors">
																	<Trash2 className="h-4 w-4" />
																</button>
															</>
														) : mergedReports.length > 0 && record.status !== "suspended" && !record.deletedAt ? (
															<>
																<button
																	type="button"
																	onClick={() => openReportsModal(record.title, mergedReports)}
																	className={`group inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-xs font-semibold transition-all hover:scale-[1.03] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${severityBadgeClass(highestType)}`}
																	title={`${mergedReports.length} report(s)`}
																	aria-label={`View ${mergedReports.length} reports`}>
																	<BadgeAlert className="h-3.5 w-3.5" />
																	<span>{mergedReports.length}</span>
																	{showUpdateDot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70 group-hover:opacity-100" />}
																</button>
																<Trash2
																	className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-destructive transition-colors"
																	onClick={() => { setLessonToDelete(record); setDeleteModalOpen(true); }}
																/>
															</>
														) : !record.deletedAt ? (
															<Trash2
																className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-destructive transition-colors"
																onClick={() => { setLessonToDelete(record); setDeleteModalOpen(true); }}
															/>
														) : null}

														<ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
													</div>
												</div>

												<p className="text-sm text-muted-foreground mb-1">{record.description}</p>

												{tagsArray.length > 0 && (
													<div className="flex flex-wrap gap-2 mb-2 overflow-hidden max-h-[72px]">
														{visibleTags.map((t, idx) => (
															<span key={idx} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">{t}</span>
														))}
														{remaining > 0 && (
															<span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20">+{remaining}</span>
														)}
													</div>
												)}

												<p className="text-xs text-muted-foreground">Created: {new Date(record.createdAt).toLocaleDateString()}</p>
											</div>
										</div>
									</div>

									{/* Reviews panel — only mounts (and fetches) when card is expanded */}
									<div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
										<div className="overflow-hidden">
											{isExpanded && <ReviewsPanel lessonId={String(record.id)} />}
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>

			<ReportsModal
				open={isReportModalOpen}
				onClose={closeReportsModal}
				lessonTitle={selectedLessonTitle}
				reports={selectedReports}
				onSaveRemark={(reportId, remark) => {
					const now = new Date().toISOString();
					setSelectedReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, remarks: remark, lastUpdate: "admin", updatedAt: now } : r)));
					setReportOverrides((prev) => {
						const base = prev[selectedLessonTitle] ?? selectedReports;
						return { ...prev, [selectedLessonTitle]: base.map((r) => (r.id === reportId ? { ...r, remarks: remark, lastUpdate: "admin", updatedAt: now } : r)) };
					});
				}}
			/>
			<DeleteModal
				open={deleteModalOpen}
				onClose={closeDeleteModal}
				lesson={lessonToDelete}
				setLessonToDelete={setLessonToDelete}
				setDeleteModalOpen={setDeleteModalOpen}
				setLocalData={setLocalData}
			/>
		</div>
	);
};
