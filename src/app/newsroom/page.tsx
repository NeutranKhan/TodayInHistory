"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, addDoc, query, orderBy, getDocs, limit } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import {
  Loader2,
  LogOut,
  Send,
  CheckCircle,
  AlertCircle,
  ImageIcon,
  BarChart3,
  MessageSquare,
  PlusCircle,
  Star,
  Users,
  Calendar as CalendarIcon,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { HistoryEvent, FeedbackSubmission } from "@/../types";

type AdminTab = "publish" | "feedback" | "stats";

export default function NewsroomPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>("publish");
  
  // Data state
  const [feedback, setFeedback] = useState<FeedbackSubmission[]>([]);
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Form state
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [monthDay, setMonthDay] = useState("");
  const [content, setContent] = useState("");
  const [impactSummary, setImpactSummary] = useState("");
  const [imageURL, setImageURL] = useState("");

  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, [router]);

  const fetchData = async (tab: AdminTab) => {
    if (tab === "publish") return;
    setLoadingData(true);
    try {
      if (tab === "feedback") {
        const q = query(collection(db, "feedback"), orderBy("createdAt", "desc"), limit(50));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FeedbackSubmission[];
        setFeedback(data);
      } else if (tab === "stats") {
        const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as HistoryEvent[];
        setEvents(data);
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData(activeTab);
    }
  }, [activeTab, user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSubmitting(true);

    try {
      await addDoc(collection(db, "events"), {
        title: title.trim(),
        year: parseInt(year),
        monthDay,
        content: content.trim(),
        impactSummary: impactSummary.trim(),
        imageURL: imageURL.trim() || null,
        createdAt: Date.now(),
        totalRating: 0,
        ratingCount: 0,
        likes: 0,
        dislikes: 0,
      });

      setSuccess(true);
      setTitle("");
      setYear("");
      setMonthDay("");
      setContent("");
      setImpactSummary("");
      setImageURL("");

      setTimeout(() => setSuccess(false), 4000);
    } catch {
      setError("Failed to publish event. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignOut() {
    await signOut(auth);
    router.push("/login");
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#0070f3] animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const inputClass =
    "w-full px-4 py-3 bg-[#111] border border-[#222] rounded-xl text-white placeholder:text-[#444] focus:outline-none focus:border-[#0070f3] focus:ring-1 focus:ring-[#0070f3]/30 transition-all";

  return (
    <div className="min-h-screen pb-20">
      {/* Admin Header */}
      <div className="border-b border-[#1a1a1a] bg-[#0a0a0a]/50 sticky top-0 z-10 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#0070f3]" />
              Newsroom <span className="text-[#0070f3]">Control</span>
            </h1>
            <p className="text-xs text-[#666] uppercase tracking-widest font-bold mt-0.5">{user.email?.split('@')[0]}</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#222] text-[#a0a0a0] hover:text-white hover:border-[#333] transition-all text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
        
        {/* Tab Switcher */}
        <div className="max-w-5xl mx-auto px-4 flex gap-8">
          {[
            { id: "publish", label: "Publish", icon: PlusCircle },
            { id: "feedback", label: "Feedback", icon: MessageSquare },
            { id: "stats", label: "Event Stats", icon: BarChart3 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`pb-3 pt-2 text-sm font-medium transition-all relative ${
                activeTab === tab.id ? "text-[#0070f3]" : "text-[#666] hover:text-[#a0a0a0]"
              }`}
            >
              <div className="flex items-center gap-2">
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </div>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0070f3]" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {activeTab === "publish" && (
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 md:p-8">
            <h2 className="text-lg font-semibold text-white mb-6">
              Publish a New Historical Event
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {success && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20 text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  Event published successfully!
                </div>
              )}

              {error && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Title */}
              <div>
                <label htmlFor="event-title" className="block text-sm font-medium text-[#a0a0a0] mb-2">
                  Title *
                </label>
                <input
                  id="event-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="The Moon Landing"
                  className={inputClass}
                />
              </div>

              {/* Year + MonthDay row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="event-year" className="block text-sm font-medium text-[#a0a0a0] mb-2">
                    Year *
                  </label>
                  <input
                    id="event-year"
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    required
                    placeholder="1969"
                    min="1"
                    max="9999"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="event-monthday" className="block text-sm font-medium text-[#a0a0a0] mb-2">
                    Month-Day (MM-DD) *
                  </label>
                  <input
                    id="event-monthday"
                    type="text"
                    value={monthDay}
                    onChange={(e) => setMonthDay(e.target.value)}
                    required
                    placeholder="07-20"
                    pattern="\d{2}-\d{2}"
                    title="Format: MM-DD (e.g., 07-20)"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Content */}
              <div>
                <label htmlFor="event-content" className="block text-sm font-medium text-[#a0a0a0] mb-2">
                  Content *
                </label>
                <textarea
                  id="event-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={5}
                  placeholder="Describe the historical event in detail..."
                  className={`${inputClass} resize-y min-h-[120px]`}
                />
              </div>

              {/* Impact Summary */}
              <div>
                <label htmlFor="event-impact" className="block text-sm font-medium text-[#a0a0a0] mb-2">
                  Impact Summary *
                </label>
                <textarea
                  id="event-impact"
                  value={impactSummary}
                  onChange={(e) => setImpactSummary(e.target.value)}
                  required
                  rows={3}
                  placeholder="Why this event matters..."
                  className={`${inputClass} resize-y min-h-[80px]`}
                />
              </div>

              {/* Image URL */}
              <div>
                <label htmlFor="event-image" className="block text-sm font-medium text-[#a0a0a0] mb-2">
                  Image URL
                </label>
                <div className="relative">
                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
                  <input
                    id="event-image"
                    type="url"
                    value={imageURL}
                    onChange={(e) => setImageURL(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl bg-[#0070f3] hover:bg-[#0060d3] text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,112,243,0.2)]"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submitting ? "Publishing..." : "Publish Event"}
              </button>
            </form>
          </div>
        )}

        {activeTab === "feedback" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Recent Feedback</h2>
              <button onClick={() => fetchData("feedback")} className="text-xs text-[#0070f3] hover:underline">Refresh</button>
            </div>
            
            {loadingData ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 text-[#0070f3] animate-spin" />
              </div>
            ) : feedback.length === 0 ? (
              <div className="text-center py-20 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl">
                <p className="text-[#444]">No feedback received yet.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {feedback.map((sub) => (
                  <div key={sub.id} className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 rounded-2xl">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-white">{sub.name}</h3>
                        <p className="text-sm text-[#666]">{sub.email}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-[#111] px-3 py-1 rounded-full border border-[#222]">
                        <Star className="w-3 h-3 fill-[#0070f3] text-[#0070f3]" />
                        <span className="text-xs font-bold text-white">{sub.rating}</span>
                      </div>
                    </div>
                    <div className="mb-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#0070f3]/10 text-[#0070f3] mb-2 border border-[#0070f3]/20">
                        {sub.type}
                      </span>
                      <p className="text-white/80 text-sm leading-relaxed">{sub.message}</p>
                    </div>
                    <div className="text-[10px] text-[#444] font-medium flex items-center gap-1.5 uppercase tracking-widest">
                      <CalendarIcon className="w-3 h-3" />
                      {sub.createdAt && typeof sub.createdAt === "object" && "toDate" in sub.createdAt
                        ? (sub.createdAt as { toDate: () => Date }).toDate().toLocaleString()
                        : "Recently"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "stats" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Event Performance</h2>
              <button onClick={() => fetchData("stats")} className="text-xs text-[#0070f3] hover:underline">Refresh</button>
            </div>

            {loadingData ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 text-[#0070f3] animate-spin" />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-20 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl">
                <p className="text-[#444]">No events found.</p>
              </div>
            ) : (
              <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#1a1a1a] bg-[#050505]">
                        <th className="px-6 py-4 text-xs font-bold text-[#444] uppercase tracking-widest">Event</th>
                        <th className="px-6 py-4 text-xs font-bold text-[#444] uppercase tracking-widest text-center">Avg Rating</th>
                        <th className="px-6 py-4 text-xs font-bold text-[#444] uppercase tracking-widest text-center">Votes</th>
                        <th className="px-6 py-4 text-xs font-bold text-[#444] uppercase tracking-widest text-center">Likes</th>
                        <th className="px-6 py-4 text-xs font-bold text-[#444] uppercase tracking-widest text-center">Dislikes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((event) => {
                        const avg = event.ratingCount ? (event.totalRating! / event.ratingCount).toFixed(1) : "0.0";
                        return (
                          <tr key={event.id} className="border-b border-[#1a1a1a] hover:bg-[#111] transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-white">{event.title}</div>
                              <div className="text-xs text-[#666]">{event.year} • {event.monthDay}</div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0070f3]/5 border border-[#0070f3]/10">
                                <Star className="w-3 h-3 fill-[#0070f3] text-[#0070f3]" />
                                <span className="text-sm font-bold text-white">{avg}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-1.5 text-[#a0a0a0]">
                                <Users className="w-3.5 h-3.5" />
                                <span className="text-sm font-medium">{event.ratingCount || 0}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-1.5 text-green-500/60 font-bold">
                                <ThumbsUp className="w-3.5 h-3.5" />
                                <span className="text-sm">{event.likes || 0}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-1.5 text-red-500/60 font-bold">
                                <ThumbsDown className="w-3.5 h-3.5" />
                                <span className="text-sm">{event.dislikes || 0}</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
