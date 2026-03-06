import { useState, useMemo } from "react";
import { BookOpen, Pencil, Trash2, ChevronDown } from "lucide-react";
import { Lesson } from "@/app/admin/page";
import { parseTags, getVisibleTags } from "@/app/utils/tags";

type FilterValue = "pending" | "rejected";
interface MyLessonsCardProps {
	title: string;
	data: Lesson[];
}
export const MyLessonsCard = ({ title, data }: MyLessonsCardProps) => {
	const [isOpen, setIsOpen] = useState(true);
	const [appFilter, setAppFilter] = useState<FilterValue>("pending");

	function renderPendingTag(status: string) {
		const isPending = status.toLowerCase() === "pending";
		return (
			<span className={`ml-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${isPending ? "bg-warning-light text-warning-dark" : "bg-destructive-light text-destructive-dark"}`}>
				<span className={`h-1.5 w-1.5 rounded-full ${isPending ? "bg-warning" : "bg-destructive"}`} />
				{isPending ? "Pending" : "Rejected"}
			</span>
		);
	}
	const displayData = useMemo(() => {
		if (title !== "Applications") return data;
		return data.filter((l) => (l.status ?? "").toLowerCase() === appFilter);
	}, [title, data, appFilter]);

	return (
		<div className="rounded-xl border border-border bg-card p-6 shadow-sm my-3">
			<button type="button" onClick={() => setIsOpen((prev) => !prev)} className="w-full flex items-center justify-between mb-6 text-left">
				<h3 className="text-lg font-semibold text-foreground">{title}</h3>
				<ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ease-in-out ${isOpen ? "rotate-180" : ""}`} />
			</button>
			{title === "Applications" && (
				<div className="mb-4 flex items-center gap-1 rounded-lg border border-border bg-background p-1 w-fit">
					{(["pending", "rejected"] as const).map((value) => (
						<button key={value} type="button" onClick={() => setAppFilter(value)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${appFilter === value ? (value === "pending" ? "bg-warning text-white" : "bg-destructive text-white") : "text-muted-foreground hover:text-foreground"}`}>
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
							return (
								<div key={i} className="p-4 rounded-lg border border-border hover:bg-border/50 transition-colors cursor-pointer">
									<div className="flex items-start gap-3">
										<div className="hidden sm:block p-3 rounded-lg bg-primary/10 shrink-0">
											<BookOpen className="h-5 w-5 text-primary" />
										</div>
										<div className="flex-1 min-w-0">
											<div className="flex items-start justify-between gap-2">
												<div className="flex-1">
													<p className="text-sm font-semibold text-foreground mb-1">
														{record.title} {title === "Applications" ? renderPendingTag(record.status ?? "") : ""}
													</p>
												</div>
												{record.status === "pending" ? (
													<div className="flex items-center gap-1 shrink-0">
														<button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
															<Pencil className="h-4 w-4" />
														</button>
														<button className="p-2 text-muted-foreground hover:text-destructive transition-colors">
															<Trash2 className="h-4 w-4" />
														</button>
													</div>
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
													{remaining > 0 && <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20">+{remaining}</span>}
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
		</div>
	);
};
