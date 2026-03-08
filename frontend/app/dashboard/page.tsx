"use client";


import { useEffect, useMemo, useState } from "react";
import LessonCard from "@/app/dashboard/components/LessonCard";
import { Sidebar } from "@/app/components/Sidebar";
import { api } from "@/app/api/api";
import TagFilterSearch from "@/app/components/TagFilterSearch";


interface Lesson {
 id: number;        // ADD THIS
 title: string;
 description: string;
 createdBy: string;
 createdAt: string;
 tags?: string;
 lessonPictureUrl?: string;
}


function parseTags(tags?: string): string[] {
 if (!tags) return [];
 return tags
   .split(",")
   .map((t) => t.trim())
   .filter(Boolean);
}


function normalize(s: string) {
 return s.trim().toLowerCase();
}


export default function DashboardPage() {
 const [selected, setSelected] = useState("View Lessons");
 const [lessons, setLessons] = useState<Lesson[]>([]);
 const [error, setError] = useState<string | null>(null);
 const [query, setQuery] = useState("");
 const [selectedTags, setSelectedTags] = useState<string[]>([]);


 useEffect(() => {
   const fetchLessons = async () => {
     try {
       const { data } = await api.get<Lesson[]>("/api/lesson/");
       console.log("Lessons from API:", data);
       setLessons(data);
     } catch (err: any) {
       console.error(err);
       setError("Failed to load lessons.");
     }
   };


   fetchLessons();
 }, []);


 const addTag = (tag: string) => {
   const cleaned = tag.trim();
   if (!cleaned) return;
   const exists = selectedTags.some((t) => normalize(t) === normalize(cleaned));
   if (exists) return;
   setSelectedTags((prev) => [...prev, cleaned]);
 };


 const removeTag = (tag: string) => {
   setSelectedTags((prev) => prev.filter((t) => t !== tag));
 };


 const clearAll = () => setSelectedTags([]);


 const filteredLessons = useMemo(() => {
   if (selectedTags.length === 0) return lessons;
   const selectedNorm = selectedTags.map(normalize);
   return lessons.filter((lesson) => {
     const lessonTags = parseTags(lesson.tags).map(normalize);
     return selectedNorm.every((sel) => lessonTags.includes(sel));
   });
 }, [lessons, selectedTags]);


 const isFiltering = selectedTags.length > 0;


 return (
   <div className="flex w-full bg-background text-foreground">
     <Sidebar selected={selected} setSelected={setSelected} />


     <div className="flex-1 px-6 py-12">
       <h1 className="text-3xl md:text-4xl font-black mb-2">
         Your Daily Grind 🔥
       </h1>
       <p className="text-sm text-muted-foreground mb-6">
         Enrolled & Available Courses
       </p>


       <TagFilterSearch
         query={query}
         setQuery={setQuery}
         selectedTags={selectedTags}
         addTag={addTag}
         removeTag={removeTag}
         clearAll={clearAll}
       />


       {error && <p className="text-red-500 mt-6">{error}</p>}


       {!error && isFiltering && filteredLessons.length === 0 && (
         <p className="text-muted-foreground mt-6">
           No lessons found for this tag
         </p>
       )}


       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
         {filteredLessons.map((lesson, i) => (
           <LessonCard
             key={`${lesson.title}-${i}`}
             lessonId={lesson.id}        // ADD THIS
             title={lesson.title}
             description={lesson.description}
            image={lesson.lessonPictureUrl || `/images/questionmark.jpg`}
            progress={0}
             tags={parseTags(lesson.tags)}
           />
         ))}
       </div>


       {lessons.length === 0 && !error && (
         <p className="text-muted-foreground mt-6">
           No courses available yet.
         </p>
       )}
     </div>
   </div>
 );
}

