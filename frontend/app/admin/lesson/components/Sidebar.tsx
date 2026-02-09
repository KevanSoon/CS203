"use client";
import { useState } from "react";
import { BookOpen, MessageSquare, Menu, LogOut } from "lucide-react";
import { SidebarOption } from "./SidebarOption";
import { SidebarTitleSection } from "./SidebarTitleSection";
import { SidebarToggle } from "./SidebarToggle";
import { logout } from "@/app/api/api";
import { useRouter } from "next/navigation";
import { useSiteState } from "@/app/store/SiteStore";

export interface SidebarProps {
  selected: string;
  setSelected: (selected: string) => void;
}

export const Sidebar = ({ selected, setSelected }: SidebarProps) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const user = useSiteState((s) => s.user);

  const handleOptionSelect = () => {
    // Only close sidebar on mobile (< 768px)
    if (window.innerWidth < 768) {
      setOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      {/* Mobile menu button - always visible on mobile when sidebar is closed */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed top-4 right-4 z-50 p-2 rounded-lg bg-card border border-border shadow-md md:hidden"
        >
          <Menu className="h-5 w-5 text-foreground" />
        </button>
      )}

      {/* Backdrop overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <nav
        className={`
          fixed md:sticky top-0 left-0 h-screen z-50 shrink-0 border-r transition-all duration-300 ease-in-out
          border-border bg-card p-2 shadow-sm
          ${open ? "w-64" : "w-16"}
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <SidebarTitleSection open={open} />

        <div className="space-y-1 mb-8">
          <SidebarOption
            Icon={BookOpen}
            title="My Lessons"
            selected={selected}
            setSelected={setSelected}
            open={open}
            onSelect={handleOptionSelect}
          />
          <SidebarOption
            Icon={MessageSquare}
            title="Feedbacks and Alerts"
            selected={selected}
            setSelected={setSelected}
            open={open}
            onSelect={handleOptionSelect}
          />
        </div>
        
        {/* Logout button at the bottom - only show if user is logged in */}
        {user && (
          <div className="absolute bottom-16 left-0 right-0 px-2">
            <button
              onClick={handleLogout}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                hover:bg-accent text-muted-foreground hover:text-foreground
                ${!open && "justify-center"}
              `}
              title="Logout"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {open && <span className="font-medium">Logout</span>}
            </button>
          </div>
        )}

        <SidebarToggle open={open} setOpen={setOpen} />
      </nav>
    </>
  );
};
