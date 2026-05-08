"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, CheckCircle2, AlertCircle, Star } from "lucide-react";
import Link from "next/link";

const FEEDBACK_TYPES = [
  { id: "suggestion", label: "Suggestion", icon: "💡" },
  { id: "bug", label: "Bug Report", icon: "🐛" },
  { id: "praise", label: "Praise", icon: "✨" },
  { id: "other", label: "Other", icon: "💬" },
];

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    type: "suggestion",
    message: "",
    rating: 5,
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    try {
      await addDoc(collection(db, "feedback"), {
        ...formData,
        createdAt: serverTimestamp(),
      });
      setStatus("success");
      setFormData({ name: "", email: "", type: "suggestion", message: "", rating: 5 });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen pt-12 pb-24 px-4">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0070f3]/10 border border-[#0070f3]/20 text-[#0070f3] text-sm font-medium mb-6"
          >
            <MessageSquare className="w-4 h-4" />
            <span>We value your voice</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4"
          >
            Share Your <span className="bg-gradient-to-r from-[#0070f3] to-[#00a0f3] bg-clip-text text-transparent">Feedback</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[#a0a0a0] text-lg"
          >
            Help us build the ultimate historical timeline. What's on your mind?
          </motion.p>
        </header>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          {/* Decorative background blur */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-[#0070f3]/10 to-transparent blur-3xl -z-10 opacity-50" />

          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-3xl p-8 md:p-10 shadow-2xl">
            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="py-12 text-center"
                >
                  <div className="w-20 h-20 bg-[#0070f3]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#0070f3]/20">
                    <CheckCircle2 className="w-10 h-10 text-[#0070f3]" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
                  <p className="text-[#a0a0a0] mb-8">Your feedback has been received and helps us improve.</p>
                  <button
                    onClick={() => setStatus("idle")}
                    className="px-8 py-3 bg-[#1a1a1a] hover:bg-[#222] text-white rounded-xl font-medium transition-colors border border-[#333]"
                  >
                    Send Another Response
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-8"
                >
                  {/* Feedback Type Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {FEEDBACK_TYPES.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: type.id })}
                        className={`p-4 rounded-2xl border transition-all duration-200 text-center flex flex-col items-center gap-2 ${
                          formData.type === type.id
                            ? "bg-[#0070f3]/10 border-[#0070f3] text-[#0070f3]"
                            : "bg-[#111] border-[#222] text-[#666] hover:border-[#333] hover:text-[#a0a0a0]"
                        }`}
                      >
                        <span className="text-2xl">{type.icon}</span>
                        <span className="text-xs font-semibold uppercase tracking-wider">{type.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#666] ml-1">Name</label>
                      <input
                        required
                        type="text"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-[#111] border border-[#222] rounded-xl px-5 py-3.5 text-white placeholder-[#444] focus:outline-none focus:ring-2 focus:ring-[#0070f3]/50 focus:border-[#0070f3] transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#666] ml-1">Email</label>
                      <input
                        required
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-[#111] border border-[#222] rounded-xl px-5 py-3.5 text-white placeholder-[#444] focus:outline-none focus:ring-2 focus:ring-[#0070f3]/50 focus:border-[#0070f3] transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#666] ml-1">Overall Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(null)}
                          onClick={() => setFormData({ ...formData, rating: star })}
                          className="p-1 transition-transform active:scale-90"
                        >
                          <Star
                            className={`w-8 h-8 transition-colors ${
                              star <= (hoveredRating ?? formData.rating)
                                ? "fill-[#0070f3] text-[#0070f3]"
                                : "text-[#222]"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#666] ml-1">Your Message</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Tell us what you think..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-[#111] border border-[#222] rounded-xl px-5 py-3.5 text-white placeholder-[#444] focus:outline-none focus:ring-2 focus:ring-[#0070f3]/50 focus:border-[#0070f3] transition-all resize-none"
                    />
                  </div>

                  {status === "error" && (
                    <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>Oops! Something went wrong. Please try again.</span>
                    </div>
                  )}

                  <button
                    disabled={status === "submitting"}
                    type="submit"
                    className="w-full bg-[#0070f3] hover:bg-[#0060e3] disabled:bg-[#0070f3]/50 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group"
                  >
                    {status === "submitting" ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      <>
                        <span>Submit Feedback</span>
                        <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <footer className="mt-12 text-center">
          <Link href="/" className="text-sm text-[#444] hover:text-[#666] transition-colors underline underline-offset-4">
            Back to Timeline
          </Link>
        </footer>
      </div>
    </div>
  );
}
