# ShadeRoute

A route planning engine to generate shade-optimized routes anywhere all year round.

## Introduction

Finding the shortest route between two locations is a well-researched problem. We address a variation thereof, the ''shade-optimizing routing problem'', which allows one to set a preference for routes with more or less shade. This kind of problem is of interest, for instance, for runners and bikers, who may prefer shadier routes during summer heat or around noon time, and sunnier ones in late fall or early morning. As our main contribution, we present ShadeRoute, a open-sourced cloud-based app that leverage open datasets and APIs in order to provide routes that fit the user's priorities regarding shade (or not) at a given route and particular time.

## Features
- Multiple mobility modes
- Worldwide Route generate
- Turn-by-turn Navigation
- Route saving and management

## Get started
The app is deployed and live [here](https://shaderoute.me). The fastest way to run it locally is using Docker.

### Prerequisites
- ```Docker```

Environment variables:
- ```MAPBOX_ACCESS_TOKEN``` ([Get your access token](https://console.mapbox.com))
- ```SHADEMAP_API_KEY``` ([Get your API key](https://shademap.app/about/#))

1. Edit .env in root directory to provide the environment variables above
2. Download [map.osm.pbf](https://some-firebase-link) and put inside ```/routing-server/src/main/java/resources/static```
3. Build the docker image for router in ```/routing-server```      
   ```./mvnw clean compile jib:dockerBuild```
4. Run docker compose in root directory    
```docker compose up```

### Add more cities
The [pbf file](https://some-firebase-link) contains OpenStreetMap data for select cities.   
To create your own dataset, use [Osmium Tool](https://osmcode.org/osmium-tool/) to extract and merge OSM data.   
OSM extracts are available at [GEOFABIRK](https://download.geofabrik.de/). City polygon GeoJSON data is available at [MapTiler](https://www.maptiler.com/showcase/geocoding/).

## Architecture

The overall architecture is shown in the diagram:

Tech stack:
- Frontend: React, React Native (Expo), Mantine, React Native Paper
- Backend: Node.js, Spring Boot
- Database: Cloud Firestore, Redis
- Tools and Libraries: GraphHopper, Mapbox GL Shadow Simulator (ShadeMap),  
  BullMQ, Mapbox GL JS, MapLibre
- Deployment: Kubernetes, Jenkins

### Data Preparation
ShadeMap's mapbox-gl-shadow-simulator package is used as the source of truth for shadows.   
However, it is not trivial to just utilize the shadow the simulator renders on the map,  
because a mapping between the shadow and graph edges is needed to calculate the percentage  
shade coverage, therefore determining how much an edge is favorable in path-finding.

A two-step process is involved as shown in the diagram:

### Route Generation
Once data is ready, the routing service gets notified and starts performing the actual routing.  
During path-finding, edge weights are dynamically calculated based on the length and percentage shade coverage,  
as well as priority and speed determined by GraphHopper.

## Deployment
Feel free to deploy the application on any platform of your choice. However, shade simulation relies heavily on graphics processing  
and therefore requires an GPU on the host machine to work correctly.

## License
This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.