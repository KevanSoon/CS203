import { ChevronDown, GraduationCap } from "lucide-react";

export interface SidebarTitleSectionProps {
  open: boolean;
}

const Logo = () => {
  return (
    <div className="grid size-10 shrink-0 place-content-center rounded-lg bg-primary shadow-sm">
      <GraduationCap className="h-5 w-5 text-card" />
    </div>
  );
};

export const SidebarTitleSection = ({ open }: SidebarTitleSectionProps) => {
  return (
    <div className="mb-6 border-b border-border pb-4">
      <div className="flex cursor-pointer items-center justify-between rounded-md p-2 transition-colors hover:bg-border">
        <div className="flex items-center gap-3">
          <Logo />
          {open && (
            <div
              className={`transition-opacity duration-200 ${
                open ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="flex items-center gap-2">
                <div>
                  <span className="block text-sm font-semibold text-foreground">
                    Simi Slang?
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    Admin Portal
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        {open && <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </div>
    </div>
  );
};
