# 📚 Guide Complet - Système de Livraison

## 🎯 Vue d'ensemble

Vous avez maintenant un système de livraison complet et fonctionnel avec:

✅ **3 Microservices** (Order, Delivery, Tracking)  
✅ **API Gateway** (REST + GraphQL)  
✅ **Communication gRPC** entre services  
✅ **Kafka** pour les événements asynchrones  
✅ **Auto-assignment** des livreurs  
✅ **Tracking GPS** en temps réel  
✅ **Calcul automatique** de distance et ETA  
✅ **Documentation complète**  
✅ **Tests automatisés**  
✅ **Docker** pour le déploiement  

---

## 📁 Structure du projet

```
soaaaaaa/
├── api-gateway/              # API Gateway (REST + GraphQL)
│   ├── src/
│   │   ├── graphql/         # Schéma et resolvers GraphQL
│   │   ├── grpc/            # Clients gRPC
│   │   ├── routes/          # Routes REST
│   │   └── index.js         # Point d'entrée
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
│
├── order-service/            # Service de gestion des commandes
│   ├── src/
│   │   ├── handlers/        # Handlers gRPC
│   │   ├── database.js      # SQLite
│   │   ├── kafka.js         # Kafka producer/consumer
│   │   └── index.js
│   ├── data/                # Base de données SQLite
│   ├── Dockerfile
│   └── package.json
│
├── delivery-service/         # Service de gestion des livraisons
│   ├── src/
│   │   ├── handlers/        # Handlers gRPC
│   │   ├── database.js      # RxDB
│   │   ├── kafka.js         # Kafka producer/consumer
│   │   └── index.js
│   ├── Dockerfile
│   └── package.json
│
├── tracking-service/         # Service de tracking GPS
│   ├── src/
│   │   ├── handlers/        # Handlers gRPC
│   │   ├── database.js      # SQLite
│   │   ├── kafka.js         # Kafka producer/consumer
│   │   └── index.js
│   ├── data/                # Base de données SQLite
│   ├── Dockerfile
│   └── package.json
│
├── proto/                    # Fichiers Protocol Buffers
│   ├── order.proto
│   ├── delivery.proto
│   └── tracking.proto
│
├── docs/                     # Documentation
│   ├── architecture.md
│   ├── databases.md
│   ├── graphql-schema.md
│   ├── grpc-services.md
│   ├── kafka-topics.md
│   └── rest-api.md
│
├── postman/                  # Collection Postman
│   ├── Delivery-System.postman_collection.json
│   └── README.md
│
├── docker-compose.yml        # Kafka + Zookeeper
├── docker-compose.full.yml   # Tous les services
├── README-COMPLET.md         # Documentation complète
├── GRPC-TESTS.md            # Guide des tests gRPC
├── DEPLOYMENT.md            # Guide de déploiement
├── test-automation.ps1      # Tests automatisés
├── start-all.sh             # Script de démarrage
└── stop-all.sh              # Script d'arrêt
```

---

## 🚀 Démarrage rapide

### 1. Prérequis
- Node.js >= 18
- Docker Desktop
- Git

### 2. Installation
```bash
# Cloner le projet
git clone <votre-repo>
cd soaaaaaa

# Installer les dépendances
npm install
cd order-service && npm install
cd ../delivery-service && npm install
cd ../tracking-service && npm install
cd ../api-gateway && npm install
cd ..
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

### 5. Démarrer les services (4 terminaux)

**Terminal 1:**
```bash
cd order-service
npm start
```

**Terminal 2:**
```bash
cd delivery-service
npm start
```

**Terminal 3:**
```bash
cd tracking-service
npm start
```

**Terminal 4:**
```bash
cd api-gateway
npm start
```

### 6. Tester
```bash
# REST API
curl http://localhost:3000/api/orders

# GraphQL
# Ouvrir http://localhost:3000/graphql dans le navigateur
```

---

## 📖 Documentation disponible

| Fichier | Description |
|---------|-------------|
| [README-COMPLET.md](./README-COMPLET.md) | Documentation technique complète |
| [GRPC-TESTS.md](./GRPC-TESTS.md) | Guide des tests gRPC avec Postman |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Guide de déploiement (Docker, Cloud, CI/CD) |
| [docs/architecture.md](./docs/architecture.md) | Architecture du système |
| [docs/rest-api.md](./docs/rest-api.md) | Documentation REST API |
| [docs/graphql-schema.md](./docs/graphql-schema.md) | Schéma GraphQL |
| [docs/grpc-services.md](./docs/grpc-services.md) | Services gRPC |
| [docs/kafka-topics.md](./docs/kafka-topics.md) | Topics Kafka |
| [docs/databases.md](./docs/databases.md) | Bases de données |

---

## 🧪 Tests

### Tests automatisés (PowerShell)
```powershell
./test-automation.ps1
```

### Tests manuels REST API
```powershell
# Créer une commande
$order = Invoke-RestMethod -Uri "http://localhost:3000/api/orders" -Method Post -ContentType "application/json" -Body '{"customer_name":"Test","customer_phone":"+216 20 123 456","pickup_address":"Tunis","delivery_address":"La Marsa","package_weight":1.5}'

# Vérifier la livraison
Invoke-RestMethod -Uri "http://localhost:3000/api/deliveries/$($order.order_id)"

