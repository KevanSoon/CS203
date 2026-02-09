"use client";

import HeroSection from "./components/HeroSection";
import FeatureSection from "./components/FeatureSection";
import FooterCTA from "./components/FooterCTA";

export default function LandingPage() {
  return (
    <main>
      <HeroSection />
      <FeatureSection />
      <FooterCTA />
    </main>
  );
}