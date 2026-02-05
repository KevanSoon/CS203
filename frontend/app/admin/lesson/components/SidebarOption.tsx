import { type LucideIcon } from "lucide-react";

export interface SidebarOptionProps {
  Icon: LucideIcon;
  title: string;
  selected: string;
  setSelected: (title: string) => void;
  open: boolean;
  notifs?: number;
  onSelect?: () => void;
}

export const SidebarOption = ({
  Icon,
  title,
  selected,
  setSelected,
  open,
  notifs,
  onSelect,
}: SidebarOptionProps) => {
  const isSelected = selected === title;

  const handleClick = () => {
    setSelected(title);
    onSelect?.();
  };

  return (
    <button
      onClick={handleClick}
      className={`relative flex h-11 w-full items-center rounded-md transition-all duration-200 ${
        isSelected
          ? "bg-primary/10 text-primary shadow-sm border-l-2 border-primary"
          : "text-muted-foreground hover:bg-border hover:text-foreground"
      }`}
    >
      <div className="grid h-full w-12 place-content-center">
        <Icon className="h-4 w-4" />
      </div>

      {open && (
        <span
          className={`text-sm font-medium transition-opacity duration-200 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        >
          {title}
        </span>
      )}

      {notifs && open && (
        <span className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-card font-medium">
          {notifs}
        </span>
      )}
    </button>
  );
};
