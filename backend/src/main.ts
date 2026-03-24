import express from 'express';
import {createProvider} from './db/index';

const app = express();
app.use(express.json());

const providerReady = createProvider();

app.get('/health', (_req, res) => res.json({status: 'ok'}));

app.get('/markets/latest', async (req, res) => {
  const symbol = (req.query.symbol as string) || 'BTCUSDT';
  const provider = await providerReady;
  const row = await provider.getLatest(symbol);
  if(!row) return res.status(404).json({error: 'not found'});
  res.json(row);
});

app.get('/markets/history', async (req, res) => {
  const symbol = (req.query.symbol as string) || 'BTCUSDT';
  const limit = parseInt((req.query.limit as string) || '100', 10);
  const provider = await providerReady;
  const rows = await provider.getHistory(symbol, limit);
  res.json(rows);
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Backend listening on ${port}`));
