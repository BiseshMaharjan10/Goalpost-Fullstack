const API_BASE = import.meta.env.VITE_API_BASE_URL;

const UserCard = ({ user }) => {
  return (
    <div className="relative rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-full border border-gray-200">
          {user.profile ? (
            <img
              src={`${API_BASE}${user.profile}`}
              alt={user.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-full bg-green-100 text-base font-bold text-green-700">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-500">✉️ {user.email}</p>

          <div className="mt-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                user.isVerified
                  ? "bg-green-50 text-green-600"
                  : "bg-yellow-50 text-yellow-600"
              }`}
            >
              {user.isVerified ? "✅ Verified" : "⏳ Unverified"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;