const express = require('express');
const router = express.Router();
const { getOrderClient } = require('../grpc/clients');

// POST /api/orders - Créer une commande
router.post('/', (req, res) => {
  const client = getOrderClient();
  const { customer_name, customer_phone, pickup_address, delivery_address, 
          package_description, package_weight } = req.body;

  client.CreateOrder({
    customer_name,
    customer_phone,
    pickup_address,
    delivery_address,
    package_description,
    package_weight
  }, (error, response) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(201).json(response);
  });
});

// GET /api/orders - Lister les commandes
router.get('/', (req, res) => {
  const client = getOrderClient();
  const { page = 1, limit = 10, status } = req.query;

  client.ListOrders({
    page: parseInt(page),
    limit: parseInt(limit),
    status: status || ''
  }, (error, response) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(response);
  });
});

// GET /api/orders/:id - Obtenir une commande
router.get('/:id', (req, res) => {
  const client = getOrderClient();
  
  client.GetOrder({ order_id: req.params.id }, (error, response) => {
    if (error) {
      if (error.code === 5) {
        return res.status(404).json({ error: 'Commande non trouvée' });
      }
      return res.status(500).json({ error: error.message });
    }
    res.json(response);
  });
});

// PUT /api/orders/:id - Mettre à jour une commande
router.put('/:id', (req, res) => {
  const client = getOrderClient();
  const { status, delivery_address } = req.body;

  client.UpdateOrder({
    order_id: req.params.id,
    status,
    delivery_address
  }, (error, response) => {
    if (error) {
      if (error.code === 5) {
        return res.status(404).json({ error: 'Commande non trouvée' });
      }
      return res.status(500).json({ error: error.message });
    }
    res.json(response);
  });
});

// DELETE /api/orders/:id - Annuler une commande
router.delete('/:id', (req, res) => {
  const client = getOrderClient();
  const { reason } = req.body;

  client.CancelOrder({
    order_id: req.params.id,
    reason
  }, (error, response) => {
    if (error) {
      if (error.code === 5) {
        return res.status(404).json({ error: 'Commande non trouvée' });
      }
      return res.status(500).json({ error: error.message });
    }
    res.json(response);
  });
});

module.exports = router;
