import { getRandomColor } from "./coloring.js";
export function startKMeans(flag, kMeansIndexes, centroidCountInput, pointsOfK, kCanvas, usedColors) {
    let centroids = kMeansPlusPlus(centroidCountInput.value, pointsOfK);
    let threshold = 0.1;
    let moved = true;

    calculateDistances(centroids, pointsOfK);

    while (moved) {
        moved = false;
        let oldCentroids = centroids.map(function(centroid) {
            return { x: centroid.x, y: centroid.y };
        });

        updateCentroids(centroids, pointsOfK);

        centroids.forEach(function(centroid, centroidIndex) {
            const oldCentroid = oldCentroids[centroidIndex];
            const dx = Math.abs(centroid.x - oldCentroid.x);
            const dy = Math.abs(centroid.y - oldCentroid.y);

            if (dx > threshold || dy > threshold) {
                moved = true;
            }
        });
    }

    calculateDistances(centroids, pointsOfK);
    colorPoints(centroids, pointsOfK, kCanvas, flag, usedColors);
}

function calculateDistances(centroids, pointsOfK) {
    pointsOfK.forEach(function(point) {
        point.distances = centroids.map(function(centroid) {
            return calculateDistance(point, centroid);
        });
        console.log(point.distances);
    });
}

function updateCentroids(centroids, pointsOfK) {
    centroids.forEach(function(centroid, centroidIndex) {
        let sumX = 0;
        let sumY = 0;
        let count = 0;

        pointsOfK.forEach(function(point) {
            if (point.distances.indexOf(Math.min(...point.distances)) === centroidIndex) {
                sumX += point.x;
                sumY += point.y;
                count++;
            }
        });

        if (count > 0) {
            centroid.x = sumX / count;
            centroid.y = sumY / count;
        }
    });
}

function kMeansPlusPlus(count, pointsOfK) {
    let centroids = [];
    const firstCentroidIndex = Math.floor(Math.random() * pointsOfK.length);
    const firstCentroid = pointsOfK[firstCentroidIndex];
    centroids.push(addRandomOffset(firstCentroid));

    while (centroids.length < count) {
        let maxDistSquared = -1;
        let nextCentroid = null;

        for (const point of pointsOfK) {
            let minDistSquared = Infinity;

            for (const centroid of centroids) {
                const distSquared = calculateDistance(point, centroid);
                minDistSquared = Math.min(minDistSquared, distSquared);
            }

            if (minDistSquared > maxDistSquared) {
                maxDistSquared = minDistSquared;
                nextCentroid = point;
            }
        }

        centroids.push(addRandomOffset(nextCentroid));
    }

    return centroids;
}

function addRandomOffset(point) {
    const offsetX = Math.random() * 10 - 5;
    const offsetY = Math.random() * 10 - 5;
    return { x: point.x + offsetX, y: point.y + offsetY };
}

function colorPoints(centroids, pointsOfK, kCanvas, flag, usedColors) {
    const ctx = kCanvas.getContext("2d");
    const clusterColors = centroids.map(_ => getRandomColor(usedColors));

    pointsOfK.forEach(function(point) {
        let minDistance = Infinity;
        let closestCentroidIndex = -1;

        point.distances.forEach(function(distance, centroidIndex) {
            if (distance < minDistance) {
                minDistance = distance;
                closestCentroidIndex = centroidIndex;

            }
        });

        if (closestCentroidIndex !== -1) {
            const closestCentroidColor = clusterColors[closestCentroidIndex];
            const canvas = kCanvas;
            const ctx = canvas.getContext("2d");
            if (flag === "all") {
                ctx.fillStyle = closestCentroidColor;
                ctx.beginPath();
                ctx.arc(point.x, point.y, canvas.width / 40, Math.PI, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.fillStyle = closestCentroidColor;
                ctx.beginPath();
                ctx.arc(point.x, point.y, canvas.width / 30, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }
        }
    });
}

function calculateDistance(point, centroid) {
    const dx = point.x - centroid.x;
    const dy = point.y - centroid.y;
    return Math.sqrt(dx * dx + dy * dy);
}