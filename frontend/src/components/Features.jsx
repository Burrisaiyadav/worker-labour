import React from 'react';
import { Shield, Clock, Users, CreditCard, Star, Phone } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Shield className="w-8 h-8 text-green-600" />,
      title: "Verified Groups",
      description: "Every labour group is verified with Aadhar and past work history checks."
    },
    {
      icon: <Clock className="w-8 h-8 text-green-600" />,
      title: "Instant Booking",
      description: "Book labour for tomorrow or next week in just a few clicks."
    },
    {
      icon: <CreditCard className="w-8 h-8 text-green-600" />,
      title: "Secure Payments",
      description: "Money is held safely and released only after work is completed."
    },
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: "Large Teams",
      description: "Find groups of any size, from 5 to 50+ workers for big harvests."
    },
    {
      icon: <Star className="w-8 h-8 text-green-600" />,
      title: "Rating System",
      description: "Hire based on ratings and reviews from other farmers."
    },
    {
      icon: <Phone className="w-8 h-8 text-green-600" />,
      title: "24/7 Support",
      description: "Dedicated support team to help resolve any disputes."
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose KisanLabour?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We simplify the process of finding and managing farm labour, making it transparent and reliable.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="p-8 bg-green-50 rounded-xl hover:shadow-lg transition duration-300">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-green-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
