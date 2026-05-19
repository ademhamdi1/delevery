const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { initDatabase } = require('./database');
const { initKafka } = require('./kafka');
const trackingHandlers = require('./handlers/trackingHandlers');

const PROTO_PATH = path.join(__dirname, '../../proto/tracking.proto');

// Charger le fichier proto
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const trackingProto = grpc.loadPackageDefinition(packageDefinition).tracking;

async function main() {
  // Initialiser la base de données SQLite
  await initDatabase();
  console.log('✓ Base de données SQLite initialisée');

  // Initialiser Kafka
  await initKafka();
  console.log('✓ Kafka initialisé');

  // Créer le serveur gRPC
  const server = new grpc.Server();

  // Ajouter le service
  server.addService(trackingProto.TrackingService.service, trackingHandlers);

  // Démarrer le serveur
  const PORT = process.env.GRPC_PORT || '50053';
  server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        console.error('Erreur lors du démarrage du serveur:', error);
        return;
      }
      console.log(`✓ Tracking Service démarré sur le port ${port}`);
      server.start();
    }
  );
}

main().catch(console.error);
