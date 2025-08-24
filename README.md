# 📦 CodeDock – Online IDE with Multi-Language Execution  

CodeDock is a lightweight **online IDE platform** inspired by HackerRank / CodeSandbox.  
It provides a simple interface to write, run, and test code in multiple languages inside sandboxed Docker workers, all orchestrated by a Node.js backend via **gRPC**.  

---

## 🚀 Features
- ✍️ Online editor (React + Monaco) with syntax highlighting  
- ⚡ Execute code in multiple languages (Python, Node.js, C++)  
- 🔒 Sandboxed execution using Docker containers  
- 🔄 gRPC-based communication between **server** and **workers**  
- 📊 Real-time feedback of stdout / stderr in UI  
- 🐳 Fully Dockerized for easy local setup  

---

## 🏗️ Architecture

- **Frontend** → Provides editor & UI  
- **Backend API** → Routes requests, forwards execution calls via gRPC  
- **Workers** → Language-specific execution servers, isolated with Docker  

---

## 🧩 Workers Explained

### 🐍 Python Worker
- **Stack:** Python 3 + gRPC  
- Directly interprets Python code via subprocess (`python3 snippet.py`)  
- Lightweight by design; perfect for quick iteration  

---

### 🟩 Node.js Worker
- **Stack:** Node.js + gRPC  
- Executes JS code with `node` runtime inside container  
- Mirrors same gRPC interface as Python worker  

---

### 💻 C++ Worker
- **Stack:** Python gRPC server + system `g++` compiler  
- **Design Choice:**  
  Instead of writing a full gRPC server in C++ (complex: cmake, grpc-cpp), we use a **Python gRPC server** that shells out to `g++`.  
  This keeps workers consistent and codebase simpler.  

**Flow:**  
1. Receives code via gRPC  
2. Saves as `snippet.cpp`  
3. Compiles with `g++ -o snippet snippet.cpp`  
4. Runs binary, captures stdout/stderr, returns result  

---

## ⚙️ Development Setup

### 1️ Clone Repo
```bash
cd codedock
docker-compose up --build
```
---
