"use client"

import { Suspense } from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Tungtung from "../public/Tungtung";
import { BookOpen, Gamepad2, Video } from "lucide-react";
import { CartoonButton } from "@/components/CartoonButton";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Skibidi University</h1>
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

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-2">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* 3D Model - Left */}
          <div className="w-full h-[500px] rounded-2xl overflow-hidden">
            <Canvas camera={{ position: [0, 10, 20], fov: 60 }}>
              <ambientLight intensity={1.5} />
              <directionalLight position={[5, 5, 5]} intensity={2} />
              <directionalLight position={[-5, 3, -5]} intensity={1} />
              <OrbitControls target={[0, 10, 0]} />
              <Suspense fallback={null}>
                <Tungtung />
              </Suspense>
            </Canvas>
          </div>

          {/* Text - Right */}
          <div className="space-y-6">
            <h2 className="text-5xl font-extrabold leading-tight">
              Learn Internet Culture,{" "}
              <span className="text-primary">The Fun Way</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Master Gen Alpha slang, gaming lingo, and TikTok trends through
              interactive lessons. Stay relevant and connect across generations.
            </p>
            <div className="flex gap-4">
              <Link href="/signup">
                <CartoonButton label="Get Started" />
              </Link>
              <Link href="/login">
                <CartoonButton label="Log In" color="bg-[#4a4e69]" textColor="text-white" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">What You&apos;ll Learn</h3>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="text-center p-6 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-lg hover:shadow-primary/10 transition-all">
            <div className="space-y-4 pt-4">
              <div className="mx-auto w-14 h-14 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                <BookOpen className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold">Gen Alpha Slangs</h4>
              <p className="text-muted-foreground">
                From &apos;skibidi&apos; to &apos;rizz&apos;, become fluent in the language of the youth.
              </p>
            </div>
          </div>

          <div className="text-center p-6 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-lg hover:shadow-primary/10 transition-all">
            <div className="space-y-4 pt-4">
              <div className="mx-auto w-14 h-14 rounded-xl bg-secondary/20 text-secondary flex items-center justify-center">
                <Gamepad2 className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold">Gaming Culture</h4>
              <p className="text-muted-foreground">
                Master gaming terminology like &apos;GG&apos;, &apos;noob&apos;, &apos;poggers&apos; and more.
              </p>
            </div>
          </div>

          <div className="text-center p-6 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-lg hover:shadow-primary/10 transition-all">
            <div className="space-y-4 pt-4">
              <div className="mx-auto w-14 h-14 rounded-xl bg-accent/20 text-accent flex items-center justify-center">
                <Video className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold">TikTok Trends</h4>
              <p className="text-muted-foreground">
                Understand viral trends, sounds, and culture. Get in on the loop!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="bg-primary/10 rounded-3xl p-12 space-y-6">
          <h3 className="text-3xl font-bold">Ready to get started?</h3>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Join thousands of learners bridging the generational gap through fun, interactive lessons.
          </p>
          <Link href="/signup">
            <CartoonButton label="Start Learning Now" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-muted-foreground text-sm">
          &copy; 2026 Skibidi University. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
