import { startKMeans } from "./kMeans.js";
import { DBSCAN } from "./DBSCAN.js";
import { colorDBSCANPoints } from "./DBSCAN.js";
import { hierarchicalClustering } from "./hierarchical.js";
import { colorHierarchicalClusters } from "./hierarchical.js";

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

    function editCentrText(){
        if (document.getElementById("centrText").value != undefined) {

            if (document.getElementById("centrText").value.length > 1 && document.getElementById("centrText").value[0] == "0") {
                document.getElementById("centrText").value = Number(document.getElementById("centrText").value[1]);
            }
    
            document.getElementById("centrText").value = Math.min(document.getElementById("centrText").value, 20);
            centroidCountInput.value = document.getElementById("centrText").value;
        }
    
        setTimeout(function() {
            document.getElementById("centrText").value = Math.max(2, document.getElementById("centrText").value);
        }, 5000)
    }

    document.querySelector("#centrText").oninput = function(){
        editCentrText();
    }

    centroidCountInput.addEventListener("input", function() {
        document.getElementById("centrText").value = centroidCountInput.value;
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
        colorDBSCANPoints(DBSCANclusters, flag, pointsOfDBSCAN, kMeansIndexes, pointsOfK, usedColors);
    }

    function startHierarch(flag){
        const HierClusters = hierarchicalClustering(pointsOfIerarch, centroidCountInput);
        colorHierarchicalClusters(HierClusters, flag, usedColors, pointsOfIerarch);
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

});

const dialog = document.querySelector("dialog");  // информация

document.querySelector("#infoButton").onclick = function() {
    dialog.showModal();
}

document.querySelector("#closeDialog").onclick = function() {
    dialog.close();
}

window.sessionStorage.setItem("slide", 1); // на какой слайд возвращаемся

document.querySelector("#backButton").onclick = function() {
    window.location.href = "../sliderMenu";
}