# Tracking Service

Service de suivi en temps réel des livraisons.

## Responsabilités

- Suivre la position en temps réel des livreurs
- Calculer le temps estimé d'arrivée (ETA)
- Conserver l'historique des positions
- Publier des événements de mise à jour de position

## Base de données

**Type**: SQLite3

**Schema**:
```sql
CREATE TABLE tracking (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE,
  driver_id TEXT NOT NULL,
  current_latitude REAL,
  current_longitude REAL,
  pickup_latitude REAL,
  pickup_longitude REAL,
  delivery_latitude REAL,
  delivery_longitude REAL,
  distance_traveled_km REAL DEFAULT 0,
  distance_remaining_km REAL,
  estimated_minutes INTEGER,
  status TEXT DEFAULT 'TRACKING',
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE location_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  speed REAL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Événements Kafka

### Publiés
- `tracking.location.updated` - Position mise à jour

### Consommés
- `delivery.assigned` - Pour démarrer le suivi

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

Le service gRPC démarre sur le port 50053 par défaut.
