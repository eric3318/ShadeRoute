package com.graphhopper.shaded;

import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class EdgeShadeProfile {

  //  private final List<List<Boolean>> subEdges = new ArrayList<>();
  private static final int SHADE = 0;
//  private final List<Double> subEdgeLengths;

  @Getter
  private double shadeCoverage;

//  public void process(List<List<Integer>> subEdgeRgbaLists) {
//    for (List<Integer> rgbaList : subEdgeRgbaLists) {
//      addSubEdge(rgbaList);
//    }
//    calcShadeCoverage();
//  }

  public void process(List<Integer> input) {
    int shadeCount = 0;
    for (Integer isShade : input) {
      if (isShade == SHADE) {
        shadeCount++;
      }
    }
    shadeCoverage = (double) shadeCount / input.size();
  }

//  private void addSubEdge(List<Integer> rgbaList) {
//    int size = rgbaList.size();
//    int i = 0;
//    List<Boolean> subEdgeSamplings = new ArrayList<>();
//    while (i < size) {
//      subEdgeSamplings.add(rgbaList.get(i) == SHADE_COLOR_START);
//      i += 4;
//    }
//    subEdges.add(subEdgeSamplings);
//  }
//
//  private void calcShadeCoverage() {
//    double shadedDistance = 0;
//    double totalDistance = 0;
//    for (int i = 0; i < subEdges.size(); i++) {
//      double length = subEdgeLengths.get(i);
//      shadedDistance += calcSubEdgeShadeCoverage(i) * length;
//      totalDistance += length;
//    }
//    if (Math.abs(totalDistance) > 0.00002) {
//      shadeCoverage = shadedDistance / totalDistance;
//    } else {
//      shadeCoverage = 1.;
//    }
//  }
//
//  private double calcSubEdgeShadeCoverage(int index) {
//    List<Boolean> samplings = subEdges.get(index);
//    int shadeCount = 0;
//    for (Boolean isShade : samplings) {
//      if (isShade) {
//        shadeCount++;
//      }
//    }
//    return (double) shadeCount / samplings.size();
//  }

}
