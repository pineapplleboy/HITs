class Node {
    constructor (condition) {
        this.condition = condition; // условие, по которому мы попали в этот узел
        this.title = ""; // название узла, по которому происходит дальнейшее разделение
        this.child = new Array(); // дети узла
        this.parent = null; // родитель узла

        this.nodeInfo = new Array(); // оставшиеся в узле строчки и столбцы
        this.nodeCategories = new Array(); // оставшиезя в узле категории
    }

    // считаем энтропию ответов
    decisionEntropy() {
        let positive = 0;
        let negative = 0;

        for (let i = 0; i < this.nodeInfo.length; i++) {
            if (this.nodeInfo[i][this.nodeInfo[i].length - 1].toLowerCase() == "true" ||
             this.nodeInfo[i][this.nodeInfo[i].length - 1].toLowerCase() == "yes" || this.nodeInfo[i][this.nodeInfo[i].length - 1] == "1") {
                positive++;
             }
             else {
                negative++;
             }
        }

        let desEntr = 0;
        
        if (positive > 0) {
            desEntr -= (positive / (positive + negative)) * Math.log2(positive / (positive + negative));
        }
        if (negative > 0) {
            desEntr -= (negative / (positive + negative)) * Math.log2(negative / (positive + negative));
        }

        return desEntr;
    }

    // считаем прирост
    calculateGain(entropyMap) { // энтропия * (встреч параметров / всего ответов)
        let ratio = this.decisionEntropy();
        
        for (let elem of entropyMap) {
            ratio -= elem[1][0] * (elem[1][1] / this.nodeInfo.length);
        }
        
        return ratio;
    }

    // считаем "параметр разделённости"
    calculateSplitInfo(entropyMap) { // высчитываем через количество ответов на каждый параметр
        let splitInfo = 0;

        for (let elem of entropyMap) {
            if (elem[1][1]) {
                splitInfo -= (elem[1][1] / this.nodeInfo.length) * Math.log2(elem[1][1] / this.nodeInfo.length);
            }
        }

        return splitInfo;
    }

    // считаем коэф. усиления
    calculateGainRatio(index, digitCond = -1) {
        let entrMap = this.calculateEntropy(index, digitCond);
        //return this.calculateGain(entrMap); // это был бы алгоритм ID3
        return this.calculateGain(entrMap) / this.calculateSplitInfo(entrMap); // а это алгоритм C4.5
    }

    // считаем количество ответов да/нет для каждого из параметров, считаем энтропию для каждого параметра
    calculateEntropy(entropyIndex, digitCond = -1) {
        let allVar = new Map();
        let entropyMap = new Map();

        // если варианты - не числа, то проводим обычный анализ, иначе - анализ по больше/меньше одному из чисел
        if (digitCond == -1) {
            for (let i = 0; i < this.nodeInfo.length; i++) { // считаем количество "да" и "нет" для параметров
                if (!allVar.has(this.nodeInfo[i][entropyIndex])) {
                    allVar.set(this.nodeInfo[i][entropyIndex], [0, 0]); // первый элемент в массиве - да, второй элемент - нет
                }
    
                if (this.nodeInfo[i][this.nodeInfo[i].length - 1].toLowerCase() == "true" ||
                 this.nodeInfo[i][this.nodeInfo[i].length - 1].toLowerCase() == "yes" || this.nodeInfo[i][this.nodeInfo[i].length - 1] == "1") {
    
                    allVar.set(this.nodeInfo[i][entropyIndex], [allVar.get(this.nodeInfo[i][entropyIndex])[0] + 1,
                     allVar.get(this.nodeInfo[i][entropyIndex])[1]]);
                }
                else {
                    allVar.set(this.nodeInfo[i][entropyIndex], [allVar.get(this.nodeInfo[i][entropyIndex])[0],
                    allVar.get(this.nodeInfo[i][entropyIndex])[1] + 1]);
                }
    
            }
    
            for (let elem of allVar) { // считаем энтропию и записываем в словарь это число и количество встреченных ответов на параметр
                let entrSum = elem[1][0] + elem[1][1];
                entropyMap.set(elem[0], 0);
    
                 if (elem[1][0] > 0) {
                    entropyMap.set(elem[0], entropyMap.get(elem[0]) -(elem[1][0] / entrSum) * Math.log2(elem[1][0] / entrSum));
                 }
    
                 if (elem[1][1] > 0) {
                    entropyMap.set(elem[0], entropyMap.get(elem[0]) -(elem[1][1] / entrSum) * Math.log2(elem[1][1] / entrSum));
                 }
    
                 entropyMap.set(elem[0], [entropyMap.get(elem[0]), allVar.get(elem[0])[0] + allVar.get(elem[0])[1]]);
            }   
        }

        else {
            allVar.set(`> ${digitCond}`, [0, 0]);
            allVar.set(`<= ${digitCond}`, [0, 0]);

            for (let i = 0; i < this.nodeInfo.length; i++) { // считаем количество "да" и "нет" для >/<= числу

                if (this.nodeInfo[i][this.nodeInfo[i].length - 1].toLowerCase() == "true" ||
                 this.nodeInfo[i][this.nodeInfo[i].length - 1].toLowerCase() == "yes" || this.nodeInfo[i][this.nodeInfo[i].length - 1] == "1") {
                    
                    if (Number(this.nodeInfo[i][entropyIndex]) > Number(digitCond)) {
                        allVar.set(`> ${digitCond}`, [allVar.get(`> ${digitCond}`)[0] + 1,
                        allVar.get(`> ${digitCond}`)[1]]);
                    }
                    else {
                        allVar.set(`<= ${digitCond}`, [allVar.get(`<= ${digitCond}`)[0] + 1,
                        allVar.get(`<= ${digitCond}`)[1]]);
                    }
                }
                else {
                    if (Number(this.nodeInfo[i][entropyIndex]) > Number(digitCond)) {
                        allVar.set(`> ${digitCond}`, [allVar.get(`> ${digitCond}`)[0],
                        allVar.get(`> ${digitCond}`)[1] + 1]);
                    }
                    else {
                        allVar.set(`<= ${digitCond}`, [allVar.get(`<= ${digitCond}`)[0],
                        allVar.get(`<= ${digitCond}`)[1] + 1]);
                    }
                }
    
            }
    
            for (let elem of allVar) { // считаем энтропию и записываем в словарь это число и количество встреченных ответов на параметр
                let entrSum = elem[1][0] + elem[1][1];
                entropyMap.set(elem[0], 0);
    
                 if (elem[1][0] > 0) {
                    entropyMap.set(elem[0], entropyMap.get(elem[0]) -(elem[1][0] / entrSum) * Math.log2(elem[1][0] / entrSum));
                 }
    
                 if (elem[1][1] > 0) {
                    entropyMap.set(elem[0], entropyMap.get(elem[0]) -(elem[1][1] / entrSum) * Math.log2(elem[1][1] / entrSum));
                 }
    
                 entropyMap.set(elem[0], [entropyMap.get(elem[0]), allVar.get(elem[0])[0] + allVar.get(elem[0])[1]]);
            }  

        }

        return entropyMap;
    }

    // получаем значения GainRatio для всех категорий
    getAllOptionsValues() {
        let currentGainRatio = new Array(); // список со всеми параметрами и их GainRatio
        for (let i = 0; i < this.nodeCategories.length - 1; i++) {
            if (isDigit(this.nodeInfo[0][i][0])) { // если первый знак первого элемента - число, то проверяем по числам
                let tempCategMap = new Map();
                let allNumVariants = new Array();

                for (let j = 0; j < this.nodeInfo.length; j++) { // подбираем наилучший разделитель
                    if (!tempCategMap.has(`${this.nodeCategories[i]} <> ${this.nodeInfo[j][i]}`)) {
                        tempCategMap.set(`${this.nodeCategories[i]} <> ${this.nodeInfo[j][i]}`, this.calculateGainRatio(i, this.nodeInfo[j][i]));
                        allNumVariants.push(this.nodeInfo[j][i]);
                    }
                }
                
                let maxKey = "", maxGainRatio = -100; // выбираем наибольшее значение GainRatio, пропуская глобальные максимальные и минимальные значение параметра
                // (в диапазоне +- 1)

                let allGlobVar = new Array(); // для того, чтобы просмотреть глобольный максимум/минимум
                let tempCond = this.nodeCategories[i];

                for (let j = 0; j < categories.length; j++) {
                    if (categories[j] == tempCond) {
                        for (let iter = 0; iter < allInfo.length; iter++) {
                            allGlobVar.push(allInfo[iter][j]);
                        }
                    }
                }

                for (let elem of tempCategMap) { // тут > или >= может повлиять на результат
                    if (elem[1] > maxGainRatio && allNumVariants.length > 2 && Math.max.apply(null, allGlobVar) > Number(elem[0].split(" ")[elem[0].split(" ").length - 1]) + 1
                        && Math.min.apply(null, allGlobVar) < Number(elem[0].split(" ")[elem[0].split(" ").length - 1]) - 1) {

                        maxKey = elem[0];
                        maxGainRatio = elem[1];
                    }
                }

                currentGainRatio.push([maxKey, tempCategMap.get(maxKey)]);
            }
            else { // иначе - по-стандартному
                currentGainRatio.push([this.nodeCategories[i], this.calculateGainRatio(i)]);
            }
        }

        //console.log(currentGainRatio);
        return currentGainRatio;
    }

    // выбираем наилучший вариант
    chooseBestOption() {
        let allOptions = this.getAllOptionsValues();

        let bestInd = 0;

        for (let i = 1; i < allOptions.length; i++) {
            //if (allOptions[i][1] > allOptions[bestInd][1] && allOptions[i][1] != 1) {
            if (allOptions[i][1] > allOptions[bestInd][1]) {
                bestInd = i;
            }
        }

        return allOptions[bestInd][0];
    }

    createNewNode() {
        if (!this.checkIsNodeLeaf()) {
            return [];
        }

        let bestOption = this.chooseBestOption().split(" <> ");
        this.title = bestOption[0];

        let deleteInd = 0;

        let clearedNodeCategories = this.nodeCategories.map((element) => element);

        // сначала удаляем из списков вариантов лучшую категорию
        for (let i = 0; i < clearedNodeCategories.length; i++) {

            if (clearedNodeCategories[i] == bestOption[0]) {
                deleteInd = i;
                clearedNodeCategories.splice(i, 1);
                break;
            }
        }

        let allNewVariants = new Set(); // сохраняем все варианты разветвления деревьев
        for (let i = 0; i < this.nodeInfo.length; i++) {
            allNewVariants.add(this.nodeInfo[i][deleteInd]);
        }
        
        // "циферная" категория - добавляем варианты >/<=
        if (bestOption.length > 1) {
            allNewVariants = new Set([`> ${bestOption[1]}`, `<= ${bestOption[1]}`]);
        }

        // создаём новых потомков
        for (let conditionVariant of allNewVariants) {
            let newNode = new Node(conditionVariant);

            let newNodeInfo = new Array();
            newNode.parent = this;

            if (bestOption.length > 1) {
                if (conditionVariant == `> ${bestOption[1]}`) {
                    for (let i = 0; i < this.nodeInfo.length; i++) {
                        if (this.nodeInfo[i][deleteInd] > bestOption[1]) {
                            newNodeInfo.push(this.nodeInfo[i].map((element) => element));
                            newNodeInfo[newNodeInfo.length - 1].splice(deleteInd, 1);
                        }
                    }
                }
                else {
                    for (let i = 0; i < this.nodeInfo.length; i++) {

                        if (this.nodeInfo[i][deleteInd] <= bestOption[1]) {
                            newNodeInfo.push(this.nodeInfo[i].map((element) => element));
                            newNodeInfo[newNodeInfo.length - 1].splice(deleteInd, 1);
                        }
                    }
                }
            }

            else {

                for (let i = 0; i < this.nodeInfo.length; i++) {

                    if (this.nodeInfo[i][deleteInd] == conditionVariant) {
                        newNodeInfo.push(this.nodeInfo[i].map((element) => element));
                        newNodeInfo[newNodeInfo.length - 1].splice(deleteInd, 1);
                    }
                }
            }     

            newNode.nodeCategories = clearedNodeCategories.map((element) => element);
            newNode.nodeInfo = newNodeInfo.map((element) => element);

            this.child.push(newNode);
        }

        //console.log(this.child);
        return this.child;
    }

    // проверка, нужно ли создавать новые узлы
    checkIsNodeLeaf() {
        if (this.nodeInfo[0].length == 1) {
            //this.title = this.nodeInfo[0][0];
            return false;
        }

        let positive = 0;
        for (let i = 0; i < this.nodeInfo.length; i++) {
            if (this.nodeInfo[i][this.nodeInfo[i].length - 1].toLowerCase() == "true" ||
             this.nodeInfo[i][this.nodeInfo[i].length - 1].toLowerCase() == "yes" || this.nodeInfo[i][this.nodeInfo[i].length - 1] == "1") {
                positive++;
            }
        }

        if (positive != this.nodeInfo.length && positive > 0) {
            return true;
        }

        //this.title = this.nodeInfo[0][this.nodeInfo[0].length - 1];
        return false;
    }
    
}

