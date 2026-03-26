const express = require('express');
const router = express.Router();
const Car = require('../models/Car');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/cars
// @desc    Get all cars with optional filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { type, minPrice, maxPrice, available, search, page = 1, limit = 12 } = req.query;
    
    // Build query
    let query = {};
    
    if (type) {
      query.type = type;
    }
    
    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) query.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
    }
    
    if (available === 'true') {
      query.available = true;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const cars = await Car.find(query)
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Car.countDocuments(query);

    res.json({
      cars,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/cars/:id
// @desc    Get single car by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    
    res.json(car);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/cars
// @desc    Create a new car
// @access  Private (Admin only)
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, type, description, pricePerDay, images, features, available } = req.body;

    // Validate required fields
    if (!name || !type || !description || !pricePerDay) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const car = await Car.create({
      name,
      type,
      description,
      pricePerDay,
      images: images || ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800'],
      features: features || [],
      available: available !== undefined ? available : true
    });

    res.status(201).json(car);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/cars/:id
// @desc    Update a car
// @access  Private (Admin only)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { name, type, description, pricePerDay, images, features, available } = req.body;

    let car = await Car.findById(req.params.id);
    
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    car = await Car.findByIdAndUpdate(
      req.params.id,
      { name, type, description, pricePerDay, images, features, available },
      { new: true, runValidators: true }
    );

    res.json(car);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/cars/:id
// @desc    Delete a car
// @access  Private (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    await Car.findByIdAndDelete(req.params.id);

    res.json({ message: 'Car removed successfully' });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;