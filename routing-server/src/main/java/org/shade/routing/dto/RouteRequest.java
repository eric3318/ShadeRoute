package org.shade.routing.dto;

import java.util.List;
import java.util.Map;
import org.shade.routing.config.Modes;

public record RouteRequest(String requestId,
                           double parameter,
                           String mode,
                           Map<Integer, List<Integer>> data
) {

}

