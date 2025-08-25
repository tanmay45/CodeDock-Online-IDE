import path from 'path'; import { fileURLToPath } from 'url';
import grpc from '@grpc/grpc-js'; import protoLoader from '@grpc/proto-loader';
import { spawn } from 'child_process'; import fs from 'fs/promises'; import os from 'os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const protoPath = path.join(__dirname, 'proto/executor.proto');
const pkgDef = protoLoader.loadSync(protoPath, { keepCase: true });
const proto = grpc.loadPackageDefinition(pkgDef).executor;

function runNode(code, stdin, args, timeoutMs=8000){
  return new Promise(async (resolve) => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'node-'));
    const file = path.join(tmp, 'main.mjs');
    await fs.writeFile(file, code, 'utf8');
    const child = spawn('node', [file, ...(args||[])], { stdio: ['pipe','pipe','pipe'] });
    let out='', err='';
    child.stdout.on('data', d => out += d.toString());
    child.stderr.on('data', d => err += d.toString());
    const timer = setTimeout(()=> { child.kill('SIGKILL'); }, timeoutMs);
    if(stdin) child.stdin.write(stdin);
    child.stdin.end();
    child.on('close', (code)=> { clearTimeout(timer); resolve({ exitCode: code ?? -1, stdout: out, stderr: err }); });
  });
}

const server = new grpc.Server();
server.addService(proto.Executor.service, {
  Run: async (call, cb) => {
    try {
      const { code, stdin, args, timeoutMs } = call.request;
      const res = await runNode(code, stdin, args, timeoutMs || 8000);
      cb(null, { ...res, error: '' , durationMs: 0 });
    } catch (e){
      cb(null, { exitCode: -1, stdout:'', stderr:'', error: String(e), durationMs: 0 });
    }
  }
});
const PORT='0.0.0.0:50052';
server.bindAsync(PORT, grpc.ServerCredentials.createInsecure(), ()=> {
  server.start(); console.log('Node worker :50052');
});
