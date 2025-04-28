package org.shade.routing.config;

import com.graphhopper.GraphHopper;
import com.graphhopper.config.Profile;
import com.graphhopper.json.Statement;
import com.graphhopper.json.Statement.Op;
import com.graphhopper.shaded.GraphStatus;
import com.graphhopper.shaded.ShadedGraphHopper;
import com.graphhopper.util.CustomModel;
import com.graphhopper.util.GHUtility;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GraphHopperConfig {

  @Value("${graphhopper.osm-path}")
  private String osmPath;
  @Value("${graphhopper.graph-location}")
  private String graphLocation;

  @Bean
  public GraphHopper graphHopper() {
    ShadedGraphHopper hopper = new ShadedGraphHopper();
    hopper.setOSMFile(osmPath);
    hopper.setGraphHopperLocation(graphLocation);
    hopper.setEncodedValuesString(
        "foot_access, foot_average_speed,foot_priority, hike_rating, mtb_rating, average_slope, bike_priority, bike_access, roundabout, bike_average_speed");
    hopper.setProfiles(
        new Profile("preliminary").setCustomModel(
            new CustomModel().addToSpeed(Statement.If("true", Op.LIMIT, "foot_average_speed"))),
        createProfile(Modes.WALKING),
        createProfile(Modes.RUNNING),
        createProfile(Modes.BIKING));
    hopper.importOrLoad();
    GraphStatus graphStatus = GraphStatus.getInstance();
    if (!graphStatus.isRouting()) {
      graphStatus.setRouting(true);
    }
    return hopper;
  }

  private Profile createProfile(String mode) {
    CustomModel baseModel;
    String profileName;

    if (mode.equals(Modes.BIKING)) {
      baseModel = CustomModel.merge(GHUtility.loadCustomModelFromJar("bike.json"),
          GHUtility.loadCustomModelFromJar("bike_elevation.json"));
      profileName = Profiles.Bike.BIKING;
    } else {
      baseModel = CustomModel.merge(GHUtility.loadCustomModelFromJar("foot.json"),
          GHUtility.loadCustomModelFromJar("foot_elevation.json"));
      profileName = Profiles.FOOT_BASE_PROFILE + "_" + mode;
    }

    // apply a multiplier = 2 to foot_average_speed in running mode
    if (mode.equals(Modes.RUNNING)) {
      baseModel.addToSpeed(Statement.If("true", Op.MULTIPLY, "2"));
    }

    Profile profile = new Profile(profileName).setCustomModel(baseModel)
        .putHint("ch.disable", true);
    return profile;
  }

}