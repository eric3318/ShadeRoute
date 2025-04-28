package com.graphhopper.shaded.utils;

import com.graphhopper.util.shapes.BBox;
import java.util.ArrayList;
import java.util.List;

public class GraphUtil {

  private static final int TILE_SIZE = 512;
  private static final int BUILDING_ZOOM = 15;

  public static double longitudeToPixel(double lng) {
    return ((lng + 180.0) / 360.0 * Math.pow(2.0, BUILDING_ZOOM)) * TILE_SIZE;
  }

  public static double latitudeToPixel(double lat) {
    double latRad = Math.toRadians(lat);
    double mercatorY = Math.log(Math.tan(latRad) + 1.0 / Math.cos(latRad));
    return ((1.0 - (mercatorY / Math.PI)) / 2.0 * Math.pow(2.0, BUILDING_ZOOM)) * TILE_SIZE;
  }

  public static double[] getBBox(double minLon, double maxLon, double minLat, double maxLat,
      double magFactor) {
    double centerLat = (minLat + maxLat) / 2.0;
    double centerLon = (minLon + maxLon) / 2.0;

    double halfWidth = (maxLon - minLon) / 2.0;
    double halfHeight = (maxLat - minLat) / 2.0;

    double enlargedHalfWidth = halfWidth * (1 + magFactor);
    double enlargedHalfHeight = halfHeight * (1 + magFactor);

    double newMinLon = centerLon - enlargedHalfWidth;
    double newMaxLon = centerLon + enlargedHalfWidth;
    double newMinLat = centerLat - enlargedHalfHeight;
    double newMaxLat = centerLat + enlargedHalfHeight;

    return new double[]{newMinLon, newMaxLon, newMinLat, newMaxLat};
  }

  public static List<BBox> getBBoxCells(double minLon, double maxLon, double minLat,
      double maxLat, int viewPortWidthPx, int viewPortHeightPx) {
    List<BBox> cells = new ArrayList<>();

    double left = longitudeToPixel(minLon);
    double right = longitudeToPixel(maxLon);
    double top = latitudeToPixel(maxLat);
    double bottom = latitudeToPixel(minLat);

    double horizontalPixelSpan = right - left;
    int numberOfCols = (int) Math.ceil(horizontalPixelSpan / viewPortWidthPx);

    double verticalPixelSpan = bottom - top;
    int numberOfRows = (int) Math.ceil(verticalPixelSpan / viewPortHeightPx);

    double deltaLon = (maxLon - minLon) / numberOfCols;
    double deltaLat = (maxLat - minLat) / numberOfRows;

    for (int row = 0; row < numberOfRows; row++) {
      double cellMinLat = minLat + (row * deltaLat);
      double cellMaxLat = cellMinLat + deltaLat;

      for (int col = 0; col < numberOfCols; col++) {
        double cellMinLon = minLon + (col * deltaLon);
        double cellMaxLon = cellMinLon + deltaLon;

        if (col == numberOfCols - 1) {
          cellMaxLon = maxLon;
        }
        if (row == numberOfRows - 1) {
          cellMaxLat = maxLat;
        }

        BBox cell = new BBox(cellMinLon, cellMaxLon, cellMinLat, cellMaxLat);
        cells.add(cell);
      }
    }
    return cells;
  }

}
