const express = require('express');
const router = express.Router();
const { getDeliveryClient } = require('../grpc/clients');

// POST /api/deliveries/assign - Assigner un livreur
router.post('/assign', (req, res) => {
  const client = getDeliveryClient();
  const { order_id, driver_id } = req.body;

  client.AssignDriver({ order_id, driver_id }, (error, response) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(201).json(response);
  });
});

// GET /api/deliveries/:orderId - Obtenir une livraison
router.get('/:orderId', (req, res) => {
  const client = getDeliveryClient();
  
  client.GetDelivery({ order_id: req.params.orderId }, (error, response) => {
    if (error) {
      if (error.code === 5) {
        return res.status(404).json({ error: 'Livraison non trouvée' });
      }
      return res.status(500).json({ error: error.message });
    }
    res.json(response);
  });
});

// PUT /api/deliveries/:orderId/status - Mettre à jour le statut
router.put('/:orderId/status', (req, res) => {
  const client = getDeliveryClient();
  const { status, current_location } = req.body;

  client.UpdateDeliveryStatus({
    order_id: req.params.orderId,
    status,
    current_location
  }, (error, response) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(response);
  });
});

// GET /api/deliveries/drivers/available - Lister les livreurs disponibles
router.get('/drivers/available', (req, res) => {
  const client = getDeliveryClient();
  
  client.ListAvailableDrivers({}, (error, response) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(response);
  });
});

// GET /api/deliveries/drivers/:driverId - Obtenir un livreur
router.get('/drivers/:driverId', (req, res) => {
  const client = getDeliveryClient();
  
  client.GetDriver({ driver_id: req.params.driverId }, (error, response) => {
    if (error) {
      if (error.code === 5) {
        return res.status(404).json({ error: 'Livreur non trouvé' });
      }
      return res.status(500).json({ error: error.message });
    }
    res.json(response);
  });
});

module.exports = router;
