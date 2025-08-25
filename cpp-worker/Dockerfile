# C++ Worker: Python gRPC wrapper that shells out to g++

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install g++ for C++ code compilation
RUN apt-get update && \
    apt-get install -y --no-install-recommends g++ ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies (grpc server libs)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy proto definitions and generate Python gRPC stubs
COPY proto ./proto
RUN python3 -m grpc_tools.protoc \
    -I./proto \
    --python_out=. \
    --grpc_python_out=. \
    ./proto/executor.proto

# Copy the worker server code
COPY server.py .

# Expose gRPC port
EXPOSE 50053

# Start the worker
CMD ["python", "server.py"]
