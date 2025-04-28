package com.graphhopper.shaded;

import static com.graphhopper.routing.weighting.custom.CustomModelParser.createWeightingParameters;

import com.graphhopper.routing.ev.EncodedValueLookup;
import com.graphhopper.routing.weighting.TurnCostProvider;
import com.graphhopper.routing.weighting.custom.CustomWeighting;
import com.graphhopper.util.CustomModel;
import java.util.Map;

public class CustomModelHelper {

  public static CustomWeighting createWeighting(EncodedValueLookup lookup, TurnCostProvider
      turnCostProvider, CustomModel customModel, Map<Integer, Double> shadeData) {
    if (customModel == null) {
      throw new IllegalStateException("CustomModel cannot be null");
    }
    CustomWeighting.Parameters parameters = createWeightingParameters(customModel, lookup);
    return new ShadedCustomWeighting(turnCostProvider, parameters, shadeData);
  }

}

