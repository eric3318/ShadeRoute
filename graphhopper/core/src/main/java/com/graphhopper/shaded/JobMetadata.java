package com.graphhopper.shaded;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JobMetadata {

  private String id;
  private int total;
  private int timestamp;
  private double fromLat;
  private double fromLon;
  private double toLat;
  private double toLon;
  private double parameter;
  private String mode;
}