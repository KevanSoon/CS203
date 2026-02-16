"use client";
import { useEffect, useState } from "react";
import { Sidebar } from "@/app/components/Sidebar";
import { LessonContent } from "./components/LessonContent";
import { api } from "@/app/api/api";

export const AdminLessonPage = () => {
  const [selected, setSelected] = useState("Manage Lessons");
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        //calls route.ts
        const result = await api.get("/api/lesson/user-lessons/");
        console.log(result.data)
        setLessons(result.data);
      }
      catch (err) {
        console.error("Failed to fetch lessons", err)
      }
    };
    fetchLessons();
  }, [])



  return (
    <div className="flex min-h-screen w-full">
      <div className="flex w-full bg-background text-foreground">
        <Sidebar selected={selected} setSelected={setSelected} />
        <LessonContent selected={selected} lessons={lessons} />
      </div>
    </div>
  );
};

export default AdminLessonPage;
