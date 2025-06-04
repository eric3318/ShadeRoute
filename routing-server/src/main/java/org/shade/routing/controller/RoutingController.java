package org.shade.routing.controller;


import lombok.RequiredArgsConstructor;
import org.shade.routing.dto.RouteRequestDto;
import org.shade.routing.dto.RouteResponse;
import org.shade.routing.service.RoutingService;
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

  @PostMapping("/route")
  public ResponseEntity<?> route(@RequestBody RouteRequestDto routeRequestDto) {
    return ResponseEntity.ok(routingService.init(routeRequestDto));
  }

  @PostMapping("/cb")
  public ResponseEntity<?> callback(@RequestParam String jobId) {
    routingService.callback(jobId);
    return ResponseEntity.ok().build();
  }

  @GetMapping("/results")
  public ResponseEntity<?> getRoutingResult(@RequestParam String jobId) {
    RouteResponse result = routingService.getResult(jobId);
    return result != null ? ResponseEntity.ok(result) : ResponseEntity.noContent().build();
  }
}
