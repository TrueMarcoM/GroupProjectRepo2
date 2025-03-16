"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "true";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-100 to-sky-200 p-4">
      <div className="w-full max-w-md">
        {justRegistered && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md text-center">
            Registration successful! Please log in with your credentials.
          </div>
        )}

        <AuthForm type="login" />

        <p className="mt-4 text-center text-gray-600">
          Don't have an account?{" "}
          <Link href="/register" className="text-sky-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
