package com.graphhopper.shaded;

import java.util.HashMap;
import java.util.Map;

public class EdgeCache {

  private static final Map<Integer, Edge> cache = new HashMap<>();

  public void put(int edgeId, Edge edge) {
    cache.put(edgeId, edge);
  }

  public Edge get(int edgeId) {
    return cache.get(edgeId);
  }

  public boolean contains(int edgeId) {
    return cache.containsKey(edgeId);
  }

}
