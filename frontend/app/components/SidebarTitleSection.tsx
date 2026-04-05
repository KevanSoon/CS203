import { User } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export interface SidebarTitleSectionProps {
  open: boolean;
  user: {
    id: number;
    username: string;
    email: string;
    usertype: string;
    profilePictureUrl?: string;
  } | null;
  selected?: string;
  hasHydrated?: boolean;
  loadingPic?: boolean;
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

export const SidebarTitleSection = ({ open, user, selected, hasHydrated = true, loadingPic = false }: SidebarTitleSectionProps) => {
  const router = useRouter();
  const handleClick = (usertype: string) => {
    if(usertype !== "root"){
      router.push(`/profile/${user?.id}`);
    }
  };

  // check if profile is selected
  const isSelected = selected === "Profile";

  // Show a neutral skeleton while the store is rehydrating from localStorage,
  // so we never flash the default avatar before the real user data arrives.
  if (!hasHydrated || loadingPic) {
    return (
      <div className="mb-6 border-b border-border pb-4">
        <div className={`flex items-center rounded-md p-2 ${!open && 'justify-center'}`}>
          <div className={`flex items-center ${open ? 'gap-3' : 'justify-center'}`}>
            <div className={`shrink-0 rounded-full bg-muted animate-pulse ${open ? 'size-12' : 'size-8'}`} />
            {open && <div className="space-y-1.5"><div className="h-3 w-24 rounded bg-muted animate-pulse" /><div className="h-2.5 w-16 rounded bg-muted animate-pulse" /></div>}
          </div>
        </div>
      </div>
    );
  }

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
        onClick={()=>handleClick(user.usertype)}
        className={`flex items-center rounded-md p-2 transition-colors ${user.usertype === "root" ? "" : !isSelected ?  'cursor-pointer hover:bg-border' : 'cursor-pointer bg-primary/10 shadow-sm border-l-2 border-primary'} ${!open && 'justify-center'}`}
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
            <div className={`grid shrink-0 place-content-center rounded-full bg-slate-200 shadow-sm ${open ? 'size-12' : 'size-8'}`}>
              <span className={open ? 'text-2xl' : 'text-base'}>🙂</span>
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