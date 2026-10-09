import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import documentRoutes from './routes/documentRoutes.js';
import agentRoutes from './routes/agentRoutes.js';
import formRoutes from './routes/formRoutes.js';

const app = express();
const port = Number(process.env.PORT ?? 4000);
const clientOrigin = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';

app.use(cors({ origin: clientOrigin }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'form-mitra-server',
    modelProvider: process.env.MODEL_PROVIDER ?? 'local-open-weight',
    automationScope: 'demo-form-only'
  });
});

app.use('/api/documents', documentRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/forms', formRoutes);

app.use((req, res) => {
  res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` });
});

app.use((err, _req, res, _next) => {
  const status = err.statusCode ?? 500;
  const message = status === 500 ? 'Unexpected server error.' : err.message;
  if (status === 500) {
    console.error(err);
  }
  res.status(status).json({ error: message });
});

app.listen(port, () => {
  console.log(`Form Mitra server listening on http://localhost:${port}`);
});
