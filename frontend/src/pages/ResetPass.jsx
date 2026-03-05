import React, { useState } from "react";
import { Eye, EyeOff, Lock, Shield, ArrowRight, CheckCircle } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/api"; // Make sure this path is correct!
import toast from "react-hot-toast";

const Resetpass = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    // Client-side validation
    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters long" });
      toast.error("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    try {
      const response = await resetPassword(token, { password, confirmPassword });

      setMessage({ 
        type: "success", 
        text: response.data.message || "Password reset successful!" 
      });
      toast.success("Password reset successful!");
      
      // Clear form
      setPassword("");
      setConfirmPassword("");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to reset password";
      setMessage({ 
        type: "error", 
        text: errorMsg
      });
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-2 relative">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=1200)`,
          filter: 'blur(8px)',
          transform: 'scale(1.1)'
        }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />
      
      <div className="flex max-w-6xl w-full min-h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden relative z-10">
        {/* Left Side - Form */}
        <div className="w-full md:w-1/2 p-12 bg-gradient-to-br from-gray-50 to-white flex flex-col justify-center relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-100 to-blue-100 rounded-full blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10">
            {/* Icon */}
            <div className="mb-6 inline-flex p-4 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl shadow-lg">
              <Shield className="text-white" size={32} />
            </div>

            {/* Header */}
            <div className="mb-8">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent mb-3">
                Reset Password
              </h2>
              <p className="text-gray-600 text-base leading-relaxed">
                Create a strong password to secure your account
              </p>
            </div>

            {/* Success/Error Message */}
            {message.text && (
              <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${
                message.type === "success" 
                  ? "bg-green-50 border-2 border-green-200 text-green-800" 
                  : "bg-red-50 border-2 border-red-200 text-red-800"
              }`}>
                {message.type === "success" && <CheckCircle size={20} className="mt-0.5 flex-shrink-0" />}
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  New Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-900 transition-colors" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your new password"
                    required
                    disabled={loading}
                    className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-900 transition-colors" size={20} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    required
                    disabled={loading}
                    className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-900 mb-2">Password Requirements:</p>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li className="flex items-center gap-2">
                    <span className={password.length >= 8 ? "text-green-600" : "text-gray-400"}>
                      {password.length >= 8 ? "✓" : "○"}
                    </span>
                    At least 8 characters long
                  </li>
                </ul>
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className="group w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-3.5 rounded-xl font-semibold hover:shadow-xl hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? "Resetting..." : "Reset Password"}
                {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gradient-to-br from-gray-50 to-white text-gray-500">
                    or
                  </span>
                </div>
              </div>

              {/* Remember Password - Login */}
              <p className="text-center text-sm text-gray-600">
                Remember your password?{" "}
                <a 
                  href="/login"
                  className="text-gray-900 font-bold cursor-pointer hover:underline inline-flex items-center gap-1 group">
                  Log in
                </a>
              </p>
            </form>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="hidden md:block w-1/2 relative overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800" 
            alt="Soccer Player" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
      </div>
    </div>
  );
};

export default Resetpass;