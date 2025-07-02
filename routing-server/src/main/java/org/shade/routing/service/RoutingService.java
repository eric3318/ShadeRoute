package org.shade.routing.service;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.graphhopper.GHRequest;
import com.graphhopper.GHResponse;
import com.graphhopper.GraphHopper;
import com.graphhopper.ResponsePath;
import com.graphhopper.shaded.Edge;
import com.graphhopper.shaded.JobMetadata;
import com.graphhopper.shaded.utils.GraphUtil;
import com.graphhopper.shaded.utils.RequestContext;
import com.graphhopper.storage.Graph;
import com.graphhopper.storage.index.LocationIndex;
import com.graphhopper.storage.index.LocationIndex.Visitor;
import com.graphhopper.util.EdgeIteratorState;
import com.graphhopper.util.FetchMode;
import com.graphhopper.util.Instruction;
import com.graphhopper.util.InstructionList;
import com.graphhopper.util.Parameters.Algorithms;
import com.graphhopper.util.Parameters.Details;
import com.graphhopper.util.PointList;
import com.graphhopper.util.Translation;
import com.graphhopper.util.details.PathDetail;
import com.graphhopper.util.shapes.BBox;
import com.graphhopper.util.shapes.GHPoint;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.locationtech.jts.geom.Envelope;
import org.shade.routing.config.Profiles;
import org.shade.routing.dto.Block;
import org.shade.routing.dto.Cell;
import org.shade.routing.dto.EdgeDetail;
import org.shade.routing.dto.InstructionDetail;
import org.shade.routing.dto.Limits;
import org.shade.routing.dto.RouteRequestDto;
import org.shade.routing.dto.RouteResponse;
import org.shade.routing.dto.ScrapeRequestDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class RoutingService {

  private final GraphHopper hopper;
  private static final int PARTITION_SIZE = 4;
  private final RedisTemplate<String, Object> redisTemplate;
  private final RestTemplate restTemplate;
  private final ObjectMapper objectMapper;
  private final Map<String, RouteResponse> pendingResults = new HashMap<>();

  @Value("${data-service-url}")
  private String dataServiceUrl;

  public RouteResponse getRoute(String jobId) {
      JobMetadata metadata = retrieveJobMetadata(jobId);
      Map<Integer, Double> shadeData = retrieveJobShadeData(jobId);
      Map<Integer, Edge> edgeMap = retrieveJobEdgeMap(jobId);

      RequestContext.setMetadata(metadata);

      GHRequest ghRequest = buildGHRequest(
          metadata.getFromLat(),
          metadata.getFromLon(),
          metadata.getToLat(),
          metadata.getToLon(),
          Profiles.getProfileName(metadata.getMode()),
          Algorithms.ASTAR
      );

      ghRequest.setPathDetails(
          Arrays.asList(Details.EDGE_ID, Details.DISTANCE));

      GHResponse ghResponse = hopper.route(ghRequest);

      if (ghResponse.hasErrors()) {
        throw new RuntimeException(ghResponse.getErrors().toString());
      }

      ResponsePath bestPath = ghResponse.getBest();

      List<PathDetail> edgeIdDetails = bestPath.getPathDetails().get(Details.EDGE_ID);
      List<PathDetail> distanceDetails = bestPath.getPathDetails().get(Details.DISTANCE);
      PointList pointList = bestPath.getPoints();

      List<EdgeDetail> edgeDetails = new ArrayList<>();

      double totalWeightedCoverage = 0;

      for (int i = 0; i < edgeIdDetails.size(); i++) {
        Integer edgeId = (Integer) edgeIdDetails.get(i).getValue();
        double distance = (double) distanceDetails.get(i).getValue();
        double coverage = shadeData.get(edgeId);

        edgeDetails.add(
            new EdgeDetail(distance, coverage, edgeMap.get(edgeId).points()));

        totalWeightedCoverage += distance * coverage;
      }

      double totalDistance = bestPath.getDistance();
      double weightedAverageCoverage =
          totalDistance == 0 ? 0 : totalWeightedCoverage / totalDistance;

      List<Double[]> pathPoints = new ArrayList<>();
      pointList.forEach(p -> pathPoints.add(p.toGeoJson()));

      List<InstructionDetail> instructions = new ArrayList<>();
      InstructionList instructionList = bestPath.getInstructions();
      Translation tr = hopper.getTranslationMap().getWithFallBack(Locale.CANADA);
      int idx = 0;
      for (Instruction instruction : instructionList) {
        int tempIdx = idx + instruction.getLength();
        int[] interval = new int[]{idx, tempIdx};
        InstructionDetail i = new InstructionDetail(instruction.getName(),
            instruction.getTurnDescription(tr),
            instruction.getTime(), instruction.getDistance(), interval);
        instructions.add(i);
        idx = tempIdx;
      }

      return new RouteResponse(pathPoints, edgeDetails, bestPath.getRouteWeight(),
          bestPath.getDistance(), weightedAverageCoverage, instructions);

  }

  private JobMetadata retrieveJobMetadata(String jobId) {
    Object value = redisTemplate.opsForValue().get("job:" + jobId + ":metadata");

    if (!(value instanceof Map)) {
      throw new RuntimeException();
    }

    return objectMapper.convertValue(value, JobMetadata.class);
  }

  private Map<Integer, Double> retrieveJobShadeData(String jobId) {
    String key = "job:" + jobId + ":result";
    Map<Object, Object> data = redisTemplate.opsForHash().entries(key);
    return data.entrySet().stream()
        .collect(Collectors.toMap(e -> Integer.parseInt(e.getKey().toString()),
            e -> Double.parseDouble(e.getValue().toString())));
  }

  private ResponsePath doPreliminaryPathfinding(GHRequest ghRequest) {
    GHResponse ghResponse = hopper.route(ghRequest);
    return ghResponse.getBest();
  }

  private GHRequest buildGHRequest(double fromLat, double fromLon, double toLat, double toLon,
      String profileName, String algorithm) {
    GHRequest ghRequest = new GHRequest(fromLat, fromLon, toLat, toLon);
    ghRequest.setProfile(profileName);
    ghRequest.setAlgorithm(algorithm);
    return ghRequest;
  }

  public List<Block> getEdges(String jobId, double fromLat, double fromLon, double toLat,
      double toLon) {
    GHRequest prelimRequest = buildGHRequest(fromLat, fromLon, toLat, toLon,
        "preliminary",
        Algorithms.ASTAR);
    ResponsePath prelimPath = doPreliminaryPathfinding(prelimRequest);
    Envelope prelimBBox = prelimPath.calcBBox2D();

    double minLon = prelimBBox.getMinX();
    double maxLon = prelimBBox.getMaxX();
    double minLat = prelimBBox.getMinY();
    double maxLat = prelimBBox.getMaxY();

    double[] bounds = GraphUtil.getBBox(minLon, maxLon, minLat, maxLat, 0.5);
    List<BBox> blocks = GraphUtil.getBBoxCells(bounds[0], bounds[1], bounds[2],
        bounds[3], 1600, 900);

    List<Edge> cellEdges = new ArrayList<>();
    Map<Integer, Edge> edgeMap = new HashMap<>();

    LocationIndex locationIndex = hopper.getLocationIndex();
    Graph graph = hopper.getBaseGraph();
    Visitor v = getVisitor(graph, cellEdges, edgeMap);

    List<Block> result = new ArrayList<>();

    for (BBox bBox : blocks) {
      List<BBox> bBoxList = GraphUtil.getBBoxCells(bBox.minLon, bBox.maxLon, bBox.minLat,
          bBox.maxLat, 300, 300);
      Limits limits = new Limits(bBox.minLon, bBox.maxLon, bBox.minLat, bBox.maxLat);

      List<Cell> cells = new ArrayList<>();
      for (BBox box : bBoxList) {
        locationIndex.query(box, v);
        Limits celllimits = new Limits(box.minLon, box.maxLon, box.minLat, box.maxLat);
        Cell currCell = new Cell(List.copyOf(cellEdges), celllimits);
        cells.add(currCell);
        cellEdges.clear();
      }

      Block block = new Block(limits, cells);
      result.add(block);
    }

    CompletableFuture.runAsync(() -> {
      storeJobEdgeMap(jobId, edgeMap);
    }).exceptionally(ex -> {
      ex.printStackTrace();
      return null;
    });

    return result;
  }

  @NotNull
  private static Visitor getVisitor(Graph graph, List<Edge> cellEdges, Map<Integer, Edge> edgeMap) {
    Visitor v = i -> {
      EdgeIteratorState edgeState = graph.getEdgeIteratorState(i, Integer.MIN_VALUE);
      int edgeId = edgeState.getEdge();

      PointList geometry = edgeState.fetchWayGeometry(FetchMode.ALL);
      List<Double[]> points = new ArrayList<>();

      for (int idx = 0; idx < geometry.size(); idx++) {
        GHPoint ghPoint = geometry.get(idx);
        points.add(ghPoint.toGeoJson());
      }

      Edge edge = new Edge(edgeId, edgeState.getDistance(), points);
      edgeMap.put(edgeId, edge);
      cellEdges.add(edge);
    };

    return v;
  }

  public ScrapeRequestDto init(RouteRequestDto routeRequestDto) {
    String jobId = UUID.randomUUID().toString();

    double fromLat = routeRequestDto.fromLat();
    double fromLon = routeRequestDto.fromLon();
    double toLat = routeRequestDto.toLat();
    double toLon = routeRequestDto.toLon();
    double parameter = routeRequestDto.parameter();
    String mode = routeRequestDto.mode();

    List<Block> blocks = getEdges(jobId, fromLat, fromLon,
        toLat, toLon);

    List<List<Block>> partitions = partitionJob(blocks);

    storeJobMetaData(jobId, partitions.size(), routeRequestDto.timeStamp(),
        fromLat, fromLon, toLat,
        toLon, parameter, mode);

    storePartitionedJob(jobId, partitions);

    ScrapeRequestDto scrapeRequestDto = new ScrapeRequestDto(jobId);

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);

    HttpEntity<ScrapeRequestDto> requestEntity = new HttpEntity<>(scrapeRequestDto, headers);

    ResponseEntity<String> response = restTemplate.postForEntity(
        dataServiceUrl,
        requestEntity,
        String.class
    );

    if (!response.getStatusCode().is2xxSuccessful()) {
      throw new RuntimeException("Scrape service failed to process request");
    }
    return scrapeRequestDto;
  }

  public void callback(String jobId) {
    CompletableFuture.supplyAsync(() ->
        getRoute(jobId)
    ).thenAccept(routeResponse -> {
          System.out.println("Saved result for job " + jobId);
          pendingResults.put(jobId, routeResponse);
        }
    ).exceptionally(ex -> {
      ex.printStackTrace();
      return null;
    });
  }

  public RouteResponse getResult(String jobId) {
    return pendingResults.remove(jobId);
  }

  private List<List<Block>> partitionJob(List<Block> job) {
    List<List<Block>> partitions = new ArrayList<>();
    for (int i = 0; i < job.size(); i += PARTITION_SIZE) {
      partitions.add(job.subList(i, Math.min(i + PARTITION_SIZE, job.size())));
    }
    return partitions;
  }

  private void storeJobMetaData(String jobId, int totalPartitions, int timeStamp, double fromLat,
      double fromLon, double toLat, double toLon, double parameter, String mode) {
    JobMetadata metadata = new JobMetadata(
        jobId,
        totalPartitions,
        timeStamp,
        fromLat,
        fromLon,
        toLat,
        toLon,
        parameter,
        mode
    );

    redisTemplate.opsForValue().set("job:" + jobId + ":metadata", metadata);
  }

  private void storePartitionedJob(String jobId, List<List<Block>> partitions) {
    for (int i = 0; i < partitions.size(); i++) {
      redisTemplate.opsForValue().set("job:" + jobId + ":" + i, partitions.get(i));
    }
  }

  private void storeJobEdgeMap(String jobId, Map<Integer, Edge> edgeMap) {
    redisTemplate.opsForHash().putAll("job:" + jobId + ":edgeMap", edgeMap);
  }

  private Map<Integer, Edge> retrieveJobEdgeMap(String jobId) {
    return redisTemplate.opsForHash().entries("job:" + jobId + ":edgeMap")
        .entrySet()
        .parallelStream()
        .collect(Collectors.toMap(
            entry -> Integer.parseInt(entry.getKey().toString()),
            entry -> objectMapper.convertValue(entry.getValue(), Edge.class)
        ));
  }
}
