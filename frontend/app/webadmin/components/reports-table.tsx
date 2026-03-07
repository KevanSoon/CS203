"use client";

import { useMemo, useState } from "react";
import { Report } from "../page";

type ReportStatus = "reported" | "unresolved" | "closed";
type ReportType = "critical" | "high" | "medium" | "low";
type FilterValue = "all" | ReportStatus;

interface ReportsTableProps {
	reports: Report[];
	onCloseReport: (id: number) => void;
	onMarkRedirect: (id: number) => void;
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

export function ReportsTable({ reports, onCloseReport, onMarkRedirect }: ReportsTableProps) {
	const [filter, setFilter] = useState<FilterValue>("reported");

    const filteredReports = useMemo(() => {
    const base = filter === "all" ? reports : reports.filter((r) => r.status === filter);

    return [...base].sort((a, b) => {
        const severityDiff = severityRank[b.type] - severityRank[a.type];
        if (severityDiff !== 0) return severityDiff;

        // tie-breaker: newest first
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    }, [reports, filter]);

	const counts = {
		all: reports.length,
		reported: reports.filter((r) => r.status === "reported").length,
		unresolved: reports.filter((r) => r.status === "unresolved").length,
		closed: reports.filter((r) => r.status === "closed").length,
	};

	return (
		<div className="w-full rounded-lg border border-border bg-card">
			<div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
				<h2 className="text-lg font-semibold text-foreground">User Reports</h2>
				<div className="flex items-center gap-1 rounded-lg border border-border bg-background p-1">
					{(["all", "reported", "unresolved", "closed"] as const).map((tab) => (
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
						<p className="mt-1 text-sm text-muted-foreground">{filter !== "all" ? `No ${filter} reports right now` : "No reports submitted yet"}</p>
					</div>
				) : (
					filteredReports.map((report) => (
						<div key={report.id} className="rounded-md border border-border px-3 py-3 shadow-sm transition-all hover:shadow-md">
							<div className="flex items-start justify-between gap-3">
								<div className="min-w-0">
									<span className="text-sm font-semibold text-foreground">{report.title}</span>
									{filter === "all" ? <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(report.status)}`}>{toSentenceCase(report.status)}</span> : <></>}
									<div className="mt-2 flex flex-wrap items-center gap-2">
										<span className={`rounded-full px-2.5 py-1 text-xs font-medium ${severityBadgeClass(report.type)}`}>{toSentenceCase(report.type)}</span>
										<span className="text-xs text-muted-foreground">
											Lesson: {report.lessonTitle}
											{report.chapterTitle ? ` · ${report.chapterTitle}` : ""}
										</span>
									</div>
									<p className="mt-2 text-sm text-muted-foreground">{report.description}</p>
									<p className="mt-2 text-xs text-muted-foreground">
										Reported By: {report.reportedBy} · {new Date(report.createdAt).toLocaleString()}
									</p>
								</div>

								<div className="flex shrink-0 items-center gap-2">
									{report.status !== "closed" && (
										<button onClick={() => onCloseReport(report.id)} className="rounded-md bg-success px-3 py-1.5 text-xs font-medium text-white hover:opacity-90">
											Close
										</button>
									)}
									{report.status !== "unresolved" && (
										<button onClick={() => onMarkRedirect(report.id)} className="rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-white hover:opacity-90">
											Redirect
										</button>
									)}
								</div>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
}
