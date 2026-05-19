# Documentation des Bases de Données

## Vue d'ensemble

Chaque microservice possède sa propre base de données, respectant le principe de séparation des données dans une architecture microservices.

## Order Service - SQLite3

**Type**: Base de données SQL relationnelle  
**Fichier**: `order-service/data/orders.db`

### Table: orders

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

**Colonnes**:
- `id` - UUID de la commande (clé primaire)
- `customer_name` - Nom du client
- `customer_phone` - Téléphone du client
- `pickup_address` - Adresse de récupération
- `delivery_address` - Adresse de livraison
- `package_description` - Description du colis
- `package_weight` - Poids du colis en kg
- `status` - Statut de la commande (PENDING, ASSIGNED, IN_TRANSIT, DELIVERED, CANCELLED)
- `created_at` - Date de création
- `updated_at` - Date de dernière mise à jour

**Exemple de données**:
```sql
INSERT INTO orders VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Ahmed Ben Ali',
  '+216 20 123 456',
  'Avenue Habib Bourguiba, Tunis',
  'Rue de la Liberté, La Marsa',
  'Documents importants',
  0.5,
  'PENDING',
  '2025-05-19 10:30:00',
  '2025-05-19 10:30:00'
);
```

---

## Delivery Service - RxDB (NoSQL)

**Type**: Base de données NoSQL réactive  
**Stockage**: En mémoire (peut être persisté avec un autre storage)

### Collection: drivers

**Schéma**:
```javascript
{
  title: 'driver schema',
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    name: { type: 'string' },
    phone: { type: 'string' },
    vehicle_type: { type: 'string' },
    vehicle_plate: { type: 'string' },
    is_available: { type: 'boolean' },
    current_location: {
      type: 'object',
      properties: {
        latitude: { type: 'number' },
        longitude: { type: 'number' }
      }
    },
    rating: { type: 'number' },
    total_deliveries: { type: 'number' }
  },
  required: ['id', 'name', 'phone']
}
```

**Exemple de document**:
```json
{
  "id": "driver-1",
  "name": "Ahmed Ben Ali",
  "phone": "+216 20 123 456",
  "vehicle_type": "Moto",
  "vehicle_plate": "TUN 1234",
  "is_available": true,
  "current_location": {
    "latitude": 36.8065,
    "longitude": 10.1815
  },
  "rating": 4.8,
  "total_deliveries": 150
}
```

### Collection: deliveries

**Schéma**:
```javascript
{
  title: 'delivery schema',
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    order_id: { type: 'string' },
    driver_id: { type: 'string' },
    status: { type: 'string' },
    assigned_at: { type: 'string' },
    picked_up_at: { type: ['string', 'null'] },
    delivered_at: { type: ['string', 'null'] }
  },
  required: ['id', 'order_id', 'driver_id', 'status']
}
```

**Exemple de document**:
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "order_id": "550e8400-e29b-41d4-a716-446655440000",
  "driver_id": "driver-1",
  "status": "ASSIGNED",
  "assigned_at": "2025-05-19T10:31:00Z",
  "picked_up_at": null,
  "delivered_at": null
}
```

**Pourquoi RxDB ?**
- Base de données réactive (observable)
- Parfait pour les données en temps réel
- Synchronisation facile
- Requêtes flexibles avec Mango Query

---

## Tracking Service - SQLite3

**Type**: Base de données SQL relationnelle  
**Fichier**: `tracking-service/data/tracking.db`

### Table: tracking

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
```

**Colonnes**:
- `id` - UUID du tracking (clé primaire)
- `order_id` - ID de la commande (unique)
- `driver_id` - ID du livreur
- `current_latitude` / `current_longitude` - Position actuelle
- `pickup_latitude` / `pickup_longitude` - Position de récupération
- `delivery_latitude` / `delivery_longitude` - Position de livraison
- `distance_traveled_km` - Distance parcourue
- `distance_remaining_km` - Distance restante
- `estimated_minutes` - Temps estimé d'arrivée en minutes
- `status` - Statut du tracking
- `last_updated` - Dernière mise à jour

### Table: location_history

```sql
CREATE TABLE location_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  speed REAL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Colonnes**:
- `id` - ID auto-incrémenté
- `order_id` - ID de la commande
- `latitude` / `longitude` - Position
- `speed` - Vitesse en km/h
- `timestamp` - Horodatage

**Exemple de données**:
```sql
-- Tracking
INSERT INTO tracking VALUES (
  '770e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440000',
  'driver-1',
  36.8100,
  10.1750,
  36.8065,
  10.1815,
  36.8189,
  10.1658,
  0.8,
  1.7,
  3,
  'TRACKING',
  '2025-05-19 10:35:00'
);

-- Historique
INSERT INTO location_history (order_id, latitude, longitude, speed) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 36.8065, 10.1815, 0),
  ('550e8400-e29b-41d4-a716-446655440000', 36.8100, 10.1750, 35.5);
```

---

## Principe de séparation des données

### Avantages
1. **Indépendance** : Chaque service peut évoluer indépendamment
2. **Scalabilité** : Chaque base peut être scalée séparément
3. **Résilience** : Une panne d'une base n'affecte pas les autres
4. **Technologie adaptée** : Chaque service utilise la technologie la plus appropriée

### Inconvénients
1. **Pas de transactions distribuées** : Nécessite des patterns comme Saga
2. **Duplication de données** : Certaines données peuvent être dupliquées
3. **Cohérence éventuelle** : Les données ne sont pas immédiatement cohérentes

### Communication entre bases
Les microservices ne communiquent **jamais** directement avec les bases de données des autres services. Toute communication se fait via :
- **gRPC** pour les appels synchrones
- **Kafka** pour les événements asynchrones

---

## Initialisation des bases de données

### Order Service
```bash
cd order-service
npm start
# La base de données est créée automatiquement au démarrage
```

### Delivery Service
```bash
cd delivery-service
npm start
# RxDB est initialisé en mémoire avec des livreurs de test
```

### Tracking Service
```bash
cd tracking-service
npm start
# La base de données est créée automatiquement au démarrage
```

---

## Requêtes utiles

### SQLite3 - Lister toutes les commandes
```sql
SELECT * FROM orders ORDER BY created_at DESC;
```

### SQLite3 - Commandes en cours
```sql
SELECT * FROM orders WHERE status IN ('PENDING', 'ASSIGNED', 'IN_TRANSIT');
```

### SQLite3 - Historique de tracking
```sql
SELECT * FROM location_history 
WHERE order_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY timestamp ASC;
```

### RxDB - Trouver les livreurs disponibles
```javascript
const drivers = await driversCollection
  .find({ selector: { is_available: true } })
  .exec();
```
