import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Clock, AlertTriangle, Car, ArrowRight, RotateCcw, Search, Gauge, Timer, Route } from 'lucide-react';
import { trafficAPI } from '../services/api';
import Alert from '../components/Alert';

const TrafficSearch = () => {
  // Origin state
  const [originQuery, setOriginQuery] = useState('');
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [selectedOrigin, setSelectedOrigin] = useState(null);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);

  // Destination state
  const [destQuery, setDestQuery] = useState('');
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [selectedDest, setSelectedDest] = useState(null);
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  // Route result state
  const [routeResult, setRouteResult] = useState(null);
  const [originFlow, setOriginFlow] = useState(null);
  const [destFlow, setDestFlow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Refs for click-outside handling
  const originRef = useRef(null);
  const destRef = useRef(null);

  // Debounce timers
  const originTimer = useRef(null);
  const destTimer = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (originRef.current && !originRef.current.contains(e.target)) {
        setShowOriginDropdown(false);
      }
      if (destRef.current && !destRef.current.contains(e.target)) {
        setShowDestDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search for origin
  useEffect(() => {
    if (originTimer.current) clearTimeout(originTimer.current);
    if (!originQuery || originQuery.length < 2 || selectedOrigin) return;

    originTimer.current = setTimeout(async () => {
      try {
        const res = await trafficAPI.searchLocation(originQuery);
        setOriginSuggestions(res.data);
        setShowOriginDropdown(true);
      } catch {
        setOriginSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(originTimer.current);
  }, [originQuery, selectedOrigin]);

  // Debounced search for destination
  useEffect(() => {
    if (destTimer.current) clearTimeout(destTimer.current);
    if (!destQuery || destQuery.length < 2 || selectedDest) return;

    destTimer.current = setTimeout(async () => {
      try {
        const res = await trafficAPI.searchLocation(destQuery);
        setDestSuggestions(res.data);
        setShowDestDropdown(true);
      } catch {
        setDestSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(destTimer.current);
  }, [destQuery, selectedDest]);

  // Select origin location
  const handleSelectOrigin = (location) => {
    setSelectedOrigin(location);
    setOriginQuery(location.address || location.name);
    setShowOriginDropdown(false);
    setOriginSuggestions([]);
  };

  // Select destination location
  const handleSelectDest = (location) => {
    setSelectedDest(location);
    setDestQuery(location.address || location.name);
    setShowDestDropdown(false);
    setDestSuggestions([]);
  };

  // Calculate route
  const handleCalculateRoute = async (e) => {
    e.preventDefault();
    setError(null);
    setRouteResult(null);
    setOriginFlow(null);
    setDestFlow(null);

    if (!selectedOrigin || !selectedDest) {
      setError('Please select both origin and destination from the suggestions');
      return;
    }

    setLoading(true);

    try {
      // Fetch route and traffic flow in parallel
      const [routeRes, originFlowRes, destFlowRes] = await Promise.allSettled([
        trafficAPI.getRoute(
          selectedOrigin.position.lat,
          selectedOrigin.position.lon,
          selectedDest.position.lat,
          selectedDest.position.lon
        ),
        trafficAPI.getFlow(selectedOrigin.position.lat, selectedOrigin.position.lon),
        trafficAPI.getFlow(selectedDest.position.lat, selectedDest.position.lon),
      ]);

      if (routeRes.status === 'fulfilled') {
        setRouteResult(routeRes.value.data);
      } else {
        setError(routeRes.reason?.response?.data?.message || 'Failed to calculate route');
      }

      if (originFlowRes.status === 'fulfilled') {
        setOriginFlow(originFlowRes.value.data);
      }
      if (destFlowRes.status === 'fulfilled') {
        setDestFlow(destFlowRes.value.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to calculate route');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setOriginQuery('');
    setDestQuery('');
    setSelectedOrigin(null);
    setSelectedDest(null);
    setRouteResult(null);
    setOriginFlow(null);
    setDestFlow(null);
    setError(null);
  };

  // Swap origin and destination
  const handleSwap = () => {
    const tempQuery = originQuery;
    const tempSelected = selectedOrigin;
    setOriginQuery(destQuery);
    setSelectedOrigin(selectedDest);
    setDestQuery(tempQuery);
    setSelectedDest(tempSelected);
    setRouteResult(null);
    setOriginFlow(null);
    setDestFlow(null);
  };

  // Get severity color classes
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'heavy': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'severe': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Get congestion color classes
  const getCongestionColor = (level) => {
    switch (level) {
      case 'free': return 'text-green-600';
      case 'light': return 'text-green-500';
      case 'moderate': return 'text-yellow-600';
      case 'heavy': return 'text-orange-600';
      case 'standstill': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Get congestion bar width
  const getCongestionBarWidth = (level) => {
    switch (level) {
      case 'free': return 'w-1/5';
      case 'light': return 'w-2/5';
      case 'moderate': return 'w-3/5';
      case 'heavy': return 'w-4/5';
      case 'standstill': return 'w-full';
      default: return 'w-0';
    }
  };

  const getCongestionBarColor = (level) => {
    switch (level) {
      case 'free': return 'bg-green-500';
      case 'light': return 'bg-green-400';
      case 'moderate': return 'bg-yellow-500';
      case 'heavy': return 'bg-orange-500';
      case 'standstill': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-app">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Route className="w-8 h-8 mr-3 text-primary-600" />
            Traffic & Route Finder
          </h1>
          <p className="text-gray-600">
            Search two locations and get real-time traffic conditions, travel time, and route details
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <form onSubmit={handleCalculateRoute}>
            <div className="flex flex-col lg:flex-row gap-4 items-start">
              {/* Origin Input */}
              <div className="flex-1 w-full" ref={originRef}>
                <label className="label flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  Starting Point
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                  <input
                    type="text"
                    value={originQuery}
                    onChange={(e) => {
                      setOriginQuery(e.target.value);
                      setSelectedOrigin(null);
                    }}
                    placeholder="Search for starting location..."
                    className="input pl-10"
                    autoComplete="off"
                  />
                  {selectedOrigin && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-xs font-medium bg-green-50 px-2 py-0.5 rounded-full">
                      Selected
                    </span>
                  )}
                </div>
                {/* Origin Suggestions Dropdown */}
                {showOriginDropdown && originSuggestions.length > 0 && (
                  <div className="absolute z-40 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto w-full max-w-md">
                    {originSuggestions.map((loc) => (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => handleSelectOrigin(loc)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors"
                      >
                        <p className="font-medium text-gray-900 text-sm">{loc.name || loc.address}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {loc.city}{loc.city && loc.country ? ', ' : ''}{loc.country}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Swap Button */}
              <div className="flex items-end pb-1">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors mt-6"
                  title="Swap origin and destination"
                >
                  <RotateCcw className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Destination Input */}
              <div className="flex-1 w-full" ref={destRef}>
                <label className="label flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  Destination
                </label>
                <div className="relative">
                  <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                  <input
                    type="text"
                    value={destQuery}
                    onChange={(e) => {
                      setDestQuery(e.target.value);
                      setSelectedDest(null);
                    }}
                    placeholder="Search for destination..."
                    className="input pl-10"
                    autoComplete="off"
                  />
                  {selectedDest && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-xs font-medium bg-red-50 px-2 py-0.5 rounded-full">
                      Selected
                    </span>
                  )}
                </div>
                {/* Destination Suggestions Dropdown */}
                {showDestDropdown && destSuggestions.length > 0 && (
                  <div className="absolute z-40 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto w-full max-w-md">
                    {destSuggestions.map((loc) => (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => handleSelectDest(loc)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors"
                      >
                        <p className="font-medium text-gray-900 text-sm">{loc.name || loc.address}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {loc.city}{loc.city && loc.country ? ', ' : ''}{loc.country}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  disabled={loading || !selectedOrigin || !selectedDest}
                  className="btn btn-primary py-2.5 px-6 mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center whitespace-nowrap"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Get Route
                    </>
                  )}
                </button>
                {routeResult && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="btn btn-secondary py-2.5 px-4 mt-6"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} onClose={() => setError(null)} />
          </div>
        )}

        {/* Route Result */}
        {routeResult && (
          <div className="animate-fade-in space-y-6">
            {/* Route Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Travel Time with Traffic */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">Travel Time</span>
                  <div className="bg-primary-50 p-2 rounded-lg">
                    <Clock className="w-5 h-5 text-primary-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{routeResult.travelTime.formatted}</p>
                <p className="text-xs text-gray-500 mt-1">with current traffic</p>
              </div>

              {/* Distance */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">Distance</span>
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <Car className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{routeResult.distance.km} km</p>
                <p className="text-xs text-gray-500 mt-1">{routeResult.distance.miles} miles</p>
              </div>

              {/* Traffic Delay */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">Traffic Delay</span>
                  <div className="bg-amber-50 p-2 rounded-lg">
                    <Timer className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{routeResult.trafficDelay.formatted}</p>
                <p className="text-xs text-gray-500 mt-1">extra due to traffic</p>
              </div>

              {/* Traffic Severity */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">Traffic Level</span>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-gray-600" />
                  </div>
                </div>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border capitalize ${getSeverityColor(routeResult.trafficSeverity)}`}>
                  {routeResult.trafficSeverity}
                </span>
                <p className="text-xs text-gray-500 mt-2">congestion level</p>
              </div>
            </div>

            {/* Detailed Route Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Route Details</h2>

              {/* Route Visual */}
              <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700 max-w-xs truncate">
                    {selectedOrigin?.address || selectedOrigin?.name}
                  </span>
                </div>
                <div className="flex-1 flex items-center gap-1">
                  <div className="flex-1 h-0.5 bg-gray-300 relative">
                    <div className="absolute inset-0 bg-primary-500 rounded" style={{ width: '100%' }}></div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-primary-600 flex-shrink-0" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700 max-w-xs truncate">
                    {selectedDest?.address || selectedDest?.name}
                  </span>
                </div>
              </div>

              {/* Time Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-xs text-green-600 font-medium mb-1">Without Traffic</p>
                  <p className="text-xl font-bold text-green-700">
                    {routeResult.travelTimeWithoutTraffic.formatted}
                  </p>
                </div>
                <div className="p-4 bg-primary-50 rounded-lg border border-primary-100">
                  <p className="text-xs text-primary-600 font-medium mb-1">With Current Traffic</p>
                  <p className="text-xl font-bold text-primary-700">
                    {routeResult.travelTime.formatted}
                  </p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-xs text-amber-600 font-medium mb-1">Live Traffic Estimate</p>
                  <p className="text-xl font-bold text-amber-700">
                    {routeResult.liveTrafficTime.formatted}
                  </p>
                </div>
              </div>

              {/* Departure / Arrival */}
              {routeResult.departureTime && routeResult.arrivalTime && (
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Departure</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(routeResult.departureTime).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex-1 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Estimated Arrival</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(routeResult.arrivalTime).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Traffic Flow at Both Points */}
            {(originFlow || destFlow) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Origin Traffic Flow */}
                {originFlow && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      Traffic at Starting Point
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Current Speed</span>
                        <span className="text-lg font-bold text-gray-900">{originFlow.currentSpeed} km/h</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Free Flow Speed</span>
                        <span className="text-lg font-bold text-gray-900">{originFlow.freeFlowSpeed} km/h</span>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-500">Congestion</span>
                          <span className={`text-sm font-semibold capitalize ${getCongestionColor(originFlow.congestionLevel)}`}>
                            {originFlow.congestionLevel}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className={`h-2.5 rounded-full transition-all duration-500 ${getCongestionBarWidth(originFlow.congestionLevel)} ${getCongestionBarColor(originFlow.congestionLevel)}`}></div>
                        </div>
                      </div>
                      {originFlow.roadClosure && (
                        <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-red-700 text-sm flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Road closure detected nearby
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Destination Traffic Flow */}
                {destFlow && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      Traffic at Destination
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Current Speed</span>
                        <span className="text-lg font-bold text-gray-900">{destFlow.currentSpeed} km/h</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Free Flow Speed</span>
                        <span className="text-lg font-bold text-gray-900">{destFlow.freeFlowSpeed} km/h</span>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-500">Congestion</span>
                          <span className={`text-sm font-semibold capitalize ${getCongestionColor(destFlow.congestionLevel)}`}>
                            {destFlow.congestionLevel}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className={`h-2.5 rounded-full transition-all duration-500 ${getCongestionBarWidth(destFlow.congestionLevel)} ${getCongestionBarColor(destFlow.congestionLevel)}`}></div>
                        </div>
                      </div>
                      {destFlow.roadClosure && (
                        <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-red-700 text-sm flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Road closure detected nearby
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!routeResult && !loading && !error && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <Route className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Plan Your Route</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Enter a starting point and destination above to see real-time traffic conditions,
              estimated travel time, and route details for your car journey.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrafficSearch;
