import { Mode } from './constants';

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
  country: string;
};

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
