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

/**
 * Spring Boot configuration class for initializing and configuring the GraphHopper instance.
 * This setup supports custom routing profiles (e.g., walking, running, biking) using GraphHopper's
 * {@link CustomModel}
 */
@Configuration
public class GraphHopperConfig {

  // Path to the input OpenStreetMap (.osm.pbf) file
  @Value("${graphhopper.osm-path}")
  private String osmPath;
  // Directory where GraphHopper stores its processed graph data
  @Value("${graphhopper.graph-location}")
  private String graphLocation;

  /**
   * Configures and initializes the GraphHopper instance as a Spring bean.
   */
  @Bean
  public GraphHopper graphHopper() {
    ShadedGraphHopper hopper = new ShadedGraphHopper();
    hopper.setOSMFile(osmPath);
    hopper.setGraphHopperLocation(graphLocation);
    // specify encoded values to use in profiles
    hopper.setEncodedValuesString(
        "foot_access, foot_average_speed,foot_priority, hike_rating, mtb_rating, average_slope, bike_priority, bike_access, roundabout, bike_average_speed");
    // register routing profiles
    hopper.setProfiles(
        new Profile("preliminary").setCustomModel(
            new CustomModel().addToSpeed(Statement.If("true", Op.LIMIT, "foot_average_speed"))),
        createProfile(Modes.WALKING),
        createProfile(Modes.RUNNING),
        createProfile(Modes.BIKING));
    // create graph or import existing graph
    hopper.importOrLoad();
    GraphStatus graphStatus = GraphStatus.getInstance();
    if (!graphStatus.isRouting()) {
      graphStatus.setRouting(true);
    }
    return hopper;
  }

  /**
   * Creates a custom routing profile based on the selected mode.
   */
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

    if (mode.equals(Modes.RUNNING)) {
      baseModel.addToSpeed(Statement.If("true", Op.MULTIPLY, "2"));
    }

    Profile profile = new Profile(profileName).setCustomModel(baseModel)
        .putHint("ch.disable", true);
    return profile;
  }

}