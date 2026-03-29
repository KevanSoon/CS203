"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/app/api/api";
import { Sidebar } from "@/app/components/Sidebar";

export default function ProfileRedirect() {
  const router = useRouter();
  const [selected, setSelected] = useState("Profile");

  useEffect(() => {
    api.get("/api/profile").then((res) => {
      router.replace(`/profile/${res.data.id}`);
    });
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar selected={selected} setSelected={setSelected} />
    </div>
  );
}