class Tree {
    constructor (root) {
        this.root = root;
        this.coordInfo = new Array(); // храним координаты визуализации дерева (для прохода новых элементов)
        this.absoluteMistakeGlobal = 0;
    }

    // строим дерево
    buildTree() {
        let nodeStorage = [this.root];

        this.absoluteMistakeGlobal = 0;

        while (nodeStorage.length != 0) {
            let currentNode = nodeStorage.shift();

            let newNodes = currentNode.createNewNode();

            for (let i = 0; i < newNodes.length; i++) {
                nodeStorage.push(newNodes[i]);
            }

        }

    }

    // получаем все массив уровней дерева
    getAllLevels() {
        let levels = [[this.root]];
        let prevLevel = [this.root];
        let newLevel = [];
        
        while (prevLevel.length) {
            newLevel = new Array();
            
            for (let i = 0; i < prevLevel.length; i++) {

                for (let j = 0; j < prevLevel[i].child.length; j++) {
                    newLevel.push(prevLevel[i].child[j]);
                }
                
            }

            prevLevel = newLevel.map((element) => element);
            if (prevLevel.length) {
                levels.push(prevLevel);
            }
            
        }

        return levels;
    }

    // рисуем дерево
    printTree() {
        const levels = this.getAllLevels();

        let ctx = canvas.getContext("2d");

        this.coordInfo = [];

        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";

        ctx.fillRect(0, 0, canvas.width, canvas.height); // очищаем канвас

        ctx.fillStyle = "black";

        ctx.textAlign = "center";

        const height = canvas.width / (levels.length * 2 + 1);

        let currentX = 5, currentY = height;

        for (let level of levels) { // рисуем прямоугольнички

            const width = canvas.width / (level.length * 2 + 1);

            currentX = width;

            let currentLevelCoord = new Array();

            for (let elem of level) {
            
                if (elem.child.length) {
                    let fontSize = Math.min(22, width / (elem.title.split(" ")[0].length));
                    ctx.font = `${fontSize}px Intro`;
                    ctx.strokeRect(currentX, currentY, width, height);
                    ctx.fillText(elem.title.split(" ")[0], currentX + width / 2, currentY + height / 2 + fontSize / 2);
                }
                else {
                    let fontSize = Math.min(22, width / elem.nodeInfo[0][elem.nodeInfo[0].length - 1].length);
                    //let fontSize = width / 2;
                    ctx.font = `${fontSize}px Intro`;
                    ctx.strokeRect(currentX, currentY, width, height);
                    ctx.fillText(elem.nodeInfo[0][elem.nodeInfo[0].length - 1], currentX + width / 2, currentY + height / 2 + fontSize / 2);
                }

                // if (elem.condition != undefined) {
                //     ctx.textAlign = "left";
                //     ctx.font = `${18}px Intro`;
                //     ctx.fillText(elem.condition, currentX, currentY);
                //     ctx.textAlign = "center";
                // }
                
                currentLevelCoord.push({x: currentX, y: currentY, width: width, height: height, condition: elem.condition});

                currentX += width * 2;
                
            }

            this.coordInfo.push(currentLevelCoord);

            currentY += height * 2;

        }

        ctx.beginPath();

        ctx.strokeStyle = "gray";
        ctx.textAlign = "center";
        ctx.font = `${18}px Intro`;

        for (let i in levels) { // соединяем их рёбрами

            if (i == 0) {
                continue;
            }
        
            for (let elem in levels[i]) {
                
                for (let potentialParent in levels[i - 1]) { // ищем родителя
                    if (levels[i][elem].parent == levels[i - 1][potentialParent]) {

                        let fromX = this.coordInfo[i - 1][potentialParent].x + this.coordInfo[i - 1][potentialParent].width / 2; // нижний центр вершины-родителя
                        let fromY = this.coordInfo[i - 1][potentialParent].y + this.coordInfo[i - 1][potentialParent].height; 

                        let toX = this.coordInfo[i][elem].x + this.coordInfo[i][elem].width / 2; // верхний центр узла
                        let toY = this.coordInfo[i][elem].y;
                        
                        ctx.moveTo(fromX, fromY); // рисуем линию

                        ctx.lineTo(toX, toY);

                        ctx.font = `${Math.min((this.coordInfo[i][elem].width + 20) / levels[i][elem].condition.length, 20)}px Intro`;
                        
                        ctx.fillText(levels[i][elem].condition, (fromX + toX) / 2, (fromY + toY) / 2); // дописываем условие 
                    }
                }
            }
        }

        ctx.stroke();

        //console.log(this.coordInfo);
    }

