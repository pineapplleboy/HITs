import { startKMeans } from "./kMeans.js";

document.addEventListener("DOMContentLoaded", function() {
    const kMeansButton = document.getElementById("kMeansButton");
    const DBSCANButton = document.getElementById("DBSCANButton");
    const hierarchicalButton = document.getElementById("hierarchicalButton");
    const kMeansIndexes = [];
    let flag;
    const kCanvas = document.getElementById("kCanvas");
    const usedColors = new Set();
    const pointsOfK = [];
    const pointsOfDBSCAN = [];
    const pointsOfIerarch = [];
    const clearButton = document.getElementById("clearButton");
    const startButton = document.getElementById("startButton");
    const centroidCountInput = document.getElementById("centroidCount");
    const centroidCountDisplay = document.createElement("span");
    centroidCountDisplay.textContent = centroidCountInput.value;
    //document.body.insertBefore(centroidCountDisplay, kCanvas);

    kCanvas.addEventListener("click", function(event) {
        const rect = kCanvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) * 500 / rect.width;
        const y = (event.clientY - rect.top) * 500 / rect.height;
        let index = kMeansIndexes.length;
        createPoint(x, y);
        pointsOfK.push({x, y});
        kMeansIndexes.push(index);
        pointsOfDBSCAN.push({x, y});
        pointsOfIerarch.push({x, y});
    });

    kMeansButton.addEventListener("click", function() {
        flag = "kMeans"
        startKMeans(flag, kMeansIndexes, centroidCountInput, pointsOfK, kCanvas, usedColors);
        usedColors.clear();
    });

    DBSCANButton.addEventListener("click", function() {
        flag = "DBSCAN";
        startDBSCAN(flag);
        usedColors.clear();
    });

    hierarchicalButton.addEventListener("click", function() {
        flag = "hierarch";
        startHierarch(flag);
        usedColors.clear();
    });

    centroidCountInput.addEventListener("input", function() {
        centroidCountDisplay.textContent = centroidCountInput.value;
    });

    startButton.addEventListener("click", function() {
        flag = "all";
        startDBSCAN(flag);
        startHierarch(flag);
        usedColors.clear();
        startKMeans(flag, kMeansIndexes, centroidCountInput, pointsOfK, kCanvas, usedColors);
        usedColors.clear();
    });
    
    function startDBSCAN(flag) {
        const DBSCANclusters = DBSCAN(pointsOfDBSCAN);
        colorDBSCANPoints(DBSCANclusters, flag);
    }
    function startHierarch(flag){
        const HierClusters = hierarchicalClustering(pointsOfIerarch);
        colorHierarchicalClusters(HierClusters, flag);
    }


    function colorDBSCANPoints(clusters, flag) {
        let visited = new Set();
        clusters.forEach(function(cluster) {
            const randomColor = getRandomColor();
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


    function getRandomColor() {
        let color;
        const maxAttempts = 20;
        let attempts = 0;

        do {
            color = `rgb(${getRandomRGBValue()}, ${getRandomRGBValue()}, ${getRandomRGBValue()})`;
            attempts++;
        } while (usedColors.has(color) || isColorTooClose(color) || attempts < maxAttempts);

        usedColors.add(color);
        return color;
    }

    function isColorTooClose(newColor) {
        const threshold = 50;
        for (const usedColor of usedColors) {
            if (calculateColorDistance(newColor, usedColor) < threshold) {
                return true;
            }
        }
        return false;
    }

    function calculateColorDistance(color1, color2) {
        const [r1, g1, b1] = color1.match(/\d+/g).map(Number);
        const [r2, g2, b2] = color2.match(/\d+/g).map(Number);
        return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
    }

    function getRandomRGBValue() {
        return Math.floor(Math.random() * 254);
    }

    const ctx = kCanvas.getContext("2d");
    function createPoint(x, y) {
        const pointRadius = 15;
        ctx.beginPath();
        ctx.arc(x, y, pointRadius, 0, Math.PI * 2);
        ctx.fillStyle = "black";
        ctx.fill();
        ctx.closePath();
    }

    clearButton.addEventListener("click", function() {
        clearCanvas();
        clearClusters();
        pointsOfK.length = 0;
        pointsOfDBSCAN.length = 0;
        pointsOfIerarch.length = 0;
        kMeansIndexes.length = 0;
    });

    function clearCanvas() {
        while (kCanvas.firstChild) {
            kCanvas.removeChild(kCanvas.firstChild);
        }
    }
    function clearClusters() {
        const ctx = kCanvas.getContext("2d");
        ctx.clearRect(0, 0, kCanvas.width, kCanvas.height);
    }

    function calculateDistance(point, centroid) {
        const dx = point.x - centroid.x;
        const dy = point.y - centroid.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function hierarchicalClustering(pointsOfIerarch) {
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

            // Объединяем найденную пару кластеров
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
    function colorHierarchicalClusters(clusters, flag) {
        clusters.forEach(function(set) {
            const randomColor = getRandomColor();
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

    function DBSCAN(dataPoints, eps = 60, MinPts = 4) {
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
});