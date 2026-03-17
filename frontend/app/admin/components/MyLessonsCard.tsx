import { useEffect, useState, useMemo } from "react";
import { BookOpen, Pencil, Trash2, ChevronDown, BadgeAlert } from "lucide-react";
import { useRouter } from "next/navigation";

import { Lesson } from "@/app/admin/page";
import { parseTags, getVisibleTags } from "@/app/utils/tags";
import { Report, ReportType } from "@/app/webadmin/page";
import { ReportsModal } from "./ReportModal";
import toast from "react-hot-toast";
import DeleteModal from "./DeleteModal";

type FilterValue = "pending" | "rejected";
interface MyLessonsCardProps {
	title: string;
	data: Lesson[];
}

function severityBadgeClass(type: ReportType | null): string {
	if (type === "critical") return "border-destructive/30 bg-destructive/10 text-destructive";
	if (type === "high") return "border-warning/30 bg-warning/10 text-warning";
	if (type === "medium") return "border-accent/30 bg-accent/10 text-accent";
	return "border-border bg-muted/40 text-foreground";
}

const severityRank: Record<ReportType, number> = {
	critical: 4,
	high: 3,
	medium: 2,
	low: 1,
};

export const MyLessonsCard = ({ title, data }: MyLessonsCardProps) => {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(true);
	const [appFilter, setAppFilter] = useState<FilterValue>("pending");
	const [localData, setLocalData] = useState(data);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);

	const [isReportModalOpen, setIsReportModalOpen] = useState(false);
	const [selectedLessonTitle, setSelectedLessonTitle] = useState("");
	const [selectedReports, setSelectedReports] = useState<Report[]>([]);
	const [reportOverrides, setReportOverrides] = useState<Record<string, Report[]>>({});

	useEffect(() => {
		setLocalData(data);
	}, [data]);

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

	function renderPendingTag(status: string) {
		const isPending = status.toLowerCase() === "pending";
		return (
			<span
				className={`ml-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${isPending ? "bg-warning-light text-warning-dark" : "bg-destructive-light text-destructive-dark"}`}>
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
			if (!highest || severityRank[t] > severityRank[highest]) {
				highest = t;
			}
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
							return (
								<div
									key={i}
									className={
										`p-4 rounded-lg border border-border hover:bg-border/50 transition-colors cursor-pointer` +
										(record.deletedAt ? " opacity-50 pointer-events-none grayscale" : "")
									}>
									<div className="flex items-start gap-3">
										<div className="hidden sm:block p-3 rounded-lg bg-primary/10 shrink-0">
											<BookOpen className="h-5 w-5 text-primary" />
										</div>
										<div className="flex-1 min-w-0">
											<div className="flex items-start justify-between gap-2">
												<div className="flex-1">
													<p className="text-sm font-semibold text-foreground mb-1">
														{record.title} {record.deletedAt ? "(Deleted on " + new Date(record.createdAt).toUTCString().slice(0, -4) + ")" : ""}
														{record.status === "suspended" ? renderSuspendedTag() : <></>} {title === "Applications" ? renderPendingTag(record.status ?? "") : ""}
													</p>
												</div>
												{record.status === "pending" ? (
													<div className="flex items-center gap-1 shrink-0">
														<button
															title="Edit lesson"
															className="p-2 text-muted-foreground hover:text-foreground transition-colors"
															onClick={(e) => {
																e.stopPropagation();
																router.push(`/admin/create?edit=${encodeURIComponent(record.title)}`);
															}}>
															<Pencil className="h-4 w-4" />
														</button>
														<button className="p-2 text-muted-foreground hover:text-destructive transition-colors">
															<Trash2 className="h-4 w-4" />
														</button>
													</div>
												) : (record.reports?.length ?? 0) > 0 && record.status !== "suspended" && !record.deletedAt ? (
													<div className="flex items-center gap-2">
														<button
															type="button"
															onClick={() => openReportsModal(record.title, mergedReports)}
															className={`group inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-xs font-semibold transition-all hover:scale-[1.03] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${severityBadgeClass(highestType)}`}
															title={`${record.reports?.length ?? 0} report(s)`}
															aria-label={`View ${record.reports?.length ?? 0} reports`}>
															<BadgeAlert className="h-3.5 w-3.5" />
															<span>{record.reports?.length ?? 0}</span>
															{showUpdateDot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70 group-hover:opacity-100" />}
														</button>
														<Trash2
															className="h-4 w-4"
															onClick={(e) => {
																e.stopPropagation();
																setLessonToDelete(record);
																setDeleteModalOpen(true);
															}}
														/>
													</div>
												) : !record.deletedAt ? (
													<Trash2
														className="h-4 w-4"
														onClick={(e) => {
															e.stopPropagation();
															setLessonToDelete(record);
															setDeleteModalOpen(true);
														}}
													/>
												) : (
													<></>
												)}
											</div>
											<p className="text-sm text-muted-foreground mb-1">{record.description}</p>
											{tagsArray.length > 0 && (
												<div className="flex flex-wrap gap-2 mb-2 overflow-hidden max-h-[72px]">
													{visibleTags.map((t, idx) => (
														<span key={idx} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
															{t}
														</span>
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
						return {
							...prev,
							[selectedLessonTitle]: base.map((r) => (r.id === reportId ? { ...r, remarks: remark, lastUpdate: "admin", updatedAt: now } : r)),
						};
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
