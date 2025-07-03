package com.shadegraphhopper.shaded;

import com.graphhopper.GraphHopper;
import com.graphhopper.routing.DefaultWeightingFactory;
import com.graphhopper.routing.WeightingFactory;
import com.shadegraphhopper.shaded.utils.RequestContext;
import io.lettuce.core.RedisClient;
import io.lettuce.core.api.StatefulRedisConnection;
import io.lettuce.core.api.sync.RedisCommands;
import java.util.Map;
import java.util.stream.Collectors;

public class ShadedGraphHopper extends GraphHopper {

  private final GraphStatus graphStatus;
  private final RedisCommands<String, String> commands;

  /**
   * Constructs a new instance of ShadedGraphHopper.
   * This constructor initializes the Redis client and the {@link GraphStatus} singleton used to track routing state.
   */
  public ShadedGraphHopper() {
    this.graphStatus = GraphStatus.getInstance();
    RedisClient client = RedissClient.getInstance();
    StatefulRedisConnection<String, String> connection = client.connect();
    this.commands = connection.sync();
  }

  /**
   * This method is used during both graph-creating and routing request.
   * Returns DefaultWeightingFactory if creating graph or preflight routing,
   * or ShadeWeightingFactory when routing.
   */
  @Override
  protected WeightingFactory createWeightingFactory() {
    if (!graphStatus.isRouting()) {
      return new DefaultWeightingFactory(super.getBaseGraph(), getEncodingManager());
    }

    // The job metadata is set in RequestContext when routing starts
    JobMetadata metadata = RequestContext.getMetadata();

    // Missing job metadata indicates that the method is called during preflight routing
    if (metadata == null) {
      return new DefaultWeightingFactory(super.getBaseGraph(), getEncodingManager());
    }

    // Instantiate ShadeWeightingFactory with shade data to be used in routing
    return new ShadeWeightingFactory(super.getBaseGraph(), super.getEncodingManager(),
        retrieveShadeData(
            metadata.getId())
    );
  }

  /**
   * Gets shade data for a specific job from Redis.
   * Returns a map of edge IDs to their corresponding percentage shade coverage.
   */
  private Map<Integer, Double> retrieveShadeData(String jobId) {
    String key = "job:" + jobId + ":result";
    Map<String, String> data = commands.hgetall(key);

    return data.entrySet().stream()
        .collect(Collectors.toMap(
            entry -> Integer.parseInt(entry.getKey()),
            entry -> Double.parseDouble(entry.getValue())
        ));
  }

  /**
   * This method gets called after graph is created and sets routing to true.
   */
  @Override
  protected void cleanUp() {
    super.cleanUp();
    graphStatus.setRouting(true);
  }
}

