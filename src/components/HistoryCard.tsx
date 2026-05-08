"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HistoryEvent } from "@/../types";
import { cn } from "@/lib/utils";
import { Star, Users } from "lucide-react";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface HistoryCardProps {
  event: HistoryEvent;
}

export function HistoryCard({ event }: HistoryCardProps) {
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [isRating, setIsRating] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  // Stats
  const totalRating = event.totalRating || 0;
  const ratingCount = event.ratingCount || 0;
  const averageRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : "0.0";

  useEffect(() => {
    const ratedEvents = JSON.parse(localStorage.getItem("rated_events") || "[]");
    if (ratedEvents.includes(event.id)) {
      setHasRated(true);
    }
  }, [event.id]);

  const handleRate = async (rating: number) => {
    if (hasRated || isRating || !event.id) return;

    setIsRating(true);
    setUserRating(rating);

    try {
      const eventRef = doc(db, "events", event.id);
      await updateDoc(eventRef, {
        totalRating: increment(rating),
        ratingCount: increment(1),
      });

      const ratedEvents = JSON.parse(localStorage.getItem("rated_events") || "[]");
      localStorage.setItem("rated_events", JSON.stringify([...ratedEvents, event.id]));
      setHasRated(true);
    } catch (error) {
      console.error("Error rating event:", error);
      setUserRating(null);
    } finally {
      setIsRating(false);
    }
  };

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

        <div className="bg-[#ff4500]/10 border-l-4 border-[#ff4500] p-4 rounded-r-lg mb-8">
          <h4 className="text-[#ff4500] font-bold text-sm uppercase tracking-wider mb-1">
            Historical Impact
          </h4>
          <p className="text-white/90 text-sm md:text-base">
            {event.impactSummary}
          </p>
        </div>

        {/* Rating Section */}
        <div className="pt-6 border-t border-[#1a1a1a] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#444] uppercase tracking-widest mb-1">Rating</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-white">{averageRating}</span>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "w-4 h-4",
                        star <= Math.round(Number(averageRating))
                          ? "fill-[#0070f3] text-[#0070f3]"
                          : "text-[#222]"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="w-px h-10 bg-[#1a1a1a]" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#444] uppercase tracking-widest mb-1">Votes</span>
              <div className="flex items-center gap-1.5 text-white/60">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">{ratingCount}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-end">
            <span className="text-xs font-bold text-[#444] uppercase tracking-widest mb-2">
              {hasRated ? "Thank you for rating!" : "Rate this event"}
            </span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  disabled={hasRated || isRating}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(null)}
                  onClick={() => handleRate(star)}
                  className={cn(
                    "p-1.5 rounded-lg transition-all",
                    !hasRated && !isRating && "hover:bg-[#0070f3]/10 active:scale-90"
                  )}
                >
                  <Star
                    className={cn(
                      "w-6 h-6 transition-colors",
                      star <= (hoveredRating ?? userRating ?? 0)
                        ? "fill-[#0070f3] text-[#0070f3]"
                        : hasRated
                        ? "text-[#1a1a1a]"
                        : "text-[#333]"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