    // "прогоняем" элемент по дереву
    analizeElement(elementInfo) {

        this.printTree();

        let ctx = canvas.getContext("2d");
        ctx.strokeStyle = "green";
        ctx.fillStyle = "green";

        let currentNode = this.root;
        let layIndex = 0;
        let currentCoords;
        let isFound;

        let usedCoords = [this.coordInfo[0][0]];

        ctx.beginPath();

        while (currentNode.child.length != 0) { // проходимся по дереву

            let currentAtribute = elementInfo[currentNode.nodeCategories.indexOf(currentNode.title)];

            isFound = -1;
            
            for (let elem of currentNode.child) { // ищем, куда переходим

                if (elem.condition.split(" ").length == 2 && elem.condition.split(" ")[0] == ">"
                 && isDigit(currentAtribute[0])) {
                    
                    if (Number(currentAtribute) > Number(elem.condition.split(" ")[1])) {
                        isFound = currentNode.child.indexOf(elem);
                        currentCoords = this.coordInfo[layIndex + 1][this.getAllLevels()[layIndex + 1].indexOf(elem)];
                    }
                    
                }

                else if (elem.condition.split(" ").length == 2 && elem.condition.split(" ")[0] == "<="
                && isDigit(currentAtribute[0])) {

                    if (Number(currentAtribute) <= Number(elem.condition.split(" ")[1])) {
                        isFound = currentNode.child.indexOf(elem);
                        currentCoords = this.coordInfo[layIndex + 1][this.getAllLevels()[layIndex + 1].indexOf(elem)];
                    }
                }

                else if (elem.condition.toLowerCase() == currentAtribute.toLowerCase()){
                    isFound = currentNode.child.indexOf(elem);
                    currentCoords = this.coordInfo[layIndex + 1][this.getAllLevels()[layIndex + 1].indexOf(elem)];
                }

            }

            if (isFound == -1) {
                isFound = 2;
                alert("Не могу...");
                break;
            }

            //currentCoords = this.coordInfo[layIndex + 1][isFound];
            
            ctx.strokeRect(currentCoords.x, currentCoords.y, currentCoords.width, currentCoords.height);

            elementInfo.splice(currentNode.nodeCategories.indexOf(currentNode.title), 1);
            layIndex++;
            currentNode = currentNode.child[isFound];
            usedCoords.push(currentCoords);
        }

        if (isFound != -1) {
            currentCoords = this.coordInfo[0][0]; // красим корень
            ctx.strokeRect(currentCoords.x, currentCoords.y, currentCoords.width, currentCoords.height);

            for (let i = 1; i < usedCoords.length; i++) {

                let fromX = usedCoords[i - 1].x + usedCoords[i - 1].width / 2; // нижний центр вершины-родителя
                let fromY = usedCoords[i - 1].y + usedCoords[i - 1].height; 

                let toX = usedCoords[i].x + usedCoords[i].width / 2; // верхний центр узла
                let toY = usedCoords[i].y;
                        
                ctx.moveTo(fromX, fromY); // рисуем линию

                ctx.font = `${Math.min((usedCoords[i].width + 20) / usedCoords[i].condition.length, 20)}px Intro`;
                ctx.fillText(usedCoords[i].condition, (fromX + toX) / 2, (fromY + toY) / 2);

                ctx.lineTo(toX, toY);
            }
        }

        ctx.stroke();
    }

