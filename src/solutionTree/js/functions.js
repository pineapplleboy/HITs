export function getCopy(array) {
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

export function isDigit(symb) {
    if (symb >= "0" && symb <= "9") {
        return true;
    }
    return false;
}