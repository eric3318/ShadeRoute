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
package com.graphhopper.shaded;

import com.graphhopper.routing.querygraph.VirtualEdgeIterator;
import com.graphhopper.routing.weighting.TurnCostProvider;
import com.graphhopper.routing.weighting.custom.CustomWeighting;
import com.graphhopper.shaded.utils.RequestContext;
import com.graphhopper.util.CustomModel;
import com.graphhopper.util.EdgeIteratorState;
import com.graphhopper.util.GHUtility;
import java.util.HashMap;
import java.util.Map;

/**
 * The CustomWeighting allows adjusting the edge weights relative to those we'd obtain for a given
 * base flag encoder. For example a car flag encoder already provides speeds and access flags for
 * every edge depending on certain edge properties. By default the CustomWeighting simply makes use
 * of these values, but it is possible to adjust them by setting up rules that apply changes
 * depending on the edges' encoded values.
 * <p>
 * The formula for the edge weights is as follows:
 * <p>
 * weight = distance/speed + distance_costs + stress_costs
 * <p>
 * The first term simply corresponds to the time it takes to travel along the edge. The second term
 * adds a fixed per-distance cost that is proportional to the distance but *independent* of the edge
 * properties, i.e. it reads
 * <p>
 * distance_costs = distance * distance_influence
 * <p>
 * The third term is also proportional to the distance but compared to the second it describes
 * additional costs that *do* depend on the edge properties. It can represent any kind of costs that
 * depend on the edge (like inconvenience or dangers encountered on 'high-stress' roads for bikes,
 * toll roads (because they cost money), stairs (because they are awkward when going by bike) etc.).
 * This 'stress' term reads
 * <p>
 * stress_costs = distance * stress_per_meter
 * <p>
 * and just like the distance term it describes costs measured in seconds. When modelling it, one
 * always has to 'convert' the costs into some time equivalent (e.g. for toll roads one has to think
 * about how much money can be spent to save a certain amount of time). Note that the distance_costs
 * described by the second term in general cannot be properly described by the stress costs, because
 * the distance term allows increasing the per-distance costs per-se (regardless of the type of the
 * road). Also note that both the second and third term are different to the first in that they can
 * increase the edge costs but do *not* modify the travel *time*.
 * <p>
 * Instead of letting you set the speed directly, `CustomWeighting` allows changing the speed
 * relative to the speed we get from the base flag encoder. The stress costs can be specified by
 * using a factor between 0 and 1 that is called 'priority'.
 * <p>
 * Therefore the full edge weight formula reads:
 * <pre>
 * weight = distance / (base_speed * speed_factor * priority)
 *        + distance * distance_influence
 * </pre>
 * <p>
 * The open parameters that we can adjust are therefore: speed_factor, priority and
 * distance_influence and they are specified via the `{@link CustomModel}`. The speed can also be
 * restricted to a maximum value, in which case the value calculated via the speed_factor is simply
 * overwritten. Edges that are not accessible according to the access flags of the base vehicle
 * always get assigned an infinite weight and this cannot be changed (yet) using this weighting.
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

  @Override
  public double calcEdgeWeight(EdgeIteratorState edgeState, boolean reverse) {
    double priority = edgeToPriorityMapping.get(edgeState, reverse);
    double speed = edgeToSpeedMapping.get(edgeState, reverse);

    if (priority == 0 || speed == 0) {
      return Double.POSITIVE_INFINITY;
    }

    Integer edgeId = edgeState.getEdge();
    Integer coverageLookUpKey;

    if (!(edgeState instanceof VirtualEdgeIterator)) {
      coverageLookUpKey = edgeId;
    } else {
      VirtualEdgeIterator v = (VirtualEdgeIterator) edgeState;
      int originalEdgeKey = v.getOriginalEdgeKey(edgeState.getEdge());
      coverageLookUpKey = GHUtility.getEdgeFromEdgeKey(originalEdgeKey);
    }

    if (!shadeData.containsKey(coverageLookUpKey)) {
      return Double.POSITIVE_INFINITY;
    }

    return getEdgeWeight(edgeState.getDistance(), priority, shadeData.get(coverageLookUpKey));
  }

  private double getEdgeWeight(double distanceWeight, double priority, double coverage) {
    return distanceWeight * (1 - coverage * parameter) / priority;
  }
}
