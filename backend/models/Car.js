const mongoose = require('mongoose');

// Car Schema
const carSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Car name is required'],
    trim: true,
    maxlength: 100
  },
  type: {
    type: String,
    required: [true, 'Car type is required'],
    enum: ['SUV', 'Sedan', 'Hatchback']
  },
  description: {
    type: String,
    required: [true, 'Car description is required'],
    maxlength: 1000
  },
  pricePerDay: {
    type: Number,
    required: [true, 'Price per day is required'],
    min: 0
  },
  images: {
    type: [String],
    default: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800']
  },
  available: {
    type: Boolean,
    default: true
  },
  features: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Car', carSchema);