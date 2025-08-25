import grpc, time, os, tempfile, subprocess
from concurrent import futures
import executor_pb2 as pb2
import executor_pb2_grpc as pb2_grpc

class Executor(pb2_grpc.ExecutorServicer):
    def Run(self, request, context):
        code = request.code
        stdin = request.stdin or ""
        args = list(request.args)
        timeout = max(1000, int(request.timeoutMs or 8000)) / 1000.0
        try:
            with tempfile.TemporaryDirectory() as d:
                path = os.path.join(d, "main.py")
                with open(path, "w", encoding="utf-8") as f:
                    f.write(code)
                proc = subprocess.Popen(["python3", path, *args], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
                try:
                    out, err = proc.communicate(stdin, timeout=timeout)
                    code_rc = proc.returncode
                except subprocess.TimeoutExpired:
                    proc.kill()
                    out, err, code_rc = "", "Timeout", -1
                return pb2.RunResponse(exitCode=code_rc, stdout=out, stderr=err, error="", durationMs=0)
        except Exception as e:
            return pb2.RunResponse(exitCode=-1, stdout="", stderr="", error=str(e), durationMs=0)

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=4))
    pb2_grpc.add_ExecutorServicer_to_server(Executor(), server)
    server.add_insecure_port("[::]:50051")
    server.start()
    print("Python worker :50051")
    server.wait_for_termination()

if __name__ == "__main__":
    serve()
