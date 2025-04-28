package com.graphhopper.shaded;

import static com.graphhopper.routing.weighting.custom.CustomModelParser.createWeightingParameters;

import com.graphhopper.routing.ev.EncodedValueLookup;
import com.graphhopper.routing.weighting.TurnCostProvider;
import com.graphhopper.routing.weighting.custom.CustomWeighting;
import com.graphhopper.util.CustomModel;

public class CustomModelHelper {

  public static CustomWeighting createWeighting(EncodedValueLookup lookup, TurnCostProvider
      turnCostProvider, CustomModel customModel) {
    if (customModel == null) {
      throw new IllegalStateException("CustomModel cannot be null");
    }
    CustomWeighting.Parameters parameters = createWeightingParameters(customModel, lookup);
    return new ShadedCustomWeighting(turnCostProvider, parameters);
  }

}

