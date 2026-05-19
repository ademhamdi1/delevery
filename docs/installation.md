# Guide d'Installation et d'Exécution

## Prérequis

- **Node.js** v18 ou supérieur
- **npm** v9 ou supérieur
- **Docker** et **Docker Compose** (pour Kafka)
- **Git** (pour le versioning)

## Installation

### 1. Cloner le repository

```bash
git clone <votre-repo-url>
cd delivery-system
```

### 2. Installer les dépendances

#### Option A : Installation automatique (recommandé)
```bash
npm run install:all
```

#### Option B : Installation manuelle
```bash
# Root
npm install

# Order Service
cd order-service && npm install && cd ..

# Delivery Service
cd delivery-service && npm install && cd ..

# Tracking Service
cd tracking-service && npm install && cd ..

# API Gateway
cd api-gateway && npm install && cd ..

# Client (optionnel)
cd client && npm install && cd ..
```

### 3. Configuration

Copier les fichiers `.env.example` vers `.env` dans chaque service :

```bash
# Order Service
cp order-service/.env.example order-service/.env

# Delivery Service
cp delivery-service/.env.example delivery-service/.env

# Tracking Service
cp tracking-service/.env.example tracking-service/.env

# API Gateway
cp api-gateway/.env.example api-gateway/.env
```

### 4. Démarrer Kafka

```bash
docker-compose up -d
```

Vérifier que Kafka est démarré :
```bash
docker-compose ps
```

Vous devriez voir :
```
NAME                COMMAND                  SERVICE             STATUS
delivery-system-kafka-1       "/etc/confluent/dock…"   kafka               running
delivery-system-zookeeper-1   "/etc/confluent/dock…"   zookeeper           running
```

## Exécution

### Démarrer tous les services

Ouvrir **6 terminaux** différents :

#### Terminal 1 - Order Service
```bash
cd order-service
npm start
```

Vous devriez voir :
```
✓ Base de données SQLite initialisée
✓ Kafka initialisé
✓ Order Service démarré sur le port 50051
```

#### Terminal 2 - Delivery Service
```bash
cd delivery-service
npm start
```

Vous devriez voir :
```
✓ Base de données RxDB initialisée
✓ Livreurs de test insérés
✓ Kafka initialisé
✓ Delivery Service démarré sur le port 50052
```

#### Terminal 3 - Tracking Service
```bash
cd tracking-service
npm start
```

Vous devriez voir :
```
✓ Base de données SQLite initialisée
✓ Kafka initialisé
✓ Tracking Service démarré sur le port 50053
```

#### Terminal 4 - API Gateway
```bash
cd api-gateway
npm start
```

Vous devriez voir :
```
✓ Clients gRPC initialisés
✓ Serveur GraphQL démarré
✓ API Gateway démarré sur le port 3000
  REST API: http://localhost:3000/api
  GraphQL: http://localhost:3000/graphql
```

#### Terminal 5 - Client (optionnel)
```bash
cd client
npm start
```

#### Terminal 6 - Logs Kafka (optionnel, pour debug)
```bash
docker-compose logs -f kafka
```

## Vérification

### 1. Vérifier que tous les services sont démarrés

```bash
# Health check API Gateway
curl http://localhost:3000/health
```

Réponse attendue :
```json
{"status":"OK","service":"API Gateway"}
```

### 2. Tester la création d'une commande

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Test User",
    "customer_phone": "+216 20 123 456",
    "pickup_address": "Tunis Centre",
    "delivery_address": "La Marsa",
    "package_description": "Test package",
    "package_weight": 1.5
  }'
```

Vous devriez voir dans les logs :
- **Order Service** : Commande créée et événement `order.created` publié
- **Delivery Service** : Événement reçu et livreur assigné automatiquement
- **Tracking Service** : Tracking démarré

### 3. Tester GraphQL

Ouvrir http://localhost:3000/graphql dans votre navigateur et exécuter :

```graphql
query {
  availableDrivers {
    driver_id
    name
    vehicle_type
    rating
  }
}
```

## Arrêt des services

### Arrêter les microservices
Appuyer sur `Ctrl+C` dans chaque terminal.

### Arrêter Kafka
```bash
docker-compose down
```

### Arrêter et supprimer les données Kafka
```bash
docker-compose down -v
```

## Résolution des problèmes

### Problème : Kafka ne démarre pas

**Solution** :
```bash
docker-compose down -v
docker-compose up -d
```

### Problème : Port déjà utilisé

**Solution** : Modifier les ports dans les fichiers `.env`

### Problème : Erreur de connexion gRPC

**Vérifier** :
1. Que tous les microservices sont démarrés
2. Que les ports dans `.env` correspondent
3. Que les fichiers `.proto` sont identiques partout

### Problème : Base de données SQLite verrouillée

**Solution** :
```bash
# Supprimer les fichiers de base de données
rm order-service/data/orders.db
rm tracking-service/data/tracking.db
# Redémarrer les services
```

### Problème : Événements Kafka non reçus

**Vérifier** :
1. Que Kafka est démarré : `docker-compose ps`
2. Les logs Kafka : `docker-compose logs kafka`
3. Que les consumer groups sont différents

## Structure des ports

| Service | Port | Type |
|---------|------|------|
| API Gateway | 3000 | HTTP |
| Order Service | 50051 | gRPC |
| Delivery Service | 50052 | gRPC |
| Tracking Service | 50053 | gRPC |
| Kafka | 9092 | TCP |
| Zookeeper | 2181 | TCP |

## Commandes utiles

### Voir les topics Kafka
```bash
docker exec -it $(docker ps -qf "name=kafka") kafka-topics --list --bootstrap-server localhost:9092
```

### Consommer un topic Kafka
```bash
docker exec -it $(docker ps -qf "name=kafka") kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic order.created \
  --from-beginning
```

### Voir les bases de données SQLite
```bash
# Order Service
sqlite3 order-service/data/orders.db "SELECT * FROM orders;"

# Tracking Service
sqlite3 tracking-service/data/tracking.db "SELECT * FROM tracking;"
```

## Prochaines étapes

1. Lire la [documentation de l'architecture](./architecture.md)
2. Tester les [endpoints REST](./rest-api.md)
3. Tester les [requêtes GraphQL](./graphql-schema.md)
4. Explorer les [topics Kafka](./kafka-topics.md)
