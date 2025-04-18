"use client";

import { useState } from "react";

interface RentalUnit {
  id: number;
  username: string;
  title: string;
  description: string;
  features: string;
  price: number;
  created_at: string;
}

interface RentalSearchProps {
  onSelectRental: (rental: RentalUnit) => void;
}

export default function RentalSearch({ onSelectRental }: RentalSearchProps) {
  const [searchFeature, setSearchFeature] = useState("");
  const [results, setResults] = useState<RentalUnit[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/rentals${
          searchFeature ? `?feature=${encodeURIComponent(searchFeature)}` : ""
        }`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to search rental units");
      }

      setResults(data.rentalUnits);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Search Rental Units
      </h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchFeature}
            onChange={(e) => setSearchFeature(e.target.value)}
            placeholder="Search by feature (e.g. Wi-Fi, Kitchen)"
            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 border-gray-300"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="bg-sky-500 text-white py-2 px-4 rounded-md hover:bg-sky-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-70"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {results.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-sky-50 text-left">
                <th className="px-4 py-2 border-b">Title</th>
                <th className="px-4 py-2 border-b">Description</th>
                <th className="px-4 py-2 border-b">Features</th>
                <th className="px-4 py-2 border-b">Price</th>
                <th className="px-4 py-2 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.map((rental) => (
                <tr key={rental.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b">{rental.title}</td>
                  <td className="px-4 py-2 border-b">
                    {rental.description.length > 50
                      ? `${rental.description.substring(0, 50)}...`
                      : rental.description}
                  </td>
                  <td className="px-4 py-2 border-b">{rental.features}</td>
                  <td className="px-4 py-2 border-b">${rental.price}</td>
                  <td className="px-4 py-2 border-b">
                    <button
                      onClick={() => onSelectRental(rental)}
                      className="text-sky-600 hover:text-sky-800 focus:outline-none"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          {isSearching
            ? "Searching..."
            : "No rental units found. Try a different search or view all rentals."}
        </div>
      )}
    </div>
  );
}
