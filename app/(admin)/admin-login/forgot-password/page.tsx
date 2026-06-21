"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { GalleryVerticalEnd, ArrowLeft, Mail, KeyRound, Eye, EyeOff, Save, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"request" | "verify" | "success">("request");
  const [email, setEmail] = useState("");
  const [formData, setFormData] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message || "Failed to send OTP.");
        return;
      }
      
      setStep("verify");
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.otp) {
      setError("Please enter the OTP sent to your email.");
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: formData.otp,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message || "Invalid OTP or server error.");
        return;
      }

      setStep("success");
    } catch (err) {
      setError("Failed to reset password. Invalid OTP or server error.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center items-center mb-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-[#76C043] text-white shadow-lg">
              <GalleryVerticalEnd className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 font-['Poppins']">
            {step === "request" && "Forgot Password"}
            {step === "verify" && "Reset Password"}
            {step === "success" && "Password Reset Complete"}
          </h2>
          <p className="mt-2 text-sm text-gray-600 font-['Poppins']">
            {step === "request" && "Enter your email address and we'll send you an OTP to reset your password."}
            {step === "verify" && `We've sent an OTP to ${email}. Please enter it below along with your new password.`}
            {step === "success" && "Your password has been successfully reset. You can now log in with your new password."}
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span className="text-red-700 text-sm font-['Poppins']">{error}</span>
            </div>
          )}

          {step === "request" && (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 font-['Poppins']">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg font-['Poppins'] focus:outline-none focus:ring-2 focus:ring-[#76C043]/20 focus:border-[#76C043] transition-colors"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center items-center gap-3 py-3 px-4 border border-transparent rounded-lg font-medium font-['Poppins'] transition-all duration-200 ${
                    isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#76C043] hover:bg-lime-600 text-white shadow-sm hover:shadow-md"
                  }`}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Mail className="w-5 h-5 text-white" />
                  )}
                  <span className="text-white">{isLoading ? "Sending..." : "Send OTP"}</span>
                </button>
              </div>
            </form>
          )}

          {step === "verify" && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2 font-['Poppins']">
                  OTP Code
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  value={formData.otp}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg font-['Poppins'] focus:outline-none focus:ring-2 focus:ring-[#76C043]/20 focus:border-[#76C043] transition-colors tracking-widest text-center"
                  placeholder="• • • • • •"
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2 font-['Poppins']">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showNew ? "text" : "password"}
                    required
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg font-['Poppins'] focus:outline-none focus:ring-2 focus:ring-[#76C043]/20 focus:border-[#76C043] transition-colors"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2 font-['Poppins']">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg font-['Poppins'] focus:outline-none focus:ring-2 focus:ring-[#76C043]/20 focus:border-[#76C043] transition-colors"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center items-center gap-3 py-3 px-4 border border-transparent rounded-lg font-medium font-['Poppins'] transition-all duration-200 ${
                    isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#76C043] hover:bg-lime-600 text-white shadow-sm hover:shadow-md"
                  }`}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save className="w-5 h-5 text-white" />
                  )}
                  <span className="text-white">{isLoading ? "Resetting..." : "Reset Password"}</span>
                </button>
              </div>
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={isLoading}
                  className="text-sm font-medium text-gray-600 hover:text-[#76C043] transition-colors font-['Poppins']"
                >
                  Didn't receive the code? Resend OTP
                </button>
              </div>
            </form>
          )}

          {step === "success" && (
            <div className="text-center pt-2">
              <Link
                href="/admin-login"
                className="w-full inline-flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg font-medium font-['Poppins'] transition-all duration-200 bg-[#76C043] hover:bg-lime-600 text-white shadow-sm hover:shadow-md"
              >
                Go to Login Page
              </Link>
            </div>
          )}

          {step !== "success" && (
            <div className="mt-6 text-center">
              <Link
                href="/admin-login"
                className="inline-flex items-center text-sm font-medium text-[#76C043] hover:text-lime-600 transition-colors font-['Poppins']"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
