"use client";

import Image from "next/image";
import Link from "next/link";
import { CartoonButton } from "@/app/components/CartoonButton";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSiteState } from "@/app/store/SiteStore";
import { logout } from "@/app/api/api";

type HeaderProps = {
  isAuthenticated?: boolean;
};

export default function Header({ isAuthenticated = false }: HeaderProps) {
  const user = useSiteState((s) => s.user);
  const clearUser = useSiteState((s) => s.clearUser);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      clearUser();
      router.push("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-12 md:h-20 flex items-center justify-between">
        <Link href="/">
          <Image
            src="/navbar_logo.png"
            alt="Simi Slang"
            width={150}
            height={150}
            className="h-[110px] md:h-[200px] w-auto -my-4 md:-my-8"
          />
        </Link>

        <div className="flex items-center gap-2 md:gap-3">
          {user ? (
            <CartoonButton
              label="Logout"
              color="bg-foreground"
              textColor="text-white"
              size="sm"
              onClick={handleLogout}
            />
          ) : (
            <>
              <Link href="/login">
                <CartoonButton
                  label="Log In"
                  color="bg-foreground"
                  textColor="text-white"
                  size="sm"
                />
              </Link>
              <Link href="/signup">
                <CartoonButton label="Sign Up" size="sm" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}