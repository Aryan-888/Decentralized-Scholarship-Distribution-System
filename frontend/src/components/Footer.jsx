"use client";

import { GraduationCap, Github, FileText, Mail, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <GraduationCap className="w-8 h-8 text-blue-400" />
              <span className="text-xl font-bold text-white">Scholarship DApp</span>
            </div>
            <p className="text-gray-400 mb-4 leading-relaxed">
              A decentralized scholarship distribution platform built on Stellar blockchain, enabling transparent and instant educational funding.
            </p>
            <div className="flex items-center space-x-2 text-sm">
              <div className="px-3 py-1 bg-blue-600 rounded-full text-white font-medium">
                Powered by Stellar
              </div>
              <div className="px-3 py-1 bg-purple-600 rounded-full text-white font-medium">
                Freighter Wallet
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#home" className="hover:text-blue-400 transition-colors">Home</a>
              </li>
              <li>
                <a href="#about" className="hover:text-blue-400 transition-colors">About</a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-blue-400 transition-colors">How It Works</a>
              </li>
              <li>
                <a href="#apply" className="hover:text-blue-400 transition-colors">Apply</a>
              </li>
              <li>
                <a href="#admin" className="hover:text-blue-400 transition-colors">Admin Portal</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#docs" className="hover:text-blue-400 transition-colors flex items-center space-x-1">
                  <FileText className="w-4 h-4" />
                  <span>Documentation</span>
                </a>
              </li>
              <li>
                <a href="#github" className="hover:text-blue-400 transition-colors flex items-center space-x-1">
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
              </li>
              <li>
                <a href="#stellar" className="hover:text-blue-400 transition-colors flex items-center space-x-1">
                  <ExternalLink className="w-4 h-4" />
                  <span>Stellar Network</span>
                </a>
              </li>
              <li>
                <a href="#freighter" className="hover:text-blue-400 transition-colors flex items-center space-x-1">
                  <ExternalLink className="w-4 h-4" />
                  <span>Freighter Wallet</span>
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-blue-400 transition-colors flex items-center space-x-1">
                  <Mail className="w-4 h-4" />
                  <span>Contact</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-400">
                🎓 Proudly developed during <span className="text-blue-400 font-semibold">Rise In Bootcamp 2025</span>
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Powered by Stellar Blockchain & Freighter Wallet
              </p>
            </div>

            <div className="flex space-x-6 text-sm">
              <a href="#terms" className="hover:text-blue-400 transition-colors">
                Terms
              </a>
              <a href="#privacy" className="hover:text-blue-400 transition-colors">
                Privacy Policy
              </a>
              <a href="#contact" className="hover:text-blue-400 transition-colors">
                Contact
              </a>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Scholarship DApp. Built with blockchain technology for educational empowerment.
          </div>
        </div>
      </div>
    </footer>
  );
}
