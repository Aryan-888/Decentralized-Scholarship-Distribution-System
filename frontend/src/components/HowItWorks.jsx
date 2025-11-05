"use client";
import { Wallet, FileText, CheckCircle, Coins } from 'lucide-react';

// Logo Components using local assets
const FreighterLogo = ({ className }) => (
  <img 
    src="/frieghter.png" 
    alt="Freighter Wallet" 
    className={className}
    style={{ filter: 'none' }} // Makes it white for dark backgrounds
  />
);

const StellarLogo = ({ className }) => (
  <img 
    src="/stellar-xlm-logo.svg" 
    alt="Stellar Network" 
    className={className}
    style={{ filter: 'brightness(0) invert(1)' }} // Makes it white for dark backgrounds
  />
);

const FirebaseLogo = ({ className }) => (
  <img 
    src="/firebaselogo.png" 
    alt="Firebase" 
    className={className}
    style={{ 
      transform: 'scale(1.5)' // Zoom Firebase logo, removed problematic filter
    }}
  />
);

const RiseInLogo = ({ className }) => (
  <img 
    src="/risein.png" 
    alt="Rise In" 
    className={className}
    style={{ 
      transform: 'scale(1.5)' // Zoom Rise In logo, removed problematic filter
    }}
  />
);

const steps = [
  {
    number: '01',
    icon: FreighterLogo,
    title: 'Connect Freighter Wallet',
    description: 'Install the Freighter wallet extension and connect it to our DApp securely. Your wallet address will be used to receive scholarship funds directly.',
    brandColor: 'from-purple-600 to-blue-600',
    bgColor: 'from-purple-50 to-blue-50',
  },
  {
    number: '02',
    icon: FirebaseLogo,
    title: 'Submit Application',
    description: 'Fill out a simple application form with your academic details. All data is encrypted and stored securely with Firebase authentication.',
    brandColor: 'from-orange-500 to-yellow-500',
    bgColor: 'from-orange-50 to-yellow-50',
  },
  {
    number: '03',
    icon: RiseInLogo,
    title: 'Admin Review',
    description: 'Educational institutions review applications through the admin portal. Built with Rise In bootcamp best practices for transparency.',
    brandColor: 'from-green-600 to-emerald-600',
    bgColor: 'from-green-50 to-emerald-50',
  },
  {
    number: '04',
    icon: StellarLogo,
    title: 'Receive Funds',
    description: 'Approved scholarships are instantly transferred to your wallet via Stellar network. Track your transaction in real-time on the blockchain.',
    brandColor: 'from-blue-600 to-cyan-600',
    bgColor: 'from-blue-50 to-cyan-50',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Four simple steps to receive your scholarship through cutting-edge blockchain technology
          </p>
          <div className="mt-8 flex flex-wrap justify-center items-center gap-8 opacity-60">
            <span className="text-sm font-medium text-gray-500">Powered by:</span>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <img 
                  src="/frieghter.png" 
                  alt="Freighter Wallet" 
                  className="w-5 h-5 object-contain"
                  style={{ filter: 'none' }}
                />
                <span className="text-sm font-medium text-gray-600">Freighter</span>
              </div>
              <div className="flex items-center gap-2">
                <img 
                  src="/stellar-xlm-logo.svg" 
                  alt="Stellar Network" 
                  className="w-5 h-5 object-contain"
                  style={{ filter: 'none' }}
                />
                <span className="text-sm font-medium text-gray-600">Stellar</span>
              </div>
              <div className="flex items-center gap-2">
                <img 
                  src="/firebaselogo.png" 
                  alt="Firebase" 
                  className="w-6 h-6 object-contain"
                />
                <span className="text-sm font-medium text-gray-600">Firebase</span>
              </div>
              <div className="flex items-center gap-2">
                <img 
                  src="/risein.png" 
                  alt="Rise In" 
                  className="w-6 h-6 object-contain"
                />
                <span className="text-sm font-medium text-gray-600">Rise In</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="relative group"
              >
                <div className={`bg-linear-to-br ${step.bgColor} rounded-2xl p-8 h-full hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200 group-hover:scale-105`}>
                  <div className={`absolute -top-4 -left-4 w-12 h-12 bg-linear-to-br ${step.brandColor} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                    {step.number}
                  </div>

                  <div className="mb-6 mt-4">
                    <div className={`inline-flex p-4 bg-linear-to-br ${step.brandColor} rounded-xl shadow-md`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>

                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <div className={`w-8 h-0.5 bg-linear-to-r ${step.brandColor}`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <button className="px-8 py-4 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:shadow-xl transition-all">
            <a href="/login">Start Your Application</a>
          </button>
        </div>
      </div>
    </section>
  );
}
