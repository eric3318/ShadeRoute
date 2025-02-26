package org.shade.routing.config;

public class Profiles {

  public static final String FOOT_BASE_PROFILE = "foot";

  public static final class Foot {

    public static final String WALKING = FOOT_BASE_PROFILE + "_walking";
    public static final String RUNNING = FOOT_BASE_PROFILE + "_running";
  }

  public static final class Bike {

    public static final String BIKING = "biking";
  }

  public static String getProfileName(String mode) {
    switch (mode) {
      case Modes.WALKING:
        return Foot.WALKING;
      case Modes.RUNNING:
        return Foot.RUNNING;
      case Modes.BIKING:
        return Bike.BIKING;
      default:
        throw new IllegalArgumentException("Invalid mode: " + mode);
    }
  }
}
