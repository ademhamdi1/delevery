# 🔷 Guide de Tests gRPC

Ce document contient tous les tests gRPC pour les 3 microservices.

---

## 📋 Table des matières

1. [Order Service (localhost:50051)](#order-service)
2. [Delivery Service (localhost:50052)](#delivery-service)
3. [Tracking Service (localhost:50053)](#tracking-service)

---

## 🔷 ORDER SERVICE (localhost:50051)

### 1. CreateOrder

**Service:** `OrderService / CreateOrder`

**Message:**
```json
{
  "customer_name": "Test gRPC",
  "customer_phone": "+216 20 999 888",
  "pickup_address": "Tunis Centre",
  "delivery_address": "La Marsa",
  "package_description": "Colis test",
  "package_weight": 2.5
}
```

**Réponse attendue:**
```json
{
  "order_id": "uuid-generated",
  "customer_name": "Test gRPC",
  "customer_phone": "+216 20 999 888",
  "pickup_address": "Tunis Centre",
  "delivery_address": "La Marsa",
  "package_description": "Colis test",
  "package_weight": 2.5,
  "status": "PENDING",
  "created_at": "2026-05-20T00:00:00.000Z",
  "updated_at": "2026-05-20T00:00:00.000Z"
}
```

---

### 2. GetOrder

**Service:** `OrderService / GetOrder`

**Message:**
```json
{
  "order_id": "VOTRE_ORDER_ID"
}
```

**Réponse attendue:**
```json
{
  "order_id": "VOTRE_ORDER_ID",
  "customer_name": "Test gRPC",
  "status": "PENDING",
  ...
}
```

---

### 3. ListOrders

**Service:** `OrderService / ListOrders`

**Message:**
```json
{
  "page": 1,
  "limit": 10,
  "status": ""
}
```

**Réponse attendue:**
```json
{
  "orders": [
    {
      "order_id": "...",
      "customer_name": "...",
      ...
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10
}
```

---

### 4. UpdateOrder

**Service:** `OrderService / UpdateOrder`

**Message:**
```json
{
  "order_id": "VOTRE_ORDER_ID",
  "status": "CONFIRMED",
  "delivery_address": "Nouvelle adresse"
}
```

**Réponse attendue:**
```json
{
  "order_id": "VOTRE_ORDER_ID",
  "status": "CONFIRMED",
  "delivery_address": "Nouvelle adresse",
  "updated_at": "2026-05-20T00:00:00.000Z"
}
```

---

### 5. CancelOrder

**Service:** `OrderService / CancelOrder`

**Message:**
```json
{
  "order_id": "VOTRE_ORDER_ID",
  "reason": "Client a annulé"
}
```

**Réponse attendue:**
```json
{
  "order_id": "VOTRE_ORDER_ID",
  "status": "CANCELLED",
  "cancelled_at": "2026-05-20T00:00:00.000Z"
}
```

---

## 🔷 DELIVERY SERVICE (localhost:50052)

### 1. AssignDriver

**Service:** `DeliveryService / AssignDriver`

**Message:**
```json
{
  "order_id": "VOTRE_ORDER_ID",
  "driver_id": ""
}
```
*Note: Laissez `driver_id` vide pour auto-assignment*

**Réponse attendue:**
```json
{
  "delivery_id": "uuid-generated",
  "order_id": "VOTRE_ORDER_ID",
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
  "assigned_at": "2026-05-20T00:00:00.000Z",
  "picked_up_at": "",
  "delivered_at": ""
}
```

---

### 2. GetDelivery

**Service:** `DeliveryService / GetDelivery`

**Message:**
```json
{
  "order_id": "VOTRE_ORDER_ID"
}
```

**Réponse attendue:**
```json
{
  "delivery_id": "...",
  "order_id": "VOTRE_ORDER_ID",
  "driver_id": "driver-1",
  "driver_name": "Ahmed Ben Ali",
  "status": "ASSIGNED",
  ...
}
```

---

### 3. UpdateDeliveryStatus

**Service:** `DeliveryService / UpdateDeliveryStatus`

**Message (PICKED_UP):**
```json
{
  "order_id": "VOTRE_ORDER_ID",
  "status": "PICKED_UP"
}
```

**Message (DELIVERED):**
```json
{
  "order_id": "VOTRE_ORDER_ID",
  "status": "DELIVERED"
}
```

**Réponse attendue:**
```json
{
  "delivery_id": "...",
  "order_id": "VOTRE_ORDER_ID",
  "status": "DELIVERED",
  "picked_up_at": "2026-05-20T00:00:00.000Z",
  "delivered_at": "2026-05-20T00:01:00.000Z"
}
```

---

### 4. ListAvailableDrivers

**Service:** `DeliveryService / ListAvailableDrivers`

**Message:**
```json
{}
```

**Réponse attendue:**
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
    },
    {
      "driver_id": "driver-2",
      "name": "Fatma Trabelsi",
      "phone": "+216 22 234 567",
      "vehicle_type": "Voiture",
      "vehicle_plate": "TUN 5678",
      "is_available": true,
      "current_location": {
        "latitude": 36.8189,
        "longitude": 10.1658
      },
      "rating": 4.9,
      "total_deliveries": 200
    }
  ]
}
```

---

### 5. GetDriver

**Service:** `DeliveryService / GetDriver`

**Message:**
```json
{
  "driver_id": "driver-1"
}
```

**Réponse attendue:**
```json
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
```

---

## 🔷 TRACKING SERVICE (localhost:50053)

### 1. StartTracking

**Service:** `TrackingService / StartTracking`

**Message:**
```json
{
  "order_id": "VOTRE_ORDER_ID",
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

**Réponse attendue:**
```json
{
  "tracking_id": "uuid-generated",
  "order_id": "VOTRE_ORDER_ID",
  "current_location": null,
  "pickup_location": {
    "latitude": 36.8065,
    "longitude": 10.1815
  },
  "delivery_location": {
    "latitude": 36.8189,
    "longitude": 10.1658
  },
  "distance_traveled_km": 0,
  "distance_remaining_km": 2.5,
  "estimated_minutes": 5,
  "status": "TRACKING",
  "last_updated": "2026-05-20T00:00:00.000Z"
}
```

---

### 2. UpdateLocation

**Service:** `TrackingService / UpdateLocation`

**Message:**
```json
{
  "order_id": "VOTRE_ORDER_ID",
  "current_location": {
    "latitude": 36.8150,
    "longitude": 10.1700
  }
}
```

**Réponse attendue:**
```json
{
  "tracking_id": "...",
  "order_id": "VOTRE_ORDER_ID",
  "current_location": {
    "latitude": 36.8150,
    "longitude": 10.1700
  },
  "distance_traveled_km": 0.5,
  "distance_remaining_km": 1.2,
  "estimated_minutes": 3,
  "status": "TRACKING",
  "last_updated": "2026-05-20T00:01:00.000Z"
}
```

---

### 3. GetCurrentLocation

**Service:** `TrackingService / GetCurrentLocation`

**Message:**
```json
{
  "order_id": "VOTRE_ORDER_ID"
}
```

**Réponse attendue:**
```json
{
  "order_id": "VOTRE_ORDER_ID",
  "current_location": {
    "latitude": 36.8150,
    "longitude": 10.1700
  },
  "last_updated": "2026-05-20T00:01:00.000Z"
}
```

---

### 4. GetLocationHistory

**Service:** `TrackingService / GetLocationHistory`

**Message:**
```json
{
  "order_id": "VOTRE_ORDER_ID"
}
```

**Réponse attendue:**
```json
{
  "order_id": "VOTRE_ORDER_ID",
  "locations": [
    {
      "latitude": 36.8065,
      "longitude": 10.1815,
      "timestamp": "2026-05-20T00:00:00.000Z"
    },
    {
      "latitude": 36.8150,
      "longitude": 10.1700,
      "timestamp": "2026-05-20T00:01:00.000Z"
    }
  ]
}
```

---

### 5. CalculateETA

**Service:** `TrackingService / CalculateETA`

**Message:**
```json
{
  "order_id": "VOTRE_ORDER_ID",
  "current_location": {
    "latitude": 36.8150,
    "longitude": 10.1700
  },
  "destination": {
    "latitude": 36.8189,
    "longitude": 10.1658
  }
}
```

**Réponse attendue:**
```json
{
  "order_id": "VOTRE_ORDER_ID",
  "distance_km": 1.2,
  "estimated_minutes": 3,
  "calculated_at": "2026-05-20T00:01:00.000Z"
}
```

---

## 🔧 Configuration Postman pour gRPC

### 1. Importer les fichiers .proto

1. Ouvrez Postman
2. Créez une nouvelle requête gRPC
3. Cliquez sur "Import .proto file"
4. Sélectionnez les fichiers:
   - `proto/order.proto`
   - `proto/delivery.proto`
   - `proto/tracking.proto`

### 2. Configuration des URLs

- **Order Service:** `localhost:50051`
- **Delivery Service:** `localhost:50052`
- **Tracking Service:** `localhost:50053`

### 3. Ordre de test recommandé

1. **CreateOrder** (Order Service)
2. **AssignDriver** (Delivery Service) - ou attendre l'auto-assignment
3. **GetDelivery** (Delivery Service)
4. **StartTracking** (Tracking Service) - ou attendre l'auto-création
5. **GetTracking** (Tracking Service)
6. **UpdateDeliveryStatus** à PICKED_UP (Delivery Service)
7. **UpdateLocation** (Tracking Service)
8. **CalculateETA** (Tracking Service)
9. **UpdateDeliveryStatus** à DELIVERED (Delivery Service)
10. **ListAvailableDrivers** (Delivery Service) - vérifier que le livreur est redevenu disponible

---

## 📝 Notes importantes

- **RxDB est en mémoire:** Si vous redémarrez le delivery-service, les livreurs seront réinitialisés
- **Auto-assignment:** Attendez 3-5 secondes après CreateOrder pour que Kafka fasse l'auto-assignment
- **Tracking automatique:** Le tracking est créé automatiquement via Kafka quand un livreur est assigné
- **Order ID:** Copiez toujours l'order_id de CreateOrder pour l'utiliser dans les autres tests

---

## 🐛 Troubleshooting

### "NOT_FOUND: Livraison non trouvée"
- La livraison n'existe pas encore (attendez l'auto-assignment)
- Ou le delivery-service a été redémarré (créez une nouvelle commande)

