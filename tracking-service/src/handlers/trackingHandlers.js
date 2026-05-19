const { v4: uuidv4 } = require('uuid');
const { createTracking, getTracking, updateLocation, getLocationHistory, updateETA } = require('../database');
const { publishEvent } = require('../kafka');

// Fonction utilitaire pour calculer la distance entre deux points (formule de Haversine)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Fonction pour estimer le temps d'arrivée (vitesse moyenne 30 km/h en ville)
function estimateArrivalTime(distanceKm, averageSpeedKmh = 30) {
  return Math.ceil((distanceKm / averageSpeedKmh) * 60); // en minutes
}

// Handler pour StartTracking
async function StartTracking(call, callback) {
  try {
    const { order_id, driver_id, pickup_location, delivery_location } = call.request;

    if (!order_id || !driver_id || !pickup_location || !delivery_location) {
      return callback({
        code: 3,
        message: 'Tous les champs sont requis'
      });
    }

    // Calculer la distance initiale
    const distance = calculateDistance(
      pickup_location.latitude,
      pickup_location.longitude,
      delivery_location.latitude,
      delivery_location.longitude
    );

    const estimatedMinutes = estimateArrivalTime(distance);

    // Créer le tracking
    const tracking = {
      id: uuidv4(),
      order_id,
      driver_id,
      pickup_latitude: pickup_location.latitude,
      pickup_longitude: pickup_location.longitude,
      delivery_latitude: delivery_location.latitude,
      delivery_longitude: delivery_location.longitude,
      distance_remaining_km: distance,
      estimated_minutes: estimatedMinutes
    };

    await createTracking(tracking);

    callback(null, {
      tracking_id: tracking.id,
      order_id,
      current_location: null,
      pickup_location,
      delivery_location,
      distance_traveled_km: 0,
      distance_remaining_km: distance,
      estimated_minutes: estimatedMinutes,
      status: 'TRACKING',
      last_updated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur StartTracking:', error);
    callback({
      code: 13,
      message: error.message
    });
  }
}

// Handler pour UpdateLocation
async function UpdateLocation(call, callback) {
  try {
    const { order_id, current_location, speed } = call.request;

    if (!order_id || !current_location) {
      return callback({
        code: 3,
        message: 'order_id et current_location sont requis'
      });
    }

    const tracking = await getTracking(order_id);

    if (!tracking) {
      return callback({
        code: 5,
        message: 'Tracking non trouvé'
      });
    }

    // Mettre à jour la position
    await updateLocation(order_id, current_location, speed);

    // Recalculer la distance restante
    const distanceRemaining = calculateDistance(
      current_location.latitude,
      current_location.longitude,
      tracking.delivery_latitude,
      tracking.delivery_longitude
    );

    const estimatedMinutes = estimateArrivalTime(distanceRemaining);

    // Mettre à jour l'ETA
    await updateETA(order_id, distanceRemaining, estimatedMinutes);

    // Publier l'événement
    await publishEvent('tracking.location.updated', {
      order_id,
      current_location,
      distance_remaining_km: distanceRemaining,
      estimated_minutes: estimatedMinutes,
      updated_at: new Date().toISOString()
    });

    const updatedTracking = await getTracking(order_id);

    callback(null, {
      tracking_id: updatedTracking.id,
      order_id,
      current_location,
      pickup_location: {
        latitude: updatedTracking.pickup_latitude,
        longitude: updatedTracking.pickup_longitude
      },
      delivery_location: {
        latitude: updatedTracking.delivery_latitude,
        longitude: updatedTracking.delivery_longitude
      },
      distance_traveled_km: updatedTracking.distance_traveled_km,
      distance_remaining_km: distanceRemaining,
      estimated_minutes: estimatedMinutes,
      status: updatedTracking.status,
      last_updated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur UpdateLocation:', error);
    callback({
      code: 13,
      message: error.message
    });
  }
}

// Handler pour GetCurrentLocation
async function GetCurrentLocation(call, callback) {
  try {
    const { order_id } = call.request;

    if (!order_id) {
      return callback({
        code: 3,
        message: 'order_id est requis'
      });
    }

    const tracking = await getTracking(order_id);

    if (!tracking) {
      return callback({
        code: 5,
        message: 'Tracking non trouvé'
      });
    }

    callback(null, {
      tracking_id: tracking.id,
      order_id,
      current_location: tracking.current_latitude ? {
        latitude: tracking.current_latitude,
        longitude: tracking.current_longitude
      } : null,
      pickup_location: {
        latitude: tracking.pickup_latitude,
        longitude: tracking.pickup_longitude
      },
      delivery_location: {
        latitude: tracking.delivery_latitude,
        longitude: tracking.delivery_longitude
      },
      distance_traveled_km: tracking.distance_traveled_km,
      distance_remaining_km: tracking.distance_remaining_km,
      estimated_minutes: tracking.estimated_minutes,
      status: tracking.status,
      last_updated: tracking.last_updated
    });
  } catch (error) {
    console.error('Erreur GetCurrentLocation:', error);
    callback({
      code: 13,
      message: error.message
    });
  }
}

// Handler pour GetLocationHistory
async function GetLocationHistory(call, callback) {
  try {
    const { order_id, from_time, to_time } = call.request;

    if (!order_id) {
      return callback({
        code: 3,
        message: 'order_id est requis'
      });
    }

    const history = await getLocationHistory(order_id, from_time, to_time);

    const points = history.map(point => ({
      location: {
        latitude: point.latitude,
        longitude: point.longitude
      },
      timestamp: point.timestamp,
      speed: point.speed
    }));

    callback(null, { points });
  } catch (error) {
    console.error('Erreur GetLocationHistory:', error);
    callback({
      code: 13,
      message: error.message
    });
  }
}

// Handler pour CalculateETA
async function CalculateETA(call, callback) {
  try {
    const { order_id, current_location, destination } = call.request;

    if (!current_location || !destination) {
      return callback({
        code: 3,
        message: 'current_location et destination sont requis'
      });
    }

    const distance = calculateDistance(
      current_location.latitude,
      current_location.longitude,
      destination.latitude,
      destination.longitude
    );

    const estimatedMinutes = estimateArrivalTime(distance);
    const arrivalTime = new Date(Date.now() + estimatedMinutes * 60000).toISOString();

    callback(null, {
      estimated_minutes: estimatedMinutes,
      distance_km: distance,
      arrival_time: arrivalTime
    });
  } catch (error) {
    console.error('Erreur CalculateETA:', error);
    callback({
      code: 13,
      message: error.message
    });
  }
}

module.exports = {
  StartTracking,
  UpdateLocation,
  GetCurrentLocation,
  GetLocationHistory,
  CalculateETA
};
