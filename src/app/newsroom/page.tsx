"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import {
  Loader2,
  LogOut,
  Send,
  CheckCircle,
  AlertCircle,
  ImageIcon,
} from "lucide-react";

export default function NewsroomPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [monthDay, setMonthDay] = useState("");
  const [content, setContent] = useState("");
  const [impactSummary, setImpactSummary] = useState("");
  const [imageURL, setImageURL] = useState("");

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
    <div className="min-h-screen">
      {/* Admin Header */}
      <div className="border-b border-[#1a1a1a] bg-[#0a0a0a]/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Newsroom</h1>
            <p className="text-sm text-[#666]">{user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#222] text-[#a0a0a0] hover:text-white hover:border-[#333] transition-all text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
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
                <span className="ml-2 text-[#ff4500] text-xs font-normal">
                  Displayed in orange callout
                </span>
              </label>
              <textarea
                id="event-impact"
                value={impactSummary}
                onChange={(e) => setImpactSummary(e.target.value)}
                required
                rows={3}
                placeholder="Why this event matters and its lasting impact..."
                className={`${inputClass} resize-y min-h-[80px]`}
              />
            </div>

            {/* Image URL */}
            <div>
              <label htmlFor="event-image" className="block text-sm font-medium text-[#a0a0a0] mb-2">
                Image URL
                <span className="ml-2 text-[#666] text-xs font-normal">
                  Optional
                </span>
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

            {/* Image Preview */}
            {imageURL && (
              <div className="rounded-xl overflow-hidden border border-[#222] bg-[#111]">
                <img
                  src={imageURL}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-[#0070f3] hover:bg-[#0060d3] text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,112,243,0.2)] hover:shadow-[0_0_30px_rgba(0,112,243,0.3)]"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Publish Event
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
