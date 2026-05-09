"use client";

import { useEffect, useState, useCallback, useRef, Fragment } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  DocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { HistoryEvent } from "@/../types";
import { HistoryCard } from "@/components/HistoryCard";
import { Calendar, Loader2 } from "lucide-react";

const BATCH_SIZE = 10;

function getTodayMonthDay(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${month}-${day}`;
}

function getYesterdayMonthDay(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const month = String(yesterday.getMonth() + 1).padStart(2, "0");
  const day = String(yesterday.getDate()).padStart(2, "0");
  return `${month}-${day}`;
}

function formatDateDisplay(monthDay: string): string {
  const [month, day] = monthDay.split("-");
  const date = new Date(2000, parseInt(month) - 1, parseInt(day));
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

export default function HomePage() {
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const todayMonthDay = getTodayMonthDay();
  const yesterdayMonthDay = getYesterdayMonthDay();

  let currentMonthDay = "";

  const fetchEvents = useCallback(
    async (isLoadMore = false) => {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        let q;
        const eventsRef = collection(db, "events");

        if (isLoadMore && lastDoc) {
          q = query(
            eventsRef,
            where("monthDay", "<=", todayMonthDay),
            orderBy("monthDay", "desc"),
            orderBy("year", "desc"),
            startAfter(lastDoc),
            limit(BATCH_SIZE)
          );
        } else {
          q = query(
            eventsRef,
            where("monthDay", "<=", todayMonthDay),
            orderBy("monthDay", "desc"),
            orderBy("year", "desc"),
            limit(BATCH_SIZE)
          );
        }

        const snapshot = await getDocs(q);
        const newEvents: HistoryEvent[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as HistoryEvent[];

        if (isLoadMore) {
          setEvents((prev) => [...prev, ...newEvents]);
        } else {
          setEvents(newEvents);
        }

        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
        setHasMore(snapshot.docs.length === BATCH_SIZE);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [lastDoc, todayMonthDay]
  );

  // Initial fetch
  useEffect(() => {
    fetchEvents(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchEvents(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore, loading, fetchEvents]);

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <header className="relative overflow-hidden border-b border-[#1a1a1a]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0070f3]/8 via-transparent to-transparent" />
        <div className="relative max-w-4xl mx-auto px-4 py-12 md:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0070f3]/10 border border-[#0070f3]/20 text-[#0070f3] text-sm font-medium mb-6">
            <Calendar className="w-4 h-4" />
            <span>{formatDateDisplay(todayMonthDay)}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4">
            Today in{" "}
            <span className="bg-gradient-to-r from-[#0070f3] to-[#00a0f3] bg-clip-text text-transparent">
              History
            </span>
          </h1>
          <p className="text-lg md:text-xl text-[#a0a0a0] max-w-2xl mx-auto leading-relaxed">
            Discover the moments that shaped our world — one day at a time.
          </p>
        </div>
      </header>

      {/* Feed */}
      <section className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {loading ? (
          <div className="space-y-8">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-full max-w-2xl mx-auto bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden"
              >
                <div className="skeleton h-64 w-full" />
                <div className="p-6 md:p-8 space-y-4">
                  <div className="skeleton h-8 w-3/4" />
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-4 w-5/6" />
                  <div className="skeleton h-4 w-2/3" />
                  <div className="skeleton h-20 w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#0a0a0a] border border-[#1a1a1a] flex items-center justify-center">
              <Calendar className="w-10 h-10 text-[#333]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              No Events Yet
            </h2>
            <p className="text-[#666] max-w-md mx-auto">
              History is being written. Check back soon for events that happened
              on this day.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {events.map((event, index) => {
              const isNewDate = event.monthDay !== currentMonthDay;
              currentMonthDay = event.monthDay;

              return (
                <Fragment key={event.id}>
                  {isNewDate && (
                    <div className="relative py-4 flex items-center gap-4">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#1a1a1a]" />
                      <div className="px-6 py-2 rounded-full bg-[#0a0a0a] border border-[#1a1a1a] text-xs font-black uppercase tracking-[0.2em] text-[#0070f3] shadow-[0_0_15px_rgba(0,112,243,0.1)]">
                        {event.monthDay === todayMonthDay
                          ? "Today in History"
                          : event.monthDay === yesterdayMonthDay
                          ? "Yesterday in History"
                          : `${formatDateDisplay(event.monthDay)} in History`}
                      </div>
                      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#1a1a1a]" />
                    </div>
                  )}
                  <div
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <HistoryCard event={event} />
                  </div>
                </Fragment>
              );
            })}
          </div>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-4" />

        {loadingMore && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-[#0070f3] animate-spin" />
          </div>
        )}

        {!hasMore && events.length > 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 text-[#444] text-sm">
              <div className="w-8 h-px bg-[#222]" />
              <span>You&apos;ve reached the beginning of time</span>
              <div className="w-8 h-px bg-[#222]" />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
