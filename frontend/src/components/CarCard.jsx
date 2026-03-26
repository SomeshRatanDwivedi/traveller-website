import { Link } from 'react-router-dom';
import { Car, MapPin, Calendar } from 'lucide-react';

const CarCard = ({ car }) => {
  const getTypeColor = (type) => {
    switch (type) {
      case 'SUV':
        return 'bg-blue-100 text-blue-700';
      case 'Sedan':
        return 'bg-green-100 text-green-700';
      case 'Hatchback':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="card card-hover">
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        <img
          src={car.images?.[0] || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800'}
          alt={car.name}
          className="w-full h-full object-cover"
        />
        <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(car.type)}`}>
          {car.type}
        </span>
        {!car.available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-medium">
              Currently Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{car.name}</h3>
        
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span>Available for rent</span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {car.description}
        </p>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-primary-600">${car.pricePerDay}</span>
            <span className="text-gray-500 text-sm">/day</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Link
            to={`/cars/${car._id}`}
            className="flex-1 btn btn-secondary text-center"
          >
            View Details
          </Link>
          <Link
            to={`/cars/${car._id}/book`}
            className={`flex-1 btn text-center ${
              car.available ? 'btn-primary' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!car.available}
          >
            <Calendar className="w-4 h-4 mr-2 inline" />
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CarCard;