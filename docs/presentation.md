# Présentation du Projet

## Système de Livraison en Temps Réel

### Contexte académique
- **Cours** : SoA et Microservices
- **Année universitaire** : 2025-26
- **Professeur** : Dr. Salah Gontara
- **Type** : Mini-projet en binôme/trinôme

---

## 🎯 Objectifs du projet

Concevoir et développer une application fonctionnelle basée sur une architecture microservices démontrant :
- Une séparation claire des responsabilités
- Une communication correcte entre les composants
- L'utilisation de technologies modernes (gRPC, Kafka, GraphQL)

---

## 🏗️ Architecture

### Vue d'ensemble

```
┌─────────┐
│ Client  │ (Interface de test)
└────┬────┘
     │ REST / GraphQL
     ▼
┌─────────────────┐
│  API Gateway    │ (Point d'entrée unique)
│  - REST API     │
│  - GraphQL API  │
└────┬────────────┘
     │ gRPC (HTTP/2 + Protobuf)
     ├──────────────┬──────────────┐
     ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│  Order   │  │ Delivery │  │ Tracking │
│ Service  │  │ Service  │  │ Service  │
│ (SQLite) │  │  (RxDB)  │  │ (SQLite) │
└────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │              │
     └──────┬──────┴──────┬───────┘
            ▼             ▼
       ┌─────────────────────┐
       │   Kafka Broker      │
       └─────────────────────┘
```

### Composants

#### 1. API Gateway (Port 3000)
- **Rôle** : Point d'entrée unique
- **Technologies** : Express.js, Apollo Server
- **Expose** : REST API + GraphQL
- **Communique** : gRPC vers les microservices

#### 2. Order Service (Port 50051)
- **Rôle** : Gestion des commandes
- **Base de données** : SQLite3
- **Événements Kafka** : Publie `order.created`, `order.updated`, `order.cancelled`

#### 3. Delivery Service (Port 50052)
- **Rôle** : Gestion des livreurs et affectations
- **Base de données** : RxDB (NoSQL)
- **Événements Kafka** : Publie `delivery.assigned`, `delivery.status.changed`
- **Intelligence** : Auto-assignment des livreurs disponibles

#### 4. Tracking Service (Port 50053)
- **Rôle** : Suivi en temps réel
- **Base de données** : SQLite3
- **Fonctionnalités** : Calcul d'ETA, historique des positions
- **Événements Kafka** : Publie `tracking.location.updated`

---

## 🔧 Technologies utilisées

### Communication
- **gRPC** : Communication synchrone haute performance (HTTP/2 + Protobuf)
- **REST** : API HTTP classique pour les opérations CRUD
- **GraphQL** : Requêtes flexibles et agrégation de données
- **Kafka** : Messaging asynchrone pour les événements métier

### Bases de données
- **SQLite3** : Base SQL légère (Order Service, Tracking Service)
- **RxDB** : Base NoSQL réactive (Delivery Service)

### Runtime et frameworks
- **Node.js** : Runtime JavaScript
- **Express** : Framework web
- **Apollo Server** : Serveur GraphQL
- **KafkaJS** : Client Kafka pour Node.js

---

## 📊 Flux de données

### Scénario : Créer et livrer une commande

1. **Client** crée une commande via REST
   ```
   POST /api/orders
   ```

2. **API Gateway** → **Order Service** (gRPC)
   ```
   CreateOrder(customer_name, pickup_address, ...)
   ```

3. **Order Service** enregistre dans SQLite et publie sur Kafka
   ```
   Topic: order.created
   ```

4. **Delivery Service** consomme l'événement et assigne un livreur
   ```
   Auto-assignment du livreur disponible le plus proche
   ```

5. **Delivery Service** publie sur Kafka
   ```
   Topic: delivery.assigned
   ```

6. **Order Service** met à jour le statut → `ASSIGNED`

7. **Tracking Service** démarre le suivi

8. **Client** consulte via GraphQL (agrégation de données)
   ```graphql
   query {
     order(id: "123") {
       customer_name
       delivery {
         driver { name }
       }
       tracking {
         current_location
         estimated_minutes
       }
     }
   }
   ```

---

## ✨ Fonctionnalités clés

### 1. Auto-assignment intelligent
- Détection automatique des livreurs disponibles
- Assignment dès la création de la commande
- Libération automatique du livreur après livraison

### 2. Suivi en temps réel
- Position GPS du livreur
- Calcul dynamique de l'ETA
- Historique des positions
- Formule de Haversine pour les distances

