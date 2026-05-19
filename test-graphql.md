# Tests GraphQL

Ouvrir http://localhost:3000/graphql dans votre navigateur.

## Test 1 : Lister les livreurs disponibles

```graphql
query {
  availableDrivers {
    driver_id
    name
    phone
    vehicle_type
    vehicle_plate
    rating
    total_deliveries
    current_location {
      latitude
      longitude
    }
  }
}
```

## Test 2 : Créer une commande

```graphql
mutation {
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

## Test 3 : Obtenir une commande complète

```graphql
query {
  order(id: "REMPLACER_PAR_ORDER_ID") {
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

## Test 4 : Lister toutes les commandes

```graphql
query {
  orders(page: 1, limit: 10) {
    order_id
    customer_name
    delivery_address
    status
    created_at
  }
}
```

## Test 5 : Mettre à jour la position

```graphql
mutation {
  updateLocation(
    order_id: "REMPLACER_PAR_ORDER_ID"
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

## Test 6 : Obtenir le tracking

```graphql
query {
  tracking(orderId: "REMPLACER_PAR_ORDER_ID") {
    tracking_id
    current_location {
      latitude
      longitude
    }
    pickup_location {
      latitude
      longitude
    }
    delivery_location {
      latitude
      longitude
    }
    distance_traveled_km
    distance_remaining_km
    estimated_minutes
    status
    last_updated
  }
}
```

## Test 7 : Assigner un livreur manuellement

```graphql
mutation {
  assignDriver(
    order_id: "REMPLACER_PAR_ORDER_ID"
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

## Test 8 : Mettre à jour le statut de livraison

```graphql
mutation {
  updateDeliveryStatus(
    order_id: "REMPLACER_PAR_ORDER_ID"
    status: "PICKED_UP"
    current_location: {
      latitude: 36.8065
      longitude: 10.1815
    }
  ) {
    delivery_id
    status
    driver {
      name
    }
  }
}
```
