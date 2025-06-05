export type Route = {
  path: [number, number][];
  details: {
    points: [number, number][];
    coverage: number;
    distance: number;
  }[];
  distance: number;
  weight: number;
  weightedAverageCoverage: number;
  instructions: Instruction[];
};

export type Instruction = {
  name: string;
  turnDescription: string;
  distance: number;
  time: number;
  interval: [number, number];
};

export type City = {
  name: string;
  coordinates: [number, number];
};
