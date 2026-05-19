# 🚀 COMMENCEZ ICI

## Bienvenue dans le Système de Livraison en Temps Réel !

Ce guide vous aidera à démarrer le projet en quelques minutes.

---

## ✅ Étape 1 : Vérifier les prérequis

```bash
# Vérifier Node.js (v18+)
node --version

# Vérifier npm
npm --version

# Vérifier Docker
docker --version
```

Si quelque chose manque, installez-le avant de continuer.

---

## ✅ Étape 2 : Les dépendances sont déjà installées !

✓ Order Service  
✓ Delivery Service  
✓ Tracking Service  
✓ API Gateway  

Tous les `node_modules` sont prêts !

---

## ✅ Étape 3 : Démarrer Kafka

```bash
docker-compose up -d
```

Vérifier que Kafka est démarré :
```bash
docker-compose ps
```

Vous devriez voir `kafka` et `zookeeper` en état `running`.

---

## ✅ Étape 4 : Démarrer les services

**Ouvrez 4 terminaux différents :**

### Terminal 1 - Order Service
```bash
cd order-service
npm start
```
Attendez de voir : `✓ Order Service démarré sur le port 50051`

### Terminal 2 - Delivery Service
```bash
cd delivery-service
npm start
```
Attendez de voir : `✓ Delivery Service démarré sur le port 50052`

### Terminal 3 - Tracking Service
```bash
cd tracking-service
npm start
```
Attendez de voir : `✓ Tracking Service démarré sur le port 50053`

### Terminal 4 - API Gateway
```bash
cd api-gateway
npm start
```
Attendez de voir : `✓ API Gateway démarré sur le port 3000`

---

## ✅ Étape 5 : Tester l'application

### Option A : Test avec PowerShell (Windows)

```powershell
.\test-api.ps1
```

### Option B : Test manuel avec curl

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d "{\"customer_name\":\"Test User\",\"customer_phone\":\"+216 20 123 456\",\"pickup_address\":\"Tunis\",\"delivery_address\":\"La Marsa\",\"package_weight\":1.5}"
```

### Option C : Test avec GraphQL

1. Ouvrir http://localhost:3000/graphql dans votre navigateur
2. Exécuter cette requête :

```graphql
query {
  availableDrivers {
    name
    vehicle_type
    rating
  }
}
```

---

## 🎯 Scénario de test complet

### 1. Créer une commande (REST)

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d "{\"customer_name\":\"Ahmed Ben Ali\",\"customer_phone\":\"+216 20 123 456\",\"pickup_address\":\"Tunis Centre\",\"delivery_address\":\"La Marsa\",\"package_weight\":1.5}"
```

**Résultat attendu :** Vous recevez un `order_id`

### 2. Vérifier l'auto-assignment (GraphQL)

Ouvrir http://localhost:3000/graphql et exécuter :

```graphql
query {
  order(id: "VOTRE_ORDER_ID") {
    customer_name
    status
    delivery {
      driver {
        name
        vehicle_type
      }
    }
  }
}
```

**Résultat attendu :** Un livreur est automatiquement assigné !

### 3. Mettre à jour la position (REST)

```bash
curl -X PUT http://localhost:3000/api/tracking/VOTRE_ORDER_ID/location \
  -H "Content-Type: application/json" \
  -d "{\"current_location\":{\"latitude\":36.8100,\"longitude\":10.1750},\"speed\":35.5}"
```

### 4. Consulter le tracking (GraphQL)

```graphql
query {
  tracking(orderId: "VOTRE_ORDER_ID") {
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

## 📚 Documentation

- **[README.md](./README.md)** - Documentation complète
- **[QUICKSTART.md](./QUICKSTART.md)** - Guide de démarrage rapide
- **[docs/architecture.md](./docs/architecture.md)** - Architecture détaillée
- **[docs/rest-api.md](./docs/rest-api.md)** - Endpoints REST
- **[docs/graphql-schema.md](./docs/graphql-schema.md)** - Schéma GraphQL
- **[test-graphql.md](./test-graphql.md)** - Tests GraphQL

---

## 🛑 Arrêter les services

### Arrêter les microservices
Appuyer sur `Ctrl+C` dans chaque terminal.

### Arrêter Kafka
```bash
docker-compose down
```

---

## ❓ Problèmes fréquents

### Kafka ne démarre pas
```bash
docker-compose down -v
docker-compose up -d
```

### Port déjà utilisé
Modifier les ports dans les fichiers `.env` de chaque service.

### Erreur "Cannot find module"
```bash
cd [nom-du-service]
npm install
```

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
├── order-service/        # Service de commandes
├── delivery-service/     # Service de livraison
├── tracking-service/     # Service de suivi
├── proto/                # Fichiers .proto (gRPC)
├── docs/                 # Documentation
└── docker-compose.yml    # Configuration Kafka
```

---

## 🎉 Félicitations !

Votre système de livraison microservices est maintenant opérationnel !

### Prochaines étapes :

1. ✅ Tester tous les endpoints REST
2. ✅ Tester toutes les requêtes GraphQL
3. ✅ Vérifier les événements Kafka dans les logs
4. ✅ Lire la documentation complète
5. ✅ Personnaliser le projet
6. ✅ Pousser sur GitHub

---

## 💡 Conseils

- **Logs** : Surveillez les logs de chaque service pour voir les événements Kafka
- **GraphQL** : Utilisez Apollo Sandbox (http://localhost:3000/graphql) pour explorer l'API
- **Kafka** : Utilisez `docker-compose logs -f kafka` pour voir les messages
- **Git** : Commitez régulièrement avec des messages clairs

---

## 📞 Besoin d'aide ?

1. Consultez la [documentation complète](./README.md)
2. Vérifiez les [problèmes fréquents](#-problèmes-fréquents)
3. Regardez les logs des services
4. Demandez à votre équipe

---

**Bon développement ! 🚀**

*Projet académique - A.U. 2025-26*
