import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <span className="text-2xl font-bold text-green-500 mb-4 block">Labour</span>
            <p className="text-gray-400">
              Connecting farmers with trusted labour groups across India.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-green-400">Home</a></li>
              <li><a href="#features" className="hover:text-green-400">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-green-400">How it Works</a></li>
              <li><a href="#testimonials" className="hover:text-green-400">Reviews</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-green-400">Help Center</a></li>
              <li><a href="#" className="hover:text-green-400">Safety Guidelines</a></li>
              <li><a href="#" className="hover:text-green-400">Terms of Service</a></li>
              <li><a href="#" className="hover:text-green-400">Privacy Policy</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li>support@labour.com</li>
              <li>+91 6301910135</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
          <p>© 2025 Labour. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
