import path from 'path'; import grpc from '@grpc/grpc-js'; import protoLoader from '@grpc/proto-loader';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const protoPath = path.join(__dirname, '../proto/executor.proto');
const pkgDef = protoLoader.loadSync(protoPath, { keepCase: true });
const proto = grpc.loadPackageDefinition(pkgDef).executor;
export function makeClient(addr){
  return new proto.Executor(addr, grpc.credentials.createInsecure());
}
