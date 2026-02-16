"use client";
import { useState } from "react";
import { BookOpen, MessageSquare, Menu, LogOut, Settings, Users, BarChart3, FileText } from "lucide-react";
import { SidebarOption } from "@/app/components/SidebarOption";
import { SidebarTitleSection } from "@/app/components/SidebarTitleSection";
import { SidebarToggle } from "@/app/components/SidebarToggle";
import { logout } from "@/app/api/api";
import { useRouter, usePathname } from "next/navigation";
import { useSiteState } from "@/app/store/SiteStore";

export interface SidebarProps {
  selected: string;
  setSelected: (selected: string) => void;
}

export const Sidebar = ({ selected, setSelected }: SidebarProps) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const user = useSiteState((s) => s.user);
  const clearUser = useSiteState((s) => s.clearUser);

  const handleOptionSelect = (title: string, route: string) => {
    setSelected(title);
    router.push(route);
    
    // Only close sidebar on mobile (< 768px)
    if (window.innerWidth < 768) {
      setOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      clearUser();
      router.push("/");
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
          { Icon: BarChart3, title: "View Alerts", route: "/admin/alerts" },
          { Icon: BookOpen, title: "Lesson Application", route: "/admin/lesson" },
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

        <div className="space-y-1 mb-8 flex-1">
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
