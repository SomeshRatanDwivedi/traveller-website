const express = require('express');
const axios = require('axios');
const router = express.Router();

const TOMTOM_API_KEY = process.env.TOMTOM_API_KEY || '';
const TOMTOM_BASE = 'https://api.tomtom.com';

const tomtom = axios.create({
  baseURL: TOMTOM_BASE,
  timeout: 15000,
});

// @route   GET /api/traffic/search
// @desc    Search/autocomplete locations via TomTom
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { query, limit = 5 } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    if (!TOMTOM_API_KEY) {
      return res.status(500).json({ message: 'TomTom API key not configured' });
    }

    const { data } = await tomtom.get(`/search/2/search/${encodeURIComponent(query)}.json`, {
      params: { key: TOMTOM_API_KEY, limit, typeahead: true, language: 'en-US' },
    });

    // Return simplified results
    const results = (data.results || []).map((r) => ({
      id: r.id,
      name: r.poi?.name || r.address?.freeformAddress || '',
      address: r.address?.freeformAddress || '',
      position: r.position,
      type: r.type,
      country: r.address?.country || '',
      city: r.address?.municipality || '',
    }));

    res.json(results);
  } catch (error) {
    console.error('Traffic search error:', error.message);
    const status = error.response?.status || 500;
    const msg = error.code === 'ECONNABORTED' ? 'TomTom API timed out, please try again' : 'Failed to search locations';
    res.status(status).json({ message: msg });
  }
});

// @route   GET /api/traffic/route
// @desc    Get route with traffic info between two points
// @access  Public
router.get('/route', async (req, res) => {
  try {
    const { originLat, originLon, destLat, destLon } = req.query;

    if (!originLat || !originLon || !destLat || !destLon) {
      return res.status(400).json({ message: 'Origin and destination coordinates are required' });
    }

    if (!TOMTOM_API_KEY) {
      return res.status(500).json({ message: 'TomTom API key not configured' });
    }

    const routePoints = `${originLat},${originLon}:${destLat},${destLon}`;
    const { data } = await tomtom.get(`/routing/1/calculateRoute/${routePoints}/json`, {
      params: { key: TOMTOM_API_KEY, traffic: true, travelMode: 'car', computeTravelTimeFor: 'all', departAt: 'now' },
    });

    const route = data.routes?.[0];
    if (!route) {
      return res.status(404).json({ message: 'No route found between these points' });
    }

    const summary = route.summary;

    // Format the response
    const result = {
      distance: {
        meters: summary.lengthInMeters,
        km: (summary.lengthInMeters / 1000).toFixed(1),
        miles: (summary.lengthInMeters / 1609.34).toFixed(1),
      },
      travelTime: {
        totalSeconds: summary.travelTimeInSeconds,
        formatted: formatDuration(summary.travelTimeInSeconds),
      },
      travelTimeWithoutTraffic: {
        totalSeconds: summary.noTrafficTravelTimeInSeconds,
        formatted: formatDuration(summary.noTrafficTravelTimeInSeconds),
      },
      trafficDelay: {
        totalSeconds: summary.trafficDelayInSeconds,
        formatted: formatDuration(summary.trafficDelayInSeconds),
      },
      liveTrafficTime: {
        totalSeconds: summary.liveTrafficIncidentsTravelTimeInSeconds,
        formatted: formatDuration(summary.liveTrafficIncidentsTravelTimeInSeconds),
      },
      departureTime: summary.departureTime,
      arrivalTime: summary.arrivalTime,
      trafficSeverity: getTrafficSeverity(summary.trafficDelayInSeconds, summary.noTrafficTravelTimeInSeconds),
    };

    res.json(result);
  } catch (error) {
    console.error('Route calculation error:', error.message);
    const status = error.response?.status || 500;
    const msg = error.code === 'ECONNABORTED' ? 'TomTom API timed out, please try again' : 'Failed to calculate route';
    res.status(status).json({ message: msg });
  }
});

// @route   GET /api/traffic/flow
// @desc    Get traffic flow data for a specific point
// @access  Public
router.get('/flow', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ message: 'Coordinates are required' });
    }

    if (!TOMTOM_API_KEY) {
      return res.status(500).json({ message: 'TomTom API key not configured' });
    }

    const { data } = await tomtom.get('/traffic/services/4/flowSegmentData/absolute/10/json', {
      params: { key: TOMTOM_API_KEY, point: `${lat},${lon}`, unit: 'KMPH' },
    });

    const flow = data.flowSegmentData;

    res.json({
      currentSpeed: flow.currentSpeed,
      freeFlowSpeed: flow.freeFlowSpeed,
      currentTravelTime: flow.currentTravelTime,
      freeFlowTravelTime: flow.freeFlowTravelTime,
      confidence: flow.confidence,
      roadClosure: flow.roadClosure,
      congestionLevel: getCongestionLevel(flow.currentSpeed, flow.freeFlowSpeed),
    });
  } catch (error) {
    console.error('Traffic flow error:', error.message);
    const status = error.response?.status || 500;
    const msg = error.code === 'ECONNABORTED' ? 'TomTom API timed out, please try again' : 'Failed to get traffic flow';
    res.status(status).json({ message: msg });
  }
});

// Helper: Format seconds into readable duration
function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '0 min';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0 && minutes > 0) return `${hours} hr ${minutes} min`;
  if (hours > 0) return `${hours} hr`;
  return `${minutes} min`;
}

// Helper: Determine traffic severity
function getTrafficSeverity(delaySeconds, noTrafficSeconds) {
  if (delaySeconds == null || noTrafficSeconds == null || noTrafficSeconds === 0) return 'low';
  if (delaySeconds === 0) return 'low';
  const ratio = delaySeconds / noTrafficSeconds;
  if (ratio < 0.1) return 'low';
  if (ratio < 0.3) return 'moderate';
  if (ratio < 0.6) return 'heavy';
  return 'severe';
}

// Helper: Determine congestion level from speeds
function getCongestionLevel(currentSpeed, freeFlowSpeed) {
  if (!currentSpeed || !freeFlowSpeed) return 'unknown';
  const ratio = currentSpeed / freeFlowSpeed;
  if (ratio > 0.8) return 'free';
  if (ratio > 0.6) return 'light';
  if (ratio > 0.4) return 'moderate';
  if (ratio > 0.2) return 'heavy';
  return 'standstill';
}

module.exports = router;
