import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import adminFormsRouter from './routes/adminForms.routes.js';
import publicFormsRouter from './routes/publicForms.routes.js';
import submissionsRouter from './routes/submissions.routes.js';

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  credentials: true
}));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use(limiter);

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/admin', adminFormsRouter);
app.use('/api', publicFormsRouter);
app.use('/api', submissionsRouter);


app.get('/api/health', (req, res) => res.json({ ok: true }));

const MONGO = process.env.MONGODB_URI
console.log('MONGO', MONGO);
mongoose.connect(MONGO).then(() => {
  console.log('Mongo connected');
  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`Server listening on ${port}`));
}).catch(e => {
  console.error('Mongo error', e);
  process.exit(1);
});

export default app;
