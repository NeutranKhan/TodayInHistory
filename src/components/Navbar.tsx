"use client";

import Link from "next/link";
import { History } from "lucide-react";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#222] bg-[#0a0a0a]/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-4xl">
        <Link href="/" className="flex items-center gap-2 group">
          <History className="w-6 h-6 text-[#0070f3] group-hover:rotate-12 transition-transform" />
          <span className="text-xl font-bold tracking-tight text-white">
            Today in <span className="text-[#0070f3]">History</span>
          </span>
        </Link>
        <span className="text-sm font-medium text-white/40">
          {new Date().toLocaleDateString("en-US", { weekday: "long" })}
        </span>
      </div>
    </nav>
  );
}
