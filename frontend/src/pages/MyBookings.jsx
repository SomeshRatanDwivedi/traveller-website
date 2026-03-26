import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Car, X, Check, Clock, AlertCircle } from 'lucide-react';
import { bookingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PageLoading } from '../components/Loading';
import Alert from '../components/Alert';

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await bookingsAPI.getAll();
        setBookings(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBookings();
    }
  }, [user]);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setCancelLoading(bookingId);

    try {
      await bookingsAPI.cancel(bookingId);
      // Update the booking in the list
      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, status: 'cancelled' } : b
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelLoading(null);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Check className="w-3 h-3 mr-1" />
            Confirmed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <X className="w-3 h-3 mr-1" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const canCancel = (booking) => {
    return (
      booking.status === 'confirmed' &&
      new Date(booking.startDate) > new Date()
    );
  };

  if (loading) {
    return <PageLoading />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-app">
          <Alert
            type="warning"
            message="Please login to view your bookings"
          />
          <Link to="/login" className="btn btn-primary mt-4">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-app">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">View and manage your car rentals</p>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError(null)} />
        )}

        {bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Car Image */}
                    <div className="w-full md:w-48 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={
                          booking.car?.images?.[0] ||
                          'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400'
                        }
                        alt={booking.car?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Booking Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {booking.car?.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {booking.car?.type}
                          </p>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-gray-500">Pick-up</p>
                          <p className="text-sm font-medium text-gray-900 flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(booking.startDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Return</p>
                          <p className="text-sm font-medium text-gray-900 flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(booking.endDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Total Price</p>
                          <p className="text-sm font-bold text-primary-600">
                            ${booking.totalPrice}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Booking ID</p>
                          <p className="text-xs text-gray-500 font-mono">
                            {booking._id.slice(-8)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 md:items-end">
                      <Link
                        to={`/cars/${booking.car?._id}`}
                        className="btn btn-secondary text-sm"
                      >
                        View Car
                      </Link>
                      {canCancel(booking) && (
                        <button
                          onClick={() => handleCancel(booking._id)}
                          disabled={cancelLoading === booking._id}
                          className="btn btn-danger text-sm disabled:opacity-50"
                        >
                          {cancelLoading === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Warning for past dates */}
                {new Date(booking.endDate) < new Date() && (
                  <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      This booking has ended on {formatDate(booking.endDate)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No bookings yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start by browsing our available cars
            </p>
            <Link to="/cars" className="btn btn-primary">
              Browse Cars
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;