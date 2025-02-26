package com.graphhopper.shaded;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GraphStatus {

  private boolean routing = false;
  private static GraphStatus instance;
  private GraphStatus(){}

  public static GraphStatus getInstance() {
    if (instance == null)
      instance = new GraphStatus();
    return instance;
  }
}
