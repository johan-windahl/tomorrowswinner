"use client";
import { useState } from "react";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { ArrowLeftIcon } from "@/components/ui/icons";

export default function SignInPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Navigation */}
      <div className="container py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors"
        >
          <ArrowLeftIcon size={20} />
          Back to Home
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <AuthForm
          mode={mode}
          onModeChange={setMode}
        />
      </div>

      {/* Footer */}
      <div className="container py-6 text-center">
        <p className="text-sm text-gray-500">
          By signing in, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  );
}
