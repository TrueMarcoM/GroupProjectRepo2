"use client";

import { useState } from "react";

interface RentalUnitFormProps {
  onSuccess: () => void;
}

export default function RentalUnitForm({ onSuccess }: RentalUnitFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    features: "",
    price: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [featuresList, setFeaturesList] = useState<string[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFeatureKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && formData.features.trim()) {
      e.preventDefault();
      setFeaturesList((prev) => [...prev, formData.features.trim()]);
      setFormData((prev) => ({ ...prev, features: "" }));
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeaturesList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/rentals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          features: featuresList.join(", "),
          price: parseFloat(formData.price),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          // Special handling for daily limit
          setError(
            "You have reached the daily limit of 2 rental posts. Please try again tomorrow."
          );
        } else {
          throw new Error(data.message || "Failed to create rental unit");
        }
        return;
      }

      // Reset form on success
      setFormData({
        title: "",
        description: "",
        features: "",
        price: "",
      });
      setFeaturesList([]);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Add New Rental Unit
      </h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title (Location)
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Los Angeles, California"
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 border-gray-300"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g. Peaceful modern cabin with a view"
              required
              rows={3}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 border-gray-300"
            />
          </div>

          <div>
            <label
              htmlFor="features"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Features (press Enter to add multiple)
            </label>
            <input
              type="text"
              id="features"
              name="features"
              value={formData.features}
              onChange={handleChange}
              onKeyDown={handleFeatureKeyDown}
              placeholder="e.g. Mountainview, Kitchen, Wi-Fi"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 border-gray-300"
            />

            {featuresList.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {featuresList.map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(index)}
                      className="ml-1.5 text-sky-500 hover:text-sky-700"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Price per Night ($)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g. 100"
              required
              min="1"
              step="0.01"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 border-gray-300"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting || featuresList.length === 0}
              className="w-full bg-sky-500 text-white py-2 px-4 rounded-md hover:bg-sky-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-70"
            >
              {isSubmitting ? "Creating..." : "Create Rental Unit"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
