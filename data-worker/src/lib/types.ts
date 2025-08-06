export type BoxLimits = {
    minLon: number;
    maxLon: number;
    minLat: number;
    maxLat: number;
};

export type Edge = {
    edgeId: number;
    length: number;
    points: number[];
};

export type JobData = {
    jobId: string;
    index: number;
    timestamp: number;
};

export type Input = {
    data: Data;
    timestamp: number;
};

export type Data = {
    limits: BoxLimits;
    cells: {
        edges: Edge[];
        limits: BoxLimits;
    }[];
}[];

export type Output = {
    [index: string]: number[];
};
