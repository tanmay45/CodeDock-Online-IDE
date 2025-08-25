FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY proto ./proto
RUN python3 -m grpc_tools.protoc -I./proto --python_out=. --grpc_python_out=. ./proto/executor.proto
COPY server.py ./
EXPOSE 50051
CMD ["python","server.py"]
