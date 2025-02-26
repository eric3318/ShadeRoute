package com.graphhopper.shaded;

import com.graphhopper.util.EdgeIteratorState;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ShadeDataManager {

  Logger logger = LoggerFactory.getLogger(ShadeDataManager.class);

  private final Map<Integer, EdgeShadeProfile> shadeMap = new HashMap<>();
  private final EdgeCache edgeCache = new EdgeCache();

  public double getShadeCoverage(EdgeIteratorState edgeState) {
    int edgeId = edgeState.getEdge();
    if (!shadeMap.containsKey(edgeId)) {
      throw new RuntimeException("Edge does not exist in shade map");
    }
    return shadeMap.get(edgeId).getShadeCoverage();
  }

  public double getShadeCoverage(int edgeId) {
    if (!shadeMap.containsKey(edgeId)) {
      throw new RuntimeException("Edge does not exist in shade map");
    }
    return shadeMap.get(edgeId).getShadeCoverage();
  }

  public boolean withinRange(EdgeIteratorState edgeState) {
    return shadeMap.containsKey(edgeState.getEdge());
  }

  public void generateEdgeShadeProfiles(Map<Integer, List<Integer>> shadeData) {
    for (Entry<Integer, List<Integer>> entry : shadeData.entrySet()) {
      Integer edgeId = entry.getKey();
      EdgeShadeProfile edgeShadeProfile = new EdgeShadeProfile();
      List<Integer> input = entry.getValue();
      edgeShadeProfile.process(input);
      shadeMap.put(edgeId, edgeShadeProfile);
    }
  }

  public void clearData() {
    shadeMap.clear();
  }
}
