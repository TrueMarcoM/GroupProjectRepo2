"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RentalUnitForm from "@/components/RentalUnitForm";
import RentalSearch from "@/components/RentalSearch";
import ReviewForm from "@/components/ReviewForm";
import ListAllUserPoorReviews from '@/components/ListAllUserPoorReviews'; //==
import ListAllUsersNoNegativeUnits from '@/components/ListAllUsersNoNegativeUnits'; //==

interface RentalUnit {
  id: number;
  username: string;
  title: string;
  description: string;
  features: string;
  price: number;
  created_at: string;
}

export default function ListsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    username: string;
    firstName: string;
    lastName: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "myRentals" | "search" | "addRental"
  >("myRentals");
  const [myRentals, setMyRentals] = useState<RentalUnit[]>([]);
  const [selectedRental, setSelectedRental] = useState<RentalUnit | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

  // Fetch user's rental units
  useEffect(() => {
    async function fetchMyRentals() {
      if (!user) return;

      try {
        const response = await fetch("/api/rentals/my");
        const data = await response.json();

        if (response.ok) {
          setMyRentals(data.rentalUnits);
        }
      } catch (error) {
        console.error("Error fetching rentals:", error);
      }
    }

    fetchMyRentals();
  }, [user, refreshTrigger]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleRentalAdded = () => {
    setActiveTab("myRentals");
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleViewRental = (rental: RentalUnit) => {
    setSelectedRental(rental);
  };

  const handleCloseReview = () => {
    setSelectedRental(null);
    setRefreshTrigger((prev) => prev + 1);
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
          <h1 className="text-xl font-bold">Rental Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span>Welcome, {user?.firstName}!</span>
            <button
              onClick={handleLogout}
              className="bg-white text-sky-600 px-4 py-1 rounded-md hover:bg-sky-100 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("showUserPoorReviews")}
            className={`px-4 py-2 font-medium ${
              activeTab === "showUserPoorReviews"
                ? "text-sky-600 border-b-2 border-sky-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Show User Poor Reviews
          </button>
          <button
            onClick={() => setActiveTab("showUsersNonNegativeUnits")}
            className={`px-4 py-2 font-medium ${
              activeTab === "showUsersNonNegativeUnits"
                ? "text-sky-600 border-b-2 border-sky-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Show users with no negative units
          </button>
        </div>

        {activeTab === "myRentals" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              My Rental Units
            </h2>

            {myRentals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  You haven't added any rental units yet.
                </p>
                <button
                  onClick={() => setActiveTab("addRental")}
                  className="bg-sky-500 text-white py-2 px-4 rounded-md hover:bg-sky-600"
                >
                  Add Your First Rental
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto border-collapse">
                  <thead>
                    <tr className="bg-sky-50 text-left">
                      <th className="px-4 py-2 border-b">Title</th>
                      <th className="px-4 py-2 border-b">Description</th>
                      <th className="px-4 py-2 border-b">Features</th>
                      <th className="px-4 py-2 border-b">Price</th>
                      <th className="px-4 py-2 border-b">Date Added</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myRentals.map((rental) => (
                      <tr key={rental.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border-b">{rental.title}</td>
                        <td className="px-4 py-2 border-b">
                          {rental.description.length > 50
                            ? `${rental.description.substring(0, 50)}...`
                            : rental.description}
                        </td>
                        <td className="px-4 py-2 border-b">
                          {rental.features}
                        </td>
                        <td className="px-4 py-2 border-b">${rental.price}</td>
                        <td className="px-4 py-2 border-b">
                          {new Date(rental.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}


        {activeTab ==="showUsersNonNegativeUnits" && (
            <ListAllUsersNoNegativeUnits />
        )}

        {activeTab === "showUserPoorReviews" && (
          <ListAllUserPoorReviews />
        )}
      </main>
    </div>
  );
}
