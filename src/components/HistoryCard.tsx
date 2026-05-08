"use client";

import { motion } from "framer-motion";
import { HistoryEvent } from "@/../types";
import { cn } from "@/lib/utils";

interface HistoryCardProps {
  event: HistoryEvent;
}

export function HistoryCard({ event }: HistoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto mb-8 bg-[#0a0a0a] border border-[#222] rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(0,112,243,0.1)] hover:shadow-[0_0_25px_rgba(0,112,243,0.2)] transition-shadow duration-300"
    >
      {event.imageURL && (
        <div className="w-full h-64 overflow-hidden relative bg-[#111]">
          <img
            src={event.imageURL}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent"></div>
        </div>
      )}

      <div className={cn("p-6 md:p-8", !event.imageURL && "pt-8")}>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-2xl md:text-3xl font-bold text-[#0070f3] leading-tight">
            {event.title}
          </h2>
          <span className="text-xl md:text-2xl font-black text-white/80 ml-4 shrink-0">
            {event.year}
          </span>
        </div>

        <p className="text-white/70 text-base md:text-lg leading-relaxed mb-6 whitespace-pre-line">
          {event.content}
        </p>

        <div className="bg-[#ff4500]/10 border-l-4 border-[#ff4500] p-4 rounded-r-lg">
          <h4 className="text-[#ff4500] font-bold text-sm uppercase tracking-wider mb-1">
            Historical Impact
          </h4>
          <p className="text-white/90 text-sm md:text-base">
            {event.impactSummary}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
