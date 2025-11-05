"use client";

import { Code2, Database, Wallet, Blocks } from 'lucide-react';
import { useState } from 'react';

const technologies = [
  {
    name: 'Rise In',
    description: 'Bootcamp Partner',
    logo: '/risein.png',
    fallbackIcon: Code2,
  },
  {
    name: 'Stellar',
    description: 'Blockchain Network',
    logo: '/stellar-xlm-logo.svg',
    fallbackIcon: Blocks,
  },
  {
    name: 'Freighter',
    description: 'Wallet Integration',
    logo: '/frieghter.png',
    fallbackIcon: Wallet,
  },
  {
    name: 'Firebase',
    description: 'Authentication',
    logo: '/firebaselogo.png',
    fallbackIcon: Database,
  },
];

export default function TechnologyShowcase() {
  // 1. REMOVED: <Record<string, boolean>>
  const [logoErrors, setLogoErrors] = useState({});

  // 2. REMOVED: : string
  const handleLogoError = (name) => {
    setLogoErrors((prev) => ({ ...prev, [name]: true }));
  };

  return (
    <section className="py-20 bg-linear-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Powered By Leading Technologies
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Built on a robust stack of industry-standard technologies and
            partners
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {technologies.map((tech, index) => {
            const Icon = tech.fallbackIcon;
            const showIcon = logoErrors[tech.name];

            return (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 bg-blue-100 rounded-lg h-16 w-16 flex items-center justify-center overflow-hidden">
                    {!showIcon ? (
                      <img
                        src={tech.logo}
                        alt={tech.name}
                        className="max-w-full max-h-full object-contain"
                        onError={() => handleLogoError(tech.name)}
                      />
                    ) : (
                      <Icon className="w-8 h-8 text-blue-600" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {tech.name}
                  </h3>
                  <p className="text-sm text-gray-600">{tech.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h3 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
            How It All Works Together
          </h3>

          <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0 md:space-x-4">
            <div className="flex flex-col items-center text-center space-y-2 flex-1">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Code2 className="w-8 h-8 text-blue-600" />
              </div>
              <div className="font-semibold text-gray-900">Student</div>
              <div className="text-sm text-gray-600">Applies via DApp</div>
            </div>

            <div className="hidden md:block">
              <div className="w-8 h-0.5 bg-linear-to-r from-blue-600 to-purple-600" />
            </div>

            <div className="flex flex-col items-center text-center space-y-2 flex-1">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center p-2">
                <img 
                  src="/firebaselogo.png" 
                  alt="Firebase" 
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="font-semibold text-gray-900">Firebase</div>
              <div className="text-sm text-gray-600">Secure Auth</div>
            </div>

            <div className="hidden md:block">
              <div className="w-8 h-0.5 bg-linear-to-r from-purple-600 to-blue-600" />
            </div>

            <div className="flex flex-col items-center text-center space-y-2 flex-1">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center p-2">
                <img 
                  src="/stellar-xlm-logo.svg" 
                  alt="Stellar" 
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="font-semibold text-gray-900">Stellar</div>
              <div className="text-sm text-gray-600">Blockchain</div>
            </div>

            <div className="hidden md:block">
              <div className="w-8 h-0.5 bg-linear-to-r from-blue-600 to-green-600" />
            </div>

            <div className="flex flex-col items-center text-center space-y-2 flex-1">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center p-2">
                <img 
                  src="/frieghter.png" 
                  alt="Freighter" 
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="font-semibold text-gray-900">Freighter</div>
              <div className="text-sm text-gray-600">Instant Payment</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}