    sizeOptimisation() {
        const levels = this.getAllLevels();

        for (let i = levels.length - 2; i >= 0; i--) { // проходимся по узлам снизу вверх

            for (let elem of levels[i]) {

                let positive = 0;
                let negative = 0;

                let negativeText = "";
                let positiveText = "";

                for (let i = 0; i < elem.nodeInfo.length; i++) {
                    if (elem.nodeInfo[i][elem.nodeInfo[i].length - 1].toLowerCase() === "true" ||
                        elem.nodeInfo[i][elem.nodeInfo[i].length - 1].toLowerCase() === "yes" || elem.nodeInfo[i][elem.nodeInfo[i].length - 1] == "1") {
                        positive++;
                        positiveText = elem.nodeInfo[i][elem.nodeInfo[i].length - 1];
                    }
                    else {
                        //elem.nodeInfo[i][elem.nodeInfo[i].length - 1] = "Yes";
                        negative++;
                        negativeText = elem.nodeInfo[i][elem.nodeInfo[i].length - 1];
                    }
                }

                let relativeAccuracy = Math.min(positive, negative) / elem.nodeInfo.length; // относительная точность
                let absoluteMistake = Math.min(positive, negative) / allInfo.length; // абсолютная ошибка

                // на столько изменятсся эти параметры, если заменить все отличающиеся варианты на "основные"

                if (positive == 0 || negative == 0) {
                    continue;
                }

                //console.log(i, relativeAccuracy, absoluteMistake);

                if (relativeAccuracy <= relativeAccuracyMax && 
                    absoluteMistake <= absoluteMistakeMax && 
                    this.absoluteMistakeGlobal + absoluteMistake <= absoluteMistakeGlobalMax) { // изменять параметры здесь

                    this.absoluteMistakeGlobal += absoluteMistake;

                    for (let i = 0; i < elem.nodeInfo.length; i++) { // изменяем таблицу данных для узла
                        if (positive < negative) {
                            elem.nodeInfo[i][elem.nodeInfo[i].length - 1] = negativeText;
                        }
                        else {
                            elem.nodeInfo[i][elem.nodeInfo[i].length - 1] = positiveText;
                        }
                        
                    }

                    elem.title = elem.nodeInfo[0][elem.nodeInfo[0].length - 1]; // делаем вершину листком
    
                    elem.child = [];
                }
                
            }
        }

    }
}

