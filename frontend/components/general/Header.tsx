"use client";

import Image from "next/image";
import Link from "next/link";
import { CartoonButton } from "@/components/CartoonButton";

type HeaderProps = {
  isAuthenticated?: boolean;
};

export default function Header({ isAuthenticated = false }: HeaderProps) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-14 md:h-20 flex items-center justify-between">
        <Link href="/">
          <Image
            src="/navbar_logo.png"
            alt="Simi Slang"
            width={150}
            height={150}
            className="h-[80px] md:h-[200px] w-auto -my-4 md:-my-8"
          />
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link href="/profile">
              <CartoonButton
                label="My Profile 😎"
                color="bg-foreground"
                textColor="text-white"
              />
            </Link>
          ) : (
            <>
              <Link href="/login">
                <CartoonButton
                  label="Log In"
                  color="bg-foreground"
                  textColor="text-white"
                />
              </Link>
              <Link href="/signup">
                <CartoonButton label="Sign Up" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}