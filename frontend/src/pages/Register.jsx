import React, { useState } from "react";
import {toast} from 'react-hot-toast'
import { Mail, Eye, EyeOff } from "lucide-react";
import { createUserApi } from '../services/api';
import messi from "../assets/messi.jpeg"
import futsal from "../assets/futsal.jpeg"
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const[formData, setFormData] = useState({
    name:'',
    email:'',
    password:'',
    confirmPassword:'',
    agreedToTerms:false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const validate = () => {
    if(!formData.name.trim()){
      toast.error("Username is required");
      return false;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    };

    if (!formData.password.trim()){
      toast.error("Password is required");
      return false;
    }

    if (!formData.confirmPassword.trim()){
      toast.error("Confirm Password is required");
      return false;
    }

    if(formData.password.length < 8){
      toast.error("Password must be at least 8 characters");
      return false;
    }
    if(formData.password !== formData.confirmPassword){
      toast.error('Passwords do not match');
      return false;
    }
    if (!formData.agreedToTerms) {
      toast.error("Please agree to the Terms and Conditions");
      return false;
    }


    return true;

  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!validate()) return;
    try{
      const dataToSubmit = {
        username: formData.name,
        email: formData.email,
        password: formData.password,
      }
      const response = await createUserApi(dataToSubmit);
      if(response?.data?.success){
        toast.success(response?.data?.message);
        setFormData({
          name:'',
          email:'',
          password:'',
          confirmPassword:'',
          agreedToTerms: false,
        })
      }
      else{
        toast.error(response?.data?.message);  

    }
  }catch(error){
      toast.error("Something went wrong");
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
        <div className="w-full md:w-1/2 p-6 bg-white">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Create Account
            </h1>
            <p className="text-sm text-gray-500">
              Join our futsal community today
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Name*
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

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
                  placeholder="Create a password"
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
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters.
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Confirm Password*
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                name="agreedToTerms"
                checked={formData.agreedToTerms}
                onChange={handleChange}
                className="w-4 h-4 mt-0.5 border-gray-300 rounded focus:ring-2 focus:ring-gray-900"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                I agree to the{" "}
                <span className="text-gray-900 font-semibold cursor-pointer hover:underline">
                  Terms and Conditions
                </span>
              </label>
            </div>

            {/* Button */}
            <button
              type="button"
              onClick={handleSubmit}
              className="group w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-3.5 rounded-xl font-semibold hover:shadow-xl hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
            >
            Sign Up
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


            {/* Login */}
            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <span 
              onClick={() => navigate("/login")}
              className="text-gray-900 font-semibold cursor-pointer hover:underline">
                Log in
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
};

export default Register