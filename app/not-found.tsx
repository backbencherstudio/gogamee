"use client"
// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-red-500">404 - Page Not Found</h1>
      <p className="mt-4 text-lg">The page you are looking for does not exist.</p>

      {/* Back Button */}
      <button
        className="mt-8 px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
        onClick={() => window.history.back()}
      >
        Go Back
      </button>

      {/* Optional: Link to Home Page */}
      <Link href="/" className="mt-4 text-blue-500 underline">
        Go to Home Page
      </Link>
    </div>
  );
}