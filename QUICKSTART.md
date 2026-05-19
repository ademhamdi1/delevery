# Guide de Démarrage Rapide

## 🚀 Démarrer le projet en 5 minutes

### Étape 1 : Prérequis
```bash
# Vérifier Node.js (v18+)
node --version

# Vérifier npm
npm --version

# Vérifier Docker
docker --version
```

### Étape 2 : Installation
```bash
# Cloner le projet
git clone <votre-repo-url>
cd delivery-system

# Installer toutes les dépendances
npm run install:all
```

### Étape 3 : Configuration
```bash
# Copier les fichiers .env
cp order-service/.env.example order-service/.env
cp delivery-service/.env.example delivery-service/.env
cp tracking-service/.env.example tracking-service/.env
cp api-gateway/.env.example api-gateway/.env
```

### Étape 4 : Démarrer Kafka
```bash
# Démarrer Kafka et Zookeeper
docker-compose up -d

# Vérifier que Kafka est démarré
docker-compose ps
```

### Étape 5 : Démarrer les services

**Ouvrir 4 terminaux :**

```bash
# Terminal 1 - Order Service
cd order-service && npm start

# Terminal 2 - Delivery Service
cd delivery-service && npm start

# Terminal 3 - Tracking Service
cd tracking-service && npm start

# Terminal 4 - API Gateway
cd api-gateway && npm start
```

### Étape 6 : Tester

```bash
# Créer une commande
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Test User",
    "customer_phone": "+216 20 123 456",
    "pickup_address": "Tunis",
    "delivery_address": "La Marsa",
    "package_weight": 1.5
  }'
```

**Ouvrir GraphQL :** http://localhost:3000/graphql

```graphql
query {
  availableDrivers {
    name
    vehicle_type
  }
}
```

---

## 📖 Commandes utiles

### Développement

```bash
# Installer les dépendances
npm run install:all

# Démarrer Kafka
docker-compose up -d

# Arrêter Kafka
docker-compose down

# Voir les logs Kafka
docker-compose logs -f kafka
```

### Tests

```bash
# Créer une commande
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customer_name": "Test", ...}'

# Lister les commandes
curl http://localhost:3000/api/orders

# Obtenir une commande
curl http://localhost:3000/api/orders/ORDER_ID

# Lister les livreurs disponibles
curl http://localhost:3000/api/deliveries/drivers/available
```

### Debug

```bash
# Voir les topics Kafka
docker exec -it $(docker ps -qf "name=kafka") \
  kafka-topics --list --bootstrap-server localhost:9092

# Consommer un topic
docker exec -it $(docker ps -qf "name=kafka") \
  kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic order.created \
  --from-beginning

# Voir la base de données SQLite
sqlite3 order-service/data/orders.db "SELECT * FROM orders;"
```

---

## 🎯 Scénario de test complet

### 1. Créer une commande
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

**Résultat attendu :**
- Order Service crée la commande
- Événement `order.created` publié sur Kafka
- Delivery Service assigne automatiquement un livreur
- Événement `delivery.assigned` publié
- Tracking Service démarre le suivi

### 2. Vérifier l'assignment (GraphQL)

Ouvrir http://localhost:3000/graphql

```graphql
query {
  order(id: "COPIER_ORDER_ID_ICI") {
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
      assigned_at
    }
    tracking {
      distance_remaining_km
      estimated_minutes
    }
  }
}
```

### 3. Mettre à jour la position
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

### 4. Consulter le tracking
```graphql
query {
  tracking(orderId: "ORDER_ID") {
    current_location {
      latitude
      longitude
    }
    distance_remaining_km
    estimated_minutes
    last_updated
  }
}
```

---

## 📚 Documentation

- [Architecture complète](./docs/architecture.md)
- [Installation détaillée](./docs/installation.md)
- [Endpoints REST](./docs/rest-api.md)
- [Schéma GraphQL](./docs/graphql-schema.md)
- [Services gRPC](./docs/grpc-services.md)
- [Topics Kafka](./docs/kafka-topics.md)
- [Bases de données](./docs/databases.md)
- [Présentation du projet](./docs/presentation.md)

---

## ❓ Problèmes fréquents

### Kafka ne démarre pas
```bash
docker-compose down -v
docker-compose up -d
```

### Port déjà utilisé
Modifier les ports dans les fichiers `.env`

### Erreur de connexion gRPC
Vérifier que tous les services sont démarrés

### Base de données verrouillée
```bash
rm order-service/data/orders.db
rm tracking-service/data/tracking.db
```

---

## 🎓 Structure du projet

```
delivery-system/
├── api-gateway/          # API Gateway (REST + GraphQL)
├── order-service/        # Service de commandes (SQLite)
├── delivery-service/     # Service de livraison (RxDB)
├── tracking-service/     # Service de suivi (SQLite)
├── proto/                # Fichiers .proto pour gRPC
├── docs/                 # Documentation complète
├── docker-compose.yml    # Configuration Kafka
└── README.md             # Documentation principale
```

---

## 🚀 Prochaines étapes

1. ✅ Démarrer tous les services
2. ✅ Tester la création d'une commande
3. ✅ Vérifier l'auto-assignment
4. ✅ Tester GraphQL
5. ✅ Mettre à jour une position
6. ✅ Consulter le tracking
7. 📖 Lire la documentation complète
8. 🎨 Personnaliser le projet
9. 🐳 Conteneuriser (optionnel)
10. ☁️ Déployer sur le cloud (optionnel)

---

## 💡 Conseils

- **Logs** : Toujours vérifier les logs des services
- **Kafka** : Utiliser `docker-compose logs -f kafka` pour débugger
- **GraphQL** : Utiliser Apollo Sandbox pour tester les requêtes
- **gRPC** : Utiliser grpcurl ou BloomRPC pour tester
- **Git** : Commiter régulièrement avec des messages clairs

---

## 🎉 Bon développement !

Si vous avez des questions, consultez la documentation ou demandez à votre équipe.

**Projet académique - A.U. 2025-26**
