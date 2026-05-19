# Documentation GraphQL

Endpoint: `http://localhost:3000/graphql`

## Schéma

### Types

```graphql
type Location {
  latitude: Float!
  longitude: Float!
}

type Order {
  order_id: String!
  customer_name: String!
  customer_phone: String!
  pickup_address: String!
  delivery_address: String!
  package_description: String
  package_weight: Float
  status: String!
  created_at: String!
  updated_at: String!
  delivery: Delivery
  tracking: Tracking
}

type Driver {
  driver_id: String!
  name: String!
  phone: String!
  vehicle_type: String!
  vehicle_plate: String!
  is_available: Boolean!
  current_location: Location
  rating: Float
  total_deliveries: Int
}

type Delivery {
  delivery_id: String!
  order_id: String!
  driver: Driver!
  status: String!
  current_location: Location
  assigned_at: String!
  picked_up_at: String
  delivered_at: String
}

type Tracking {
  tracking_id: String!
  order_id: String!
  current_location: Location
  pickup_location: Location!
  delivery_location: Location!
  distance_traveled_km: Float!
  distance_remaining_km: Float!
  estimated_minutes: Int!
  status: String!
  last_updated: String!
}
```

### Queries

```graphql
type Query {
  # Obtenir une commande avec toutes ses informations
  order(id: String!): Order
  
  # Lister les commandes
  orders(page: Int, limit: Int, status: String): [Order!]!
  
  # Obtenir une livraison
  delivery(orderId: String!): Delivery
  
  # Lister les livreurs disponibles
  availableDrivers: [Driver!]!
  
  # Obtenir un livreur
  driver(id: String!): Driver
  
  # Obtenir le tracking
  tracking(orderId: String!): Tracking
}
```

### Mutations

```graphql
type Mutation {
  # Créer une commande
  createOrder(
    customer_name: String!
    customer_phone: String!
    pickup_address: String!
    delivery_address: String!
    package_description: String
    package_weight: Float
  ): Order!

  # Assigner un livreur
  assignDriver(order_id: String!, driver_id: String): Delivery!

  # Mettre à jour le statut de livraison
  updateDeliveryStatus(
    order_id: String!
    status: String!
    current_location: LocationInput
  ): Delivery!

  # Mettre à jour la position
  updateLocation(
    order_id: String!
    current_location: LocationInput!
    speed: Float
  ): Tracking!
}

input LocationInput {
  latitude: Float!
  longitude: Float!
}
```

## Exemples de requêtes

### 1. Obtenir une commande complète avec livraison et tracking

```graphql
query GetCompleteOrder {
  order(id: "550e8400-e29b-41d4-a716-446655440000") {
    order_id
    customer_name
    customer_phone
    pickup_address
    delivery_address
    status
    delivery {
      delivery_id
      status
      driver {
        name
        phone
        vehicle_type
        vehicle_plate
        rating
      }
      assigned_at
    }
    tracking {
      current_location {
        latitude
        longitude
      }
      distance_remaining_km
      estimated_minutes
      last_updated
    }
  }
}
```

**Réponse:**
```json
{
  "data": {
    "order": {
      "order_id": "550e8400-e29b-41d4-a716-446655440000",
      "customer_name": "Ahmed Ben Ali",
      "customer_phone": "+216 20 123 456",
      "pickup_address": "Avenue Habib Bourguiba, Tunis",
      "delivery_address": "Rue de la Liberté, La Marsa",
      "status": "IN_TRANSIT",
      "delivery": {
        "delivery_id": "660e8400-e29b-41d4-a716-446655440001",
        "status": "PICKED_UP",
        "driver": {
          "name": "Mohamed Gharbi",
          "phone": "+216 24 345 678",
          "vehicle_type": "Moto",
          "vehicle_plate": "TUN 9012",
          "rating": 4.7
        },
        "assigned_at": "2025-05-19T10:31:00Z"
      },
      "tracking": {
        "current_location": {
          "latitude": 36.8100,
          "longitude": 10.1750
        },
        "distance_remaining_km": 1.7,
        "estimated_minutes": 3,
        "last_updated": "2025-05-19T10:35:00Z"
      }
    }
  }
}
```

### 2. Lister toutes les commandes en cours

```graphql
query ListActiveOrders {
  orders(status: "IN_TRANSIT", limit: 20) {
    order_id
    customer_name
    delivery_address
    status
    delivery {
      driver {
        name
        vehicle_type
      }
    }
  }
}
```

### 3. Obtenir les livreurs disponibles

```graphql
query GetAvailableDrivers {
  availableDrivers {
    driver_id
    name
    phone
    vehicle_type
    current_location {
      latitude
      longitude
    }
    rating
    total_deliveries
  }
}
```

### 4. Créer une commande

```graphql
mutation CreateNewOrder {
  createOrder(
    customer_name: "Fatma Trabelsi"
    customer_phone: "+216 22 234 567"
    pickup_address: "Centre Ville, Tunis"
    delivery_address: "Carthage, Tunis"
    package_description: "Colis fragile"
    package_weight: 2.5
  ) {
    order_id
    customer_name
    status
    created_at
  }
}
```

### 5. Assigner un livreur

```graphql
mutation AssignDriverToOrder {
  assignDriver(
    order_id: "550e8400-e29b-41d4-a716-446655440000"
    driver_id: "driver-2"
  ) {
    delivery_id
    driver {
      name
      phone
      vehicle_type
    }
    status
    assigned_at
  }
}
```

### 6. Mettre à jour la position

```graphql
mutation UpdateDriverLocation {
  updateLocation(
    order_id: "550e8400-e29b-41d4-a716-446655440000"
    current_location: {
      latitude: 36.8150
      longitude: 10.1700
    }
    speed: 40.0
  ) {
    tracking_id
    current_location {
      latitude
      longitude
    }
    distance_remaining_km
    estimated_minutes
  }
}
```

## Avantages de GraphQL

1. **Requêtes flexibles** : Le client demande exactement les champs dont il a besoin
2. **Agrégation de données** : Une seule requête peut récupérer des données de plusieurs microservices
3. **Typage fort** : Le schéma définit clairement les types de données
4. **Introspection** : Le schéma est auto-documenté

## Tester avec Apollo Sandbox

Accédez à `http://localhost:3000/graphql` dans votre navigateur pour utiliser l'interface Apollo Sandbox et tester les requêtes interactivement.
