import React, { useState } from "react";
import { Mail, ArrowRight, Lock, CheckCircle } from "lucide-react";
import { forgotPassword } from "../services/api";

const ForgetPass = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false); // Track if email was sent
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await forgotPassword({ email });

      setMessage({ 
        type: "success", 
        text: response.data.message || "Password reset link sent to your email!" 
      });
      
      setEmailSent(true); // Show "Check Email" view
      // NO REDIRECT - Stay on same page

    } catch (error) {
      setMessage({ 
        type: "error", 
        text: error.response?.data?.message || "Failed to send reset link" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setEmailSent(false);
    setEmail("");
    setMessage({ type: "", text: "" });
  };

  // If email was sent successfully, show "Check Your Email" view
  if (emailSent) {
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
          {/* Left Side - Content */}
          <div className="w-full md:w-1/2 p-12 bg-gradient-to-br from-gray-50 to-white flex flex-col justify-center relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-100 to-blue-100 rounded-full blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10 text-center">
              {/* Success Icon */}
              <div className="mb-6 inline-flex p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-lg">
                <Mail className="text-white" size={48} />
              </div>

              {/* Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent mb-3">
                  Check Your Email
                </h1>
                <p className="text-gray-600 text-base leading-relaxed max-w-md mx-auto">
                  We've sent a password reset link to
                </p>
                <p className="text-gray-900 font-semibold text-lg mt-2">
                  {email}
                </p>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8 text-left">
                <h3 className="font-semibold text-blue-900 mb-3">Next Steps:</h3>
                <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                  <li>Check your email inbox for a message from GoalPost</li>
                  <li>Click the "Reset Password" button in the email</li>
                  <li>You'll be redirected to create your new password</li>
                  <li>Don't forget to check your spam folder!</li>
                </ol>
              </div>

              {/* Note */}
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-8">
                <p className="text-xs text-yellow-800">
                  ⏰ <strong>Important:</strong> The reset link will expire in 1 hour for security reasons.
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <button
                  onClick={() => window.location.href = "/login"}
                  className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-3.5 rounded-xl font-semibold hover:shadow-xl hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Back to Login
                  <ArrowRight size={20} />
                </button>

                <button
                  onClick={handleResend}
                  className="w-full border-2 border-gray-300 text-gray-700 py-3.5 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                >
                  Didn't receive email? Try again
                </button>
              </div>
            </div>
          </div>

          {/* Right Side */}
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
  }

  // Default: Show email input form
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
              <Lock className="text-white" size={32} />
            </div>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent mb-3">
                Forgot Password?
              </h1>
              <p className="text-gray-600 text-base leading-relaxed">
                No worries! Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {/* Error Message */}
            {message.type === "error" && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border-2 border-red-200 text-red-800">
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-900 transition-colors" size={20} />
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    required
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className="group w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-3.5 rounded-xl font-semibold hover:shadow-xl hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
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

              {/* Back to Login */}
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

        {/* Right Side */}
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
}

export default ForgetPass;