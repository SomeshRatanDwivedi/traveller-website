import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, X, Car, Calendar, Check, X as XIcon } from 'lucide-react';
import { carsAPI, bookingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PageLoading } from '../components/Loading';
import Alert from '../components/Alert';

const Admin = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('cars');
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'Sedan',
    description: '',
    pricePerDay: '',
    images: '',
    features: '',
    available: true,
  });
  const [formLoading, setFormLoading] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!loading && !isAdmin) {
      window.location.href = '/';
    }
  }, [loading, isAdmin]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'cars') {
          const response = await carsAPI.getAll({ limit: 100 });
          setCars(response.data.cars);
        } else {
          const response = await bookingsAPI.getAll();
          setBookings(response.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchData();
    }
  }, [activeTab, isAdmin]);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);

    try {
      const carData = {
        name: formData.name,
        type: formData.type,
        description: formData.description,
        pricePerDay: Number(formData.pricePerDay),
        images: formData.images.split(',').map((img) => img.trim()).filter(Boolean),
        features: formData.features.split(',').map((f) => f.trim()).filter(Boolean),
        available: formData.available,
      };

      if (editingCar) {
        await carsAPI.update(editingCar._id, carData);
      } else {
        await carsAPI.create(carData);
      }

      // Refresh cars list
      const response = await carsAPI.getAll({ limit: 100 });
      setCars(response.data.cars);
      setShowModal(false);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save car');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (carId) => {
    if (!window.confirm('Are you sure you want to delete this car?')) {
      return;
    }

    setDeleteLoading(carId);

    try {
      await carsAPI.delete(carId);
      setCars((prev) => prev.filter((car) => car._id !== carId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete car');
    } finally {
      setDeleteLoading(null);
    }
  };

  // Edit car
  const handleEdit = (car) => {
    setEditingCar(car);
    setFormData({
      name: car.name,
      type: car.type,
      description: car.description,
      pricePerDay: car.pricePerDay,
      images: car.images?.join(', ') || '',
      features: car.features?.join(', ') || '',
      available: car.available,
    });
    setShowModal(true);
  };

  // Reset form
  const resetForm = () => {
    setEditingCar(null);
    setFormData({
      name: '',
      type: 'Sedan',
      description: '',
      pricePerDay: '',
      images: '',
      features: '',
      available: true,
    });
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isAdmin && !loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-app">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your cars and bookings</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('cars')}
            className={`pb-3 px-1 font-medium transition-colors ${
              activeTab === 'cars'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Car className="w-4 h-4 inline mr-2" />
            Cars ({cars.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-3 px-1 font-medium transition-colors ${
              activeTab === 'bookings'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Bookings ({bookings.length})
          </button>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError(null)} />
        )}

        {loading ? (
          <PageLoading />
        ) : activeTab === 'cars' ? (
          <>
            {/* Add Car Button */}
            <div className="mb-6">
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="btn btn-primary flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Car
              </button>
            </div>

            {/* Cars Table */}
            {cars.length > 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Car
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price/Day
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {cars.map((car) => (
                        <tr key={car._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-16 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 mr-3">
                                <img
                                  src={
                                    car.images?.[0] ||
                                    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=200'
                                  }
                                  alt={car.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="font-medium text-gray-900">{car.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              {car.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900">
                            ${car.pricePerDay}
                          </td>
                          <td className="px-6 py-4">
                            {car.available ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                <Check className="w-3 h-3 mr-1" />
                                Available
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                <XIcon className="w-3 h-3 mr-1" />
                                Unavailable
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleEdit(car)}
                              className="text-primary-600 hover:text-primary-700 mr-3"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(car._id)}
                              disabled={deleteLoading === car._id}
                              className="text-red-600 hover:text-red-700 disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No cars yet</h3>
                <p className="text-gray-500 mb-6">Add your first car to start renting</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="btn btn-primary"
                >
                  Add First Car
                </button>
              </div>
            )}
          </>
        ) : (
          /* Bookings Table */
          <>
            {bookings.length > 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Booking ID
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Car
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dates
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bookings.map((booking) => (
                        <tr key={booking._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                            {booking._id.slice(-8)}
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900">
                                {booking.user?.username}
                              </p>
                              <p className="text-sm text-gray-500">
                                {booking.user?.email}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900">
                              {booking.car?.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {booking.car?.type}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <p className="text-gray-900">
                              {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                            </p>
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900">
                            ${booking.totalPrice}
                          </td>
                          <td className="px-6 py-4">
                            {booking.status === 'confirmed' ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                <Check className="w-3 h-3 mr-1" />
                                Confirmed
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                <XIcon className="w-3 h-3 mr-1" />
                                Cancelled
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
                <p className="text-gray-500">Bookings will appear here</p>
              </div>
            )}
          </>
        )}

        {/* Car Form Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingCar ? 'Edit Car' : 'Add New Car'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Car Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Car Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="input"
                      required
                    >
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="Hatchback">Hatchback</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="label">Price Per Day ($) *</label>
                  <input
                    type="number"
                    value={formData.pricePerDay}
                    onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
                    className="input"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="label">Image URLs (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.images}
                    onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                    className="input"
                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  />
                </div>

                <div>
                  <label className="label">Features (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    className="input"
                    placeholder="Air Conditioning, Bluetooth, USB"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.available}
                      onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                      className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Available for booking</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="btn btn-primary disabled:opacity-50"
                  >
                    {formLoading ? 'Saving...' : editingCar ? 'Update Car' : 'Add Car'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;