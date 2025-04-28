package com.graphhopper.shaded;

import com.graphhopper.util.EdgeIteratorState;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class RequestDataStore {

  private final Map<Integer, EdgeShadeProfile> map = new HashMap<>();
  private final EdgeReference reference = new EdgeReference();
  private final double parameter = 0;
  private final double fromLon;
  private final double fromLat;
  private final double toLon;
  private final double toLat;

  public double getShadeCoverage(EdgeIteratorState edgeState) {
    int edgeId = edgeState.getEdge();
    if (!map.containsKey(edgeId)) {
      throw new RuntimeException("Edge does not exist in shade map");
    }
    return map.get(edgeId).getShadeCoverage();
  }

  public double getShadeCoverage(int edgeId) {
    if (!map.containsKey(edgeId)) {
      throw new RuntimeException("Edge does not exist in shade map");
    }
    return map.get(edgeId).getShadeCoverage();
  }

  public boolean withinRange(EdgeIteratorState edgeState) {
    return map.containsKey(edgeState.getEdge());
  }

  public void generateEdgeShadeProfiles(Map<Integer, List<Integer>> data) {
    for (Entry<Integer, List<Integer>> entry : data.entrySet()) {
      Integer edgeId = entry.getKey();
      EdgeShadeProfile edgeShadeProfile = new EdgeShadeProfile();
      List<Integer> input = entry.getValue();
      edgeShadeProfile.process(input);
      map.put(edgeId, edgeShadeProfile);
    }
  }
}
