"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { History, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/newsroom");
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      switch (firebaseError.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setError("Invalid email or password.");
          break;
        case "auth/too-many-requests":
          setError("Too many attempts. Please try again later.");
          break;
        default:
          setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#0070f3]/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <History className="w-8 h-8 text-[#0070f3] group-hover:rotate-12 transition-transform" />
            <span className="text-2xl font-bold tracking-tight text-white">
              Today in <span className="text-[#0070f3]">History</span>
            </span>
          </Link>
          <p className="text-[#666] mt-3 text-sm">
            Admin access — Sign in to manage events
          </p>
        </div>

        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8 shadow-[0_0_30px_rgba(0,112,243,0.05)]">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-[#a0a0a0] mb-2">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@example.com"
                className="w-full px-4 py-3 bg-[#111] border border-[#222] rounded-xl text-white placeholder:text-[#444] focus:outline-none focus:border-[#0070f3] focus:ring-1 focus:ring-[#0070f3]/30 transition-all"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-[#a0a0a0] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-[#111] border border-[#222] rounded-xl text-white placeholder:text-[#444] focus:outline-none focus:border-[#0070f3] focus:ring-1 focus:ring-[#0070f3]/30 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#444] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#0070f3] hover:bg-[#0060d3] text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,112,243,0.2)] hover:shadow-[0_0_30px_rgba(0,112,243,0.3)]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[#444] text-xs mt-6">
          Access restricted to authorized administrators only.
        </p>
      </div>
    </div>
  );
}
