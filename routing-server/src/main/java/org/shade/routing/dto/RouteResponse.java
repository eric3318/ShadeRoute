package org.shade.routing.dto;

import java.util.List;

public record RouteResponse(List<Double[]> path, List<EdgeDetail> details, double weight,
                            double distance, double weightedAverageCoverage, List<InstructionDetail> instructions) {
}
