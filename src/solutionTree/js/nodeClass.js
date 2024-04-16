import { isDigit } from "./functions.js";
import { allInfo, categories } from "./main.js";

export class Node {
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