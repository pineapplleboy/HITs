export class Layer {
    constructor(size, nextSize = 0) {
        this.size = size;
        this.neurons = new Array(size).fill(0);
        this.biases = new Array(size);
        for (let i = 0; i < size; i++) {
            this.biases[i] = Math.random() * 2.0 - 1.0;
        }
        this.weights = this.createArray(size, nextSize);
    }

    createArray(rows, columns) {
        let array = new Array(rows);
        for (let i = 0; i < rows; i++) {
            array[i] = new Array(columns);
            for (let j = 0; j < columns; j++) {
                array[i][j] = Math.random() * 2.0 - 1.0;
            }
        }
        return array;
    }
}