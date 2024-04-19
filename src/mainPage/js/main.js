window.sessionStorage.setItem('slide', 0);

document.querySelector("#startButton").onclick = function() {
    window.location.href = "../sliderMenu";
}

function start() {
    document.getElementById('startButton').style.color = 'white';
    // document.getElementById('startButton').style.backgroundColor = 'white';
    document.getElementById('startButton').style.border = '1px solid white';
}

start();