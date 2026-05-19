# Documentation REST API

Base URL: `http://localhost:3000/api`

## Orders

### Créer une commande
```http
POST /api/orders
Content-Type: application/json

{
  "customer_name": "Ahmed Ben Ali",
  "customer_phone": "+216 20 123 456",
  "pickup_address": "Avenue Habib Bourguiba, Tunis",
  "delivery_address": "Rue de la Liberté, La Marsa",
  "package_description": "Documents importants",
  "package_weight": 0.5
}
```

**Réponse (201 Created):**
```json
{
  "order_id": "550e8400-e29b-41d4-a716-446655440000",
  "customer_name": "Ahmed Ben Ali",
  "customer_phone": "+216 20 123 456",
  "pickup_address": "Avenue Habib Bourguiba, Tunis",
  "delivery_address": "Rue de la Liberté, La Marsa",
  "package_description": "Documents importants",
  "package_weight": 0.5,
  "status": "PENDING",
  "created_at": "2025-05-19T10:30:00Z",
  "updated_at": "2025-05-19T10:30:00Z"
}
```

### Lister les commandes
```http
GET /api/orders?page=1&limit=10&status=PENDING
```

**Réponse (200 OK):**
```json
{
  "orders": [
    {
      "order_id": "550e8400-e29b-41d4-a716-446655440000",
      "customer_name": "Ahmed Ben Ali",
      "status": "PENDING",
      ...
    }
  ],
  "total": 25
}
```

### Obtenir une commande
```http
GET /api/orders/:id
```

### Mettre à jour une commande
```http
PUT /api/orders/:id
Content-Type: application/json

{
  "status": "IN_TRANSIT",
  "delivery_address": "Nouvelle adresse"
}
```

### Annuler une commande
```http
DELETE /api/orders/:id
Content-Type: application/json

{
  "reason": "Client a annulé"
}
```

## Deliveries

### Assigner un livreur
```http
POST /api/deliveries/assign
Content-Type: application/json

{
  "order_id": "550e8400-e29b-41d4-a716-446655440000",
  "driver_id": "driver-1"
}
```

**Réponse (201 Created):**
```json
{
  "delivery_id": "660e8400-e29b-41d4-a716-446655440001",
  "order_id": "550e8400-e29b-41d4-a716-446655440000",
  "driver_id": "driver-1",
  "driver_name": "Ahmed Ben Ali",
  "driver_phone": "+216 20 123 456",
  "vehicle_type": "Moto",
  "vehicle_plate": "TUN 1234",
  "status": "ASSIGNED",
  "current_location": {
    "latitude": 36.8065,
    "longitude": 10.1815
  },
  "assigned_at": "2025-05-19T10:31:00Z"
}
```

### Obtenir une livraison
```http
GET /api/deliveries/:orderId
```

### Mettre à jour le statut de livraison
```http
PUT /api/deliveries/:orderId/status
Content-Type: application/json

{
  "status": "PICKED_UP",
  "current_location": {
    "latitude": 36.8065,
    "longitude": 10.1815
  }
}
```

### Lister les livreurs disponibles
```http
GET /api/deliveries/drivers/available
```

**Réponse (200 OK):**
```json
{
  "drivers": [
    {
      "driver_id": "driver-1",
      "name": "Ahmed Ben Ali",
      "phone": "+216 20 123 456",
      "vehicle_type": "Moto",
      "vehicle_plate": "TUN 1234",
      "is_available": true,
      "current_location": {
        "latitude": 36.8065,
        "longitude": 10.1815
      },
      "rating": 4.8,
      "total_deliveries": 150
    }
  ]
}
```

### Obtenir un livreur
```http
GET /api/deliveries/drivers/:driverId
```

## Tracking

### Démarrer le suivi
```http
POST /api/tracking/start
Content-Type: application/json

{
  "order_id": "550e8400-e29b-41d4-a716-446655440000",
  "driver_id": "driver-1",
  "pickup_location": {
    "latitude": 36.8065,
    "longitude": 10.1815
  },
  "delivery_location": {
    "latitude": 36.8189,
    "longitude": 10.1658
  }
}
```

### Mettre à jour la position
```http
PUT /api/tracking/:orderId/location
Content-Type: application/json

{
  "current_location": {
    "latitude": 36.8100,
    "longitude": 10.1750
  },
  "speed": 35.5
}
```

**Réponse (200 OK):**
```json
{
  "tracking_id": "770e8400-e29b-41d4-a716-446655440002",
  "order_id": "550e8400-e29b-41d4-a716-446655440000",
  "current_location": {
    "latitude": 36.8100,
    "longitude": 10.1750
  },
  "pickup_location": {
    "latitude": 36.8065,
    "longitude": 10.1815
  },
  "delivery_location": {
    "latitude": 36.8189,
    "longitude": 10.1658
  },
  "distance_traveled_km": 0.8,
  "distance_remaining_km": 1.7,
  "estimated_minutes": 3,
  "status": "TRACKING",
  "last_updated": "2025-05-19T10:35:00Z"
}
```

### Obtenir la position actuelle
```http
GET /api/tracking/:orderId
```

### Obtenir l'historique des positions
```http
GET /api/tracking/:orderId/history?from_time=2025-05-19T10:00:00Z&to_time=2025-05-19T11:00:00Z
```

**Réponse (200 OK):**
```json
{
  "points": [
    {
      "location": {
        "latitude": 36.8065,
        "longitude": 10.1815
      },
      "timestamp": "2025-05-19T10:30:00Z",
      "speed": 0
    },
    {
      "location": {
        "latitude": 36.8100,
        "longitude": 10.1750
      },
      "timestamp": "2025-05-19T10:35:00Z",
      "speed": 35.5
    }
  ]
}
```

### Calculer l'ETA
```http
POST /api/tracking/calculate-eta
Content-Type: application/json

{
  "order_id": "550e8400-e29b-41d4-a716-446655440000",
  "current_location": {
    "latitude": 36.8100,
    "longitude": 10.1750
  },
  "destination": {
    "latitude": 36.8189,
    "longitude": 10.1658
  }
}
```

**Réponse (200 OK):**
```json
{
  "estimated_minutes": 3,
  "distance_km": 1.7,
  "arrival_time": "2025-05-19T10:38:00Z"
}
```

## Codes d'erreur

- `400 Bad Request` - Paramètres invalides
- `404 Not Found` - Ressource non trouvée
- `500 Internal Server Error` - Erreur serveur
