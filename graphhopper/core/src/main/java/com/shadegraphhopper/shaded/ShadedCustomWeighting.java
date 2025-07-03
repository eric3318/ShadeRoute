/*
 *  Licensed to GraphHopper GmbH under one or more contributor
 *  license agreements. See the NOTICE file distributed with this work for
 *  additional information regarding copyright ownership.
 *
 *  GraphHopper GmbH licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except in
 *  compliance with the License. You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
package com.shadegraphhopper.shaded;

import com.graphhopper.routing.querygraph.VirtualEdgeIterator;
import com.graphhopper.routing.weighting.TurnCostProvider;
import com.graphhopper.routing.weighting.custom.CustomWeighting;
import com.graphhopper.util.CustomModel;
import com.graphhopper.util.EdgeIteratorState;
import com.graphhopper.util.GHUtility;
import com.shadegraphhopper.shaded.utils.RequestContext;
import java.util.Map;

/**
 * A subclass of CustomWeighting that calculates edge weight based on shade data and parameter specified by user.
 */
public class ShadedCustomWeighting extends CustomWeighting {

  private final Map<Integer, Double> shadeData;
  private final double parameter;

  public ShadedCustomWeighting(TurnCostProvider turnCostProvider, Parameters parameters,
      Map<Integer, Double> shadeData) {
    super(turnCostProvider, parameters);
    this.shadeData = shadeData;
    this.parameter = RequestContext.getMetadata().getParameter();
  }

  /**
   * Calculates the weight for each edge explored in the algorithm.
   * @param edgeState the edge for which the weight should be calculated
   * @param reverse   if the specified edge is specified in reverse direction e.g. from the reverse
   *                  case of a bidirectional search.
   */
  @Override
  public double calcEdgeWeight(EdgeIteratorState edgeState, boolean reverse) {
    double priority = edgeToPriorityMapping.get(edgeState, reverse);
    double speed = edgeToSpeedMapping.get(edgeState, reverse);

    // GH uses encoded values of the edge to calculate the priority and speed for the edge
    // A speed or priority of 0 indicates that the edge is inaccessible or is the least preferred
    // in the current profile, and therefore should be assigned an infinite weight to prevent being included in the route
    if (priority == 0 || speed == 0) {
      return Double.POSITIVE_INFINITY;
    }

    Integer edgeId = edgeState.getEdge();
    Integer coverageLookUpKey;

    // use the edge id if the current edge is not an virtual edge,
    // otherwise use the id of the original edge that the virtual edge is created from.
    // note that the VirtualEdgeIterator class was modified to add a method for finding the original edge id.
    if (!(edgeState instanceof VirtualEdgeIterator)) {
      coverageLookUpKey = edgeId;
    } else {
      VirtualEdgeIterator v = (VirtualEdgeIterator) edgeState;
      int originalEdgeKey = v.getOriginalEdgeKey(edgeState.getEdge());
      coverageLookUpKey = GHUtility.getEdgeFromEdgeKey(originalEdgeKey);
    }

    // exclude the edge if the shade data does not exist
    if (!shadeData.containsKey(coverageLookUpKey)) {
      return Double.POSITIVE_INFINITY;
    }

    return getEdgeWeight(edgeState.getDistance(), priority, shadeData.get(coverageLookUpKey));
  }

  /**
   * Calculates the edge weight using a formula based on the priority, percentage shade coverage and length of the edge.
   * Returns the edge weight.
   * @param distanceWeight the length of the edge
   * @param priority the priority value determined by GH
   * @param coverage the percentage shade coverage of the edge
   */
  private double getEdgeWeight(double distanceWeight, double priority, double coverage) {
    return distanceWeight * (1 - coverage * parameter) / priority;
  }
}
