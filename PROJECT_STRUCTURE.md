# Structure Complète du Projet

## 📁 Arborescence

```
delivery-system/
│
├── 📄 README.md                      # Documentation principale
├── 📄 QUICKSTART.md                  # Guide de démarrage rapide
├── 📄 CONTRIBUTING.md                # Guide de contribution
├── 📄 PROJECT_STRUCTURE.md           # Ce fichier
├── 📄 package.json                   # Configuration npm racine
├── 📄 .gitignore                     # Fichiers à ignorer par Git
├── 📄 docker-compose.yml             # Configuration Kafka + Zookeeper
│
├── 📂 proto/                         # Fichiers Protocol Buffers
│   ├── order.proto                   # Contrat gRPC Order Service
│   ├── delivery.proto                # Contrat gRPC Delivery Service
│   └── tracking.proto                # Contrat gRPC Tracking Service
│
├── 📂 docs/                          # Documentation complète
│   ├── architecture.md               # Architecture détaillée
│   ├── installation.md               # Guide d'installation
│   ├── rest-api.md                   # Documentation REST API
│   ├── graphql-schema.md             # Documentation GraphQL
│   ├── grpc-services.md              # Documentation gRPC
│   ├── kafka-topics.md               # Documentation Kafka
│   ├── databases.md                  # Documentation bases de données
│   └── presentation.md               # Présentation du projet
│
├── 📂 api-gateway/                   # API Gateway
│   ├── 📂 src/
│   │   ├── 📂 routes/
│   │   │   ├── index.js              # Router principal
│   │   │   ├── orders.js             # Routes REST orders
│   │   │   ├── deliveries.js         # Routes REST deliveries
│   │   │   └── tracking.js           # Routes REST tracking
│   │   ├── 📂 grpc/
│   │   │   └── clients.js            # Clients gRPC
│   │   ├── 📂 graphql/
│   │   │   └── index.js              # Schéma et resolvers GraphQL
│   │   └── index.js                  # Point d'entrée
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── 📂 order-service/                 # Order Service
│   ├── 📂 src/
│   │   ├── 📂 handlers/
│   │   │   └── orderHandlers.js      # Handlers gRPC
│   │   ├── database.js               # Gestion SQLite
│   │   ├── kafka.js                  # Configuration Kafka
│   │   └── index.js                  # Point d'entrée
│   ├── 📂 data/
│   │   └── orders.db                 # Base de données SQLite (généré)
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── 📂 delivery-service/              # Delivery Service
│   ├── 📂 src/
│   │   ├── 📂 handlers/
│   │   │   └── deliveryHandlers.js   # Handlers gRPC
│   │   ├── database.js               # Gestion RxDB
│   │   ├── kafka.js                  # Configuration Kafka
│   │   └── index.js                  # Point d'entrée
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
└── 📂 tracking-service/              # Tracking Service
    ├── 📂 src/
    │   ├── 📂 handlers/
    │   │   └── trackingHandlers.js   # Handlers gRPC
    │   ├── database.js               # Gestion SQLite
    │   ├── kafka.js                  # Configuration Kafka
    │   └── index.js                  # Point d'entrée
    ├── 📂 data/
    │   └── tracking.db               # Base de données SQLite (généré)
    ├── package.json
    ├── .env.example
    └── README.md
```

---

## 📊 Statistiques du projet

### Fichiers
- **Total** : ~50 fichiers
- **Code source** : ~30 fichiers JavaScript
- **Documentation** : ~10 fichiers Markdown
- **Configuration** : ~10 fichiers (package.json, .env, .proto, etc.)

### Lignes de code (approximatif)
- **Order Service** : ~500 lignes
- **Delivery Service** : ~600 lignes
- **Tracking Service** : ~550 lignes
- **API Gateway** : ~800 lignes
- **Documentation** : ~2000 lignes
- **Total** : ~4500 lignes

### Services
- **Microservices** : 3 (Order, Delivery, Tracking)
- **API Gateway** : 1
- **Kafka Broker** : 1
- **Total** : 5 composants

---

## 🔧 Technologies par composant

### API Gateway
- Express.js (REST)
- Apollo Server (GraphQL)
- @grpc/grpc-js (Client gRPC)
- @grpc/proto-loader

