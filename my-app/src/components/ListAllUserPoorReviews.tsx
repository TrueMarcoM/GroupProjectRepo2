"use client";
import { useState } from "react";

export default function ListAllUserPoorReviews() {
  const [users, setUsers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsersWithPoorReviews = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/reviews");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch users");
      }

      setUsers(data.users.map((user: { username: string }) => user.username));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Recent Poor Reviews
      </h2>

      <button
        onClick={fetchUsersWithPoorReviews}
        disabled={isLoading}
        className="bg-sky-500 text-white py-2 px-4 rounded-md hover:bg-sky-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-70"
      >
        {isLoading ? "Loading..." : "Fetch Users"}
      </button>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mt-4">{error}</div>
      )}

      {users.length > 0 && (
        <ul className="mt-4 list-disc list-inside text-gray-700">
          {users.map((username, index) => (
            <li key={index}>{username}</li>
          ))}
        </ul>
      )}

      {users.length === 0 && !isLoading && !error && (
        <p className="mt-4 text-gray-500">No users found with poor reviews.</p>
      )}
    </div>
  );
}