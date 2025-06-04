package org.shade.routing.dto;

import java.util.List;

public record EdgeDetail(double distance, double coverage, List<Double[]> points) {

}
