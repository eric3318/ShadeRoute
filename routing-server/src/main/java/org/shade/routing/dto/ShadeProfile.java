package org.shade.routing.dto;

import java.util.List;

public record ShadeProfile(List<List<Integer>> shadeSamples, List<Double> segmentLengths) {
}
