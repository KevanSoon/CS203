"use client";

import Link from "next/link";
import { CartoonButton } from "@/components/CartoonButton";
import HeroSection from "./components/HeroSection";
import FeatureSection from "./components/FeatureSection";
import FooterCTA from "./components/FooterCTA";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Simi Slang?</h1>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <CartoonButton label="Log In" color="bg-[#4a4e69]" textColor="text-white" />
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
