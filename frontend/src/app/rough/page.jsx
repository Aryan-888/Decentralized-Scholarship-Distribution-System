"use client";
import { Shield, Zap, Eye } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Blockchain Security',
    description: 'Secured by Stellar Network',
    detail: 'Every transaction is cryptographically secured and immutably recorded on the Stellar blockchain, ensuring the highest level of security.',
    color: 'blue',
  },
  {
    icon: Zap,
    title: 'Instant Payments',
    description: 'Direct wallet transfers via Freighter',
    detail: 'Receive scholarships directly to your Freighter wallet in seconds, eliminating traditional banking delays and intermediaries.',
    color: 'yellow',
  },
  {
    icon: Eye,
    title: 'Full Transparency',
    description: 'Track every transaction on blockchain',
    detail: 'Monitor the entire scholarship distribution process from application to disbursement with complete transparency and accountability.',
    color: 'purple',
  },
];

export default function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Choose Our Platform
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Built with cutting-edge blockchain technology to revolutionize scholarship distribution
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colorClasses = {
              blue: 'from-blue-500 to-blue-600',
              yellow: 'from-yellow-500 to-orange-500',
              purple: 'from-purple-500 to-purple-600',
            }[feature.color];

            return (
              <div
                key={index}
                className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-transparent hover:-translate-y-2"
              >
                <div className={`absolute inset-0 bg-linear-to-br ${colorClasses} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`} />

                <div className={`inline-flex p-4 rounded-xl bg-linear-to-br ${colorClasses} mb-6 shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>

                <p className="text-blue-600 font-semibold mb-4">
                  {feature.description}
                </p>

                <p className="text-gray-600 leading-relaxed">
                  {feature.detail}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
