FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retries 5 && \
    npm config set registry http://registry.npmjs.org/ && \
    npm ci

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 3001

CMD ["sh", "-c", "npx prisma db push && npx prisma db seed && npm run start:prod"]
