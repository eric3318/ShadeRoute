package com.graphhopper.shaded;

import static com.graphhopper.routing.weighting.TurnCostProvider.NO_TURN_COST_PROVIDER;
import static com.graphhopper.util.Helper.toLowerCase;

import com.graphhopper.config.Profile;
import com.graphhopper.routing.DefaultWeightingFactory;
import com.graphhopper.routing.ev.BooleanEncodedValue;
import com.graphhopper.routing.ev.DecimalEncodedValue;
import com.graphhopper.routing.ev.Orientation;
import com.graphhopper.routing.ev.TurnRestriction;
import com.graphhopper.routing.util.EncodingManager;
import com.graphhopper.routing.weighting.DefaultTurnCostProvider;
import com.graphhopper.routing.weighting.TurnCostProvider;
import com.graphhopper.routing.weighting.Weighting;
import com.graphhopper.routing.weighting.custom.CustomWeighting;
import com.graphhopper.storage.BaseGraph;
import com.graphhopper.util.CustomModel;
import com.graphhopper.util.PMap;
import com.graphhopper.util.Parameters;
import com.graphhopper.util.TurnCostsConfig;

public class ShadeWeightingFactory extends DefaultWeightingFactory {

  //  private final ShadeDataManager shadeManager;
  private final EncodingManager encodingManager;
  // buggy???
  private final BaseGraph graph;

  public ShadeWeightingFactory(BaseGraph graph,
      EncodingManager encodingManager) {
    super(graph, encodingManager);
//    this.shadeManager = shadeDataManager;
    this.encodingManager = encodingManager;
    this.graph = graph;
  }

  @Override
  public Weighting createWeighting(Profile profile, PMap requestHints, boolean disableTurnCosts) {
    if (!"foot_walking".equals(profile.getName()) && !"foot_running".equals(
        profile.getName()) && !"biking".equals(profile.getName()) && !"preliminary".equals(
        profile.getName())) {
      throw new IllegalArgumentException("Invalid profile name: " + profile.getName());
    }

    PMap hints = new PMap();
    hints.putAll(profile.getHints());
    hints.putAll(requestHints);

    TurnCostProvider turnCostProvider;
    if (profile.hasTurnCosts() && !disableTurnCosts) {
      BooleanEncodedValue turnRestrictionEnc = encodingManager.getTurnBooleanEncodedValue(
          TurnRestriction.key(profile.getName()));
      if (turnRestrictionEnc == null) {
        throw new IllegalArgumentException(
            "Cannot find turn restriction encoded value for " + profile.getName());
      }
      DecimalEncodedValue oEnc =
          encodingManager.hasEncodedValue(Orientation.KEY) ? encodingManager.getDecimalEncodedValue(
              Orientation.KEY) : null;
      if (profile.getTurnCostsConfig().hasLeftRightStraightCosts() && oEnc == null) {
        throw new IllegalArgumentException(
            "Using left_turn_costs,sharp_left_turn_costs,right_turn_costs,sharp_right_turn_costs or straight_costs for turn_costs requires 'orientation' in graph.encoded_values");
      }
      int uTurnCosts = hints.getInt(
          Parameters.Routing.U_TURN_COSTS, profile.getTurnCostsConfig().getUTurnCosts());
      TurnCostsConfig tcConfig = new TurnCostsConfig(profile.getTurnCostsConfig()).setUTurnCosts(
          uTurnCosts);
      turnCostProvider = new DefaultTurnCostProvider(turnRestrictionEnc, oEnc, graph, tcConfig);
    } else {
      turnCostProvider = NO_TURN_COST_PROVIDER;
    }

    String weightingStr = toLowerCase(profile.getWeighting());

    Weighting weighting = null;
    if (CustomWeighting.NAME.equalsIgnoreCase(weightingStr)) {
      final CustomModel queryCustomModel = requestHints.getObject(CustomModel.KEY, null);
      final CustomModel mergedCustomModel = CustomModel.merge(profile.getCustomModel(),
          queryCustomModel);
      if (requestHints.has(Parameters.Routing.HEADING_PENALTY)) {
        mergedCustomModel.setHeadingPenalty(
            requestHints.getDouble(Parameters.Routing.HEADING_PENALTY,
                Parameters.Routing.DEFAULT_HEADING_PENALTY));
      }

      weighting = CustomModelHelper.createWeighting(encodingManager, turnCostProvider,
          mergedCustomModel);

    } else if ("shortest".equalsIgnoreCase(weightingStr)) {
      throw new IllegalArgumentException(
          "Instead of weighting=shortest use weighting=custom with a high distance_influence");
    } else if ("fastest".equalsIgnoreCase(weightingStr)) {
      throw new IllegalArgumentException(
          "Instead of weighting=fastest use weighting=custom with a custom model that avoids road_access == DESTINATION");
    } else if ("curvature".equalsIgnoreCase(weightingStr)) {
      throw new IllegalArgumentException(
          "The curvature weighting is no longer supported since 7.0. Use a custom " +
              "model with the EncodedValue 'curvature' instead");
    } else if ("short_fastest".equalsIgnoreCase(weightingStr)) {
      throw new IllegalArgumentException(
          "Instead of weighting=short_fastest use weighting=custom with a distance_influence");
    }

    if (weighting == null) {
      throw new IllegalArgumentException("Weighting '" + weightingStr + "' not supported");
    }

    return weighting;
  }

}
