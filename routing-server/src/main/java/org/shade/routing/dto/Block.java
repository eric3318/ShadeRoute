package org.shade.routing.dto;

import java.util.List;


public record Block(Limits limits, List<Cell> cells) {

}