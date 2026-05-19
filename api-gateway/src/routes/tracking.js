const express = require('express');
const router = express.Router();
const { getTrackingClient } = require('../grpc/clients');

// POST /api/tracking/start - Démarrer le suivi
router.post('/start', (req, res) => {
  const client = getTrackingClient();
  const { order_id, driver_id, pickup_location, delivery_location } = req.body;

  client.StartTracking({
    order_id,
    driver_id,
    pickup_location,
    delivery_location
  }, (error, response) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(201).json(response);
  });
});

// PUT /api/tracking/:orderId/location - Mettre à jour la position
router.put('/:orderId/location', (req, res) => {
  const client = getTrackingClient();
  const { current_location, speed } = req.body;

  client.UpdateLocation({
    order_id: req.params.orderId,
    current_location,
    speed
  }, (error, response) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(response);
  });
});

// GET /api/tracking/:orderId - Obtenir la position actuelle
router.get('/:orderId', (req, res) => {
  const client = getTrackingClient();
  
  client.GetCurrentLocation({ order_id: req.params.orderId }, (error, response) => {
    if (error) {
      if (error.code === 5) {
        return res.status(404).json({ error: 'Tracking non trouvé' });
      }
      return res.status(500).json({ error: error.message });
    }
    res.json(response);
  });
});

// GET /api/tracking/:orderId/history - Obtenir l'historique
router.get('/:orderId/history', (req, res) => {
  const client = getTrackingClient();
  const { from_time, to_time } = req.query;

  client.GetLocationHistory({
    order_id: req.params.orderId,
    from_time,
    to_time
  }, (error, response) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(response);
  });
});

// POST /api/tracking/calculate-eta - Calculer l'ETA
router.post('/calculate-eta', (req, res) => {
  const client = getTrackingClient();
  const { order_id, current_location, destination } = req.body;

  client.CalculateETA({
    order_id,
    current_location,
    destination
  }, (error, response) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(response);
  });
});

module.exports = router;
