const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { initDatabase } = require('./database');
const { initKafka } = require('./kafka');
const orderHandlers = require('./handlers/orderHandlers');

const PROTO_PATH = path.join(__dirname, '../../proto/order.proto');

// Charger le fichier proto
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const orderProto = grpc.loadPackageDefinition(packageDefinition).order;

async function main() {
  // Initialiser la base de données
  await initDatabase();
  console.log('✓ Base de données SQLite initialisée');

  // Initialiser Kafka
  await initKafka();
  console.log('✓ Kafka initialisé');

  // Créer le serveur gRPC
  const server = new grpc.Server();

  // Ajouter le service
  server.addService(orderProto.OrderService.service, orderHandlers);

  // Démarrer le serveur
  const PORT = process.env.GRPC_PORT || '50051';
  server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        console.error('Erreur lors du démarrage du serveur:', error);
        return;
      }
      console.log(`✓ Order Service démarré sur le port ${port}`);
      server.start();
    }
  );
}

main().catch(console.error);
