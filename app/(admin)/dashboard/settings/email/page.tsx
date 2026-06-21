"use client";
import React, { useState } from "react";
import { Mail, CheckCircle, Save, AlertCircle, ShieldCheck } from "lucide-react";

export default function ChangeEmailPage() {
  const [step, setStep] = useState<
    "request_old" | "verify_old" | "request_new" | "verify_new" | "success"
  >("request_old");
  
  const [formData, setFormData] = useState({
    currentEmail: "",
    oldOtp: "",
    newEmail: "",
    newOtp: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSendOldOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(formData.currentEmail)) {
      setError("Please enter a valid current email address.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/settings/email/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.currentEmail, type: "old" }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message || "Failed to send OTP.");
        return;
      }
      setStep("verify_old");
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOldOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.oldOtp || formData.oldOtp.length < 4) {
      setError("Please enter a valid OTP.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/settings/email/verify-old-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.currentEmail, otp: formData.oldOtp }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message || "Invalid OTP.");
        return;
      }
      setStep("request_new");
    } catch (err) {
      setError("Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendNewOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(formData.newEmail)) {
      setError("Please enter a valid new email address.");
      return;
    }
    if (formData.newEmail === formData.currentEmail) {
      setError("New email must be different from current email.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/settings/email/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.newEmail, type: "new" }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message || "Failed to send OTP.");
        return;
      }
      setStep("verify_new");
    } catch (err) {
      setError("Failed to send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyNewOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.newOtp || formData.newOtp.length < 4) {
      setError("Please enter a valid OTP.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/settings/email/verify-new-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentEmail: formData.currentEmail,
          oldOtp: formData.oldOtp,
          newEmail: formData.newEmail,
          newOtp: formData.newOtp,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message || "Invalid OTP or server error.");
        return;
      }
      localStorage.setItem("adminEmail", formData.newEmail);
      setStep("success");
    } catch (err) {
      setError("Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-4 min-h-screen mb-4 p-4 flex flex-col items-center">
      <div className="w-full max-w-2xl flex flex-col gap-2 mb-8 text-center pt-8">
        <h1 className="text-zinc-950 text-3xl md:text-4xl lg:text-4xl font-semibold font-['Poppins'] leading-tight">
          Change Email
        </h1>
        <p className="text-sm text-gray-600 font-['Poppins']">
          Update your account's primary email address securely. You'll need to verify both your current and new email.
        </p>
      </div>

      <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 md:p-10 flex flex-col items-center">
          {error && (
            <div className="w-full max-w-md mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span className="text-red-700 text-sm font-['Poppins']">{error}</span>
            </div>
          )}

          {step === "request_old" && (
            <form onSubmit={handleSendOldOTP} className="w-full max-w-md space-y-6">
              <div className="text-center mb-6">
                <ShieldCheck className="w-12 h-12 text-[#76C043] mx-auto mb-2" />
                <h2 className="text-lg font-semibold text-gray-800 font-['Poppins']">Step 1: Verify Identity</h2>
                <p className="text-sm text-gray-500 font-['Poppins']">Enter your current email to receive a verification OTP.</p>
              </div>
              <div>
                <label htmlFor="currentEmail" className="block text-sm font-medium text-gray-700 mb-2 font-['Poppins']">
                  Current Email Address
                </label>
                <input
                  id="currentEmail"
                  name="currentEmail"
                  type="email"
                  required
                  value={formData.currentEmail}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg font-['Poppins'] focus:outline-none focus:ring-2 focus:ring-[#76C043]/20 focus:border-[#76C043] transition-colors"
                  placeholder="Enter your current email"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center gap-2 py-3 px-6 border border-transparent rounded-lg font-medium font-['Poppins'] transition-all duration-200 ${
                  isLoading ? "bg-gray-400 text-white cursor-not-allowed" : "bg-[#76C043] hover:bg-lime-600 text-white shadow-sm hover:shadow-md"
                }`}
              >
                {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Mail className="w-5 h-5" />}
                {isLoading ? "Sending..." : "Send Verification Code"}
              </button>
            </form>
          )}

          {step === "verify_old" && (
            <form onSubmit={handleVerifyOldOTP} className="w-full max-w-md space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 font-['Poppins'] mb-6 text-center">
                We've sent an OTP to <strong>{formData.currentEmail}</strong>.
              </div>
              <div>
                <label htmlFor="oldOtp" className="block text-sm font-medium text-gray-700 mb-2 font-['Poppins']">
                  Current Email OTP
                </label>
                <input
                  id="oldOtp"
                  name="oldOtp"
                  type="text"
                  required
                  value={formData.oldOtp}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg font-['Poppins'] focus:outline-none focus:ring-2 focus:ring-[#76C043]/20 focus:border-[#76C043] transition-colors tracking-widest text-center text-lg"
                  placeholder="• • • • • •"
                />
              </div>
              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center items-center gap-2 py-3 px-6 border border-transparent rounded-lg font-medium font-['Poppins'] transition-all duration-200 ${
                    isLoading ? "bg-gray-400 text-white cursor-not-allowed" : "bg-[#76C043] hover:bg-lime-600 text-white shadow-sm hover:shadow-md"
                  }`}
                >
                  {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <ShieldCheck className="w-5 h-5" />}
                  {isLoading ? "Verifying..." : "Verify Identity"}
                </button>
                <div className="flex justify-between items-center w-full">
                  <button type="button" onClick={() => setStep("request_old")} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                    Go Back
                  </button>
                  <button type="button" onClick={handleSendOldOTP} disabled={isLoading} className="text-sm font-medium text-[#76C043] hover:text-lime-600 transition-colors">
                    Resend OTP
                  </button>
                </div>
              </div>
            </form>
          )}

          {step === "request_new" && (
            <form onSubmit={handleSendNewOTP} className="w-full max-w-md space-y-6">
              <div className="text-center mb-6">
                <Mail className="w-12 h-12 text-[#76C043] mx-auto mb-2" />
                <h2 className="text-lg font-semibold text-gray-800 font-['Poppins']">Step 2: New Email</h2>
                <p className="text-sm text-gray-500 font-['Poppins']">Enter your new email address for verification.</p>
              </div>
              <div>
                <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 mb-2 font-['Poppins']">
                  New Email Address
                </label>
                <input
                  id="newEmail"
                  name="newEmail"
                  type="email"
                  required
                  value={formData.newEmail}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg font-['Poppins'] focus:outline-none focus:ring-2 focus:ring-[#76C043]/20 focus:border-[#76C043] transition-colors"
                  placeholder="Enter your new email"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center gap-2 py-3 px-6 border border-transparent rounded-lg font-medium font-['Poppins'] transition-all duration-200 ${
                  isLoading ? "bg-gray-400 text-white cursor-not-allowed" : "bg-[#76C043] hover:bg-lime-600 text-white shadow-sm hover:shadow-md"
                }`}
              >
                {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Mail className="w-5 h-5" />}
                {isLoading ? "Sending..." : "Send Verification Code"}
              </button>
            </form>
          )}

          {step === "verify_new" && (
            <form onSubmit={handleVerifyNewOTP} className="w-full max-w-md space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 font-['Poppins'] mb-6 text-center">
                We've sent an OTP to <strong>{formData.newEmail}</strong>.
              </div>
              <div>
                <label htmlFor="newOtp" className="block text-sm font-medium text-gray-700 mb-2 font-['Poppins']">
                  New Email OTP
                </label>
                <input
                  id="newOtp"
                  name="newOtp"
                  type="text"
                  required
                  value={formData.newOtp}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg font-['Poppins'] focus:outline-none focus:ring-2 focus:ring-[#76C043]/20 focus:border-[#76C043] transition-colors tracking-widest text-center text-lg"
                  placeholder="• • • • • •"
                />
              </div>
              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center items-center gap-2 py-3 px-6 border border-transparent rounded-lg font-medium font-['Poppins'] transition-all duration-200 ${
                    isLoading ? "bg-gray-400 text-white cursor-not-allowed" : "bg-[#76C043] hover:bg-lime-600 text-white shadow-sm hover:shadow-md"
                  }`}
                >
                  {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="w-5 h-5" />}
                  {isLoading ? "Verifying..." : "Verify & Update Email"}
                </button>
                <div className="flex justify-between items-center w-full">
                  <button type="button" onClick={() => setStep("request_new")} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                    Go Back
                  </button>
                  <button type="button" onClick={handleSendNewOTP} disabled={isLoading} className="text-sm font-medium text-[#76C043] hover:text-lime-600 transition-colors">
                    Resend OTP
                  </button>
                </div>
              </div>
            </form>
          )}

          {step === "success" && (
             <div className="w-full max-w-md text-center py-8">
              <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-6">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 font-['Poppins'] mb-2">
                Email Updated Successfully!
              </h3>
              <p className="text-gray-600 font-['Poppins']">
                Your account's primary email address is now <strong>{formData.newEmail}</strong>. You'll use this new email to log in from now on.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
