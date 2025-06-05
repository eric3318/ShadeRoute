export const Mode = {
  RUNNING: 'running',
  WALKING: 'walking',
  BIKING: 'biking',
} as const;

export type Mode = (typeof Mode)[keyof typeof Mode];
