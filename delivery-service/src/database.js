const { createRxDatabase, addRxPlugin } = require('rxdb');
const { getRxStorageMemory } = require('rxdb/plugins/storage-memory');
const { RxDBUpdatePlugin } = require('rxdb/plugins/update');

// Ajouter le plugin update
addRxPlugin(RxDBUpdatePlugin);

let db;
let driversCollection;
let deliveriesCollection;

// Schéma pour les livreurs
const driverSchema = {
  title: 'driver schema',
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    name: {
      type: 'string'
    },
    phone: {
      type: 'string'
    },
    vehicle_type: {
      type: 'string'
    },
    vehicle_plate: {
      type: 'string'
    },
    is_available: {
      type: 'boolean'
    },
    current_location: {
      type: 'object',
      properties: {
        latitude: { type: 'number' },
        longitude: { type: 'number' }
      }
    },
    rating: {
      type: 'number'
    },
    total_deliveries: {
      type: 'number'
    }
  },
  required: ['id', 'name', 'phone']
};

// Schéma pour les livraisons
const deliverySchema = {
  title: 'delivery schema',
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    order_id: {
      type: 'string'
    },
    driver_id: {
      type: 'string'
    },
    status: {
      type: 'string'
    },
    assigned_at: {
      type: 'string'
    },
    picked_up_at: {
      type: ['string', 'null']
    },
    delivered_at: {
      type: ['string', 'null']
    }
  },
  required: ['id', 'order_id', 'driver_id', 'status']
};

async function initDatabase() {
  // Créer la base de données
  db = await createRxDatabase({
    name: 'deliverydb',
    storage: getRxStorageMemory()
  });

  // Créer les collections
  await db.addCollections({
    drivers: {
      schema: driverSchema
    },
    deliveries: {
      schema: deliverySchema
    }
  });

  driversCollection = db.drivers;
  deliveriesCollection = db.deliveries;

  // Insérer des livreurs de test
  await seedDrivers();
}

async function seedDrivers() {
  const existingDrivers = await driversCollection.find().exec();
  if (existingDrivers.length > 0) {
    return; // Déjà initialisé
  }

  const testDrivers = [
    {
      id: 'driver-1',
      name: 'Ahmed Ben Ali',
      phone: '+216 20 123 456',
      vehicle_type: 'Moto',
      vehicle_plate: 'TUN 1234',
      is_available: true,
      current_location: { latitude: 36.8065, longitude: 10.1815 },
      rating: 4.8,
      total_deliveries: 150
    },
    {
      id: 'driver-2',
      name: 'Fatma Trabelsi',
      phone: '+216 22 234 567',
      vehicle_type: 'Voiture',
      vehicle_plate: 'TUN 5678',
      is_available: true,
      current_location: { latitude: 36.8189, longitude: 10.1658 },
      rating: 4.9,
      total_deliveries: 200
    },
    {
      id: 'driver-3',
      name: 'Mohamed Gharbi',
      phone: '+216 24 345 678',
      vehicle_type: 'Moto',
      vehicle_plate: 'TUN 9012',
      is_available: false,
      current_location: { latitude: 36.7989, longitude: 10.1789 },
      rating: 4.7,
      total_deliveries: 120
    }
  ];

  for (const driver of testDrivers) {
    await driversCollection.insert(driver);
  }

  console.log('✓ Livreurs de test insérés');
}

function getDatabase() {
  return db;
}

function getDriversCollection() {
  return driversCollection;
}

function getDeliveriesCollection() {
  return deliveriesCollection;
}

module.exports = {
  initDatabase,
  getDatabase,
  getDriversCollection,
  getDeliveriesCollection
};
