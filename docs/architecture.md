# Architecture du Système de Livraison

## Vue d'ensemble

Le système de livraison en temps réel est construit sur une architecture microservices avec les composants suivants :

```
┌─────────┐
│ Client  │
└────┬────┘
     │ REST / GraphQL
     │ HTTP/1.1 + JSON
     ▼
┌─────────────────┐
│  API Gateway    │
│  - REST API     │
│  - GraphQL API  │
└────┬────────────┘
     │ gRPC
     │ HTTP/2 + Protobuf
     ├──────────────┬──────────────┐
     ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│  Order   │  │ Delivery │  │ Tracking │
│ Service  │  │ Service  │  │ Service  │
└────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │              │
     │    Kafka    │    Kafka     │
     └──────┬──────┴──────┬───────┘
            ▼             ▼
       ┌─────────────────────┐
       │   Kafka Broker      │
       │  - order.created    │
       │  - delivery.assigned│
       │  - tracking.updated │
       └─────────────────────┘
```

## Composants

### 1. API Gateway

**Rôle** : Point d'entrée unique pour tous les clients

**Technologies** :
- Express.js pour REST
- Apollo Server pour GraphQL
- @grpc/grpc-js pour les appels gRPC

**Responsabilités** :
- Exposer les endpoints REST
- Exposer le schéma GraphQL
- Router les requêtes vers les microservices appropriés via gRPC
- Agréger les données de plusieurs microservices
- Gestion de l'authentification (optionnel)

**Ne fait PAS** :
- Logique métier complexe
- Accès direct aux bases de données
- Traitement des événements Kafka

### 2. Order Service

**Rôle** : Gestion du cycle de vie des commandes

**Technologies** :
- Node.js + Express
- @grpc/grpc-js pour le serveur gRPC
- SQLite3 pour la persistance
- KafkaJS pour la publication d'événements

**Base de données** : SQLite3
```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  pickup_address TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  package_description TEXT,
  package_weight REAL,
  status TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Événements Kafka publiés** :
- `order.created` : Nouvelle commande créée
- `order.updated` : Commande mise à jour
- `order.cancelled` : Commande annulée

**Événements Kafka consommés** :
- `delivery.assigned` : Pour mettre à jour le statut de la commande

### 3. Delivery Service

**Rôle** : Gestion des livreurs et affectation des livraisons

**Technologies** :
- Node.js + Express
- @grpc/grpc-js pour le serveur gRPC
- RxDB (NoSQL) pour la persistance
- KafkaJS pour la publication/consommation d'événements

**Base de données** : RxDB (NoSQL)
```javascript
// Schema RxDB pour les livreurs
{
  title: 'driver schema',
  version: 0,
  type: 'object',
  properties: {
    id: { type: 'string', primary: true },
    name: { type: 'string' },
    phone: { type: 'string' },
    vehicle_type: { type: 'string' },
    vehicle_plate: { type: 'string' },
    is_available: { type: 'boolean' },
    current_location: {
      type: 'object',
      properties: {
        latitude: { type: 'number' },
        longitude: { type: 'number' }
      }
    },
    rating: { type: 'number' },
    total_deliveries: { type: 'number' }
  }
}
```

**Événements Kafka publiés** :
- `delivery.assigned` : Livreur assigné à une commande
- `delivery.status.changed` : Statut de livraison changé

**Événements Kafka consommés** :
- `order.created` : Pour assigner automatiquement un livreur

### 4. Tracking Service

**Rôle** : Suivi en temps réel des positions et calcul d'ETA

**Technologies** :
- Node.js + Express
- @grpc/grpc-js pour le serveur gRPC
- SQLite3 pour la persistance
- KafkaJS pour la publication d'événements

**Base de données** : SQLite3
```sql
CREATE TABLE tracking (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  driver_id TEXT NOT NULL,
  current_latitude REAL,
  current_longitude REAL,
  pickup_latitude REAL,
  pickup_longitude REAL,
  delivery_latitude REAL,
  delivery_longitude REAL,
  distance_traveled_km REAL,
  distance_remaining_km REAL,
  estimated_minutes INTEGER,
  status TEXT,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE location_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  speed REAL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Événements Kafka publiés** :
- `tracking.location.updated` : Position mise à jour

**Événements Kafka consommés** :
- `delivery.assigned` : Pour démarrer le suivi

### 5. Kafka Broker

**Rôle** : Bus de messages pour la communication asynchrone

**Topics** :
- `order.created`
- `order.updated`
- `order.cancelled`
- `delivery.assigned`
- `delivery.status.changed`
- `tracking.location.updated`

## Flux de Communication

### Flux 1 : Création d'une commande

1. Client → API Gateway (REST POST /api/orders)
2. API Gateway → Order Service (gRPC CreateOrder)
3. Order Service → Base de données (INSERT)
4. Order Service → Kafka (publish order.created)
5. Delivery Service ← Kafka (consume order.created)
6. Delivery Service → Logique d'affectation automatique
7. Delivery Service → Kafka (publish delivery.assigned)
8. Order Service ← Kafka (consume delivery.assigned)
9. Tracking Service ← Kafka (consume delivery.assigned)
10. API Gateway ← Order Service (gRPC response)
11. Client ← API Gateway (REST response)

### Flux 2 : Consultation via GraphQL

1. Client → API Gateway (GraphQL query)
2. API Gateway → Order Service (gRPC GetOrder)
3. API Gateway → Delivery Service (gRPC GetDelivery)
4. API Gateway → Tracking Service (gRPC GetCurrentLocation)
5. API Gateway → Agrégation des données
6. Client ← API Gateway (GraphQL response avec toutes les données)

### Flux 3 : Mise à jour de position

1. Livreur (via app mobile) → API Gateway (REST PUT /api/tracking/:orderId/location)
2. API Gateway → Tracking Service (gRPC UpdateLocation)
3. Tracking Service → Base de données (UPDATE + INSERT history)
4. Tracking Service → Calcul ETA
5. Tracking Service → Kafka (publish tracking.location.updated)
6. Delivery Service ← Kafka (consume tracking.location.updated)
7. API Gateway ← Tracking Service (gRPC response)
8. Client ← API Gateway (REST response)

## Principes de Conception

### Séparation des responsabilités
- Chaque microservice a une responsabilité unique et bien définie
- Pas de duplication de logique métier

### Indépendance
- Chaque microservice peut être développé, déployé et scalé indépendamment
- Chaque microservice a sa propre base de données

### Communication
- **Synchrone (gRPC)** : Pour les opérations nécessitant une réponse immédiate
- **Asynchrone (Kafka)** : Pour les événements métier et le découplage

### Résilience
- Gestion des erreurs à chaque niveau
- Timeouts sur les appels gRPC
- Retry logic pour Kafka

## Scalabilité

Chaque microservice peut être scalé horizontalement :
- Order Service : Plusieurs instances derrière un load balancer
- Delivery Service : Plusieurs instances avec partitionnement Kafka
- Tracking Service : Plusieurs instances pour gérer plus de positions simultanées

## Sécurité (Optionnel)

- Authentification JWT au niveau de l'API Gateway
- Validation des données à chaque niveau
- Chiffrement TLS pour gRPC
