import React, { useState } from "react";

const ListAllUsersNoNegativeUnits: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null); // Reset error state
    try {
      const response = await fetch("/api/users");
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.message || "Failed to fetch users.");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("An error occurred while fetching users.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Users with No Negative Units
      </h2>

      <button
        onClick={fetchUsers}
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
          {users.map((user, index) => (
            <li key={index}>
              {user.firstName} {user.lastName} ({user.username}) - {user.email} - {user.phone}
            </li>
          ))}
        </ul>
      )}

      {users.length === 0 && !isLoading && !error && (
        <p className="mt-4 text-gray-500">No users found with no negative units.</p>
      )}
    </div>
  );
};

export default ListAllUsersNoNegativeUnits;
