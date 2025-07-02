package org.shade.routing.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericToStringSerializer;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializer;

@Configuration
public class RedisConfig {

  private final static String REDIS_HOSTNAME = System.getenv()
      .getOrDefault("REDIS_HOSTNAME", "redis");

  @Bean
  public LettuceConnectionFactory lettuceConnectionFactory() {
    RedisStandaloneConfiguration redisConfiguration = new RedisStandaloneConfiguration(
        REDIS_HOSTNAME, 6379);
    return new LettuceConnectionFactory(redisConfiguration);
  }

  @Bean
  public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
    RedisTemplate<String, Object> template = new RedisTemplate<>();
    template.setConnectionFactory(connectionFactory);
    RedisSerializer<Object> toStringSerializer = new GenericToStringSerializer<>(Object.class);
    Jackson2JsonRedisSerializer<Object> jacksonSerializer = new Jackson2JsonRedisSerializer<>(
        Object.class);

    template.setKeySerializer(toStringSerializer);
    template.setHashKeySerializer(toStringSerializer);
    template.setValueSerializer(jacksonSerializer);
    template.setHashValueSerializer(jacksonSerializer);
    template.afterPropertiesSet();
    return template;
  }
}
