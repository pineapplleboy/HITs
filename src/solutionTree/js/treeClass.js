import { isDigit } from "./functions.js";
import { allInfo } from "./main.js";
import { relativeAccuracyMax, absoluteMistakeMax, absoluteMistakeGlobalMax } from "./eventFunctions.js";

export class Tree {
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

                        if (levels[i][elem].condition.split(" ")[0] != "<=" && levels[i][elem].condition.split(" ")[0] != ">") { // берём только первое слово из условия

                            ctx.font = `${Math.min((this.coordInfo[i][elem].width + 20) / Math.max(levels[i][elem].condition.split(" ")[0].length, 5), 20)}px Intro`;
                            ctx.fillText(levels[i][elem].condition.split(" ")[0], (fromX + toX) / 2, (fromY + toY) / 2); // дописываем условие 

                        }

                        else {
                            ctx.font = `${Math.min((this.coordInfo[i][elem].width + 20) / levels[i][elem].condition.length, 20)}px Intro`;
                            ctx.fillText(levels[i][elem].condition, (fromX + toX) / 2, (fromY + toY) / 2); // дописываем условие 
                        }
                        
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