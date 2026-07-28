"use client";

import { BrandLogo } from "@/src/components";
import AuthBanner from "./Banner-right";
import BackgroundDecoration from "./Background-decoration";
import LoginForm from "./LoginForm";

export default function LoginPageComponent() {
  return (
    <div
      className=" min-h-screen flex items-center justify-center p-4 relative overflow-hidden
        bg-linear-to-br from-slate-50 via-indigo-50 to-white dark:from-gray-950 dark:via-slate-900 dark:to-gray-950
      "
    >
      {/* Main Card */}

      <div
        className="relative w-full max-w-5xl grid lg:grid-cols-2 overflow-hidden rounded-3xl
          bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-gray-800 shadow-2xl
        "
      >
        {/* Login Section */}
        <div className="p-8 sm:p-10 lg:p-14">
          <div className="max-w-md mx-auto">
            {/* Logo */}
            <BrandLogo className="mb-5" />

            {/* Login Form */}
            <LoginForm />
          </div>
        </div>

        {/* Background Decoration */}
        <BackgroundDecoration />

        {/* Banner right */}
        <AuthBanner />
      </div>
    </div>
  );
}
