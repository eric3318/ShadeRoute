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

export type RouteSettings = {
  date: string;
  time: string;
  shade: number;
};

export type SavedRoute = {
  name: string;
  userId: string;
  start: [number, number];
  end: [number, number];
  path: { longitude: number; latitude: number }[];
  details: {
    points: [number, number][];
    coverage: number;
    distance: number;
  }[];
  city: string;
  mode: Mode;
  settings: RouteSettings;
  tripTime: string;
  distance: number;
  weightedAverageCoverage: number;
  createdAt: string;
};
