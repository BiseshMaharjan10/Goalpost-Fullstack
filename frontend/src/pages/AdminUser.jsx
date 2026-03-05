import { useState, useEffect } from "react";
import UserCard from "../components/UserCard";
import Navbar from "../components/Navbar";
import { getallUser } from "../services/api";

const AdminUser = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await getallUser();
        const data = res.data?.user || res.data || [];
        const normalized = data.map((u) => ({
          id: u.id,
          name: u.username,
          email: u.email,
          isVerified: u.isVerified,
          profile: u.profile,
        }));
        setUsers(normalized);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError("Failed to load users. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const totalUsers = users.length;
  const verified = users.filter((u) => u.isVerified).length;
  const unverified = users.filter((u) => !u.isVerified).length;

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex-1 ml-72 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">User Management</h1>
            <p className="text-gray-600">View and manage user accounts</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <StatCard icon="👥" value={loading ? "—" : totalUsers} label="Total Users" color="green" />
            <StatCard icon="✅" value={loading ? "—" : verified} label="Verified" color="amber" />
            <StatCard icon="⏳" value={loading ? "—" : unverified} label="Unverified" color="red" />
          </div>

          {/* Search */}
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex items-center gap-3 border border-gray-100">
            <span className="text-gray-400">🔍</span>
            <input
              className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-500">
              {error}
            </div>
          )}

          {/* User Cards */}
          {!loading && !error && (
            <div className="flex flex-col gap-4">
              {filtered.length === 0 ? (
                <p className="py-20 text-center text-sm text-gray-400">No users found.</p>
              ) : (
                filtered.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, value, label, color }) => {
  const colors = {
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-500",
  };
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm">
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${colors[color]}`}>
        {icon}
      </span>
      <div>
        <p className="text-2xl font-extrabold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
};

export default AdminUser;