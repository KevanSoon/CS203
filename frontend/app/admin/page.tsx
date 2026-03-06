"use client";
import { useEffect, useState } from "react";
import { Sidebar } from "@/app/components/Sidebar";
import { api } from "@/app/api/api";

import { CartoonButton } from "@/app/components/CartoonButton";
import { StatsGrid } from "./components/StatsGrid";
import { MyLessonsCard } from "./components/MyLessonsCard";
import { FeedbacksCard } from "./components/FeedbacksCard";

export interface Lesson {
	createdAt: string;
	title: string;
	description: string;
	tags?: string[] | string | null;
  status?: string | null;
}

export interface LessonContentProps {
	selected: string;
	lessons: Lesson[];
}

export const AdminLessonPage = () => {
	const [selected, setSelected] = useState("Manage Lessons");
	const [lessons, setLessons] = useState([]);
	const [applications, setApplications] = useState([]);


	useEffect(() => {
		const fetchLessons = async () => {
			try {
				//calls route.ts
				const lessonResult = await api.get("/api/lesson/user-lessons/");
				const applicationsResult = await api.get("/api/lesson/user-applications/");

				setLessons(lessonResult.data);
				setApplications(applicationsResult.data);

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
						<CartoonButton label="+ Create Lesson" />
					</div>

					<StatsGrid />

					{/* Content Grid */}
					<div>{selected === "Manage Lessons" ? <><MyLessonsCard title="My Lessons" data={lessons} /> <MyLessonsCard title="Applications" data={applications} /></> : selected === "View Alerts" ? <FeedbacksCard /> : null}</div>
				</div>
			</div>
		</div>
	);
};

export default AdminLessonPage;
