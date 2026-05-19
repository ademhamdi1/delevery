# Système de Livraison en Temps Réel

## Description du Projet

Application de gestion de livraison en temps réel basée sur une architecture microservices utilisant Node.js.

## Architecture

L'application est composée de :
- **API Gateway** : Point d'entrée principal (REST + GraphQL → gRPC)
- **Order Service** : Gestion des commandes (SQLite3)
- **Delivery Service** : Gestion des livreurs et affectations (RxDB)
- **Tracking Service** : Suivi en temps réel des livraisons (SQLite3)
- **Kafka Broker** : Communication asynchrone entre microservices
- **Client** : Interface de test

## Technologies Utilisées

- **Node.js** : Runtime JavaScript
- **gRPC** : Communication inter-services
- **REST** : API HTTP classique
- **GraphQL** : Requêtes flexibles
- **Kafka** : Messaging asynchrone
- **SQLite3** : Base de données SQL
- **RxDB** : Base de données NoSQL
- **Express** : Framework web
- **Apollo Server** : Serveur GraphQL

## Structure du Projet

```
delivery-system/
├── api-gateway/          # API Gateway (REST + GraphQL)
├── order-service/        # Microservice de gestion des commandes
├── delivery-service/     # Microservice de gestion des livreurs
├── tracking-service/     # Microservice de suivi en temps réel
├── proto/                # Fichiers .proto pour gRPC
├── client/               # Interface client de test
├── docs/                 # Documentation
└── docker-compose.yml    # Configuration Docker (optionnel)
```

## Fonctionnalités Principales

### Order Service
- Créer une commande
- Consulter les commandes
- Modifier une commande
- Annuler une commande
- Rechercher des commandes

### Delivery Service
- Gérer les livreurs (disponibilité, position)
- Assigner un livreur à une commande
- Mettre à jour le statut du livreur

### Tracking Service
- Suivre la position en temps réel
- Historique des positions
- Calculer le temps estimé d'arrivée

## Communication

### REST Endpoints
- `POST /api/orders` - Créer une commande
- `GET /api/orders` - Liste des commandes
- `GET /api/orders/:id` - Détails d'une commande
- `PUT /api/orders/:id` - Modifier une commande
- `DELETE /api/orders/:id` - Annuler une commande

### GraphQL Queries
```graphql
query {
  order(id: "123") {
    id
    customer {
      name
      address
    }
    delivery {
      driver {
        name
        phone
      }
      status
      currentLocation {
        lat
        lng
      }
      estimatedArrival
    }
  }
}
```

### gRPC Services
- Communication entre API Gateway et microservices
- Appels synchrones haute performance

### Kafka Topics
- `order.created` - Nouvelle commande créée
- `order.updated` - Commande mise à jour
- `delivery.assigned` - Livreur assigné
- `delivery.status.changed` - Statut de livraison changé
- `tracking.location.updated` - Position mise à jour

## Installation

### Prérequis
- Node.js (v18+)
- npm ou yarn
- Kafka (local ou Docker)

### Installation des dépendances

```bash
# Installer les dépendances pour tous les services
npm run install:all

# Ou manuellement pour chaque service
cd api-gateway && npm install
cd order-service && npm install
cd delivery-service && npm install
cd tracking-service && npm install
cd client && npm install
```

### Configuration de Kafka

```bash
# Avec Docker
docker-compose up -d kafka zookeeper

# Ou installation locale
# Suivre la documentation Kafka
```

## Exécution

### Démarrer tous les services

```bash
# Terminal 1 - Kafka
docker-compose up kafka zookeeper

# Terminal 2 - Order Service
cd order-service && npm start

# Terminal 3 - Delivery Service
cd delivery-service && npm start

# Terminal 4 - Tracking Service
cd tracking-service && npm start

# Terminal 5 - API Gateway
cd api-gateway && npm start

# Terminal 6 - Client
cd client && npm start
```

### Ports par défaut
- API Gateway: `http://localhost:3000`
- Order Service: `localhost:50051` (gRPC)
- Delivery Service: `localhost:50052` (gRPC)
- Tracking Service: `localhost:50053` (gRPC)
- Client: `http://localhost:8080`

