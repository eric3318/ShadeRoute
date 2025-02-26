package org.shade.routing.service;


import com.graphhopper.GHRequest;
import com.graphhopper.GHResponse;
import com.graphhopper.GraphHopper;
import com.graphhopper.ResponsePath;
import com.graphhopper.shaded.Edge;
import com.graphhopper.shaded.EdgeCache;
import com.graphhopper.shaded.ShadedGraphHopper;
import com.graphhopper.shaded.utils.GraphUtil;
import com.graphhopper.storage.Graph;
import com.graphhopper.storage.index.LocationIndex;
import com.graphhopper.storage.index.LocationIndex.Visitor;
import com.graphhopper.util.DistanceCalc;
import com.graphhopper.util.DistanceCalcEarth;
import com.graphhopper.util.EdgeIteratorState;
import com.graphhopper.util.FetchMode;
import com.graphhopper.util.Instruction;
import com.graphhopper.util.InstructionList;
import com.graphhopper.util.Parameters;
import com.graphhopper.util.Parameters.Algorithms;
import com.graphhopper.util.Parameters.Details;
import com.graphhopper.util.PointList;
import com.graphhopper.util.Translation;
import com.graphhopper.util.details.PathDetail;
import com.graphhopper.util.shapes.BBox;
import com.graphhopper.util.shapes.GHPoint;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Envelope;
import org.shade.routing.config.Profiles;
import org.shade.routing.dto.Block;
import org.shade.routing.dto.Cell;
import org.shade.routing.dto.Limits;
import org.shade.routing.dto.EdgeDetail;
import org.shade.routing.dto.InstructionDetail;
import org.shade.routing.dto.RouteRequest;
import org.shade.routing.dto.RouteResponse;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RoutingService {

  private final GraphHopper hopper;

  public RouteResponse getRoute(RouteRequest routeRequest) {
    ShadedGraphHopper shadedGraphHopper = (ShadedGraphHopper) hopper;

    shadedGraphHopper.attachShadeData(routeRequest.shadeData());
    shadedGraphHopper.setShadePref(routeRequest.shadePref());
    EdgeCache edgeCache = shadedGraphHopper.getEdgeCache();

    GHRequest ghRequest = buildGHRequest(routeRequest.fromLat(), routeRequest.fromLon(),
        routeRequest.toLat(), routeRequest.toLon(), Profiles.getProfileName(routeRequest.mode()),
        Algorithms.ASTAR);

    ghRequest.setPathDetails(Arrays.asList(Parameters.Details.EDGE_ID, Details.DISTANCE));

    GHResponse ghResponse = hopper.route(ghRequest);

    if (ghResponse.hasErrors()) {
      throw new RuntimeException(ghResponse.getErrors().toString());
    }

    ResponsePath bestPath = ghResponse.getBest();

    List<PathDetail> edgeIdDetails = bestPath.getPathDetails().get(Parameters.Details.EDGE_ID);
    List<PathDetail> distanceDetails = bestPath.getPathDetails().get(Details.DISTANCE);
    PointList pointList = bestPath.getPoints();

    List<EdgeDetail> edgeDetails = new ArrayList<>();

    for (int i = 0; i < edgeIdDetails.size(); i++) {
      Integer edgeId = (Integer) edgeIdDetails.get(i).getValue();
      double distance = (double) distanceDetails.get(i).getValue();
      double shadeCoverage = shadedGraphHopper.getEdgeShade(edgeId);
      edgeDetails.add(
          new EdgeDetail(edgeId, edgeCache.get(edgeId).points(), shadeCoverage, distance));
    }

    List<Double[]> pathPoints = new ArrayList<>();
    pointList.forEach(p -> pathPoints.add(p.toGeoJson()));

    List<InstructionDetail> instructions = new ArrayList<>();
    InstructionList instructionList = bestPath.getInstructions();
    Translation tr = hopper.getTranslationMap().getWithFallBack(Locale.CANADA);
    for (Instruction instruction : instructionList) {
      PointList p = instruction.getPoints();
      List<double[]> coords = new ArrayList<>();
      for (int i = 0; i < p.size(); i++) {
        double[] point = new double[2];
        point[0] = p.getLon(i);
        point[1] = p.getLat(i);
        coords.add(point);
      }
      InstructionDetail i = new InstructionDetail(instruction.getName(),
          instruction.getTurnDescription(tr),
          instruction.getTime(), instruction.getDistance(), coords
      );
      instructions.add(i);
    }

    RouteResponse response = new RouteResponse(pathPoints, edgeDetails, bestPath.getRouteWeight(),
        bestPath.getDistance(), instructions);

    shadedGraphHopper.clearShadeData();
    return response;
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

  public List<Block> getEdges(double fromLat, double fromLon, double toLat, double toLon) {
    GHRequest prelimRequest = buildGHRequest(fromLat, fromLon, toLat, toLon,
        "preliminary",
        Algorithms.ASTAR);
    ResponsePath prelimPath = doPreliminaryPathfinding(prelimRequest);
    Envelope prelimBBox = prelimPath.calcBBox2D();

    double minLat, maxLat, minLon, maxLon;
    minLon = prelimBBox.getMinX();
    maxLon = prelimBBox.getMaxX();
    minLat = prelimBBox.getMinY();
    maxLat = prelimBBox.getMaxY();

    LocationIndex locationIndex = hopper.getLocationIndex();
    // enlarge the bounding box by 0.5x
    double[] bounds = GraphUtil.getBBox(minLon, maxLon, minLat, maxLat, 0.5);
    List<BBox> blocks = GraphUtil.getBBoxCells(bounds[0], bounds[1], bounds[2],
        bounds[3], 1600, 900);
    Graph graph = hopper.getBaseGraph();
    EdgeCache edgeCache = ((ShadedGraphHopper) hopper).getEdgeCache();
    Set<Integer> edgeSet = new HashSet<>();
    List<Edge> cellEdges = new ArrayList<>();
//    DistanceCalc calc = new DistanceCalcEarth();

    Visitor v = i -> {
      EdgeIteratorState edgeState = graph.getEdgeIteratorState(i, Integer.MIN_VALUE);
      int edgeId = edgeState.getEdge();

      if (edgeSet.contains(edgeId)) {
        return;
      }

      PointList geometry = edgeState.fetchWayGeometry(FetchMode.ALL);
      List<Double> points = new ArrayList<>();
//      List<Double> segmentLengths = new ArrayList<>();

      for (int idx = 0; idx < geometry.size(); idx++) {
        GHPoint ghPoint = geometry.get(idx);
        points.add(ghPoint.getLon());
        points.add(ghPoint.getLat());
//        if (idx > 0) {
//          GHPoint prevPoint = geometry.get(idx - 1);
//          double segmentLength = calc.calcDist(
//              prevPoint.getLat(), prevPoint.getLon(),
//              ghPoint.getLat(), ghPoint.getLon()
//          );
//          segmentLengths.add(segmentLength);
//        }
      }

      Edge edge = new Edge(edgeId, edgeState.getDistance(), points);
      edgeSet.add(edgeId);
      edgeCache.put(edgeId, edge);
      cellEdges.add(edge);
    };

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
    return result;
  }

}
