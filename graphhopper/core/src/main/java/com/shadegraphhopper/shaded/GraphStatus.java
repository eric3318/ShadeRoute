package com.shadegraphhopper.shaded;

import lombok.Getter;
import lombok.Setter;


/**
 * Singleton class to indicate whether the graph is created or not.
 */
@Getter
@Setter
public class GraphStatus {

  private boolean routing = false;
  private static GraphStatus instance;
  private GraphStatus(){}

  /**
   * Returns the singleton instance of GraphStatus.
   */
  public static GraphStatus getInstance() {
    if (instance == null)
      instance = new GraphStatus();
    return instance;
  }
}
