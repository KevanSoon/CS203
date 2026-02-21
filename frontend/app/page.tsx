"use client";

import HeroSection from "./components/HeroSection";
import FeatureSection from "./components/FeatureSection";
import FooterCTA from "./components/FooterCTA";
import Header from "./components/Header";

export default function LandingPage() {
  return (
    <>
    <Header />
    <main>
      <HeroSection />
      <FeatureSection />
      <FooterCTA />
    </main>
    </>
  );
}