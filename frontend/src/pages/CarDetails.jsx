import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Check, X, Car } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { carsAPI, bookingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PageLoading } from '../components/Loading';
import Alert from '../components/Alert';

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Booking form state
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [contactPhone, setContactPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const response = await carsAPI.getById(id);
        setCar(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch car details');
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  // Calculate total price
  const calculateTotal = () => {
    if (!startDate || !endDate || !car) return 0;
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    return days * car.pricePerDay;
  };

  // Handle booking
  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingError(null);
    setBookingSuccess(null);

    if (!user) {
      navigate('/login', { state: { from: `/cars/${id}/book` } });
      return;
    }

    if (!startDate || !endDate || !contactPhone) {
      setBookingError('Please fill in all required fields');
      return;
    }

    setBookingLoading(true);

    try {
      const response = await bookingsAPI.create({
        carId: id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        contactPhone,
        notes,
      });

      setBookingSuccess('Booking confirmed! Redirecting to your bookings...');
      
      // Redirect to my bookings after 2 seconds
      setTimeout(() => {
        navigate('/my-bookings');
      }, 2000);
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };

  if (loading) {
    return <PageLoading />;
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-app">
          <Alert type="error" message={error || 'Car not found'} />
          <Link to="/cars" className="btn btn-primary mt-4">
            Back to Cars
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-app">
        {/* Back Button */}
        <Link
          to="/cars"
          className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cars
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Car Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Image */}
              <div className="h-64 md:h-96 bg-gray-100">
                <img
                  src={car.images?.[0] || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800'}
                  alt={car.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      {car.name}
                    </h1>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      car.type === 'SUV' ? 'bg-blue-100 text-blue-700' :
                      car.type === 'Sedan' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {car.type}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary-600">${car.pricePerDay}</div>
                    <div className="text-gray-500">per day</div>
                  </div>
                </div>

                <div className="flex items-center text-gray-500 mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>Available for rental</span>
                  {car.available ? (
                    <Check className="w-4 h-4 ml-2 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 ml-2 text-red-500" />
                  )}
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
                  <p className="text-gray-600 leading-relaxed">{car.description}</p>
                </div>

                {car.features && car.features.length > 0 && (
                  <div className="border-t border-gray-100 pt-6 mt-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Features</h2>
                    <div className="grid grid-cols-2 gap-2">
                      {car.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-gray-600">
                          <Check className="w-4 h-4 text-green-500 mr-2" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Book This Car</h2>

              {bookingSuccess ? (
                <Alert type="success" message={bookingSuccess} />
              ) : car.available ? (
                <form onSubmit={handleBooking}>
                  {bookingError && (
                    <Alert type="error" message={bookingError} onClose={() => setBookingError(null)} />
                  )}

                  <div className="mb-4">
                    <label className="label">Pick-up Date</label>
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
                      minDate={getMinDate()}
                      placeholderText="Select pick-up date"
                      className="input"
                      dateFormat="MMM d, yyyy"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="label">Return Date</label>
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      selectsEnd
                      startDate={startDate}
                      endDate={endDate}
                      minDate={startDate || getMinDate()}
                      placeholderText="Select return date"
                      className="input"
                      dateFormat="MMM d, yyyy"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="label">Contact Phone *</label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      className="input"
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label className="label">Additional Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special requests..."
                      className="input"
                      rows={3}
                    />
                  </div>

                  {startDate && endDate && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">
                          ${car.pricePerDay} x {Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))} days
                        </span>
                        <span className="font-semibold">${calculateTotal()}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-2 flex justify-between">
                        <span className="font-semibold">Total</span>
                        <span className="font-bold text-primary-600">${calculateTotal()}</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={bookingLoading || !startDate || !endDate || !contactPhone}
                    className="btn btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                  </button>

                  {!user && (
                    <p className="text-center text-sm text-gray-500 mt-4">
                      Please{' '}
                      <Link to="/login" state={{ from: `/cars/${id}/book` }} className="text-primary-600 hover:underline">
                        login
                      </Link>{' '}
                      to book a car
                    </p>
                  )}
                </form>
              ) : (
                <div className="text-center py-8">
                  <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">This car is currently unavailable</p>
                  <Link to="/cars" className="btn btn-primary">
                    Browse Other Cars
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetails;