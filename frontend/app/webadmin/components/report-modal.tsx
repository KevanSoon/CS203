"use client";

import { X } from "lucide-react";
import { Report, ReportStatus, ReportType } from "@/app/webadmin/page";

interface SingleReportModalProps {
	open: boolean;
	onClose: () => void;
	report: Report | null;
	handleChangeStatus: (id: number, status: ReportStatus) => void;
	onSuspendLesson: (id: number, status: ReportStatus) => void;
}

function severityTextClass(type: ReportType): string {
	if (type === "critical") return "text-destructive";
	if (type === "high") return "text-warning";
	if (type === "medium") return "text-accent";
	if (type === "low") return "text-foreground";
	return "text-muted-foreground";
}

function toSentenceCase(value: string): string {
	return value.charAt(0).toUpperCase() + value.slice(1);
}

export function SingleReportModal({ open, onClose, report, handleChangeStatus, onSuspendLesson }: SingleReportModalProps) {
	if (!open || !report) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
			<div className="w-full max-w-2xl rounded-xl border border-border bg-card p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
				<div className="flex items-center justify-between">
					<h4 className="text-lg font-semibold text-foreground">
						Report {report.id}. {report.title}
					</h4>
					<button type="button" onClick={onClose} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-border/50 hover:text-foreground">
						<X className="h-4 w-4" />
					</button>
				</div>

				<div className="space-y-2">
					<p className="text-sm font-bold">
						Severity: <span className={`text-sm ${severityTextClass(report.type)}`}>{toSentenceCase(report.type)}</span>
					</p>

					<p className="mb-0 text-sm text-muted-foreground">Lesson Reported: {report.lessonTitle}</p>
					<p className="text-sm text-muted-foreground">Chapter Specified: {report.chapterTitle ? `${report.chapterTitle}` : "None "}</p>

					<p className="mb-0 text-md font-semibold text-foreground">Report Details</p>
					<p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.description}</p>

					{report.status === "unresolved" || report.status === "closed" ? (
						<>
							<p className="text-md font-semibold text-foreground">Lesson Admin Remarks</p>
							<div className="rounded-md border border-border bg-background p-3 min-h-24 flex flex-col">
								{report.remarks ? (
									<>
										<p className="mt-1 text-sm text-black whitespace-pre-wrap">{report.remarks}</p>
										<p className="mt-auto pt-2 text-xs text-muted-foreground whitespace-pre-wrap">{new Date(report.updatedAt).toLocaleString()}</p>
									</>
								) : (
									<p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">No update from Lesson Admin yet</p>
								)}
							</div>
						</>
					) : (
						<></>
					)}

					<div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
						<p className="text-xs text-muted-foreground">
							Reported By: {report.reportedBy} · {new Date(report.createdAt).toLocaleString()}
						</p>

						<div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">
							{report.status !== "closed" ? (
								<>
									<button
										title="Redirect Report"
										onClick={async () => {
											try {
												await Promise.resolve(handleChangeStatus(report.id, "unresolved"));
											} finally {
												onClose();
											}
										}}
										className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:opacity-90">
										Redirect
									</button>
									<button
										title="Close report"
										onClick={async () => {
											try {
												await Promise.resolve(handleChangeStatus(report.id, "closed"));
											} finally {
												onClose();
											}
										}}
										className="rounded-md bg-success px-3 py-1.5 text-xs font-medium text-white hover:opacity-90">
										Close
									</button>
									<button
										title="Suspend lesson"
										onClick={async () => {
											try {
												await Promise.resolve(onSuspendLesson(report.id, "closed"));
											} finally {
												onClose();
											}
										}}
										className="rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-white hover:opacity-90">
										Suspend
									</button>
								</>
							) : (
								<p className="text-xs text-muted-foreground">Closed on {new Date(report.updatedAt).toLocaleString()}</p>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
