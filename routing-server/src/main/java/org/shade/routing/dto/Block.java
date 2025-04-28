package org.shade.routing.dto;

import com.graphhopper.shaded.Edge;
import java.util.List;


public record Block(Limits limits, List<Cell> cells) {

}