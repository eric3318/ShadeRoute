export type Route = {
  path: [number, number][];
  details: {
    points: [number, number][];
    coverage: number;
    distance: number;
  }[];
  distance: number;
  weightedAverageCoverage: number;
  instructions: Instruction[];
};

export type RouteToResume = Route & {
  start: [number, number];
  end: [number, number];
};

export const Mode = {
  RUNNING: 'running',
  WALKING: 'walking',
  BIKING: 'biking',
} as const;

export type Mode = (typeof Mode)[keyof typeof Mode];

export type SavedRoute = {
  name: string;
  start: [number, number];
  end: [number, number];
  path: { longitude: number; latitude: number }[];
  details: {
    points: { longitude: number; latitude: number }[];
    coverage: number;
    distance: number;
  }[];
  instructions: Instruction[];
  city: City;
  mode: Mode;
  parameter: number;
  timeStamp: number;
  distance: number;
  weightedAverageCoverage: number;
  createdAt: string;
};

export type Instruction = {
  name: string;
  turnDescription: string;
  distance: number;
  time: number;
  interval: [number, number];
};

export type City = { name: string; coordinates: [number, number] };

export enum APP_STATE {
  INITIAL = 'INITIAL',
  EDITING = 'EDITING',
  NAVIGATING = 'NAVIGATING',
  RESUMING = 'RESUMING',
}

export type POINT_TYPE = 'START_POINT' | 'END_POINT';

export const START_POINT = 'START_POINT';
export const END_POINT = 'END_POINT';

export type TripPoints = {
  startPoint: [number, number] | null;
  endPoint: [number, number] | null;
};

export type InitRoutingParams = {
  fromLat: number;
  fromLon: number;
  toLat: number;
  toLon: number;
  mode: Mode;
  timeStamp: number;
  parameter: number;
};

export type InitRoutingResponse = {
  jobId: string;
};
