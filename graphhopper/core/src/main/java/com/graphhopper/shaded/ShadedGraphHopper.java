package com.graphhopper.shaded;

import com.graphhopper.GraphHopper;
import com.graphhopper.routing.WeightingFactory;
import java.util.List;
import java.util.Map;
import lombok.Getter;

public class ShadedGraphHopper extends GraphHopper {

  private final ShadeDataManager shadeManager;
  private final GraphStatus graphStatus;
  @Getter
  private final EdgeCache edgeCache;

  public ShadedGraphHopper() {
    this.shadeManager = new ShadeDataManager();
    this.graphStatus = GraphStatus.getInstance();
    this.edgeCache = new EdgeCache();
  }

  @Override
  protected WeightingFactory createWeightingFactory() {
    return new ShadeWeightingFactory(super.getBaseGraph(), super.getEncodingManager(),
        shadeManager);
  }

  @Override
  protected void cleanUp() {
    super.cleanUp();
    graphStatus.setRouting(true);
  }

  public GraphStatus getGraphStatus() {
    return GraphStatus.getInstance();
  }

  public void attachShadeData(Map<Integer, List<Integer>> shadeData) {
    shadeManager.generateEdgeShadeProfiles(shadeData);
  }

  public double getEdgeShade(int edgeId) {
    return shadeManager.getShadeCoverage(edgeId);
  }

  public void clearShadeData() {
    shadeManager.clearData();
  }

  public void setShadePref(double shadePref) {
    ShadedCustomWeighting.setShadePref(shadePref);
  }

}


