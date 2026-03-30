"use client";

import * as React from "react";

export type GlassCardProps = {
  className?: string;
  children: React.ReactNode;
};

export function GlassCard({ className = "", children }: GlassCardProps) {
  return (
    <section
      className={`rounded-2xl border border-white/60 bg-white/75 p-4 shadow-lg backdrop-blur-md ${className}`.trim()}
    >
      {children}
    </section>
  );
}
