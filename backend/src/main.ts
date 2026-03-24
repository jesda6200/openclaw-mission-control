import express from 'express';
const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({status: 'ok'}));

app.get('/markets/latest', (_req, res) => {
  res.json({symbol: 'BTCUSDT', timestamp: new Date().toISOString(), price: 0});
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Backend listening on ${port}`));
