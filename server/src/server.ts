import express from 'express';
import db from './config/connection.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// GraphQL will be configured in Phase 4
app.get('/', (_req, res) => {
  res.json({ message: 'EventLoop API — GraphQL coming in Phase 4' });
});

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
  });
});
