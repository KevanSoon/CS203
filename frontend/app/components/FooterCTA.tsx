"use client";

import Link from "next/link";
import { CartoonButton } from "@/app/components/CartoonButton";

const FooterCTA = () => {
  return (
    <section className="max-w-6xl mx-auto px-4 py-16 text-center">
      <div className="bg-primary/10 rounded-3xl p-12 space-y-6">
        <h3 className="text-4xl font-extrabold">
          Don&apos;t Be a &ldquo;Boomer.&rdquo;{" "}
          <span className="text-primary">Get the Rizz.</span>
        </h3>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Join Singapore&apos;s growing community of parents, educators, and
          marketers finally understanding what the younger generation is saying.
          Sign up to start learning — or apply to become a Lesson Admin and
          share what you know.
        </p>
        <div className="flex justify-center">
          <Link href="/signup">
            <CartoonButton label="Join the Community Now" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FooterCTA;
