const sizePicker = document.getElementById("sizePicker");
// Select size input
let inputHeight = document.getElementById("inputHeight");
let inputWidth = document.getElementById("inputWidth");

// Select color input
let color = document.getElementById("colorPicker");

const pixelCanvas = document.getElementById("pixelCanvas");

function clearGrid() {
    const allRows = document.querySelectorAll("tr");
    allRows.forEach((row) => {
        row.remove();
    });
}

function makeGrid(e) {
    e.preventDefault();

    // Clear the grid everytime
    clearGrid();

    const height = inputHeight.value;
    const width = inputWidth.value;
    // nested loop
    for (let i = 1; i <= height; i++) {
        //row element is created
        const row = document.createElement("tr");
        for (let j = 1; j <= width; j++) {
            // create column element
            const column = document.createElement("td");
            column.id = "column-i-j";
            // append it to row element
            row.appendChild(column);
        }
        // append row element to table(i.e pixelCanvas) element
        pixelCanvas.appendChild(row);
    }
}

// When size is submitted by the user, call makeGrid()
sizePicker.addEventListener("submit", makeGrid);

pixelCanvas.addEventListener("click", function (e) {
    e.target.style.backgroundColor = color.value;
});