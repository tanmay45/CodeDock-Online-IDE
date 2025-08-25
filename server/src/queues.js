import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { makeClient } from './grpcClient.js';
import { createExecution, updateExecution } from './db.js';
import { config } from './config.js';

const connection = new IORedis(config.redisUrl, { maxRetriesPerRequest: null, enableReadyCheck: false });

export const execQueue = new Queue('exec', { connection });

export async function enqueue({ language, code, stdin='', args=[], timeoutMs=8000 }){
  const id = uuidv4();
  await createExecution({ id, language, code, stdin, args });
  await execQueue.add('run', { id, language, code, stdin, args, timeoutMs },
    { removeOnComplete: true, removeOnFail: true, attempts: 1 });
  return id;
}

export function startWorker(){
  const worker = new Worker('exec', async (job) => {
    const { id, language, code, stdin='', args=[], timeoutMs=8000 } = job.data;
    let addr;
    if(language==='python') addr = config.workers.python;
    else if(language==='node') addr = config.workers.node;
    else if(language==='cpp' || language==='c++') addr = config.workers.cpp;
    else throw new Error('Unsupported language');
    const client = makeClient(addr);
    const response = await new Promise((resolve, reject) => {
      client.Run({ language, code, stdin, args, timeoutMs }, (err, res) => err ? reject(err) : resolve(res));
    });
    await updateExecution(id, {
      status: response.error ? 'failed' : 'completed',
      exit_code: response.exitCode,
      stdout: response.stdout,
      stderr: response.stderr,
      error: response.error || null,
      duration_ms: response.durationMs || null
    });
    return true;
  }, { connection, concurrency: 2 });

  worker.on('failed', async (job, err) => {
    try { if(job?.data?.id) await updateExecution(job.data.id, { status: 'failed', error: String(err.message || err) }); } catch(e){}
    console.error('Job failed', job?.id, err);
  });
}
