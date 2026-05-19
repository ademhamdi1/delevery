# Documentation des Services gRPC

## Vue d'ensemble

Les microservices communiquent entre eux via gRPC (HTTP/2 + Protobuf). L'API Gateway utilise gRPC pour appeler les microservices.

## Avantages de gRPC

1. **Performance** : HTTP/2 + Protobuf = très rapide
2. **Typage fort** : Les fichiers .proto définissent les contrats
3. **Génération de code** : Clients et serveurs générés automatiquement
4. **Streaming** : Support du streaming bidirectionnel (non utilisé ici)
5. **Multi-langage** : Peut être utilisé avec n'importe quel langage

---

## Order Service (Port 50051)

**Fichier proto**: `proto/order.proto`

### Service: OrderService

#### CreateOrder
Créer une nouvelle commande.

**Request**:
```protobuf
message CreateOrderRequest {
  string customer_name = 1;
  string customer_phone = 2;
  string pickup_address = 3;
  string delivery_address = 4;
  string package_description = 5;
  double package_weight = 6;
}
```

**Response**:
```protobuf
message OrderResponse {
  string order_id = 1;
  string customer_name = 2;
  string customer_phone = 3;
  string pickup_address = 4;
  string delivery_address = 5;
  string package_description = 6;
  double package_weight = 7;
  string status = 8;
  string created_at = 9;
  string updated_at = 10;
}
```

#### GetOrder
Obtenir une commande par ID.

**Request**:
```protobuf
message GetOrderRequest {
  string order_id = 1;
}
```

**Response**: `OrderResponse`

#### ListOrders
Lister les commandes avec pagination.

**Request**:
```protobuf
message ListOrdersRequest {
  int32 page = 1;
  int32 limit = 2;
  string status = 3; // optional filter
}
```

**Response**:
```protobuf
message ListOrdersResponse {
  repeated OrderResponse orders = 1;
  int32 total = 2;
}
```

#### UpdateOrder
Mettre à jour une commande.

**Request**:
```protobuf
message UpdateOrderRequest {
  string order_id = 1;
  string status = 2;
  string delivery_address = 3;
}
```

**Response**: `OrderResponse`

#### CancelOrder
Annuler une commande.

**Request**:
```protobuf
message CancelOrderRequest {
  string order_id = 1;
  string reason = 2;
}
```

**Response**: `OrderResponse`

---

## Delivery Service (Port 50052)

**Fichier proto**: `proto/delivery.proto`

### Service: DeliveryService

#### AssignDriver
Assigner un livreur à une commande.

**Request**:
```protobuf
message AssignDriverRequest {
  string order_id = 1;
  string driver_id = 2; // optional, auto-assign if empty
}
```

**Response**:
```protobuf
message DeliveryResponse {
  string delivery_id = 1;
  string order_id = 2;
  string driver_id = 3;
  string driver_name = 4;
  string driver_phone = 5;
  string vehicle_type = 6;
  string vehicle_plate = 7;
  string status = 8;
  Location current_location = 9;
  string assigned_at = 10;
  string picked_up_at = 11;
  string delivered_at = 12;
}
```

#### GetDelivery
Obtenir les informations de livraison.

**Request**:
```protobuf
message GetDeliveryRequest {
  string order_id = 1;
}
```

**Response**: `DeliveryResponse`

#### UpdateDeliveryStatus
Mettre à jour le statut de livraison.

**Request**:
```protobuf
message UpdateDeliveryStatusRequest {
  string order_id = 1;
  string status = 2;
  Location current_location = 3;
}
```

**Response**: `DeliveryResponse`

#### ListAvailableDrivers
Lister les livreurs disponibles.

**Request**:
```protobuf
message ListAvailableDriversRequest {
  Location near_location = 1;
  double radius_km = 2;
}
```

**Response**:
```protobuf
message ListDriversResponse {
  repeated DriverResponse drivers = 1;
}
```

#### GetDriver
Obtenir les informations d'un livreur.

**Request**:
```protobuf
message GetDriverRequest {
  string driver_id = 1;
}
```

**Response**:
```protobuf
message DriverResponse {
  string driver_id = 1;
  string name = 2;
  string phone = 3;
  string vehicle_type = 4;
  string vehicle_plate = 5;
  bool is_available = 6;
  Location current_location = 7;
  double rating = 8;
  int32 total_deliveries = 9;
}
```

