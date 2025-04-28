package com.graphhopper.shaded;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class EdgeReference {

  private static final Map<Integer, Edge> cache = new ConcurrentHashMap<>();

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
