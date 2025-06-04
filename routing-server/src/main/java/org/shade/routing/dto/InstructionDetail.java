package org.shade.routing.dto;


public record InstructionDetail(String name, String turnDescription, long time, double distance,
                                int[] interval) {

}
