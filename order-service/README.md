# Order Service

Service de gestion des commandes de livraison.

## Responsabilités

- Créer, consulter, modifier et annuler des commandes
- Publier des événements Kafka lors des changements d'état
- Stocker les données dans SQLite3

## Base de données

**Type**: SQLite3

**Schema**:
```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  pickup_address TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  package_description TEXT,
  package_weight REAL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Événements Kafka

### Publiés
- `order.created` - Nouvelle commande créée
- `order.updated` - Commande mise à jour
- `order.cancelled` - Commande annulée

### Consommés
- `delivery.assigned` - Pour mettre à jour le statut de la commande

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

Le service gRPC démarre sur le port 50051 par défaut.
