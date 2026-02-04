"use client";
import { useState } from "react";
import { Home, BookOpen, Settings, HelpCircle, MessageSquare } from "lucide-react";
import { SidebarOption } from "./SidebarOption";
import { SidebarTitleSection } from "./SidebarTitleSection";
import { SidebarToggle } from "./SidebarToggle";

export interface SidebarProps {
  selected: string;
  setSelected: (selected: string) => void;
}

export const Sidebar = ({ selected, setSelected }: SidebarProps) => {
  const [open, setOpen] = useState(true);

  return (
    <nav
      className={`sticky top-0 h-screen shrink-0 border-r transition-all duration-300 ease-in-out ${
        open ? "w-64" : "w-16"
      } border-border bg-card p-2 shadow-sm`}
    >
      <SidebarTitleSection open={open} />

      <div className="space-y-1 mb-8">
        <SidebarOption
          Icon={BookOpen}
          title="My Lessons"
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
        <SidebarOption
          Icon={MessageSquare}
          title="Feedbacks and Alerts"
          selected={selected}
          setSelected={setSelected}
          open={open}
          // notifs={3}
        />
      </div>
      <SidebarToggle open={open} setOpen={setOpen} />
    </nav>
  );
};
