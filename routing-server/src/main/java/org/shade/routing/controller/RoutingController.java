package org.shade.routing.controller;


import lombok.RequiredArgsConstructor;
import org.shade.routing.config.Modes;
import org.shade.routing.dto.RouteRequest;
import org.shade.routing.service.RoutingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class RoutingController {

  private final RoutingService routingService;

  @GetMapping("/edges")
  public ResponseEntity<?> getEdges(@RequestParam double fromLat, @RequestParam double fromLon,
      @RequestParam double toLat, @RequestParam double toLon) {
    return new ResponseEntity<>(routingService.getEdges(fromLat, fromLon, toLat, toLon),
        HttpStatus.OK);
  }

  @PostMapping("/route")
  public ResponseEntity<?> route(@RequestBody RouteRequest routeRequest) {
    if (!routeRequest.mode().equals(Modes.WALKING) && !routeRequest.mode().equals(Modes.RUNNING)
        && !routeRequest.mode().equals(Modes.BIKING)) {
      return new ResponseEntity<>("Invalid mode", HttpStatus.BAD_REQUEST);
    }
    return new ResponseEntity<>(routingService.getRoute(routeRequest), HttpStatus.OK);
  }

//  @PostMapping("/route-dynamic")
//  public ResponseEntity<?> route_dynamic(@RequestBody RouteRequest routeRequest) {
//    return new ResponseEntity<>(routingService.getRouteDynamic(routeRequest), HttpStatus.OK);
//  }
}
