'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, LogIn, GalleryVerticalEnd, AlertCircle } from 'lucide-react'
import { login } from '../../../../services/authService'

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) {
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Simple validation
      if (!formData.email || !formData.password) {
        setError('Please fill in all fields')
        setIsLoading(false)
        return
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address')
        setIsLoading(false)
        return
      }

      console.log('Attempting login with:', { email: formData.email })

      // Call login API
      const response = await login({
        email: formData.email,
        password: formData.password
      })

      console.log('Login response:', response)

      if (response.success && response.authorization?.access_token) {
        // Token is already stored in authService
        // Store additional login state for backward compatibility
        localStorage.setItem('adminLoggedIn', 'true')
        localStorage.setItem('adminEmail', formData.email)
        
        console.log('Login successful, redirecting to dashboard...')
        
        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        setError(response.message || 'Invalid credentials')
      }
    } catch (err) {
      console.error('Login error:', err)
      const errorMessage = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (err as Error)?.message || 'Login failed. Please try again.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md w-full space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center items-center mb-6">
          <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-[#76C043] text-white shadow-lg">
            <GalleryVerticalEnd className="w-8 h-8" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 font-['Poppins']">
          Admin Login
        </h2>
        {/* <p className="mt-2 text-sm text-gray-600 font-['Poppins']">
          Sign in to access the GoGame admin dashboard
        </p> */}
      </div>

      {/* Login Form */}
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span className="text-red-700 text-sm font-['Poppins']">{error}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 font-['Poppins']">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg font-['Poppins'] focus:outline-none focus:ring-2 focus:ring-[#76C043]/20 focus:border-[#76C043] transition-colors"
                placeholder="Enter your email address"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 font-['Poppins']">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg font-['Poppins'] focus:outline-none focus:ring-2 focus:ring-[#76C043]/20 focus:border-[#76C043] transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#76C043] focus:ring-[#76C043] border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 font-['Poppins']">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-[#76C043] hover:text-lime-600 transition-colors font-['Poppins']">
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center gap-3 py-3 px-4 border border-transparent rounded-lg font-medium font-['Poppins'] transition-all duration-200 ${
                  isLoading
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-[#76C043] hover:bg-lime-600 text-white shadow-sm hover:shadow-md'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Sign in
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </form>

      {/* Footer */}
      <div className="text-center">
        <p className="text-xs text-gray-500 font-['Poppins']">
          © 2025 GoGame. All rights reserved.
        </p>
      </div>
    </div>
  )
}