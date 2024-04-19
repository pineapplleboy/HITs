const {readFileSync, createWriteStream} = require("fs");
export function readMNISTFile(filename) {
    const rawData = readFileSync(filename, 'utf-8');
    const lines = rawData.split('\n');

    const data = lines.map(line => {
        const values = line.split(',').map(val => Number(val) / 255);
        const label = values.shift() * 255;
        return { input: values, target: label };
    });

    return data;
}
