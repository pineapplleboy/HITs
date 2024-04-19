import { root, tree, allInfo, categories } from "./main.js";
import { Node } from "./nodeClass.js";
import { Tree } from "./treeClass.js";

export let relativeAccuracyMax = 0.4;
export let absoluteMistakeMax = 0.19;
export let absoluteMistakeGlobalMax = 0.5;

let newElemValue;

let canvasSize = 680;

export function goAlgClick() { // алгоритм C4.5

    root = new Node();

    root.nodeInfo = getCopy(allInfo);
    root.nodeCategories = categories.map((element) => element);
    
    tree = new Tree(root);

    if (root.nodeCategories.length !== 0) {
        tree.buildTree();
        tree.printTree();
    }
    
}

export function resizeTreeClick() {
    if (root.nodeCategories.length !== 0) {
        tree.sizeOptimisation();
        tree.printTree();
    }   
}

export function newElementCheckClick() {
    if (!document.getElementById("newElementInput").value) {
        return;
    }

    newElemValue = document.getElementById("newElementInput").value.split(";");
    if (root.nodeCategories.length !== 0) {
        tree.analizeElement(newElemValue);
    }
    
}

export function editRelativeAccuracy() {
    relativeAccuracyMax = document.getElementById("relativeRange").value;
    document.getElementById("relativeRangeText").value = relativeAccuracyMax;

}

export function editAbsoluteMistake() {
    absoluteMistakeMax = document.getElementById("absoluteRange").value;
    document.getElementById("absoluteRangeText").value = absoluteMistakeMax;
}

export function editAbsoluteMistakeGlobal() {
    absoluteMistakeGlobalMax = document.getElementById("absoluteGlobalRange").value;
    document.getElementById("absoluteGlobalRangeText").value = absoluteMistakeGlobalMax;
}

export function editRelativeAccuracyText() {
    relativeAccuracyMax = document.getElementById("relativeRangeText").value;

    if (relativeAccuracyMax > 1) {
        relativeAccuracyMax = 1;
        document.getElementById("relativeRangeText").value = 1;
    }
    else if (relativeAccuracyMax < 0) {
        relativeAccuracyMax = 0;
        document.getElementById("relativeRangeText").value = 0;
    }

    document.getElementById("relativeRange").value = relativeAccuracyMax;
}

export function editAbsoluteMistakeText() {
    absoluteMistakeMax = document.getElementById("absoluteRangeText").value;

    if (absoluteMistakeMax > 1) {
        absoluteMistakeMax = 1;
        document.getElementById("absoluteRangeText").value = 1;
    }
    else if (absoluteMistakeMax < 0) {
        absoluteMistakeMax = 0;
        document.getElementById("absoluteRangeText").value = 0;
    }

    document.getElementById("absoluteRange").value = absoluteMistakeMax;
}

export function editAbsoluteMistakeGlobalText() {
    absoluteMistakeGlobalMax = document.getElementById("absoluteGlobalRangeText").value;

    if (absoluteMistakeGlobalMax > 5) {
        absoluteMistakeGlobalMax = 5;
        document.getElementById("absoluteGlobalRangeText").value = 5;
    }
    else if (absoluteMistakeGlobalMax < 0) {
        absoluteMistakeGlobalMax = 0;
        document.getElementById("absoluteGlobalRangeText").value = 0;
    }

    document.getElementById("absoluteGlobalRange").value = absoluteMistakeGlobalMax;
}

export function resizeCanvas(delta) {
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height); // очищаем канвас

    canvasSize += delta;

    canvasSize = Math.min(10000, Math.max(430, canvasSize));
    
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    if (root.nodeCategories.length !== 0) {
        tree.printTree();
    }
    
}

export function reloadInputText(filename) { // 
    document.getElementById("filenameId").value = filename;
}