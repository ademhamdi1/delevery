# Delivery Service

Service de gestion des livreurs et affectation des livraisons.

## Responsabilités

- Gérer les livreurs (disponibilité, position)
- Assigner automatiquement ou manuellement un livreur à une commande
- Mettre à jour le statut des livraisons
- Publier des événements Kafka lors des changements

## Base de données

**Type**: RxDB (NoSQL)

**Collections**:
- `drivers` - Informations sur les livreurs
- `deliveries` - Affectations de livraisons

## Événements Kafka

### Publiés
- `delivery.assigned` - Livreur assigné à une commande
- `delivery.status.changed` - Statut de livraison changé

### Consommés
- `order.created` - Pour assigner automatiquement un livreur

## Installation

```bash
npm install
```

## Configuration

Copier `.env.example` vers `.env` et ajuster les valeurs.

## Démarrage

```bash
npm start
```

Le service gRPC démarre sur le port 50052 par défaut.
