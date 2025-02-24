// export type Point = {
//     lng: number;
//     lat: number;
// };

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

export type Input = {
    timeStamp: number;
    data: {
        limits: BoxLimits;
        cells: {
            edges: Edge[];
            limits: BoxLimits;
        }[];
    }[];
};

export type Output = {};
