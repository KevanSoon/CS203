"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Tungtung from "../../public/Tungtung";
import { CartoonButton } from "@/components/CartoonButton";

const HeroSection = () => {
  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* 3D Model */}
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

        {/* Text */}
        <div className="space-y-6">
          <h2 className="text-5xl font-extrabold leading-tight">
            &ldquo;Catch No Ball&rdquo; When the Kids Talk?{" "}
            <span className="text-primary">
              Decode Gen Alpha Slang with Singlish.
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From &ldquo;Rizz&rdquo; to &ldquo;Kilat&rdquo; and
            &ldquo;Sus&rdquo; to &ldquo;Hantu.&rdquo; Join Singapore&apos;s
            first community-driven platform designed to help parents, educators,
            and marketers bridge the generational language gap. Verified by
            humans, powered by AI.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link href="/signup">
              <CartoonButton label="Get started" />
            </Link>
            <Link href="/login">
              <CartoonButton
                label="Log in"
                color="bg-foreground"
                textColor="text-white"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
