package com.graphhopper.shaded;

import com.graphhopper.GHRequest;
import com.graphhopper.GHResponse;
import com.graphhopper.GraphHopper;
import com.graphhopper.routing.DefaultWeightingFactory;
import com.graphhopper.routing.WeightingFactory;
import com.graphhopper.shaded.utils.RequestContext;
import io.lettuce.core.RedisClient;
import io.lettuce.core.api.StatefulRedisConnection;
import io.lettuce.core.api.sync.RedisCommands;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.stream.Collectors;
import lombok.Data;

public class ShadedGraphHopper extends GraphHopper {

  private final GraphStatus graphStatus;
  private final RedisClient client;

  public ShadedGraphHopper() {
    this.graphStatus = GraphStatus.getInstance();
    this.client = RedissClient.getInstance();
  }

  @Override
  protected WeightingFactory createWeightingFactory() {
    if (!graphStatus.isRouting()) {
      return new DefaultWeightingFactory(super.getBaseGraph(), getEncodingManager());
    }

    JobMetadata metadata = RequestContext.getMetadata();

    if (metadata == null) {
      return new DefaultWeightingFactory(super.getBaseGraph(), getEncodingManager());
    }

    return new ShadeWeightingFactory(super.getBaseGraph(), super.getEncodingManager(),
        retrieveShadeData(
            metadata.getId())
    );
  }

  private Map<Integer, Double> retrieveShadeData(String jobId) {
    String key = "job:" + jobId + ":result";
    try (StatefulRedisConnection<String, String> connection = client.connect()) {
      Map<String, String> data = connection.sync().hgetall(key);

      return data.entrySet().stream()
          .collect(Collectors.toMap(
              entry -> Integer.parseInt(entry.getKey()),
              entry -> Double.parseDouble(entry.getValue())
          ));
    }
  }

  @Override
  protected void cleanUp() {
    super.cleanUp();
    graphStatus.setRouting(true);
  }
}

