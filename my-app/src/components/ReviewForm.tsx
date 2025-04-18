"use client";

import { useState, useEffect } from "react";

interface RentalUnit {
  id: number;
  username: string;
  title: string;
  description: string;
  features: string;
  price: number;
}

interface Review {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  rating: "excellent" | "good" | "fair" | "poor";
  description: string;
  created_at: string;
}

interface ReviewFormProps {
  rental: RentalUnit;
  onClose: () => void;
}

export default function ReviewForm({ rental, onClose }: ReviewFormProps) {
  const [formData, setFormData] = useState({
    rating: "good",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Fetch existing reviews
  useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await fetch(`/api/rentals/${rental.id}/reviews`);
        const data = await response.json();

        if (response.ok) {
          setReviews(data.reviews);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    }

    fetchReviews();
  }, [rental.id, success]);

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/rentals/${rental.id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit review");
      }

      // Reset form on success
      setFormData({
        rating: "good",
        description: "",
      });

      setSuccess("Your review has been submitted successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {rental.title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-700 mb-2">{rental.description}</p>
            <p className="text-gray-600 text-sm">
              <span className="font-semibold">Features:</span> {rental.features}
            </p>
            <p className="text-gray-600 text-sm">
              <span className="font-semibold">Price:</span> ${rental.price}
              /night
            </p>
          </div>

          <div className="border-t border-gray-200 pt-4 mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Write a Review
            </h3>

            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="rating"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Rating
                  </label>
                  <select
                    id="rating"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 border-gray-300"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Review
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Share your experience with this rental..."
                    required
                    rows={4}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 border-gray-300"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.description}
                    className="w-full bg-sky-500 text-white py-2 px-4 rounded-md hover:bg-sky-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-70"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Reviews ({reviews.length})
            </h3>

            {reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No reviews yet. Be the first to review!
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border-b border-gray-100 pb-4 last:border-0"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {review.firstName} {review.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          review.rating === "excellent"
                            ? "bg-green-100 text-green-800"
                            : review.rating === "good"
                            ? "bg-sky-100 text-sky-800"
                            : review.rating === "fair"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {review.rating.charAt(0).toUpperCase() +
                          review.rating.slice(1)}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-700">{review.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