# Vérifier le tracking
Invoke-RestMethod -Uri "http://localhost:3000/api/tracking/$($order.order_id)"
```

### Tests GraphQL
Ouvrez http://localhost:3000/graphql et testez:

```graphql
{
  availableDrivers {
    name
    vehicle_type
    rating
  }
}
```

### Tests gRPC avec Postman
Voir [GRPC-TESTS.md](./GRPC-TESTS.md)

---

## 🐳 Déploiement

### Docker Compose (tous les services)
```bash
# Build
docker-compose -f docker-compose.full.yml build

# Démarrer
docker-compose -f docker-compose.full.yml up -d

# Logs
docker-compose -f docker-compose.full.yml logs -f

# Arrêter
docker-compose -f docker-compose.full.yml down
```

### Cloud
Voir [DEPLOYMENT.md](./DEPLOYMENT.md) pour:
- AWS (ECS, EKS)
- Google Cloud (Cloud Run, GKE)
- Azure (Container Instances, AKS)
- Kubernetes

---

## 🔧 Configuration

### Variables d'environnement

Chaque service a un fichier `.env.example`. Copiez-le en `.env`:

```bash
cp order-service/.env.example order-service/.env
cp delivery-service/.env.example delivery-service/.env
cp tracking-service/.env.example tracking-service/.env
cp api-gateway/.env.example api-gateway/.env
```

### Ports utilisés

| Service | Port | Type |
|---------|------|------|
| API Gateway | 3000 | HTTP (REST + GraphQL) |
| Order Service | 50051 | gRPC |
| Delivery Service | 50052 | gRPC |
| Tracking Service | 50053 | gRPC |
| Kafka | 9092 | TCP |
| Zookeeper | 2181 | TCP |

---

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser/Mobile)                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP/HTTPS
                         ▼
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

## 🔄 Flux de données

### 1. Création de commande
```
Client → API Gateway → Order Service → Kafka (order.created)
                                          ↓
                                    Delivery Service
                                          ↓
                                    Auto-assign driver
                                          ↓
                                    Kafka (delivery.assigned)
                                          ↓
                                    Tracking Service
                                          ↓
                                    Create tracking
```

### 2. Mise à jour de position
```
Client → API Gateway → Tracking Service → Update location
                                              ↓
                                        Calculate ETA
                                              ↓
                                        Kafka (tracking.updated)
```

### 3. Livraison complète
```
Client → API Gateway → Delivery Service → Update status (DELIVERED)
                                              ↓
                                        Release driver
                                              ↓
                                        Kafka (delivery.status.changed)
```

---

## 🛠️ Technologies

### Backend
- **Node.js** v18+ - Runtime JavaScript
- **Express.js** - Framework web
- **Apollo Server** - Serveur GraphQL
- **gRPC** - Communication inter-services
- **Kafka** - Message broker
- **SQLite3** - Base de données (Order, Tracking)
- **RxDB** - Base de données réactive (Delivery)

### Infrastructure
- **Docker** - Conteneurisation
- **Docker Compose** - Orchestration
- **Kafka + Zookeeper** - Messaging

---

## 📈 Fonctionnalités

### ✅ Implémentées
- [x] Création de commandes
- [x] Auto-assignment des livreurs
- [x] Tracking GPS en temps réel
- [x] Calcul automatique de distance et ETA
- [x] Mise à jour des positions
- [x] Gestion des statuts de livraison
- [x] API REST complète
- [x] API GraphQL
- [x] Communication gRPC
- [x] Événements Kafka
- [x] Documentation complète
- [x] Tests automatisés
- [x] Docker support

### 🚧 À venir (Roadmap)
- [ ] Tests unitaires et d'intégration
- [ ] Authentication JWT
- [ ] Rate limiting
- [ ] WebSocket pour tracking temps réel
- [ ] Monitoring (Prometheus + Grafana)
- [ ] Logs centralisés (ELK Stack)
- [ ] CI/CD (GitHub Actions)
- [ ] Application mobile
- [ ] Notifications push
- [ ] Historique des livraisons
- [ ] Statistiques et analytics

---

## 🐛 Troubleshooting

### Kafka ne démarre pas
```bash
docker-compose down
docker-compose up -d
```

### Port déjà utilisé
```powershell
# Trouver le processus
netstat -ano | findstr :3000

# Tuer le processus
taskkill /PID <PID> /F
```

### RxDB perd les données
RxDB est en mémoire. Redémarrez le delivery-service pour réinitialiser.

### Auto-assignment ne fonctionne pas
1. Vérifiez que Kafka est démarré
2. Vérifiez les logs des services
3. Vérifiez que les topics Kafka existent
4. Redémarrez tous les services dans l'ordre

---

## 📞 Support

Pour toute question ou problème:
1. Consultez la documentation
2. Vérifiez les logs: `docker-compose logs -f`
3. Vérifiez le statut: `docker-compose ps`
4. Créez une issue sur GitHub

---

## 👥 Contributeurs

- Votre nom

## 📄 Licence

MIT

---

## 🎉 Félicitations!

Vous avez maintenant un système de livraison complet et professionnel! 🚀

**Prochaines étapes recommandées:**
1. Testez tous les endpoints avec Postman
2. Déployez sur un environnement de test
3. Ajoutez des tests unitaires
4. Configurez le monitoring
5. Mettez en place le CI/CD

Bon développement! 💪
