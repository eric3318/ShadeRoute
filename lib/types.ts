export type Route = {
  edgeDetails: Array<{
    points: number[];
    shadeCoverage: number;
    distance: number;
  }>;
  path: [number, number][];
};

export type APP_STATE = 'INITIAL' | 'NAVIGATING' | 'EDITING';

export const INITIAL = 'INITIAL';
export const NAVIGATING = 'NAVIGATING';
export const EDITING = 'EDITING';

export type POINT_TYPE = 'START_POINT' | 'END_POINT';

export const START_POINT = 'START_POINT';
export const END_POINT = 'END_POINT';

export type TripPoints = {
  startPoint: [number, number] | null;
  endPoint: [number, number] | null;
};
