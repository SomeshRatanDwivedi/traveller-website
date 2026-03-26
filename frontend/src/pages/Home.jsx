import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, Shield, Clock, CreditCard } from 'lucide-react';
import { carsAPI } from '../services/api';
import CarCard from '../components/CarCard';
import { CarCardSkeleton } from '../components/Loading';

const Home = () => {
  const [featuredCars, setFeaturedCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await carsAPI.getAll({ limit: 6, available: 'true' });
        setFeaturedCars(response.data.cars);
      } catch (error) {
        console.error('Error fetching cars:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  const features = [
    {
      icon: <Car className="w-8 h-8 text-primary-600" />,
      title: 'Wide Selection',
      description: 'Choose from a variety of cars including SUVs, Sedans, and Hatchbacks',
    },
    {
      icon: <Shield className="w-8 h-8 text-primary-600" />,
      title: 'Secure Booking',
      description: 'Your bookings are protected and confirmed instantly',
    },
    {
      icon: <Clock className="w-8 h-8 text-primary-600" />,
      title: '24/7 Support',
      description: 'Round-the-clock customer support for all your needs',
    },
    {
      icon: <CreditCard className="w-8 h-8 text-primary-600" />,
      title: 'Best Prices',
      description: 'Competitive pricing with no hidden fees',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20 lg:py-32">
        <div className="container-app">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Rent the Perfect Car for Your Journey
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-8">
              Discover premium cars at competitive prices. Book in minutes and enjoy 
              hassle-free rental experience across the country.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/cars"
                className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg"
              >
                Browse Cars
              </Link>
              <Link
                to="/signup"
                className="btn border-2 border-white text-white hover:bg-white/10 px-8 py-3 text-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Traveller?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We provide the best car rental experience with our wide selection of vehicles 
              and excellent customer service.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 rounded-full mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cars Section */}
      <section className="py-16">
        <div className="container-app">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Cars</h2>
              <p className="text-gray-600">Explore our most popular rental cars</p>
            </div>
            <Link
              to="/cars"
              className="btn btn-primary hidden md:inline-flex"
            >
              View All Cars
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <CarCardSkeleton key={index} />
              ))}
            </div>
          ) : featuredCars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCars.map((car) => (
                <CarCard key={car._id} car={car} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No cars available at the moment</p>
              <Link to="/cars" className="btn btn-primary mt-4">
                Check Back Later
              </Link>
            </div>
          )}

          <div className="text-center mt-8 md:hidden">
            <Link to="/cars" className="btn btn-primary">
              View All Cars
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container-app text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Hit the Road?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust Traveller for their car rental needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="btn bg-primary-600 text-white hover:bg-primary-700 px-8 py-3"
            >
              Create Account
            </Link>
            <Link
              to="/cars"
              className="btn border-2 border-white text-white hover:bg-white/10 px-8 py-3"
            >
              Browse Cars
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;