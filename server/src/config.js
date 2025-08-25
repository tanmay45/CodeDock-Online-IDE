export const config = {
  port: parseInt(process.env.API_PORT || '8080', 10),
  redisUrl: process.env.REDIS_URL || 'redis://redis:6379',
  pg: {
    host: process.env.PGHOST || 'postgres',
    user: process.env.PGUSER || 'coder',
    password: process.env.PGPASSWORD || 'coderpass',
    database: process.env.PGDATABASE || 'codedock',
    port: parseInt(process.env.PGPORT || '5432', 10)
  },
  workers: {
    python: process.env.PYTHON_WORKER_ADDR || 'python-worker:50051',
    node: process.env.NODE_WORKER_ADDR || 'node-worker:50052',
    cpp: process.env.CPP_WORKER_ADDR || 'cpp-worker:50053'
  }
};
