FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

# 👇 INSTALA EL CLI DE NEST
RUN npm install -g @nestjs/cli typescript

FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS prod-deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps
COPY prisma ./prisma
RUN npx prisma generate

FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY .env .env 
COPY package*.json ./

# 👇 INSTALA NEST CLI TAMBIÉN EN PRODUCCIÓN (POR EL OVERRIDE)
RUN npm install -g @nestjs/cli typescript

EXPOSE 3000

CMD ["node", "dist/main"]