### "FAILED_PRECONDITION: Aucun livreur disponible"
- Tous les livreurs sont occupés
- Marquez une livraison comme DELIVERED pour libérer un livreur
- Ou redémarrez le delivery-service

### "INVALID_ARGUMENT"
- Vérifiez que tous les champs requis sont remplis
- Vérifiez la syntaxe JSON
- Vérifiez les noms des champs (ex: `destination` et non `destination_location`)

---

## ✅ Checklist de test complet

- [ ] Order Service - CreateOrder
- [ ] Order Service - GetOrder
- [ ] Order Service - ListOrders
- [ ] Order Service - UpdateOrder
- [ ] Order Service - CancelOrder
- [ ] Delivery Service - AssignDriver
- [ ] Delivery Service - GetDelivery
- [ ] Delivery Service - UpdateDeliveryStatus (PICKED_UP)
- [ ] Delivery Service - UpdateDeliveryStatus (DELIVERED)
- [ ] Delivery Service - ListAvailableDrivers
- [ ] Delivery Service - GetDriver
- [ ] Tracking Service - StartTracking
- [ ] Tracking Service - UpdateLocation
- [ ] Tracking Service - GetCurrentLocation
- [ ] Tracking Service - GetLocationHistory
- [ ] Tracking Service - CalculateETA
