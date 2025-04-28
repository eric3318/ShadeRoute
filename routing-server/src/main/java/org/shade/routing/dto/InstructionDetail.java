package org.shade.routing.dto;

import java.util.List;

public record InstructionDetail(String name, String turnDescription, long time, double distance,
                                List<double[]> points) {

}