function getCopy(array) {
    let newArray = new Array();

    for (let i = 0; i < array.length; i++) {
        
        let temp = new Array();
        for (let j = 0; j < array[i].length; j++) {
            temp.push(array[i][j]);
        }

        newArray.push(temp);
    }

    return newArray;
}

function isDigit(symb) {
    if (symb >= "0" && symb <= "9") {
        return true;
    }
    return false;
}

let root = new Node();
let tree = new Tree();

let allInfo = new Array();
let categories = new Array();

const inputElement = document.getElementById("inputCSVFile");
inputElement.addEventListener("change", handleFiles, false);

const canvas = document.getElementById("canvas");

let relativeAccuracyMax = 0.4;
let absoluteMistakeMax = 0.19;
let absoluteMistakeGlobalMax = 0.5;

function handleFiles() {
  const fileList = this.files;
  if (fileList.length) {
    const currentFile = fileList[0];

    if (currentFile.name.split(".")[currentFile.name.split(".").length - 1] != "csv") {
        alert("Это не csv!!");
    }

    const reader = new FileReader();

    reader.onload = function(event) {
        let CSVData = event.target.result;

        CSVData = CSVData.split("\r\n");

        allInfo = new Array();
        categories = new Array();

        for (let i = 0; i < CSVData.length - 1; i++) {
            if (i == 0) {
                categories.push(CSVData[i].split(";"));
            }
            else {
                allInfo.push(CSVData[i].split(";"));
            }
        }

        categories = categories[0];

        const textField = document.getElementById("categoriesReminder"); // вставляем текст с категориями из файла
        textField.innerHTML = "";
        textField.innerHTML = categories.slice(0, categories.length - 1).join(";");
    }

    reader.readAsText(currentFile);
  }

}

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

