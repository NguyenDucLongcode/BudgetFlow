FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and Prisma configuration
COPY . .

# Provide a placeholder DATABASE_URL for prisma.config.ts during image build
RUN DATABASE_URL="postgresql://postgres:123456@localhost:5432/db_postgres?schema=public" npx prisma generate

# Build NestJS application
RUN npm run build

EXPOSE 8080

# Run pending Prisma migrations then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
