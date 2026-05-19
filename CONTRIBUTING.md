# Guide de Contribution

## Organisation du travail

Ce projet est réalisé en équipe. Voici les bonnes pratiques à suivre.

## Workflow Git

### 1. Branches

- `main` - Branche principale (protégée)
- `develop` - Branche de développement
- `feature/nom-feature` - Branches de fonctionnalités
- `fix/nom-bug` - Branches de correction de bugs

### 2. Créer une nouvelle fonctionnalité

```bash
# Mettre à jour develop
git checkout develop
git pull origin develop

# Créer une branche feature
git checkout -b feature/nom-de-la-feature

# Travailler sur la feature
# ... faire des modifications ...

# Commiter régulièrement
git add .
git commit -m "feat: description de la fonctionnalité"

# Pousser la branche
git push origin feature/nom-de-la-feature
```

### 3. Pull Request

1. Créer une Pull Request sur GitHub
2. Demander une revue de code à un membre de l'équipe
3. Corriger les commentaires si nécessaire
4. Merger dans `develop` après approbation

### 4. Messages de commit

Utiliser le format Conventional Commits :

```
feat: ajouter l'endpoint REST pour créer une commande
fix: corriger le calcul de l'ETA
docs: mettre à jour la documentation GraphQL
refactor: améliorer la structure du code gRPC
test: ajouter des tests pour le Order Service
chore: mettre à jour les dépendances
```

## Répartition des tâches

### Membre 1 : Order Service + Documentation
- Développer le Order Service
- Implémenter les handlers gRPC
- Configurer SQLite3
- Intégrer Kafka (producer)
- Documenter les endpoints REST

### Membre 2 : Delivery Service + Tracking Service
- Développer le Delivery Service
- Implémenter RxDB
- Développer le Tracking Service
- Implémenter le calcul d'ETA
- Intégrer Kafka (producer/consumer)

### Membre 3 : API Gateway + Client (optionnel)
- Développer l'API Gateway
- Implémenter REST API
- Implémenter GraphQL
- Configurer les clients gRPC
- Créer l'interface client de test

## Standards de code

### JavaScript/Node.js

```javascript
// Utiliser const/let, pas var
const orderService = require('./orderService');

// Fonctions async/await
async function createOrder(data) {
  try {
    const order = await orderService.create(data);
    return order;
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
}

// Nommer les fonctions clairement
function calculateEstimatedArrivalTime(distance, speed) {
  return (distance / speed) * 60; // minutes
}
```

### Protobuf

```protobuf
// Commenter les messages et services
// Service de gestion des commandes
service OrderService {
  // Créer une nouvelle commande
  rpc CreateOrder(CreateOrderRequest) returns (OrderResponse);
}

// Utiliser snake_case pour les champs
message OrderRequest {
  string customer_name = 1;
  string customer_phone = 2;
}
```

### Documentation

- Commenter le code complexe
- Mettre à jour le README après chaque changement majeur
- Documenter les endpoints REST et GraphQL
- Expliquer les événements Kafka

## Tests

### Tester manuellement

```bash
# Tester la création d'une commande
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customer_name": "Test", ...}'

# Tester GraphQL
# Ouvrir http://localhost:3000/graphql
```

### Vérifier les logs

```bash
# Logs des microservices
# Vérifier que les événements Kafka sont publiés/consommés
# Vérifier que les appels gRPC fonctionnent
```

## Revue de code

### Checklist avant de créer une PR

- [ ] Le code compile sans erreur
- [ ] Les tests manuels passent
- [ ] Le code est commenté si nécessaire
- [ ] La documentation est à jour
- [ ] Les messages de commit sont clairs
- [ ] Pas de console.log inutiles
- [ ] Pas de code commenté
- [ ] Les fichiers .env.example sont à jour

### Checklist pour reviewer une PR

- [ ] Le code respecte les standards
- [ ] La fonctionnalité fonctionne correctement
- [ ] Pas de régression
- [ ] La documentation est claire
- [ ] Les erreurs sont gérées correctement

## Communication

### Outils recommandés

- **GitHub Issues** : Pour tracker les tâches et bugs
- **GitHub Projects** : Pour organiser le travail
- **Discord/Slack** : Pour la communication rapide
- **Google Meet** : Pour les réunions

### Réunions

- **Daily standup** (5-10 min) : Qu'est-ce que j'ai fait ? Qu'est-ce que je vais faire ? Blocages ?
- **Weekly review** (30 min) : Revue du travail de la semaine
- **Sprint planning** : Planifier les tâches de la semaine suivante

## Résolution de conflits

### Conflits Git

```bash
# Mettre à jour develop
git checkout develop
git pull origin develop

# Rebaser votre branche
git checkout feature/ma-feature
git rebase develop

# Résoudre les conflits
# ... éditer les fichiers ...
git add .
git rebase --continue

# Pousser (force push nécessaire après rebase)
git push origin feature/ma-feature --force
```

### Conflits d'équipe

- Communiquer ouvertement
- Écouter les autres
- Trouver des compromis
- Demander l'avis du professeur si nécessaire

## Ressources

### Documentation officielle

- [Node.js](https://nodejs.org/docs/)
- [gRPC](https://grpc.io/docs/)
- [Kafka](https://kafka.apache.org/documentation/)
- [GraphQL](https://graphql.org/learn/)
- [SQLite](https://www.sqlite.org/docs.html)
- [RxDB](https://rxdb.info/)

### Tutoriels

- [gRPC with Node.js](https://grpc.io/docs/languages/node/)
- [Apollo Server](https://www.apollographql.com/docs/apollo-server/)
- [KafkaJS](https://kafka.js.org/)

## Questions fréquentes

### Comment ajouter un nouveau endpoint REST ?

1. Ajouter la route dans `api-gateway/src/routes/`
2. Implémenter le handler gRPC dans le microservice
3. Tester avec curl
4. Documenter dans `docs/rest-api.md`

### Comment ajouter un nouveau champ dans un message Protobuf ?

1. Modifier le fichier `.proto`
2. Redémarrer tous les services
3. Mettre à jour les handlers
4. Tester

### Comment débugger un problème Kafka ?

1. Vérifier que Kafka est démarré : `docker-compose ps`
2. Voir les logs : `docker-compose logs kafka`
3. Consommer le topic : `docker exec -it <kafka-container> kafka-console-consumer ...`
4. Vérifier les consumer groups

## Bon courage ! 🚀
