FROM node:18-slim
WORKDIR /app
COPY package.json ./
RUN npm install --no-audit --no-fund
COPY index.html ./
COPY src ./src
ENV VITE_API_URL=${VITE_API_URL}
EXPOSE 5173
CMD ["npm","run","dev"]
