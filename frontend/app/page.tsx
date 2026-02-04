"use client";

import Link from "next/link";
import Image from "next/image";
import { CartoonButton } from "@/components/CartoonButton";
import HeroSection from "./components/HeroSection";
import FeatureSection from "./components/FeatureSection";
import FooterCTA from "./components/FooterCTA";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 overflow-visible">
        <div className="max-w-6xl mx-auto px-4 py-15 h-14 md:h-20 flex items-center justify-between">
          <Image src="/navbar_logo.png" alt="Simi Slang" width={150} height={150} className="h-[80px] md:h-[200px] w-auto -my-4 md:-my-8" />
          <div className="flex items-center gap-3">
            <Link href="/login">
              <CartoonButton label="Log In" color="bg-foreground" textColor="text-white" />
            </Link>
            <Link href="/signup">
              <CartoonButton label="Sign Up" />
            </Link>
          </div>
        </div>
      </header>

      <HeroSection />
      <FeatureSection />
      <FooterCTA />

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-muted-foreground text-sm">
          &copy; 2026 Simi Slang. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
