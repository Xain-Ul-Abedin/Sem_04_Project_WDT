import cors from 'cors';
import env from './env.js';

const corsOptions = {
  origin: env.NODE_ENV === 'development'
    ? [env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000']
    : env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

export default cors(corsOptions);
