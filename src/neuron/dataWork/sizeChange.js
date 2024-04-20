const fs = require('fs');
function processMNISTTestFile() {
    const data = [];
    const outputFile = "mnist_test_50_50.csv";
    const outputFileStream = fs.createWriteStream(outputFile);

    const csvWriter = (row) => {
        let x2_train = row[0] + ",";
        row = row.slice(1);
        for (let i = 0; i < 28; i++) {
            let row1 = "";
            for (let j = 0; j < 28; j++) {
                row1 += row[j + 28 * i] + ",";
                if ((j + 1) % 4 !== 0 || (j + 1) % 16 === 0) {
                    row1 += row[j + 28 * i] + ",";
                }
            }
            x2_train += row1;
            if ((i + 1) % 4 !== 0 || (i + 1) % 16 === 0) {
                x2_train += row1;
            }
        }
        outputFileStream.write(x2_train.slice(0, -1) + "\n");
    };

    const rawData = fs.readFileSync('mnist_train.csv', 'utf-8');
    const lines = rawData.split('\n');

    for (const line of lines) {
        const row = line.split(',').map(Number);
        data.push(row);
    }

    data.forEach(csvWriter);
    outputFileStream.end();
}

processMNISTTestFile();