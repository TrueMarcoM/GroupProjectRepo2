"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{
    username: string;
    firstName: string;
    lastName: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/me");

        if (!response.ok) {
          throw new Error("Not authenticated");
        }

        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error("Authentication check failed:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-sky-50">
        <div className="text-sky-700 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-50">
      <header className="bg-sky-600 shadow-md text-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">User Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-white text-sky-600 px-4 py-1 rounded-md hover:bg-sky-100 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Welcome, {user?.firstName}!
          </h2>
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Your Profile Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Username</p>
                <p className="font-medium">{user?.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">
                  {user?.firstName} {user?.lastName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
