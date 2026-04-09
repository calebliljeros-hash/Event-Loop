import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { typeDefs, resolvers } from './schemas/index.js';
import db from './config/connection.js';
import { authenticateContext } from './utils/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;
const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true, // Allow Apollo Sandbox in dev
});

const startApolloServer = async () => {
  await server.start();

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  // Mount GraphQL endpoint
  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: authenticateContext,
    }),
  );

  // Serve static client files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../client/dist')));

    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
    });
  }

  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}`);
      console.log(`GraphQL at http://localhost:${PORT}/graphql`);
    });
  });
};

startApolloServer();
