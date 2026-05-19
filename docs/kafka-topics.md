# Documentation Kafka Topics

## Vue d'ensemble

Le système utilise Kafka pour la communication asynchrone entre les microservices. Chaque événement métier important est publié sur un topic Kafka.

## Topics

### 1. order.created

**Producteur**: Order Service  
**Consommateurs**: Delivery Service

**Description**: Publié lorsqu'une nouvelle commande est créée.

**Structure du message**:
```json
{
  "order_id": "550e8400-e29b-41d4-a716-446655440000",
  "customer_name": "Ahmed Ben Ali",
  "pickup_address": "Avenue Habib Bourguiba, Tunis",
  "delivery_address": "Rue de la Liberté, La Marsa",
  "package_weight": 0.5,
  "created_at": "2025-05-19T10:30:00Z"
}
```

**Scénario métier**:
1. Client crée une commande via l'API Gateway
2. Order Service enregistre la commande
3. Order Service publie `order.created`
4. Delivery Service reçoit l'événement et assigne automatiquement un livreur disponible

---

### 2. order.updated

**Producteur**: Order Service  
**Consommateurs**: (Aucun actuellement, peut être utilisé pour notifications)

**Description**: Publié lorsqu'une commande est mise à jour.

**Structure du message**:
```json
{
  "order_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "IN_TRANSIT",
  "updated_at": "2025-05-19T10:35:00Z"
}
```

---

### 3. order.cancelled

**Producteur**: Order Service  
**Consommateurs**: Delivery Service (pour libérer le livreur)

**Description**: Publié lorsqu'une commande est annulée.

**Structure du message**:
```json
{
  "order_id": "550e8400-e29b-41d4-a716-446655440000",
  "reason": "Client a annulé",
  "cancelled_at": "2025-05-19T10:40:00Z"
}
```

---

### 4. delivery.assigned

**Producteur**: Delivery Service  
**Consommateurs**: Order Service, Tracking Service

**Description**: Publié lorsqu'un livreur est assigné à une commande.

**Structure du message**:
```json
{
  "delivery_id": "660e8400-e29b-41d4-a716-446655440001",
  "order_id": "550e8400-e29b-41d4-a716-446655440000",
  "driver_id": "driver-1",
  "driver_name": "Ahmed Ben Ali",
  "driver_phone": "+216 20 123 456",
  "vehicle_type": "Moto",
  "assigned_at": "2025-05-19T10:31:00Z"
}
```

**Scénario métier**:
1. Delivery Service assigne un livreur (automatiquement ou manuellement)
2. Delivery Service publie `delivery.assigned`
3. Order Service reçoit l'événement et met à jour le statut de la commande à "ASSIGNED"
4. Tracking Service reçoit l'événement et démarre le suivi de la livraison

---

### 5. delivery.status.changed

**Producteur**: Delivery Service  
**Consommateurs**: Order Service, Notification Service (futur)

**Description**: Publié lorsque le statut d'une livraison change.

**Structure du message**:
```json
{
  "delivery_id": "660e8400-e29b-41d4-a716-446655440001",
  "order_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "PICKED_UP",
  "updated_at": "2025-05-19T10:32:00Z"
}
```

**Statuts possibles**:
- `ASSIGNED` - Livreur assigné
- `PICKED_UP` - Colis récupéré
- `IN_TRANSIT` - En cours de livraison
- `DELIVERED` - Livré

---

### 6. tracking.location.updated

**Producteur**: Tracking Service  
**Consommateurs**: Delivery Service, Notification Service (futur)

**Description**: Publié lorsque la position du livreur est mise à jour.

**Structure du message**:
```json
{
  "order_id": "550e8400-e29b-41d4-a716-446655440000",
  "current_location": {
    "latitude": 36.8100,
    "longitude": 10.1750
  },
  "distance_remaining_km": 1.7,
  "estimated_minutes": 3,
  "updated_at": "2025-05-19T10:35:00Z"
}
```

**Scénario métier**:
1. Livreur se déplace (app mobile envoie la position)
2. Tracking Service met à jour la position
3. Tracking Service recalcule l'ETA
4. Tracking Service publie `tracking.location.updated`
5. Les consommateurs peuvent réagir (ex: notifier le client)

---

## Configuration Kafka

### Broker
- **Host**: localhost
- **Port**: 9092

### Consumer Groups
- `order-service-group` - Order Service
- `delivery-service-group` - Delivery Service
- `tracking-service-group` - Tracking Service

### Partitions
Tous les topics utilisent 1 partition par défaut (suffisant pour un projet académique).

### Réplication
Facteur de réplication: 1 (pas de réplication en développement local).

## Démarrer Kafka

### Avec Docker Compose
```bash
docker-compose up -d zookeeper kafka
```

### Vérifier les topics
```bash
docker exec -it <kafka-container-id> kafka-topics --list --bootstrap-server localhost:9092
```

### Créer un topic manuellement (optionnel)
```bash
docker exec -it <kafka-container-id> kafka-topics --create \
  --bootstrap-server localhost:9092 \
  --topic order.created \
  --partitions 1 \
  --replication-factor 1
```

### Consommer un topic (pour debug)
```bash
docker exec -it <kafka-container-id> kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic order.created \
  --from-beginning
```

## Avantages de Kafka

1. **Découplage** : Les microservices ne se connaissent pas directement
2. **Asynchrone** : Les événements sont traités de manière asynchrone
3. **Résilience** : Si un consommateur est down, les messages sont conservés
4. **Scalabilité** : Facile d'ajouter de nouveaux consommateurs
5. **Historique** : Les événements sont persistés et peuvent être rejoués
