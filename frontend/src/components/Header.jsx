"use client";

import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';


export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Desktop Nav Links */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <img
                // 1. FIXED: This now points to a real image.
                //    Replace this with a direct link to your actual logo.
                src="https://img.icons8.com/color/48/graduation-cap.png"
                alt="Scholarship DApp"
                className="w-8 h-8"
                onError={(e) => {
                  // Your fallback SVG is great!
                  e.currentTarget.src =
                    'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%234169E1%22%3E%3Cpath d=%22M4 6h16v2H4zM2 10h20v2H2zM3 14h6v6H3zM15 14h6v6h-6z%22/%3E%3C/svg%3E';
                }}
              />
              <span className="text-xl font-bold text-gray-900">
                Scholarship DApp
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-6">
              <a
                href="/"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Home
              </a>
              
              <a
                href="#how-it-works"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                How It Works
              </a>
              <a
                href="/login"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Apply
              </a>
            </div>
          </div>

          {/* Desktop Buttons & Mobile Menu Toggle */}
          <div className="flex items-center space-x-4">
            {/* 2. FIXED: Desktop buttons are now hidden on mobile */}
            <div className="hidden md:flex items-center space-x-4">
              <button 
              onClick={() => router.push('/login')}
              className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Sign In
              </button>
              <button 
              onClick={() => router.push('/register')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all">
                Sign Up
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-700"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            {/* 2. REMOVED: Deleted the duplicate mobile-only buttons that were here */}
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            {/* Mobile Nav Links */}
            <div className="flex flex-col space-y-3">
              <a href="/" className="text-gray-700 hover:text-blue-600">
                Home
              </a>
              <a
                href="#how-it-works"
                className="text-gray-700 hover:text-blue-600"
              >
                How It Works
              </a>
              <a href="/login" className="text-gray-700 hover:text-blue-600">
                Apply
              </a>
            </div>

            {/* 2. ADDED: Mobile buttons are now inside the dropdown */}
            <div className="pt-4 mt-4 border-t border-gray-200 flex flex-col space-y-3">
              <button className="w-full text-left px-3 py-1.5 text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Sign In
              </button>
              <button className="w-full px-3 py-1.5 text-sm bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-all">
                Sign Up
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}