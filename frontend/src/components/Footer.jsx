import { Car, Github, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container-app py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-primary-600 p-2 rounded-lg">
                <Car className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Traveller</span>
            </div>
            <p className="text-gray-400 max-w-md">
              Your trusted car booking platform. Rent the perfect car for your journey 
              with ease and convenience. Quality service at competitive prices.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/cars" className="hover:text-primary-400 transition-colors">
                  Browse Cars
                </a>
              </li>
              <li>
                <a href="/my-bookings" className="hover:text-primary-400 transition-colors">
                  My Bookings
                </a>
              </li>
              <li>
                <a href="/admin" className="hover:text-primary-400 transition-colors">
                  Admin Panel
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>support@traveller.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <span>Phone: +1 (555) 123-4567</span>
              </li>
            </ul>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="hover:text-primary-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-primary-400 transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p>&copy; {new Date().getFullYear()} Traveller. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;