import { getRandomColor } from "./coloring.js";
export function DBSCAN(dataPoints, eps = 60, MinPts = 4) {
    let clusters = [];
    let visited = new Set();

    function regionQuery(currentPoint, eps) {
        const neighbors = [];
        for (const neighborPoint of dataPoints) {
            if (distance(currentPoint, neighborPoint) <= eps) {
                neighbors.push(neighborPoint);
            }
        }
        return neighbors;
    }

    function distance(currentPoint, neighborPoint) {
        return Math.sqrt(Math.pow(currentPoint.x - neighborPoint.x, 2) + Math.pow(currentPoint.y - neighborPoint.y, 2));
    }

    function expandCluster(currentPoint, NeighborPts, C) {
        clusters[C] = clusters[C] || [];
        clusters[C].push(currentPoint);
        for (let neighborPoint of NeighborPts) {
            if (!visited.has(neighborPoint)) {
                visited.add(neighborPoint);
                let QNeighborPts = regionQuery(neighborPoint, eps);
                if (QNeighborPts.length >= MinPts) {
                    NeighborPts.push(...QNeighborPts);
                }
            }
            if (!clusters.some(cluster => cluster.includes(neighborPoint))) {
                clusters[C].push(neighborPoint);
            }
        }
    }

    for (let currentPoint of dataPoints) {
        if (visited.has(currentPoint)) continue;
        visited.add(currentPoint);
        let NeighborPts = regionQuery(currentPoint, eps);
        if (NeighborPts.length < MinPts) {
            currentPoint.type = 'NOISE';
        } else {
            let C = clusters.length;
            expandCluster(currentPoint, NeighborPts, C);
        }
    }

    return clusters;
}

export function colorDBSCANPoints(clusters, flag, pointsOfDBSCAN, kMeansIndexes, pointsOfK, usedColors) {
    let visited = new Set();
    clusters.forEach(function(cluster) {
        const randomColor = getRandomColor(usedColors);
        cluster.forEach(function(point) {
            const pointIndex = pointsOfDBSCAN.indexOf(point);
            if (pointIndex !== -1) {
                const canvas = kCanvas;
                const ctx = canvas.getContext("2d");
                if (flag === "all"){
                    ctx.strokeStyle = randomColor;
                    ctx.lineWidth = 10;
                    ctx.beginPath();
                    ctx.arc(point.x, point.y, canvas.width / 40, 0, Math.PI * 2);
                    ctx.closePath();
                    ctx.stroke();
                }
                else {
                    ctx.fillStyle = randomColor;
                    ctx.beginPath();
                    ctx.arc(point.x, point.y, canvas.width / 30, 0, Math.PI * 2);
                    ctx.closePath();
                    ctx.fill();
                }
                visited.add(pointIndex);
            }

        });
    });

    kMeansIndexes.forEach(function(pointIndex) {
        const point = pointsOfK[pointIndex];

        if (!visited.has(pointIndex)) {

            const canvas = kCanvas;
            const ctx = canvas.getContext("2d");
            if (flag === "all") {
                ctx.fillStyle = "white";
                ctx.beginPath();
                ctx.arc(point.x, point.y, canvas.width / 30, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }
            else {
                ctx.fillStyle = "white";
                ctx.beginPath();
                ctx.arc(point.x, point.y, canvas.width / 30, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }
        }
    });
}