"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type AnalyticsResult = {
  success: boolean;
  results: any[];
  message?: string;
};

export default function AnalyticsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    | "expensive"
    | "sameDay"
    | "goodOnly"
    | "topPosters"
    | "poorReviewers"
    | "noPoorReviews"
  >("expensive");

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Same Day Features form state
  const [featureX, setFeatureX] = useState("");
  const [featureY, setFeatureY] = useState("");

  // Good/Excellent Only form state
  const [username, setUsername] = useState("");

  // Top Posters form state
  const [date, setDate] = useState("2025-04-15");

  const fetchExpensiveByFeature = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/analytics/most-expensive-by-feature");
      const data: AnalyticsResult = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch data");
      }

      setResults(data.results);
      if (data.results.length === 0) {
        setMessage("No results found");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSameDayFeatures = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!featureX || !featureY) {
      setError("Both features are required");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/analytics/same-day-features?featureX=${encodeURIComponent(
          featureX
        )}&featureY=${encodeURIComponent(featureY)}`
      );
      const data: AnalyticsResult = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch data");
      }

      setResults(data.results);
      if (data.results.length === 0) {
        setMessage("No users found with these features on the same day");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchGoodExcellentOnly = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!username) {
      setError("Username is required");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/analytics/good-excellent-only?username=${encodeURIComponent(
          username
        )}`
      );
      const data: AnalyticsResult = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch data");
      }

      setResults(data.results);
      if (data.results.length === 0) {
        setMessage(
          `No rental units found for ${username} with only good/excellent reviews`
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopPosters = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!date) {
      setError("Date is required");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/analytics/top-posters?date=${encodeURIComponent(date)}`
      );
      const data: AnalyticsResult = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch data");
      }

      setResults(data.results);
      if (data.results.length === 0) {
        setMessage(`No posts found on ${date}`);
      } else if (data.message) {
        setMessage(data.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPoorReviewers = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/analytics/poor-reviewers");
      const data: AnalyticsResult = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch data");
      }

      setResults(data.results);
      if (data.results.length === 0) {
        setMessage("No users found who only give poor reviews");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchNoPoorReviews = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/analytics/no-poor-reviews");
      const data: AnalyticsResult = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch data");
      }

      setResults(data.results);
      if (data.results.length === 0) {
        setMessage("No users found who never received poor reviews");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const renderResultsTable = () => {
    if (results.length === 0) {
      return null;
    }

    // Transform the results to format dates before rendering
    const formattedResults = results.map((row) => {
      const newRow = { ...row };
      // Format any field that contains 'date' or is 'created_at'
      Object.keys(row).forEach((key) => {
        if (
          key.toLowerCase().includes("date") ||
          key.toLowerCase() === "created_at"
        ) {
          newRow[key] = row[key] ? formatDate(row[key]) : "";
        }
      });
      return newRow;
    });

    const headers = Object.keys(formattedResults[0]);

    return (
      <div className="overflow-x-auto mt-6">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {formattedResults.map((row, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                {headers.map((header) => (
                  <td
                    key={`${index}-${header}`}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >
                    {row[header] !== null ? String(row[header]) : ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-sky-50 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-800">
              Rental Unit Analytics
            </h1>
            <Link
              href="/dashboard"
              className="flex items-center text-sky-600 hover:text-sky-800"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 mr-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                />
              </svg>
              Back to Dashboard
            </Link>
          </div>

          <div className="flex border-b border-gray-200">
            <button
              onClick={() => {
                setActiveTab("expensive");
                setResults([]);
                setError(null);
                setMessage(null);
              }}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === "expensive"
                  ? "text-sky-600 border-b-2 border-sky-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              1. Most Expensive by Feature
            </button>
            <button
              onClick={() => {
                setActiveTab("sameDay");
                setResults([]);
                setError(null);
                setMessage(null);
              }}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === "sameDay"
                  ? "text-sky-600 border-b-2 border-sky-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              2. Same Day Features
            </button>
            <button
              onClick={() => {
                setActiveTab("goodOnly");
                setResults([]);
                setError(null);
                setMessage(null);
              }}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === "goodOnly"
                  ? "text-sky-600 border-b-2 border-sky-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              3. Good/Excellent Only
            </button>
            <button
              onClick={() => {
                setActiveTab("topPosters");
                setResults([]);
                setError(null);
                setMessage(null);
              }}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === "topPosters"
                  ? "text-sky-600 border-b-2 border-sky-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              4. Top Posters
            </button>
            <button
              onClick={() => {
                setActiveTab("poorReviewers");
                setResults([]);
                setError(null);
                setMessage(null);
              }}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === "poorReviewers"
                  ? "text-sky-600 border-b-2 border-sky-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              5. Poor Reviewers Only
            </button>
            <button
              onClick={() => {
                setActiveTab("noPoorReviews");
                setResults([]);
                setError(null);
                setMessage(null);
              }}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === "noPoorReviews"
                  ? "text-sky-600 border-b-2 border-sky-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              6. No Poor Reviews
            </button>
          </div>

          <div className="p-6">
            {activeTab === "expensive" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  1. Most Expensive Rental Units by Feature
                </h2>
                <p className="text-gray-600 mb-6">
                  This report shows the most expensive rental unit for each
                  unique feature.
                </p>
                <button
                  onClick={fetchExpensiveByFeature}
                  disabled={loading}
                  className="bg-sky-500 text-white py-2 px-4 rounded-md hover:bg-sky-600 transition duration-200 disabled:opacity-70"
                >
                  {loading ? "Loading..." : "Run Report"}
                </button>
              </div>
            )}

            {activeTab === "sameDay" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  2. Users with Two Features on the Same Day
                </h2>
                <p className="text-gray-600 mb-6">
                  Find users who posted at least two rental units on the same
                  day, where one has feature X and another has feature Y.
                </p>
                <form onSubmit={fetchSameDayFeatures} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="featureX"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Feature X
                      </label>
                      <input
                        type="text"
                        id="featureX"
                        value={featureX}
                        onChange={(e) => setFeatureX(e.target.value)}
                        placeholder="e.g. Pool"
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 border-gray-300"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="featureY"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Feature Y
                      </label>
                      <input
                        type="text"
                        id="featureY"
                        value={featureY}
                        onChange={(e) => setFeatureY(e.target.value)}
                        placeholder="e.g. Wi-Fi"
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 border-gray-300"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-sky-500 text-white py-2 px-4 rounded-md hover:bg-sky-600 transition duration-200 disabled:opacity-70"
                  >
                    {loading ? "Loading..." : "Search"}
                  </button>
                </form>
              </div>
            )}

            {activeTab === "goodOnly" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  3. Rental Units with Only Good/Excellent Reviews
                </h2>
                <p className="text-gray-600 mb-6">
                  Find all rental units posted by a specific user that have
                  received only "Excellent" or "Good" reviews (and at least one
                  review).
                </p>
                <form onSubmit={fetchGoodExcellentOnly} className="space-y-4">
                  <div>
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username"
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 border-gray-300"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-sky-500 text-white py-2 px-4 rounded-md hover:bg-sky-600 transition duration-200 disabled:opacity-70"
                  >
                    {loading ? "Loading..." : "Search"}
                  </button>
                </form>
              </div>
            )}

            {activeTab === "topPosters" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  4. Top Posters on a Date
                </h2>
                <p className="text-gray-600 mb-6">
                  Find users who posted the most rental units on a specific
                  date. Shows all users in case of a tie.
                </p>
                <form onSubmit={fetchTopPosters} className="space-y-4">
                  <div>
                    <label
                      htmlFor="date"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 border-gray-300"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-sky-500 text-white py-2 px-4 rounded-md hover:bg-sky-600 transition duration-200 disabled:opacity-70"
                  >
                    {loading ? "Loading..." : "Search"}
                  </button>
                </form>
              </div>
            )}

            {activeTab === "poorReviewers" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  5. Users Who Only Give "Poor" Reviews
                </h2>
                <p className="text-gray-600 mb-6">
                  Display all users who have posted reviews, but every review
                  they gave was rated as "poor".
                </p>
                <button
                  onClick={fetchPoorReviewers}
                  disabled={loading}
                  className="bg-sky-500 text-white py-2 px-4 rounded-md hover:bg-sky-600 transition duration-200 disabled:opacity-70"
                >
                  {loading ? "Loading..." : "Run Report"}
                </button>
              </div>
            )}

            {activeTab === "noPoorReviews" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  6. Users Whose Rentals Have No Poor Reviews
                </h2>
                <p className="text-gray-600 mb-6">
                  Display all users who have posted rental units, but none of
                  their units have ever received a "poor" review (or no reviews
                  at all).
                </p>
                <button
                  onClick={fetchNoPoorReviews}
                  disabled={loading}
                  className="bg-sky-500 text-white py-2 px-4 rounded-md hover:bg-sky-600 transition duration-200 disabled:opacity-70"
                >
                  {loading ? "Loading..." : "Run Report"}
                </button>
              </div>
            )}

            {error && (
              <div className="mt-6 bg-red-100 text-red-700 p-4 rounded-md">
                {error}
              </div>
            )}

            {message && (
              <div className="mt-6 bg-blue-100 text-blue-700 p-4 rounded-md">
                {message}
              </div>
            )}

            {loading && (
              <div className="mt-6 text-center">
                <p className="text-gray-600">Loading results...</p>
              </div>
            )}

            {renderResultsTable()}
          </div>
        </div>
      </div>
    </div>
  );
}
