# API Gateway

Point d'entrée principal de l'application. Expose des interfaces REST et GraphQL et communique avec les microservices via gRPC.

## Responsabilités

- Exposer des endpoints REST pour les opérations CRUD
- Exposer un schéma GraphQL pour des requêtes flexibles
- Router les requêtes vers les microservices appropriés via gRPC
- Agréger les données de plusieurs microservices

## Endpoints REST

### Orders
- `POST /api/orders` - Créer une commande
- `GET /api/orders` - Lister les commandes
- `GET /api/orders/:id` - Obtenir une commande
- `PUT /api/orders/:id` - Mettre à jour une commande
- `DELETE /api/orders/:id` - Annuler une commande

### Deliveries
- `POST /api/deliveries/assign` - Assigner un livreur
- `GET /api/deliveries/:orderId` - Obtenir une livraison
- `PUT /api/deliveries/:orderId/status` - Mettre à jour le statut
- `GET /api/deliveries/drivers/available` - Livreurs disponibles
- `GET /api/deliveries/drivers/:driverId` - Obtenir un livreur

### Tracking
- `POST /api/tracking/start` - Démarrer le suivi
- `PUT /api/tracking/:orderId/location` - Mettre à jour la position
- `GET /api/tracking/:orderId` - Position actuelle
- `GET /api/tracking/:orderId/history` - Historique des positions
- `POST /api/tracking/calculate-eta` - Calculer l'ETA

## GraphQL

Endpoint: `http://localhost:3000/graphql`

### Exemple de requête

```graphql
query {
  order(id: "order-123") {
    order_id
    customer_name
    status
    delivery {
      driver {
        name
        phone
        vehicle_type
      }
      status
    }
    tracking {
      current_location {
        latitude
        longitude
      }
      estimated_minutes
    }
  }
}
```

## Installation

```bash
npm install
```

## Configuration

Copier `.env.example` vers `.env` et ajuster les valeurs.

## Démarrage

```bash
npm start
```

L'API Gateway démarre sur le port 3000 par défaut.
