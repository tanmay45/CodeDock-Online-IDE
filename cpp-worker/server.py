import grpc, os, tempfile, subprocess
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
                src = os.path.join(d, "main.cpp")
                binp = os.path.join(d, "main")
                with open(src, "w", encoding="utf-8") as f:
                    f.write(code)
                comp = subprocess.run(["g++", "-O2", "-std=c++17", src, "-o", binp], capture_output=True, text=True)
                if comp.returncode != 0:
                    return pb2.RunResponse(exitCode=comp.returncode, stdout="", stderr=comp.stderr, error="", durationMs=0)
                proc = subprocess.Popen([binp, *args], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
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
    server.add_insecure_port("[::]:50053")
    server.start()
    print("C++ worker :50053")
    server.wait_for_termination()

if __name__ == "__main__":
    serve()
