FROM node:18-slim
WORKDIR /app
COPY package.json ./
RUN npm install --no-audit --no-fund
COPY src ./src
COPY proto ./proto
EXPOSE 8080
CMD ["npm","start"]
