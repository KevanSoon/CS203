"use client";


import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { getVisibleTags } from "@/app/utils/tags";


type LessonCardProps = {
 image: string;
 title: string;
 description: string;
 progress: number;
 lessonId: number;
 tags?: string[];
 status?: "in_progress" | "completed" | "not_started";
};


type RatingData = {
 lessonId: number;
 averageRating: number;
 ratingCount: number;
 hasReviewed: boolean;
};


export default function LessonCard({
 image,
 title,
 description,
 progress,
 lessonId,
 tags = [],
 status,
}: LessonCardProps) {
 const router = useRouter();
 const [showModal, setShowModal] = useState(false);
 const [ratingData, setRatingData] = useState<RatingData | null>(null);
 const [hoveredStar, setHoveredStar] = useState(0);
 const [submitting, setSubmitting] = useState(false);
 const [submitError, setSubmitError] = useState("");


 // Fetch rating on mount
 useEffect(() => {
   const fetchRating = async () => {
     try {
       const res = await fetch(`/api/lesson/${lessonId}/rating`);
       if (res.ok) {
         const data = await res.json();
         setRatingData(data);
       }
     } catch (err) {
       console.error("Failed to fetch rating", err);
     }
   };
   fetchRating();
 }, [lessonId]);


 const handleSubmitReview = async (star: number) => {
   if (submitting || ratingData?.hasReviewed) return;
   setSubmitting(true);
   setSubmitError("");


   try {
     const res = await fetch(`/api/lesson/${lessonId}/review`, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ rating: star }),
     });


     if (res.ok) {
       // Refresh rating after submitting
       const updated = await fetch(`/api/lesson/${lessonId}/rating`);
       if (updated.ok) setRatingData(await updated.json());
     } else {
       setSubmitError("Could not submit review. Try again.");
     }
   } catch {
     setSubmitError("Something went wrong.");
   } finally {
     setSubmitting(false);
   }
 };


 function getRatingStars(rating: number) {
   const safeRating = Math.max(0, Math.min(5, Math.round(rating)));
   return "★".repeat(safeRating) + "☆".repeat(5 - safeRating);
 }


 const handleCardClick = () => {
   router.push(`/lesson/${encodeURIComponent(title)}`);
 };


 const openModal = () => setShowModal(true);
 const closeModal = () => setShowModal(false);


 useEffect(() => {
   const handleEsc = (e: KeyboardEvent) => {
     if (e.key === "Escape") closeModal();
   };
   if (showModal) window.addEventListener("keydown", handleEsc);
   return () => window.removeEventListener("keydown", handleEsc);
 }, [showModal]);


 return (
   <>
     <div
       onClick={handleCardClick}
       className="
         group bg-card border border-border rounded-2xl overflow-hidden
         shadow-sm transition-all duration-300 cursor-pointer
         md:hover:shadow-xl md:hover:-translate-y-1
       "
     >
       <div className="overflow-hidden">
         <img
           src={image}
           alt={title}
           className="
             w-full object-cover h-44 sm:h-52
             transition-transform duration-500
             md:group-hover:scale-105
           "
         />
       </div>


       <div className="p-3 sm:p-4 space-y-3 flex flex-col">
         <div>
           <h3 className="text-sm sm:text-base font-bold leading-snug line-clamp-2">
             {title}
           </h3>
           <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
             {description}
           </p>
           {description.length > 200 && (
             <button
               onClick={(e) => { e.stopPropagation(); openModal(); }}
               className="mt-1 text-xs sm:text-sm text-primary font-semibold hover:underline cursor-pointer"
             >
               See full description
             </button>
           )}
         </div>


         {tags.length > 0 && (() => {
           const { visible, remaining } = getVisibleTags(tags);
           return (
             <div className="flex flex-wrap gap-1 mt-2 overflow-hidden max-h-[72px]">
               {visible.map((tag) => (
                 <span
                   key={tag}
                   className="text-xs px-2.5 py-1 rounded-full bg-primary/15 text-primary font-semibold whitespace-nowrap border border-primary/20"
                 >
                   {tag}
                 </span>
               ))}
               {remaining > 0 && (
                 <button
                   onClick={(e) => { e.stopPropagation(); openModal(); }}
                   className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
                 >
                   +{remaining}
                 </button>
               )}
             </div>
           );
         })()}


         <div className="space-y-2 mt-auto">
           {status && (
             <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${
               status === "completed"
                 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                 : status === "in_progress"
                 ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                 : "bg-muted text-muted-foreground"
             }`}>
               {status === "completed" ? "Completed" : status === "in_progress" ? "In Progress" : "Not Started"}
             </span>
           )}
           <div className="flex justify-between text-[11px] sm:text-xs font-semibold text-muted-foreground">
             <span>Completion</span>
             <span>{progress}%</span>
           </div>
           <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
             <div
               className="h-full bg-primary transition-all duration-700 ease-out"
               style={{ width: `${progress}%` }}
             />
           </div>


          <div className="text-sm sm:text-base text-muted-foreground">
            {ratingData ? (
              ratingData.ratingCount === 0 ? (
                <span className="flex items-center gap-1.5">
                  <span className="text-yellow-500 text-lg sm:text-xl tracking-wide">
                    {getRatingStars(0)}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground italic">Unrated</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span className="text-yellow-500 text-lg sm:text-xl tracking-wide">
                    {getRatingStars(ratingData.averageRating)}
                  </span>
                  <span className="font-semibold text-foreground">
                    {ratingData.averageRating.toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({ratingData.ratingCount})
                  </span>
                </span>
              )
            ) : (
              <span className="text-xs">Loading rating...</span>
            )}
          </div>

           {submitError && (
             <p className="text-[11px] text-red-500">{submitError}</p>
           )}
         </div>
       </div>
     </div>


     {showModal && (
       <div
         className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center"
         onClick={closeModal}
       >
         <div
           onClick={(e) => e.stopPropagation()}
           className="bg-card w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 shadow-xl animate-scaleIn relative"
         >
           <button
             onClick={closeModal}
             className="absolute top-3 right-3 p-2 rounded-md hover:bg-muted"
             aria-label="Close"
           >
             <X size={18} />
           </button>
           <h3 className="text-lg sm:text-xl font-bold mb-3">{title}</h3>
           <p className="text-sm text-muted-foreground leading-relaxed">
             {description}
           </p>
           {tags.length > 0 && (
             <div className="flex flex-wrap gap-1.5 mt-3">
               {tags.map((tag) => (
                 <span
                   key={tag}
                   className="text-xs px-2.5 py-1 rounded-full bg-primary/15 text-primary font-semibold border border-primary/20 whitespace-nowrap"
                 >
                   {tag}
                 </span>
               ))}
             </div>
           )}
         </div>
       </div>
     )}
   </>
 );
}
