import express from 'express'; import cors from 'cors';
import { enqueue, startWorker } from './queues.js';
import { listExecutions, getExecution } from './db.js';
import { config } from './config.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

//Api Health check
app.get('/health', (_,res)=> res.json({ ok: true }));

app.get('/executions', async (_,res) => res.json(await listExecutions(100)));

app.get('/executions/:id', async (req,res) => {
  const row = await getExecution(req.params.id);
  if(!row) return res.status(404).json({ error: 'not found' });
  res.json(row);
});

app.post('/execute', async (req,res)=> {
  const { language, code, stdin='', args=[] } = req.body || {};
  if(!language || !code) return res.status(400).json({ error: 'language and code required' });
  if(!['python','node','cpp','c++'].includes(language)) return res.status(400).json({ error: 'Unsupported language' });
  const id = await enqueue({ language, code, stdin, args });
  res.json({ id });
});

app.listen(config.port, () => console.log('API on :' + config.port));
startWorker();
