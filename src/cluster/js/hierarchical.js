import { getRandomColor } from "./coloring.js";

export function hierarchicalClustering(pointsOfIerarch, centroidCountInput) {
    const clusters = [];
    let currentClusters = pointsOfIerarch.map(point => new Set([point]));

    while (currentClusters.length > centroidCountInput.value) {
        let minDistance = Infinity;
        let bestPair = {};
        for (let i = 0; i < currentClusters.length; i++) {
            for (let j = i + 1; j < currentClusters.length; j++) {
                const distance = calculateClusterDistance(currentClusters[i], currentClusters[j]);
                if (distance < minDistance) {
                    minDistance = distance;
                    bestPair = { cluster1: currentClusters[i], cluster2: currentClusters[j] };
                }
            }
        }
        const newCluster = new Set([...bestPair.cluster1, ...bestPair.cluster2]);
        currentClusters = currentClusters.filter(cluster => cluster !== bestPair.cluster1 && cluster !== bestPair.cluster2);
        currentClusters.push(newCluster);
    }
    clusters.push(...currentClusters);
    return clusters;
}

function calculateClusterDistance(cluster1, cluster2) {
    let minDistance = Infinity;
    for (const obj1 of cluster1) {
        for (const obj2 of cluster2) {
            const distance = calculateDistance(obj1, obj2);
            if (distance < minDistance) {
                minDistance = distance;
            }
        }
    }
    return minDistance;
}

function calculateDistance(point, centroid) {
    const dx = point.x - centroid.x;
    const dy = point.y - centroid.y;
    return Math.sqrt(dx * dx + dy * dy);
}

export function colorHierarchicalClusters(clusters, flag, usedColors, pointsOfIerarch) {
    clusters.forEach(function(set) {
        const randomColor = getRandomColor(usedColors);
        set.forEach(function(point) {
            const pointIndex = pointsOfIerarch.indexOf(point);
            if (pointIndex !== -1) {
                const canvas = document.getElementById('kCanvas');
                const ctx = canvas.getContext("2d");
                if (flag === "all") {
                    ctx.fillStyle = randomColor;
                    ctx.beginPath();
                    ctx.arc(point.x, point.y, canvas.width / 40, 0, Math.PI * 2);
                    ctx.closePath();
                    ctx.fill();
                } else {
                    ctx.fillStyle = randomColor;
                    ctx.beginPath();
                    ctx.arc(point.x, point.y, canvas.width / 30, 0, Math.PI * 2);
                    ctx.closePath();
                    ctx.fill();
                }
            }
        });
    });
}