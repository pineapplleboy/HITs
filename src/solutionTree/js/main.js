import { Node } from "./nodeClass.js";
import { Tree } from "./treeClass.js";
import { resizeTreeClick, newElementCheckClick, editRelativeAccuracy,
    editAbsoluteMistake, editAbsoluteMistakeGlobal, editRelativeAccuracyText,
    editAbsoluteMistakeText, editAbsoluteMistakeGlobalText, resizeCanvas,
    reloadInputText } from "./eventFunctions.js";
import { getCopy } from "./functions.js";

export let root = new Node();
export let tree = new Tree();

export let allInfo = new Array();
export let categories = new Array();

const inputElement = document.getElementById("inputCSVFile");
inputElement.addEventListener("change", handleFiles);

function handleFiles() {
  const fileList = this.files;
  if (fileList.length) {
    const currentFile = fileList[0];

    if (currentFile.name.split(".")[currentFile.name.split(".").length - 1] !== "csv") {
        alert("Это не csv!!");
    }

    const reader = new FileReader();

    reader.onload = function(event) {
        let CSVData = event.target.result;

        CSVData = CSVData.split("\r\n");

        allInfo = new Array();
        categories = new Array();

        for (let i = 0; i < CSVData.length - 1; i++) {
            if (i === 0) {
                categories.push(CSVData[i].split(";"));
            }
            else {
                allInfo.push(CSVData[i].split(";"));
            }
        }

        categories = categories[0];

        document.getElementById('newElementInput').placeholder = categories.slice(0, categories.length - 1).join(";");

        reloadInputText(currentFile.name);
    }

    reader.readAsText(currentFile);
  }

}

document.querySelector("#goAlgButtton").onclick = function() { // запускаем алгоритм
    goAlgClick();
}

document.querySelector("#resizeTree").onclick = function() { // оптимизируем размер дерева
    resizeTreeClick();
}

document.querySelector("#newElementCheck").onclick = function() { // прогоняем введённый элемент по дереву
    newElementCheckClick();
}


// обработка относительной точности
document.querySelector("#relativeRange").oninput = function() {
    editRelativeAccuracy();
}

document.querySelector("#relativeRangeText").oninput = function() {
    editRelativeAccuracyText();
}

// обработка абсолютной ошибки узла
document.querySelector("#absoluteRange").oninput = function() {
    editAbsoluteMistake();
}

document.querySelector("#absoluteRangeText").oninput = function() {
    editAbsoluteMistakeText();
}

// обработка глобальной абсолютной ошибки
document.querySelector("#absoluteGlobalRange").oninput = function() {
    editAbsoluteMistakeGlobal();
}

document.querySelector("#absoluteGlobalRangeText").oninput = function() {
    editAbsoluteMistakeGlobalText();
}

addEventListener("keydown", function(event) { // увеличение и уменьшении канваса на +/-
    if (event.key === "=" && !event.ctrlKey) {
        resizeCanvas(50);
    }
    else if (event.key === "-" && !event.ctrlKey) {
        resizeCanvas(-50);
    }
    
});


function goAlgClick() { // алгоритм C4.5

    root = new Node();

    root.nodeInfo = getCopy(allInfo);
    root.nodeCategories = categories.map((element) => element);
    
    tree = new Tree(root);

    if (root.nodeCategories.length !== 0) {
        tree.buildTree();
        tree.printTree();
    }
    
}

const dialog = document.querySelector("dialog");

document.querySelector("#infoButton").onclick = function() {
    dialog.showModal();
}

document.querySelector("#closeDialog").onclick = function() {
    dialog.close();
}