### 3. Agrégation de données (GraphQL)
- Une seule requête pour obtenir commande + livraison + tracking
- Le client demande exactement les champs nécessaires
- Réduction du nombre d'appels réseau

### 4. Communication événementielle
- Découplage des microservices
- Résilience (messages persistés)
- Scalabilité (ajout facile de consommateurs)

---

## 📈 Points forts du projet

### Conformité au cahier des charges

✅ **3 microservices indépendants** avec responsabilités claires  
✅ **API Gateway** exposant REST et GraphQL  
✅ **gRPC** pour la communication inter-services (HTTP/2 + Protobuf)  
✅ **Kafka** pour les événements asynchrones  
✅ **Bases de données séparées** (SQLite3 + RxDB)  
✅ **Documentation complète** avec schémas et exemples  
✅ **Fichiers .proto** bien définis  
✅ **Topics Kafka** pertinents et documentés  

### Qualité technique

✅ **Séparation des responsabilités** : Chaque service a un rôle clair  
✅ **Gestion des erreurs** : Codes d'erreur gRPC appropriés  
✅ **Code structuré** : Organisation claire des fichiers  
✅ **Commentaires** : Code commenté et explicite  
✅ **Logs** : Événements importants loggés  

### Documentation

✅ **README complet** avec instructions d'installation  
✅ **Architecture détaillée** avec schémas  
✅ **Endpoints REST** documentés avec exemples  
✅ **Schéma GraphQL** avec requêtes d'exemple  
✅ **Topics Kafka** avec structure des messages  
✅ **Services gRPC** avec tous les messages Protobuf  
✅ **Bases de données** avec schémas SQL et NoSQL  

---

## 🚀 Démonstration

### 1. Créer une commande (REST)
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Ahmed Ben Ali",
    "customer_phone": "+216 20 123 456",
    "pickup_address": "Tunis Centre",
    "delivery_address": "La Marsa"
  }'
```

### 2. Vérifier l'auto-assignment (GraphQL)
```graphql
query {
  order(id: "ORDER_ID") {
    customer_name
    status
    delivery {
      driver {
        name
        vehicle_type
      }
      status
    }
  }
}
```

### 3. Mettre à jour la position (REST)
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

### 4. Consulter le tracking (GraphQL)
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

---

## 📊 Métriques du projet

- **Lignes de code** : ~3000+
- **Fichiers** : 50+
- **Services** : 3 microservices + 1 API Gateway
- **Endpoints REST** : 15+
- **Queries/Mutations GraphQL** : 10+
- **Topics Kafka** : 6
- **Tables/Collections** : 5
- **Fichiers .proto** : 3

---

## 🎓 Apprentissages

### Concepts maîtrisés

1. **Architecture microservices**
   - Séparation des responsabilités
   - Communication inter-services
   - Bases de données indépendantes

2. **gRPC**
   - Définition de contrats avec Protobuf
   - Implémentation de serveurs et clients
   - Gestion des erreurs

3. **Kafka**
   - Publication d'événements
   - Consommation d'événements
   - Consumer groups

4. **GraphQL**
   - Définition de schémas
   - Resolvers
   - Agrégation de données

5. **Bases de données**
   - SQL (SQLite3)
   - NoSQL (RxDB)
   - Principe de séparation

---

## 🔮 Améliorations futures

### Optionnelles mais valorisées

- 🐳 **Conteneurisation** : Docker pour chaque microservice
- ☁️ **Cloud** : Déploiement sur AWS/Azure/GCP
- 🔐 **Sécurité** : Authentification JWT
- 📱 **Mobile** : Application pour les livreurs
- 🔔 **Notifications** : WebSocket pour le temps réel
- 📊 **Monitoring** : Prometheus + Grafana
- 🧪 **Tests** : Tests unitaires et d'intégration
- 🔄 **Résilience** : Circuit breaker, retry logic

---

## 👥 Équipe

- **[Nom Membre 1]** : Order Service + Documentation
- **[Nom Membre 2]** : Delivery Service + Tracking Service
- **[Nom Membre 3]** : API Gateway + Client (optionnel)

---

## 📚 Références

- [gRPC Documentation](https://grpc.io/docs/)
- [Kafka Documentation](https://kafka.apache.org/documentation/)
- [GraphQL Documentation](https://graphql.org/learn/)
- [Microservices Patterns](https://microservices.io/patterns/)

---

## 🙏 Remerciements

Merci au Dr. Salah Gontara pour ce projet enrichissant qui nous a permis de mettre en pratique les concepts d'architecture microservices.

---

**Projet académique - A.U. 2025-26**
