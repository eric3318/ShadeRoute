package com.graphhopper.shaded;

import com.graphhopper.routing.querygraph.VirtualEdgeIterator;
import com.graphhopper.routing.weighting.AbstractAdjustedWeighting;
import com.graphhopper.routing.weighting.Weighting;
import com.graphhopper.util.EdgeIteratorState;
import lombok.Setter;

public class ShadedWeighting1 extends AbstractAdjustedWeighting {

  private final RequestDataStore shadeManager;
  private static final String name = "shaded";
  private final GraphStatus graphStatus;

  @Setter
  private static double shadePref = 0;

  public ShadedWeighting1(Weighting superWeighting, RequestDataStore requestDataStore) {
    super(superWeighting);
    this.shadeManager = requestDataStore;
    this.graphStatus = GraphStatus.getInstance();
  }

  @Override
  public double calcEdgeWeight(EdgeIteratorState edgeState, boolean reverse) {
    if (graphStatus.isRouting()) {
      // todo: identify virtual edges that's within range as well and calculate the shade coverage for those
      if (!(edgeState instanceof VirtualEdgeIterator)) {
        if (shadeManager.withinRange(edgeState)) {
          return getEdgeWeight(superWeighting.calcEdgeWeight(edgeState, reverse),
              shadeManager.getShadeCoverage(edgeState));
        }
        return Double.POSITIVE_INFINITY;
      }
      return superWeighting.calcEdgeWeight(edgeState, reverse);
    }
    return superWeighting.calcEdgeWeight(edgeState, reverse);
  }

  private double getEdgeWeight(double distanceWeight, double coverage) {
    return distanceWeight * (1 - coverage * shadePref);
  }

  @Override
  public String getName() {

    return name;
  }
}
