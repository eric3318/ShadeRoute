package org.shade.routing.dto;

import java.util.List;

public record EdgeDetail(int edgeId, List<Double> points, double shadeCoverage,
                         double distance) {

}
