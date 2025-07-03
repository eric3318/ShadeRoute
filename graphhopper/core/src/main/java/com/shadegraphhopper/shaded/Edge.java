package com.shadegraphhopper.shaded;

import java.util.List;

public record Edge(int edgeId,
                   double length,
                   List<Double[]> points) {

}