---

## Tracking Service (Port 50053)

**Fichier proto**: `proto/tracking.proto`

### Service: TrackingService

#### StartTracking
Démarrer le suivi d'une livraison.

**Request**:
```protobuf
message StartTrackingRequest {
  string order_id = 1;
  string driver_id = 2;
  Location pickup_location = 3;
  Location delivery_location = 4;
}
```

**Response**:
```protobuf
message TrackingResponse {
  string tracking_id = 1;
  string order_id = 2;
  Location current_location = 3;
  Location pickup_location = 4;
  Location delivery_location = 5;
  double distance_traveled_km = 6;
  double distance_remaining_km = 7;
  int32 estimated_minutes = 8;
  string status = 9;
  string last_updated = 10;
}
```

#### UpdateLocation
Mettre à jour la position.

**Request**:
```protobuf
message UpdateLocationRequest {
  string order_id = 1;
  Location current_location = 2;
  double speed = 3; // km/h
  double heading = 4; // degrees
}
```

**Response**: `TrackingResponse`

#### GetCurrentLocation
Obtenir la position actuelle.

**Request**:
```protobuf
message GetCurrentLocationRequest {
  string order_id = 1;
}
```

**Response**: `TrackingResponse`

#### GetLocationHistory
Obtenir l'historique des positions.

**Request**:
```protobuf
message GetLocationHistoryRequest {
  string order_id = 1;
  string from_time = 2;
  string to_time = 3;
}
```

**Response**:
```protobuf
message LocationHistoryResponse {
  repeated LocationPoint points = 1;
}

message LocationPoint {
  Location location = 1;
  string timestamp = 2;
  double speed = 3;
}
```

#### CalculateETA
Calculer le temps estimé d'arrivée.

**Request**:
```protobuf
message CalculateETARequest {
  string order_id = 1;
  Location current_location = 2;
  Location destination = 3;
}
```

**Response**:
```protobuf
message ETAResponse {
  int32 estimated_minutes = 1;
  double distance_km = 2;
  string arrival_time = 3;
}
```

---

## Type commun: Location

```protobuf
message Location {
  double latitude = 1;
  double longitude = 2;
}
```

---

## Gestion des erreurs gRPC

### Codes d'erreur utilisés

| Code | Nom | Utilisation |
|------|-----|-------------|
| 3 | INVALID_ARGUMENT | Paramètres invalides ou manquants |
| 5 | NOT_FOUND | Ressource non trouvée |
| 9 | FAILED_PRECONDITION | Condition préalable non remplie (ex: aucun livreur disponible) |
| 13 | INTERNAL | Erreur interne du serveur |

### Exemple de gestion d'erreur

```javascript
client.GetOrder({ order_id: 'invalid-id' }, (error, response) => {
  if (error) {
    if (error.code === 5) {
      console.log('Commande non trouvée');
    } else {
      console.log('Erreur:', error.message);
    }
    return;
  }
  console.log('Commande:', response);
});
```

---

## Tester les services gRPC

### Avec grpcurl (outil CLI)

#### Installer grpcurl
```bash
# macOS
brew install grpcurl

# Linux
go install github.com/fullstorydev/grpcurl/cmd/grpcurl@latest
```

#### Lister les services
```bash
grpcurl -plaintext localhost:50051 list
```

#### Appeler une méthode
```bash
grpcurl -plaintext -d '{
  "customer_name": "Test User",
  "customer_phone": "+216 20 123 456",
  "pickup_address": "Tunis",
  "delivery_address": "La Marsa"
}' localhost:50051 order.OrderService/CreateOrder
```

### Avec BloomRPC (GUI)

1. Télécharger BloomRPC : https://github.com/bloomrpc/bloomrpc
2. Importer les fichiers `.proto`
3. Configurer l'adresse du serveur
4. Tester les méthodes

---

## Bonnes pratiques

1. **Contrats clairs** : Les fichiers .proto définissent les contrats
2. **Versioning** : Utiliser des versions pour les changements breaking
3. **Timeouts** : Définir des timeouts pour éviter les blocages
4. **Retry logic** : Implémenter des retries pour la résilience
5. **Logging** : Logger les appels gRPC pour le debug
6. **Validation** : Valider les paramètres côté serveur
7. **Documentation** : Commenter les fichiers .proto
