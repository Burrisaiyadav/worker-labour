import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="pt-24 pb-16 bg-gradient-to-br from-green-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Trusted by 50,000+ Farmers
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Connect with Trusted Labour <br />
            <span className="text-green-600">for Your Farm</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Book verified labour groups instantly. Secure payments, reliable service, and 
            hassle-free management for all your agricultural needs.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link to="/register?role=farmer" className="flex items-center justify-center px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 transition shadow-lg hover:shadow-xl">
              I'm a Farmer
              <ArrowRight className="ml-2" size={20} />
            </Link>
            <Link to="/register?role=laborer" className="flex items-center justify-center px-8 py-4 bg-white text-gray-700 text-lg font-semibold rounded-lg border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition">
              I'm a Labour Group
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t pt-12 border-green-500">
            <div>
              <div className="text-3xl font-bold text-gray-900">50k+</div>
              <div className="text-sm text-gray-500">Farmers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">1000+</div>
              <div className="text-sm text-gray-500">Labour Groups</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">₹2Cr+</div>
              <div className="text-sm text-gray-500">Payments Processed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">4.8/5</div>
              <div className="text-sm text-gray-500">Average Rating</div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-b pt-12 border-green-500">

          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
