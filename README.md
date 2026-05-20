# 🚚 Système de Livraison en Temps Réel - Microservices

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Technologies utilisées](#technologies-utilisées)
4. [Prérequis](#prérequis)
5. [Installation](#installation)
6. [Démarrage](#démarrage)
7. [Tests](#tests)
8. [API Documentation](#api-documentation)
9. [Déploiement](#déploiement)

---

## 🎯 Vue d'ensemble

Système de livraison en temps réel basé sur une architecture microservices avec:
- **Auto-assignment** intelligent des livreurs
- **Tracking GPS** en temps réel
- **Calcul automatique** de distance et ETA
- **Communication asynchrone** via Kafka
- **APIs REST et GraphQL**

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        API GATEWAY                          │
│                    (REST + GraphQL)                         │
│                     Port: 3000                              │
└────────────┬────────────────────────────────┬───────────────┘
             │                                │
             │ gRPC                          │ gRPC
             ▼                                ▼
┌────────────────────┐         ┌──────────────────────────┐
│  ORDER SERVICE     │         │   DELIVERY SERVICE       │
│  Port: 50051       │         │   Port: 50052            │
│  DB: SQLite        │         │   DB: RxDB (Memory)      │
└─────────┬──────────┘         └────────┬─────────────────┘
          │                              │
          │         Kafka Events         │
          │    ┌──────────────────┐     │
          └───►│  order.created   │◄────┘
               │delivery.assigned │
               │tracking.updated  │
               └────────┬─────────┘
                        │
                        ▼
               ┌────────────────────┐
               │ TRACKING SERVICE   │
               │ Port: 50053        │
               │ DB: SQLite         │
               └────────────────────┘
```

---

## 🛠️ Technologies utilisées

### Backend
- **Node.js** v18+
- **gRPC** - Communication inter-services
- **Express.js** - API REST
- **Apollo Server** - GraphQL
- **Kafka** - Messaging asynchrone
- **SQLite3** - Base de données (Order, Tracking)
- **RxDB** - Base de données réactive (Delivery)

### Infrastructure
- **Docker** - Conteneurisation
- **Kafka + Zookeeper** - Message broker

---

## 📦 Prérequis

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Docker Desktop** (pour Kafka)
- **Git**

---

## 🚀 Installation

### 1. Cloner le projet
```bash
git clone <votre-repo>
cd soaaaaaa
```

### 2. Installer les dépendances
```bash
# Installer pour tous les services
npm install

# Ou individuellement
cd order-service && npm install
cd ../delivery-service && npm install
cd ../tracking-service && npm install
cd ../api-gateway && npm install
```

### 3. Démarrer Kafka
```bash
docker-compose up -d
```

### 4. Créer les topics Kafka
```bash
docker exec -it kafka bash

kafka-topics --create --topic order.created --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
kafka-topics --create --topic delivery.assigned --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
kafka-topics --create --topic delivery.status.changed --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
kafka-topics --create --topic tracking.updated --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1

exit
```

---

## ▶️ Démarrage

### Démarrage manuel (4 terminaux)

**Terminal 1 - Order Service:**
```bash
cd order-service
npm start
```

**Terminal 2 - Delivery Service:**
```bash
cd delivery-service
npm start
```

**Terminal 3 - Tracking Service:**
```bash
cd tracking-service
npm start
```

**Terminal 4 - API Gateway:**
```bash
cd api-gateway
npm start
```

### Démarrage automatique (Windows)
```bash
./start-all.sh
```

### Arrêt
```bash
./stop-all.sh
```

---

## 🧪 Tests

### REST API avec PowerShell

#### Créer une commande
```powershell
$order = Invoke-RestMethod -Uri "http://localhost:3000/api/orders" -Method Post -ContentType "application/json" -Body '{"customer_name":"Test User","customer_phone":"+216 20 123 456","pickup_address":"Tunis","delivery_address":"La Marsa","package_weight":1.5}'

$orderId = $order.order_id
Write-Host "Order ID: $orderId"
```

#### Vérifier la livraison (auto-assignée)
```powershell
Start-Sleep -Seconds 3
Invoke-RestMethod -Uri "http://localhost:3000/api/deliveries/$orderId"
```

#### Vérifier le tracking (auto-créé)
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/tracking/$orderId"
```

#### Mettre à jour la position
```powershell
$location = @{
    order_id = $orderId
    current_location = @{
        latitude = 36.8150
        longitude = 10.1700
    }
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:3000/api/tracking/$orderId/location" -Method Put -ContentType "application/json" -Body $location
```

### GraphQL

Ouvrez http://localhost:3000/graphql dans votre navigateur.

#### Query - Livreurs disponibles
```graphql
{
  availableDrivers {
    name
    vehicle_type
    rating
    phone
  }
}
```

#### Mutation - Créer une commande
```graphql
mutation {
  createOrder(
    customer_name: "Test GraphQL"
    customer_phone: "+216 20 555 666"
    pickup_address: "Tunis"
    delivery_address: "Sousse"
    package_weight: 2.0
  ) {
    order_id
    customer_name
    status
  }
}
```

#### Query - Commande complète avec livraison et tracking
```graphql
{
  order(id: "VOTRE_ORDER_ID") {
    order_id
    customer_name
    status
    delivery {
      driver {
        name
        vehicle_type
      }
      status
      delivered_at
    }
    tracking {
      current_location {
        latitude
        longitude
      }
      distance_remaining_km
      estimated_minutes
    }
  }
}
```

### gRPC avec Postman

Voir le fichier [GRPC-TESTS.md](./GRPC-TESTS.md) pour tous les tests gRPC.

---

## 📚 API Documentation

### REST API Endpoints

#### Orders
- `POST /api/orders` - Créer une commande
- `GET /api/orders` - Lister les commandes
- `GET /api/orders/:id` - Obtenir une commande
- `PUT /api/orders/:id` - Mettre à jour une commande
- `DELETE /api/orders/:id` - Annuler une commande

#### Deliveries
- `POST /api/deliveries/assign` - Assigner un livreur
- `GET /api/deliveries/:orderId` - Obtenir une livraison
- `PUT /api/deliveries/:orderId/status` - Mettre à jour le statut
- `GET /api/deliveries/drivers/available` - Livreurs disponibles
- `GET /api/deliveries/drivers/:driverId` - Détails d'un livreur

#### Tracking
- `POST /api/tracking/start` - Démarrer le tracking
- `GET /api/tracking/:orderId` - Obtenir le tracking
- `PUT /api/tracking/:orderId/location` - Mettre à jour la position
- `PUT /api/tracking/:orderId/complete` - Terminer le tracking

### GraphQL Schema

Voir [docs/graphql-schema.md](./docs/graphql-schema.md)

### gRPC Services

Voir les fichiers `.proto`:
- [proto/order.proto](./proto/order.proto)
- [proto/delivery.proto](./proto/delivery.proto)
- [proto/tracking.proto](./proto/tracking.proto)

---

## 🐳 Déploiement

### Docker Compose complet

Voir [docker-compose.full.yml](./docker-compose.full.yml)

```bash
docker-compose -f docker-compose.full.yml up -d
```

### Variables d'environnement

Chaque service a un fichier `.env.example`. Copiez-le en `.env` et configurez:

```bash
cp order-service/.env.example order-service/.env
cp delivery-service/.env.example delivery-service/.env
cp tracking-service/.env.example tracking-service/.env
cp api-gateway/.env.example api-gateway/.env
```

---

## 📊 Monitoring

### Kafka Topics
```bash
# Lister les topics
docker exec -it kafka kafka-topics --list --bootstrap-server localhost:9092

# Consommer les messages
docker exec -it kafka kafka-console-consumer --topic order.created --bootstrap-server localhost:9092 --from-beginning
```

### Logs des services
```bash
# Order Service
cd order-service && npm start

# Delivery Service
cd delivery-service && npm start

# Tracking Service
cd tracking-service && npm start

# API Gateway
cd api-gateway && npm start
```

---

## 🔧 Troubleshooting

### Kafka ne démarre pas
```bash
docker-compose down
docker-compose up -d
```

### Port déjà utilisé
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### RxDB perd les données
RxDB est en mémoire. Redémarrez le delivery-service pour réinitialiser les livreurs.

---

## 👥 Contributeurs

- Votre nom

## 📄 Licence

MIT

---

## 🎯 Roadmap

- [ ] Tests unitaires et d'intégration
- [ ] CI/CD avec GitHub Actions
- [ ] Monitoring avec Prometheus + Grafana
- [ ] Authentication JWT
- [ ] Rate limiting
- [ ] WebSocket pour tracking temps réel
- [ ] Application mobile
