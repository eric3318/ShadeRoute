package org.shade.routing.dto;

public record RouteRequestDto(
    double fromLat,
    double fromLon,
    double toLat,
    double toLon,
    int timeStamp,
    double parameter,
    String mode
) {

}
