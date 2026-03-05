import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import messi from "../assets/messi.jpeg"
import futsal from "../assets/futsal.jpeg"
import { login } from '../services/api';
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {jwtDecode} from 'jwt-decode';


const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
      email:'',
      password:'',
    });

    const handleChange =(e) =>{
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    };

    const validate = () => {
      if(!formData.email.trim()) {
        toast.error("Email is required");
        return false;
      }

      if(!formData.password.trim()){
        toast.error("Password is required");
        return false;
      }

      return true;
    }

    const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) return // Stop if validation fails

    try {
      const response = await login(formData)
      if (!response?.data?.success) {
        toast.error("Login Failed")
        return
      }

      // Store token
      localStorage.setItem("token", response?.data?.token)
      toast.success(response?.data?.message)

      // Decode token
      let decoded
      try {
        decoded = jwtDecode(response?.data?.token)
      } catch {
        toast.error("Invalid token")
        return
      }

      // Navigate based on role
      if (decoded.role === 'admin') {
        navigate("/admindash",{replace: true})
      } else {
        navigate("/userdash",{replace: true})
      }
      window.location.reload();


    } catch (error) {
      console.error(error)
      toast.error("Something went wrong")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-2 relative">
      {/* Background Image */}
      <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${futsal})`,
            filter: 'blur(8px)',
            transform: 'scale(1.1)'
          }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />
      <div className="flex max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden relative z-10">
        {/* Left Side - Form */}
        <div className="w-full md:w-1/2 p-8 bg-white flex flex-col justify-center">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Log In Account
            </h1>
            <p className="text-sm text-gray-500">
              Login to access your account
            </p>
          </div>

          {/* Form */}
          <div className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Email*
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Password*
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
            <div className="flex items-center">
                <input
                type="checkbox"
                id="remember"
                name="rememberMe"
                className="w-4 h-4 border-gray-300 rounded focus:ring-2 focus:ring-gray-900"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                Remember Me
                </label>
            </div>
            <span 
            onClick={() => navigate("/forgot-password")}
            className="text-sm text-gray-900 font-semibold cursor-pointer hover:underline">
                Forgot password?
            </span>
            </div>

            {/* Button */}
            <button
              onClick={handleSubmit}
              className="group w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-3.5 rounded-xl font-semibold hover:shadow-xl hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
            >
            Log In
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
           
           
            {/* Sign Up Link */}
            <p className="text-center text-sm text-gray-600 mt-4">
            Don't have an account?{" "}
            <span 
            onClick={() => navigate("/")}
            className="text-gray-900 font-semibold cursor-pointer hover:underline">
                Sign up
            </span>
            </p>
          </div>  
        </div>

        {/* Right Side */}
        <div className="hidden md:block w-1/2 relative overflow-hidden">
          <img 
            src={messi} 
            alt="Futsal Court" 
            className="absolute inset-0 w-full h-full  object-cover object-right"
          />
        </div>
      </div>
    </div>
  );
}

export default Login
