"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    setMessage(error ? error.message : "Check your email to confirm your account.");
  }

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    setMessage(error ? error.message : "Signed in.");
  }

  async function signOut() {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    setMessage(error ? error.message : "Signed out.");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50  via-white  to-purple-50  py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900  mb-2">Welcome Back</h1>
          <p className="text-gray-600 ">Sign in to your account to start making predictions</p>
        </div>

        {/* Form */}
        <div className="card">
          <div className="card-body">
            <form className="space-y-6" onSubmit={signIn}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700  mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700  mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {message && (
                <div className={`p-4 rounded-lg border text-sm ${message.includes("Signed in") || message.includes("Check your email")
                  ? "bg-green-50  border-green-200  text-green-800 "
                  : "bg-red-50  border-red-200  text-red-800 "
                  }`}>
                  <div className="flex items-center gap-2">
                    {message.includes("Signed in") || message.includes("Check your email") ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.168 13.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    )}
                    {message}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <button
                  disabled={loading}
                  className="btn btn-primary w-full"
                  type="submit"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing in...
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </button>

                <div className="flex gap-3">
                  <button
                    disabled={loading}
                    className="btn btn-outline flex-1"
                    type="button"
                    onClick={signUp}
                  >
                    {loading ? "..." : "Sign Up"}
                  </button>
                  <button
                    disabled={loading}
                    className="btn btn-outline flex-1"
                    type="button"
                    onClick={signOut}
                  >
                    {loading ? "..." : "Sign Out"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-600 ">
            New to Tomorrow's Winner?{" "}
            <span className="text-blue-600  font-medium cursor-pointer hover:text-blue-700 " onClick={signUp}>
              Create an account
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
