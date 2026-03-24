import { User } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export interface SidebarTitleSectionProps {
  open: boolean;
  user: {
    username: string;
    email: string;
    usertype: string;
    profilePictureUrl?: string;
  } | null;
  selected?: string;
}

const getUserTypeLabel = (usertype: string) => {
  switch (usertype) {
    case 'admin':
      return 'Creator';
    case 'root':
      return 'Admin';
    case 'user':
    default:
      return 'Learner';
  }
};

export const SidebarTitleSection = ({ open, user, selected}: SidebarTitleSectionProps) => {
  const router = useRouter();

  const handleClick = () => {
    router.push('/profile');
  };

  // check if profile is selected
  const isSelected = selected === "Profile";

  if (!user) {
    return (
      <div className="mb-6 border-b border-border pb-4">
        <div className={`flex cursor-pointer items-center rounded-md p-2 transition-colors hover:bg-border ${!open && 'justify-center'}`}>
          {/* Avatar */}
          <div className={`flex items-center ${open ? 'gap-3' : 'justify-center'}`}>
            <div className="grid size-10 shrink-0 place-content-center rounded-lg bg-muted">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            {open && (
              <div className="transition-opacity duration-200 opacity-100">
                <span className="block text-sm font-semibold text-foreground">
                  Guest
                </span>
                <span className="block text-xs text-muted-foreground">
                  Not logged in
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 border-b border-border pb-4">
      <div 
        onClick={handleClick}
        className={`flex cursor-pointer items-center rounded-md p-2 transition-colors ${!isSelected ?  'hover:bg-border' : 'bg-primary/10 shadow-sm border-l-2 border-primary'} ${!open && 'justify-center'}`}
      >
        <div className={`flex items-center ${open ? 'gap-3' : 'justify-center'}`}>
          {user.profilePictureUrl ? (
            <Image
              src={user.profilePictureUrl}
              alt={user.username}
              width={48}
              height={48}
              className={`shrink-0 rounded-full object-cover shadow-sm ${open ? 'size-12' : 'size-8'}`}
            />
          ) : (
            <div className={`grid shrink-0 place-content-center rounded-full bg-primary shadow-sm ${open ? 'size-12' : 'size-8'}`}>
              <span className={`font-bold text-card ${open ? 'text-lg' : 'text-sm'}`}>{user.username.charAt(0).toUpperCase()}</span>
            </div>
          )}
          {open && (
            <div
              className={`transition-opacity duration-200 ${
                open ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="flex items-center gap-2">
                <div>
                  <span className={`block text-sm font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                    {user.username}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {getUserTypeLabel(user.usertype)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};