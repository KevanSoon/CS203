"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/app/components/Sidebar";
import { api } from "@/app/api/api";

import { CartoonButton } from "@/app/components/CartoonButton";
import { MyLessonsCard } from "./components/MyLessonsCard";
import { FeedbacksCard } from "./components/FeedbacksCard";

type ReportStatus = "reported" | "unresolved" | "closed";
type ReportType = "critical" | "high" | "medium" | "low";
export interface Report {
	id: number;
	title: string;
	description: string;
	status: ReportStatus;
	type: ReportType;
	reportedBy: string;
	lessonTitle: string;
	chapterTitle?: string | null;
	remarks?: string | null;
	createdAt: string;
	updatedAt: string;
	lastUpdate: string | null;
}

export interface Lesson {
	id: number;
	createdAt: string;
	title: string;
	description: string;
	tags?: string[] | string | null;
	status?: string | null;
	reports?: Array<Object>;
	deletedAt?: string | null;
}

export interface LessonContentProps {
	selected: string;
	lessons: Lesson[];
}

export const AdminLessonPage = () => {
	const router = useRouter();
	const [selected, setSelected] = useState("Manage Lessons");
	const [lessons, setLessons] = useState([]);
	const [reports, setReports] = useState([]);
	const [applications, setApplications] = useState([]);

	useEffect(() => {
		const fetchLessons = async () => {
			try {
				//calls route.ts
				const lessonResult = await api.get("/api/lesson/user-lessons/");
				const applicationsResult = await api.get("/api/lesson/user-applications/");
				const reportResult = await api.get("/api/report/admin/");

				const reportsByLesson = (reportResult.data ?? []).reduce((acc: Record<string, Report[]>, report: Report) => {
					const key = report.lessonTitle;
					if (!acc[key]) acc[key] = [];
					acc[key].push(report);
					return acc;
				}, {});

				const lessonsWithReports = (lessonResult.data ?? []).map((lesson: Lesson) => ({
					...lesson,
					reports: reportsByLesson[lesson.title] ?? [],
				}));
				lessonsWithReports.sort((a:Lesson, b:Lesson) => {
					// Deleted lessons at the bottom
					if (!!a.deletedAt !== !!b.deletedAt) {
						return a.deletedAt ? 1 : -1;
					}
					// If both are deleted or both are not, sort by id if present
					if (a.id && b.id) {
						return a.id - b.id;
					}
					return 0;
				});
				setLessons(lessonsWithReports);
				setApplications(applicationsResult.data);
				setReports(reportResult.data);
			} catch (err) {
				console.error("Failed to fetch lessons", err);
			}
		};
		fetchLessons();
	}, []);

	return (
		<div className="flex min-h-screen w-full">
			<div className="flex w-full bg-background text-foreground">
				<Sidebar selected={selected} setSelected={setSelected} />
				<div className="flex-1 bg-background p-6 overflow-auto">
					{/* Header */}
					<div className="flex flex-col items-start gap-4 mb-8 md:flex-row md:items-center md:justify-between">
						<div>
							<h1 className="text-3xl font-bold text-foreground">Lesson Management</h1>
							<p className="text-muted-foreground mt-1">Manage and organize your lessons</p>
						</div>
						<CartoonButton label="+ Create Lesson" onClick={() => router.push("/admin/create")} />
					</div>


					{/* Content Grid */}
					<div>
						{selected === "Manage Lessons" ? (
							<>
								<MyLessonsCard title="My Lessons" data={lessons} /> <MyLessonsCard title="Applications" data={applications} />
							</>
						) : selected === "View Alerts" ? (
							<FeedbacksCard />
						) : null}
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminLessonPage;
