"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Send, CheckCheck, Ban } from "lucide-react";

import { Report } from "../page";
import { SingleReportModal } from "./report-modal";

type ReportStatus = "reported" | "unresolved" | "closed";
type ReportType = "critical" | "high" | "medium" | "low";
type FilterValue = "reports" | ReportStatus;

interface ReportsTableProps {
	reports: Report[];
	handleChangeStatus: (id: number, status: ReportStatus) => void;
	onSuspendLesson: (id: number, status: ReportStatus) => void;
}

function statusBadgeClass(status: ReportStatus): string {
	if (status === "reported") return "bg-warning-light text-warning-dark";
	if (status === "closed") return "bg-success-light text-success-dark";
	return "bg-destructive-light text-destructive-dark";
}

function severityBadgeClass(type: ReportType): string {
	if (type === "critical") return "bg-destructive text-white";
	if (type === "high") return "bg-warning text-white";
	if (type === "medium") return "bg-accent text-white";
	if (type === "low") return "bg-white text-dark border";

	return "bg-muted text-foreground";
}

function toSentenceCase(value: string): string {
	return value.charAt(0).toUpperCase() + value.slice(1);
}

const severityRank: Record<ReportType, number> = {
	critical: 4,
	high: 3,
	medium: 2,
	low: 1,
};
export function ReportsTable({ reports, handleChangeStatus, onSuspendLesson }: ReportsTableProps) {
	const searchParams = useSearchParams();
	const router = useRouter();

	const [filter, setFilter] = useState<FilterValue>("reported");
	const [selectedReport, setSelectedReport] = useState<Report | null>(null);

	// Automatically open the report modal if reportId param is present on mount/reports load
	useEffect(() => {
		const initialReportId = searchParams.get("reportId");
		if (initialReportId && reports.length > 0 && !selectedReport) {
			const report = reports.find((r) => r.id === parseInt(initialReportId));
			if (report) {
				setSelectedReport(report);
				// Clean up the URL securely so it doesn't stubbornly re-open the modal
				// when the user explicitly interacts to close it later down the line.
				const newParams = new URLSearchParams(searchParams.toString());
				newParams.delete("reportId");
				newParams.delete("tab");
				
				const qs = newParams.toString();
				router.replace(`/webadmin${qs ? `?${qs}` : ""}`, { scroll: false });
			}
		}
	}, [reports, searchParams, router]);

	const filteredReports = useMemo(() => {
		const allVisible = reports.filter((r) => r.status === "reported" || r.status === "unresolved");
		const base = filter === "reports" ? allVisible : reports.filter((r) => r.status === filter);

		return [...base].sort((a, b) => {
			// For closed tab: sort by date only (newest first)
			if (filter === "closed") {
				return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
			}

			// For other tabs: severity first, then date
			const severityDiff = severityRank[b.type] - severityRank[a.type];
			if (severityDiff !== 0) return severityDiff;

			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		});
	}, [reports, filter]);

	const counts = {
		reports: reports.filter((r) => r.status === "reported" || r.status === "unresolved").length,
		reported: reports.filter((r) => r.status === "reported").length,
		unresolved: reports.filter((r) => r.status === "unresolved").length,
		closed: reports.filter((r) => r.status === "closed").length,
	};

	return (
		<div className="w-full rounded-lg border border-border bg-card">
			<div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
				<h2 className="text-lg font-semibold text-foreground">User Reports</h2>
				<div className="flex items-center gap-1 rounded-lg border border-border bg-background p-1">
					{(["reports", "reported", "unresolved", "closed"] as const).map((tab) => (
						<button
							key={tab}
							onClick={() => setFilter(tab)}
							className={`rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
								filter === tab ? "bg-accent text-white" : "text-muted-foreground hover:text-foreground"
							}`}>
							{tab[0].toUpperCase() + tab.slice(1)} ({counts[tab]})
						</button>
					))}
				</div>
			</div>

			<div className="space-y-3 p-3">
				{filteredReports.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<p className="text-muted-foreground">No reports found</p>
						<p className="mt-1 text-sm text-muted-foreground">{filter !== "reports" ? `No ${filter} reports right now` : "No reports submitted yet"}</p>
					</div>
				) : (
					filteredReports.map((report) => (
						<div key={report.id} className="rounded-md border border-border px-3 py-3 shadow-sm transition-all hover:shadow-md" onClick={() => setSelectedReport(report)}>
							<div className="flex items-start justify-between gap-3">
								<div className="min-w-0">
									<span className="text-sm font-semibold text-foreground">
										Report {report.id}. {report.title}
									</span>
									{filter === "reports" ? (
										<>
											{" "}
											<span className={`rounded-full px-2.5 py-1 text-xs font-medium ${severityBadgeClass(report.type)}`}>{toSentenceCase(report.type)}</span>
											<div className="mt-1 flex flex-wrap items-center gap-2">
												<span className="text-xs text-muted-foreground">
													Lesson: {report.lessonTitle} {report.chapterTitle ? ` · ${report.chapterTitle}` : ""}
												</span>
												<span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(report.status)}`}>{toSentenceCase(report.status)}</span>{" "}
											</div>
										</>
									) : filter === "unresolved" ? (
										<>
											{" "}
											<span className={`rounded-full px-2.5 py-1 text-xs font-medium ${severityBadgeClass(report.type)}`}>{toSentenceCase(report.type)}</span>
											<div className="mt-2 flex flex-wrap items-center gap-2">
												<span className="text-xs text-muted-foreground">
													Lesson: {report.lessonTitle} {report.chapterTitle ? ` · ${report.chapterTitle}` : ""}
												</span>
											</div>
											<div className="mt-2 flex flex-wrap items-center gap-2">
												<span className="text-xs text-muted-foreground">
													Updated By Lesson Admin: <span className={report.lastUpdate === "admin"? "font-semibold text-success" : "font-semibold text-destructive"}>{report.lastUpdate === "admin"? "Yes" : "No"}</span> 
												</span>
											</div>
										</>
									) : (
										<>
											{" "}
											<span className={`rounded-full px-2.5 py-1 text-xs font-medium ${severityBadgeClass(report.type)}`}>{toSentenceCase(report.type)}</span>
											<div className="mt-2 flex flex-wrap items-center gap-2">
												<span className="text-xs text-muted-foreground">
													Lesson: {report.lessonTitle} {report.chapterTitle ? ` · ${report.chapterTitle}` : ""}
												</span>
											</div>
										</>
									)}
									<p className="mt-2 text-xs text-muted-foreground">{new Date(report.createdAt).toLocaleString()}</p>
								</div>

								<div className="flex shrink-0 items-center gap-2">
									{report.status !== "closed" && (
										<>
											<button
												onClick={(e) => {
													e.stopPropagation();
													handleChangeStatus(report.id, "unresolved");
												}}
												title="Redirect Report"
												className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:opacity-90">
												<Send className="h-4 w-4" />
											</button>
											<button
												onClick={(e) => {
													e.stopPropagation();
													handleChangeStatus(report.id, "closed");
												}}
												title="Close Report"
												className="rounded-md bg-success text-xs px-3 py-1.5 font-medium text-white hover:opacity-90">
												<CheckCheck className="h-4 w-4" />
											</button>
											<button
												onClick={(e) => {
													e.stopPropagation();
													onSuspendLesson(report.id, "closed");
												}}
												title="Suspend Lesson"
												className="rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-white hover:opacity-90">
												<Ban className="h-4 w-4" />
											</button>
										</>
									)}
								</div>
							</div>
						</div>
					))
				)}
			</div>
			<SingleReportModal
				open={selectedReport !== null}
				report={selectedReport}
				onClose={() => setSelectedReport(null)}
				handleChangeStatus={handleChangeStatus}
				onSuspendLesson={onSuspendLesson}
			/>
		</div>
	);
}
