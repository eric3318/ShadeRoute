package org.shade.routing.dto;

import java.util.List;
import java.util.Map;
import org.shade.routing.config.Modes;

public record RouteRequest(double fromLat, double fromLon, double toLat, double toLon,
                           double shadePref,
                           Map<Integer, List<Integer>> shadeData, String mode
) {

}

