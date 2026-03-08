"use client";

import { useState } from "react";
import { X, Pencil } from "lucide-react";

import { Report, ReportType } from "@/app/webadmin/page";

interface ReportsModalProps {
	open: boolean;
	onClose: () => void;
	lessonTitle: string;
	reports: Report[];
	onSaveRemark?: (reportId: number, remark: string) => Promise<void> | void;
}

function severityBadgeClass(type: ReportType): string {
	if (type === "critical") return "bg-destructive text-white";
	if (type === "high") return "bg-warning text-white";
	if (type === "medium") return "bg-accent text-white";
	if (type === "low") return "bg-white text-foreground border border-border";
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

export function ReportsModal({ open, onClose, lessonTitle, reports, onSaveRemark }: ReportsModalProps) {
	const [editingReportId, setEditingReportId] = useState<number | null>(null);
	const [draftRemark, setDraftRemark] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [localRemarks, setLocalRemarks] = useState<Record<number, string>>({});

	function startEdit(report: Report) {
		setEditingReportId(report.id);
		setDraftRemark(localRemarks[report.id] ?? report.remarks ?? "");
	}

	function cancelEdit() {
		setEditingReportId(null);
		setDraftRemark("");
	}

	async function saveEdit(reportId: number) {
		const nextRemark = draftRemark.trim();
		setIsSaving(true);
		try {
			if (onSaveRemark) {
				await onSaveRemark(reportId, nextRemark);
			}
			setLocalRemarks((prev) => ({ ...prev, [reportId]: nextRemark }));
			cancelEdit();
		} finally {
			setIsSaving(false);
		}
	}

	if (!open) return null;

	const sortedReports = [...reports].sort((a, b) => {
		const severityDiff = severityRank[b.type as ReportType] - severityRank[a.type as ReportType];
		if (severityDiff !== 0) return severityDiff;
		return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
	});

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
			<div className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
				<div className="mb-4 flex items-center justify-between">
					<h4 className="text-lg font-semibold text-foreground">Reports for {lessonTitle}</h4>
					<button type="button" onClick={onClose} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-border/50 hover:text-foreground">
						<X className="h-4 w-4" />
					</button>
				</div>

				{sortedReports.length === 0 ? (
					<p className="text-sm text-muted-foreground">No reports found.</p>
				) : (
					<div className="max-h-[60vh] space-y-3 overflow-auto pr-1">
						{sortedReports.map((r, idx) => (
							<div key={r.id ?? idx} className="rounded-md border border-border px-3 py-3 shadow-sm">
								<div className="w-full">
									<div className="flex w-full items-start justify-between gap-3">
										<div className="min-w-0 flex-1">
											<span className="text-sm font-semibold text-foreground">{r.title}</span>{" "}
											<span className={`rounded-full px-2.5 py-1 text-xs font-medium ${severityBadgeClass(r.type as ReportType)}`}>{toSentenceCase(r.type)}</span>
										</div>

										<button type="button" onClick={() => startEdit(r)} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors" aria-label={`Edit remark for report ${r.id}`}>
											<Pencil className="h-4 w-4" />
										</button>
									</div>

									<div className="flex flex-wrap items-center gap-2">
										<span className="text-xs text-muted-foreground">{r.chapterTitle ? `${r.chapterTitle}` : ""}</span>
									</div>
									<p className="mt-1 text-sm text-muted-foreground">{r.description}</p>
									{editingReportId === r.id ? (
										<div className="mt-2 space-y-2">
											<textarea
												value={draftRemark}
												onChange={(e) => setDraftRemark(e.target.value)}
												placeholder="Type update/remark..."
												className="w-full rounded-md border border-border bg-background p-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
												rows={3}
											/>
											<div className="flex items-center gap-2">
												<button
													type="button"
													onClick={() => saveEdit(r.id)}
													disabled={isSaving}
													className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
												>
													{isSaving ? "Saving..." : "Save"}
												</button>
												<button
													type="button"
													onClick={cancelEdit}
													disabled={isSaving}
													className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-border/50 disabled:opacity-50"
												>
													Cancel
												</button>
											</div>
										</div>
									) : (localRemarks[r.id] ?? r.remarks) ? (
										<p className="mt-2 text-sm text-muted-foreground">{localRemarks[r.id] ?? r.remarks}</p>
									) : null}
									<p className="mt-2 text-xs text-muted-foreground">
										Reported By: {r.reportedBy} · {new Date(r.createdAt).toLocaleString()}
									</p>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
