"use client";
import { useState, useEffect } from "react";
import { BookOpen, MessageSquare, Menu, LogOut, Settings, Users, BarChart3, FileText, BookMarked } from "lucide-react";
import { SidebarOption } from "@/app/components/SidebarOption";
import { SidebarTitleSection } from "@/app/components/SidebarTitleSection";
import { SidebarToggle } from "@/app/components/SidebarToggle";
import { logout } from "@/app/api/api";
import { useRouter, usePathname } from "next/navigation";
import { useSiteState } from "@/app/store/SiteStore";

export interface ChapterItem {
  id: number;
  title: string;
}

export interface SidebarProps {
  selected: string;
  setSelected: (selected: string) => void;
  defaultOpen?: boolean;
  chapters?: ChapterItem[];
  selectedChapter?: number;
  onChapterSelect?: (index: number) => void;
}

export const Sidebar = ({ selected, setSelected, defaultOpen = false, chapters, selectedChapter, onChapterSelect }: SidebarProps) => {
  const [open, setOpen] = useState(defaultOpen);
  useEffect(() => { setOpen(defaultOpen); }, [defaultOpen]);
  const router = useRouter();
  const pathname = usePathname();
  const user = useSiteState((s) => s.user);
  const clearUser = useSiteState((s) => s.clearUser);

  const handleOptionSelect = (title: string, route: string) => {
    setSelected(title);

    // Only navigate if we're not already on the target route
    if (pathname !== route) {
      router.push(route);
    }

    // Only close sidebar on mobile (< 768px)
    if (window.innerWidth < 768) {
      setOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      clearUser();
      window.location.href = "/"
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Define menu options based on user type
  const getMenuOptions = () => {
    if (!user) return [];

    switch (user.usertype) {
      case 'admin':
        return [
          { Icon: FileText, title: "Manage Lessons", route: "/admin" },
          { Icon: BarChart3, title: "View Alerts", route: "/admin" },
          { Icon: BookOpen, title: "Lesson Application", route: "/admin" },
        ];
      case 'root':
        return [
          { Icon: FileText, title: "Manage Applications", route: "/webadmin" },
          { Icon: BarChart3, title: "Manage Reports", route: "/webadmin/reports" },
        ];
      
      case 'user':
      default:
        return [
          { Icon: MessageSquare, title: "View Lessons", route: "/dashboard/" },
        ];
    }
  };

  const menuOptions = getMenuOptions();

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
          flex flex-col
        `}
      >
        <SidebarToggle open={open} setOpen={setOpen} />
        <SidebarTitleSection open={open} user={user}  selected={selected}/>

        <div className="space-y-1 flex-1">
          {menuOptions.map((option) => (
            <SidebarOption
              key={option.title}
              Icon={option.Icon}
              title={option.title}
              selected={selected}
              setSelected={setSelected}
              open={open}
              onSelect={() => handleOptionSelect(option.title, option.route)}
            />
          ))}

          {/* Chapter options */}
          {chapters && chapters.length > 0 && (
            <>
              {open && (
                <p className="px-3 pt-4 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Chapters
                </p>
              )}
              {!open && <hr className="my-2 border-border" />}
              {chapters.map((chapter, index) => (
                <button
                  key={chapter.id}
                  onClick={() => {
                    onChapterSelect?.(index);
                    if (window.innerWidth < 768) setOpen(false);
                  }}
                  className={`relative flex h-11 w-full items-center rounded-md transition-all duration-200 ${
                    selectedChapter === index
                      ? "bg-primary/10 text-primary shadow-sm border-l-2 border-primary"
                      : "text-muted-foreground hover:bg-border hover:text-foreground"
                  }`}
                >
                  <div className="grid h-full w-12 place-content-center">
                    <BookMarked className="h-4 w-4" />
                  </div>
                  {open && (
                    <span className="text-sm font-medium truncate pr-2">
                      {chapter.title}
                    </span>
                  )}
                </button>
              ))}
            </>
          )}
        </div>
        
        {/* Logout button at the bottom - only show if user is logged in */}
        {/* for now no check for user login, but userstore logic still above */}
        <div className="mt-auto pb-2">
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
              hover:bg-border text-muted-foreground hover:text-foreground
              ${!open && "justify-center"}
            `}
            title="Logout"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {open && <span className="font-medium">Logout</span>}
          </button>
        </div>

        
      </nav>
    </>
  );
};