function resizeTreeClick() {
    if (root.nodeCategories.length !== 0) {
        tree.sizeOptimisation();
        tree.printTree();
    }   
}

function newElementCheckClick() {
    if (!document.getElementById("newElementInput").value) {
        return;
    }

    newElemValue = document.getElementById("newElementInput").value.split(";");
    if (root.nodeCategories.length !== 0) {
        tree.analizeElement(newElemValue);
    }
    
}

function editRelativeAccuracy() {
    relativeAccuracyMax = document.getElementById("relativeRange").value;
    document.getElementById("relativeRangeText").value = relativeAccuracyMax;

}

function editAbsoluteMistake() {
    absoluteMistakeMax = document.getElementById("absoluteRange").value;
    document.getElementById("absoluteRangeText").value = absoluteMistakeMax;
}

function editAbsoluteMistakeGlobal() {
    absoluteMistakeGlobalMax = document.getElementById("absoluteGlobalRange").value;
    document.getElementById("absoluteGlobalRangeText").value = absoluteMistakeGlobalMax;
}

function editRelativeAccuracyText() {
    relativeAccuracyMax = Math.min(1, Math.max(0, document.getElementById("relativeRangeText").value));

    document.getElementById("relativeRangeText").value = relativeAccuracyMax;
    document.getElementById("relativeRange").value = relativeAccuracyMax;
}

function editAbsoluteMistakeText() {
    absoluteMistakeMax = Math.min(1, Math.max(0, document.getElementById("absoluteRangeText").value));
    document.getElementById("absoluteRangeText").value = absoluteMistakeMax;
    document.getElementById("absoluteRange").value = absoluteMistakeMax;
}

function editAbsoluteMistakeGlobalText() {
    absoluteMistakeGlobalMax = Math.min(5, Math.max(0, document.getElementById("absoluteGlobalRangeText").value));

    document.getElementById("absoluteGlobalRangeText").value = absoluteMistakeGlobalMax;
    document.getElementById("absoluteGlobalRange").value = absoluteMistakeGlobalMax;
}

function resizeCanvas() {
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height); // очищаем канвас

    canvas.width = document.getElementById("resizeCanvas").value;
    canvas.height = document.getElementById("resizeCanvas").value;

    if (root.nodeCategories.length !== 0) {
        tree.printTree();
    }
    
}
