import { ChevronsRight } from "lucide-react";

export interface SidebarToggleProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const SidebarToggle = ({ open, setOpen }: SidebarToggleProps) => {
  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full border-b border-border transition-colors hover:bg-border mb-2"
    >
      <div className="flex items-center p-3">
        <div className="grid size-10 place-content-center">
          <ChevronsRight
            className={`h-4 w-4 transition-transform duration-300 text-muted-foreground ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
        {open && (
          <span
            className={`text-sm font-medium text-muted-foreground transition-opacity duration-200 ${
              open ? "opacity-100" : "opacity-0"
            }`}
          >
            Hide
          </span>
        )}
      </div>
    </button>
  );
};