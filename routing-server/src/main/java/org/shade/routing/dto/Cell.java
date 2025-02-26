package org.shade.routing.dto;

import com.graphhopper.shaded.Edge;
import java.util.List;

public record Cell(List<Edge> edges, Limits limits) {

}