### Order Service
- @grpc/grpc-js (Serveur gRPC)
- SQLite3 (Base de données)
- KafkaJS (Producer/Consumer)
- UUID (Génération d'IDs)

### Delivery Service
- @grpc/grpc-js (Serveur gRPC)
- RxDB (Base de données NoSQL)
- KafkaJS (Producer/Consumer)
- UUID (Génération d'IDs)

### Tracking Service
- @grpc/grpc-js (Serveur gRPC)
- SQLite3 (Base de données)
- KafkaJS (Producer/Consumer)
- UUID (Génération d'IDs)

---

## 📡 Ports utilisés

| Service | Port | Protocole |
|---------|------|-----------|
| API Gateway | 3000 | HTTP |
| Order Service | 50051 | gRPC |
| Delivery Service | 50052 | gRPC |
| Tracking Service | 50053 | gRPC |
| Kafka | 9092 | TCP |
| Zookeeper | 2181 | TCP |

---

## 🗄️ Bases de données

### SQLite3
- **order-service/data/orders.db**
  - Table: `orders`
  
- **tracking-service/data/tracking.db**
  - Table: `tracking`
  - Table: `location_history`

### RxDB (en mémoire)
- **delivery-service**
  - Collection: `drivers`
  - Collection: `deliveries`

---

## 📨 Topics Kafka

1. `order.created` - Nouvelle commande créée
2. `order.updated` - Commande mise à jour
3. `order.cancelled` - Commande annulée
4. `delivery.assigned` - Livreur assigné
5. `delivery.status.changed` - Statut de livraison changé
6. `tracking.location.updated` - Position mise à jour

---

## 🔌 Endpoints REST

### Orders (15 endpoints)
- `POST /api/orders` - Créer
- `GET /api/orders` - Lister
- `GET /api/orders/:id` - Obtenir
- `PUT /api/orders/:id` - Modifier
- `DELETE /api/orders/:id` - Annuler

### Deliveries
- `POST /api/deliveries/assign` - Assigner
- `GET /api/deliveries/:orderId` - Obtenir
- `PUT /api/deliveries/:orderId/status` - Mettre à jour
- `GET /api/deliveries/drivers/available` - Livreurs disponibles
- `GET /api/deliveries/drivers/:driverId` - Obtenir livreur

### Tracking
- `POST /api/tracking/start` - Démarrer
- `PUT /api/tracking/:orderId/location` - Mettre à jour position
- `GET /api/tracking/:orderId` - Position actuelle
- `GET /api/tracking/:orderId/history` - Historique
- `POST /api/tracking/calculate-eta` - Calculer ETA

---

## 🎯 Queries/Mutations GraphQL

### Queries (6)
- `order(id)` - Obtenir une commande
- `orders(page, limit, status)` - Lister les commandes
- `delivery(orderId)` - Obtenir une livraison
- `availableDrivers` - Livreurs disponibles
- `driver(id)` - Obtenir un livreur
- `tracking(orderId)` - Obtenir le tracking

### Mutations (4)
- `createOrder(...)` - Créer une commande
- `assignDriver(...)` - Assigner un livreur
- `updateDeliveryStatus(...)` - Mettre à jour le statut
- `updateLocation(...)` - Mettre à jour la position

---

## 📝 Fichiers de configuration

### Racine
- `package.json` - Scripts npm globaux
- `docker-compose.yml` - Configuration Kafka
- `.gitignore` - Fichiers à ignorer

### Chaque service
- `package.json` - Dépendances du service
- `.env.example` - Variables d'environnement
- `README.md` - Documentation du service

---

## 🚀 Commandes npm

### Racine
```bash
npm run install:all    # Installer toutes les dépendances
```

### Chaque service
```bash
npm start              # Démarrer le service
npm run dev            # Démarrer en mode développement (nodemon)
```

---

## 📚 Documentation

### Fichiers principaux
1. **README.md** - Vue d'ensemble et instructions
2. **QUICKSTART.md** - Démarrage rapide
3. **CONTRIBUTING.md** - Guide de contribution
4. **PROJECT_STRUCTURE.md** - Structure du projet

### Documentation technique
1. **architecture.md** - Architecture détaillée
2. **installation.md** - Installation complète
3. **rest-api.md** - Documentation REST
4. **graphql-schema.md** - Documentation GraphQL
5. **grpc-services.md** - Documentation gRPC
6. **kafka-topics.md** - Documentation Kafka
7. **databases.md** - Documentation bases de données
8. **presentation.md** - Présentation du projet

---

## ✅ Checklist de conformité

### Exigences du cahier des charges

✅ **Architecture**
- [x] 3 microservices indépendants
- [x] API Gateway
- [x] Client/Interface de test
- [x] Broker Kafka
- [x] Bases de données séparées

✅ **Technologies**
- [x] Node.js uniquement
- [x] gRPC (HTTP/2 + Protobuf)
- [x] REST API
- [x] GraphQL
- [x] Kafka
- [x] SQLite3
- [x] RxDB

✅ **Documentation**
- [x] README clair
- [x] Schéma d'architecture
- [x] Fichiers .proto
- [x] Description endpoints REST
- [x] Description schéma GraphQL
- [x] Description topics Kafka
- [x] Description bases de données
- [x] Instructions d'installation

✅ **Qualité**
- [x] Code structuré
- [x] Gestion des erreurs
- [x] Séparation des responsabilités
- [x] Communication correcte
- [x] Événements métier pertinents

---

## 🎓 Utilisation pour le projet

### Pour démarrer
1. Lire `QUICKSTART.md`
2. Suivre les instructions d'installation
3. Tester les endpoints

### Pour développer
1. Lire `CONTRIBUTING.md`
2. Créer une branche feature
3. Développer et tester
4. Créer une Pull Request

### Pour présenter
1. Lire `docs/presentation.md`
2. Préparer la démo
3. Expliquer l'architecture
4. Montrer les fonctionnalités

---

## 📞 Support

Pour toute question :
1. Consulter la documentation
2. Vérifier les logs des services
3. Demander à l'équipe
4. Contacter le professeur

---

**Projet académique - A.U. 2025-26**
