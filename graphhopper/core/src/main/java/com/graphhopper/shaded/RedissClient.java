package com.graphhopper.shaded;

import io.lettuce.core.RedisClient;

public class RedissClient {

  private static volatile RedisClient redisClient;
  private static final String REDIS_URL = System.getenv()
      .getOrDefault("REDIS_URL", "redis://redis:6379");

  private RedissClient() {
  }

  public static RedisClient getInstance() {
    if (redisClient == null) {
      synchronized (RedissClient.class) {
        if (redisClient == null) {
          redisClient = RedisClient.create(REDIS_URL);
        }
      }
    }
    return redisClient;
  }
}