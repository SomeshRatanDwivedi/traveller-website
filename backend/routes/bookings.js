const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Car = require('../models/Car');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/bookings
// @desc    Get all bookings (admin) or user's bookings
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    
    // If not admin, only show user's bookings
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    const { status, carId } = req.query;
    
    if (status) {
      query.status = status;
    }
    
    if (carId) {
      query.car = carId;
    }

    const bookings = await Booking.find(query)
      .populate('user', 'username email')
      .populate('car', 'name type images pricePerDay')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { carId, startDate, endDate, contactPhone, notes } = req.body;

    // Validate required fields
    if (!carId || !startDate || !endDate || !contactPhone) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if car exists
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Check if car is available
    if (!car.available) {
      return res.status(400).json({ message: 'Car is not available for booking' });
    }

    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate date range
    if (start >= end) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    if (start < new Date()) {
      return res.status(400).json({ message: 'Start date cannot be in the past' });
    }

    // Check for overlapping bookings
    const existingBooking = await Booking.findOne({
      car: carId,
      status: 'confirmed',
      $or: [
        { startDate: { $lt: end }, endDate: { $gt: start } }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({ 
        message: 'Car is already booked for these dates',
        conflictingBooking: existingBooking._id
      });
    }

    // Calculate total price
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalPrice = days * car.pricePerDay;

    // Create booking
    const booking = await Booking.create({
      user: req.user._id,
      car: carId,
      startDate: start,
      endDate: end,
      totalPrice,
      contactPhone,
      notes: notes || '',
      status: 'confirmed'
    });

    // Populate booking with car and user details
    const populatedBooking = await Booking.findById(booking._id)
      .populate('user', 'username email')
      .populate('car', 'name type images pricePerDay');

    res.status(201).json(populatedBooking);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel a booking
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the booking or is admin
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    // Check if booking start date has passed
    if (new Date(booking.startDate) < new Date()) {
      return res.status(400).json({ message: 'Cannot cancel a booking that has already started' });
    }

    booking.status = 'cancelled';
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('user', 'username email')
      .populate('car', 'name type images pricePerDay');

    res.json(updatedBooking);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'username email')
      .populate('car', 'name type images pricePerDay');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the booking or is admin
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json(booking);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;