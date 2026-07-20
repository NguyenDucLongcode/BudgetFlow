import Redis, { RedisOptions } from "ioredis";

class RedisService {
  private static instance: RedisService;

  private readonly client: Redis;

  private constructor() {
    const options: RedisOptions = {
      host: process.env.REDIS_HOST || "localhost",

      port: Number(process.env.REDIS_PORT) || 6379,

      password: process.env.REDIS_PASSWORD || undefined,

      db: Number(process.env.REDIS_DB ?? 0),

      keyPrefix: process.env.REDIS_PREFIX || "budgetflow:",

      connectTimeout: 10_000,

      enableReadyCheck: true,

      lazyConnect: true,

      maxRetriesPerRequest: null,

      retryStrategy(times) {
        return Math.min(times * 100, 3000);
      },
    };

    this.client = new Redis(options);

    this.registerEvents();
  }

  static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }

    return RedisService.instance;
  }

  async connect() {
    if (this.client.status === "wait") {
      await this.client.connect();
    }
  }

  async disconnect() {
    await this.client.quit();
  }

  getClient(): Redis {
    return this.client;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    await this.connect();

    if (ttlSeconds) {
      await this.client.set(key, value, "EX", ttlSeconds);
      return;
    }

    await this.client.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    await this.connect();

    return this.client.get(key);
  }

  async del(...keys: string[]) {
    await this.connect();

    return this.client.del(...keys);
  }

  async exists(key: string) {
    await this.connect();

    return (await this.client.exists(key)) === 1;
  }

  async expire(key: string, seconds: number) {
    await this.connect();

    return (await this.client.expire(key, seconds)) === 1;
  }

  async ttl(key: string) {
    await this.connect();

    return this.client.ttl(key);
  }

  async ping() {
    await this.connect();

    return this.client.ping();
  }

  private registerEvents() {
    this.client.on("ready", () => {
      console.log("✅ Redis connected");
    });

    this.client.on("error", (err) => {
      console.error("Redis Error:", err);
    });

    this.client.on("reconnecting", () => {
      console.warn("Redis reconnecting...");
    });
  }
}

export const redisService = RedisService.getInstance();
