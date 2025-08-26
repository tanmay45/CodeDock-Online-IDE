# Dockerfile to run Node js worker
FROM node:18-slim
WORKDIR /app
COPY package.json ./
RUN npm install --no-audit --no-fund
COPY server.js ./
COPY proto ./proto
EXPOSE 50052
CMD ["npm","start"]
