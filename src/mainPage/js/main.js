window.sessionStorage.setItem('slide', 0);

document.querySelector("#startButton").onclick = function() {
    window.location.href = "../sliderMenu";
}

setTimeout(function() {
    document.getElementById('startButton').style.color = 'white';
    // document.getElementById('startButton').style.backgroundColor = 'white';
    document.getElementById('startButton').style.border = '1px solid white';
}, 2500)