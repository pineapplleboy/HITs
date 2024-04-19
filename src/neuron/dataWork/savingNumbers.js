export function saveDrawnDigitsDataToCSV() {
    const drawnDigit = parseInt(document.getElementById('drawn-digit-input').value);

    const newRow = `${drawnDigit},${colors.map(row => row.map(val => Math.round(val * 255)).join(',')).join(',')}\n`;

    const blob = new Blob([newRow], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "mnist_train.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        console.error("Your browser does not support downloading files.");
    }
}