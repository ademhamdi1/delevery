const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const cors = require('cors');
const bodyParser = require('body-parser');
const restRoutes = require('./routes');
const { typeDefs, resolvers } = require('./graphql');
const { initGrpcClients } = require('./grpc/clients');

async function startServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(bodyParser.json());

  // Initialiser les clients gRPC
  await initGrpcClients();
  console.log('✓ Clients gRPC initialisés');

  // Routes REST
  app.use('/api', restRoutes);

  // Apollo Server pour GraphQL
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers
  });

  await apolloServer.start();
  console.log('✓ Serveur GraphQL démarré');

  app.use('/graphql', expressMiddleware(apolloServer));

  // Route de santé
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'API Gateway' });
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`✓ API Gateway démarré sur le port ${PORT}`);
    console.log(`  REST API: http://localhost:${PORT}/api`);
    console.log(`  GraphQL: http://localhost:${PORT}/graphql`);
  });
}

startServer().catch(console.error);