## Tests

```bash
# Tester les endpoints REST
npm run test:rest

# Tester GraphQL
npm run test:graphql

# Tester gRPC
npm run test:grpc
```

## Documentation

- [Architecture détaillée](./docs/architecture.md)
- [Endpoints REST](./docs/rest-api.md)
- [Schéma GraphQL](./docs/graphql-schema.md)
- [Services gRPC](./docs/grpc-services.md)
- [Topics Kafka](./docs/kafka-topics.md)
- [Bases de données](./docs/databases.md)

## Scénario d'utilisation

1. **Client crée une commande** via REST
2. **Order Service** enregistre la commande et publie `order.created` sur Kafka
3. **Delivery Service** reçoit l'événement et assigne un livreur disponible
4. **Delivery Service** publie `delivery.assigned` sur Kafka
5. **Tracking Service** commence à suivre la position du livreur
6. **Client** consulte le statut via GraphQL (commande + livreur + position)
7. **Tracking Service** publie `tracking.location.updated` régulièrement
8. **Client** reçoit les mises à jour en temps réel

## Scénarios de test

### Scénario complet : Créer et suivre une livraison

1. **Créer une commande** (REST)
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Ahmed Ben Ali",
    "customer_phone": "+216 20 123 456",
    "pickup_address": "Avenue Habib Bourguiba, Tunis",
    "delivery_address": "Rue de la Liberté, La Marsa",
    "package_description": "Documents",
    "package_weight": 0.5
  }'
```

2. **Vérifier l'auto-assignment** (GraphQL)
```graphql
query {
  order(id: "ORDER_ID_FROM_STEP_1") {
    order_id
    status
    delivery {
      driver {
        name
        phone
      }
      status
    }
  }
}
```

3. **Mettre à jour la position** (REST)
```bash
curl -X PUT http://localhost:3000/api/tracking/ORDER_ID/location \
  -H "Content-Type: application/json" \
  -d '{
    "current_location": {
      "latitude": 36.8100,
      "longitude": 10.1750
    },
    "speed": 35.5
  }'
```

4. **Consulter le tracking** (GraphQL)
```graphql
query {
  tracking(orderId: "ORDER_ID") {
    current_location {
      latitude
      longitude
    }
    distance_remaining_km
    estimated_minutes
  }
}
```

## Points forts du projet

✅ **Architecture microservices complète** avec 3 services indépendants  
✅ **gRPC** pour la communication inter-services (HTTP/2 + Protobuf)  
✅ **REST API** pour les opérations CRUD classiques  
✅ **GraphQL** pour des requêtes flexibles et agrégées  
✅ **Kafka** pour la communication asynchrone événementielle  
✅ **SQLite3** et **RxDB** pour la persistance des données  
✅ **Séparation des responsabilités** claire entre les services  
✅ **Documentation complète** avec exemples et schémas  
✅ **Auto-assignment** intelligent des livreurs  
✅ **Calcul d'ETA** en temps réel  

## Améliorations possibles (optionnelles)

- 🐳 Conteneurisation avec Docker pour chaque microservice
- ☁️ Déploiement sur le cloud (AWS, Azure, GCP)
- 🔐 Authentification JWT
- 📱 Application mobile pour les livreurs
- 🔔 Service de notifications en temps réel (WebSocket)
- 📊 Dashboard de monitoring
- 🧪 Tests unitaires et d'intégration
- 🔄 Circuit breaker pour la résilience
- 📈 Métriques et observabilité (Prometheus, Grafana)

## Auteurs

- [Votre Nom]
- [Nom Membre 2]
- [Nom Membre 3] (optionnel)

## Licence

Projet académique - A.U. 2025-26

---

**Note**: Ce projet répond à tous les critères du cahier des charges :
- ✅ 3 microservices indépendants
- ✅ API Gateway (REST + GraphQL)
- ✅ Communication gRPC (HTTP/2 + Protobuf)
- ✅ Kafka pour les événements asynchrones
- ✅ Bases de données séparées (SQLite3 + RxDB)
- ✅ Documentation complète
- ✅ Architecture claire et maintenable
#   d e l e v e r y  
 