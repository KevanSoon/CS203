"use client";
import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { LessonContent } from "./components/LessonContent";

export const AdminLessonPage = () => {
  const [selected, setSelected] = useState("My Lessons");

  return (
    <div className="flex min-h-screen w-full">
      <div className="flex w-full bg-background text-foreground">
        <Sidebar selected={selected} setSelected={setSelected} />
        <LessonContent selected={selected} />
      </div>
    </div>
  );
};

export default AdminLessonPage;
