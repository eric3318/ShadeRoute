package com.graphhopper.shaded;

import com.graphhopper.GHRequest;
import com.graphhopper.GHResponse;
import com.graphhopper.GraphHopper;
import com.graphhopper.routing.WeightingFactory;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.Data;

public class ShadedGraphHopper extends GraphHopper {

  private final GraphStatus graphStatus;
  private final static Map<String, RequestDataStore> requestDataStoreMap = new HashMap<>();

  public ShadedGraphHopper() {
    this.graphStatus = GraphStatus.getInstance();
  }

  @Override
  protected WeightingFactory createWeightingFactory() {
    return new ShadeWeightingFactory(super.getBaseGraph(), super.getEncodingManager());
  }

  @Override
  protected void cleanUp() {
    super.cleanUp();
    graphStatus.setRouting(true);
  }

  public GraphStatus getGraphStatus() {
    return GraphStatus.getInstance();
  }

  public RequestDataStore createDataStore(String requestId, double fromLon, double fromLat,
      double toLon, double toLat) {
    RequestDataStore requestDataStore = new RequestDataStore(fromLon, fromLat, toLon, toLat);
    requestDataStoreMap.put(requestId, requestDataStore);
    return requestDataStore;
  }

  public static RequestDataStore getRequestDataStore(String requestId) {
    return requestDataStoreMap.get(requestId);
  }
}


