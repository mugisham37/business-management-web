"use client";

import Link from "next/link";

export default function AuthPage() {
  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                angle
              </Link>
            </div>
            <div>
              <Link
                href="/"
                className="text-sm font-medium text-gray-700 hover:text-indigo-600"
              >
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex min-h-screen">
        <div className="w-full md:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold mb-2">Create your account</h1>
              <p className="text-gray-600">
                Start building beautiful interfaces today
              </p>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-4 mb-6">
              <button className="w-full flex items-center justify-center gap-3 p-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-gray-700 font-medium">
                  Sign up with Google
                </span>
              </button>

              <button className="w-full flex items-center justify-center gap-3 p-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="#000000"
                >
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.95 3.617 9.068 8.343 9.833V14.5H7.667v-2.5h2.676v-1.9c0-2.633 1.567-4.1 3.977-4.1 1.15 0 2.356.2 2.356.2v2.6h-1.33c-1.307 0-1.713.812-1.713 1.643V12h2.917l-.467 2.5h-2.45v7.333C18.383 21.068 22 16.95 22 12z" />
                </svg>
                <span className="text-gray-700 font-medium">
                  Sign up with Facebook
                </span>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center mb-6">
              <div className="flex-grow h-px bg-gray-200"></div>
              <span className="px-3 text-gray-500 text-sm">or with email</span>
              <div className="flex-grow h-px bg-gray-200"></div>
            </div>

            {/* Form */}
            <form className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    First name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Last name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Must be at least 8 characters
                </p>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-600 mt-1"
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                  I agree to the{" "}
                  <a href="#" className="text-indigo-600 hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-indigo-600 hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition"
              >
                Create account
              </button>
            </form>

            <p className="text-center mt-8 text-sm text-gray-600">
              Already have an account?{" "}
              <a
                href="#"
                className="text-indigo-600 font-medium hover:underline"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="hidden md:block md:w-1/2 bg-indigo-600">
          <div className="h-full flex items-center justify-center p-12">
            <div className="max-w-lg text-white">
              <h2 className="text-3xl font-bold mb-6">
                Build beautiful interfaces with Angle
              </h2>
              <p className="text-xl text-indigo-100 mb-8">
                Join thousands of developers and designers who are already using
                Angle to create stunning web applications.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-2">
                  <img
                    className="w-10 h-10 rounded-full border-2 border-indigo-600"
                    src="https://randomuser.me/api/portraits/women/32.jpg"
                    alt="User avatar"
                  />
                  <img
                    className="w-10 h-10 rounded-full border-2 border-indigo-600"
                    src="https://randomuser.me/api/portraits/men/46.jpg"
                    alt="User avatar"
                  />
                  <img
                    className="w-10 h-10 rounded-full border-2 border-indigo-600"
                    src="https://randomuser.me/api/portraits/women/68.jpg"
                    alt="User avatar"
                  />
                </div>
                <p className="text-indigo-100">Join our community of creators</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
