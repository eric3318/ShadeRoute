package org.shade.routing.dto;

import java.util.List;

public record RouteResponse(List<Double[]> path, List<EdgeDetail> edgeDetails, double totalWeight,
                            double totalDistance, List<InstructionDetail> instructions) {

}
