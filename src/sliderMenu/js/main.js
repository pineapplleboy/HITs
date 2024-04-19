if (window.sessionStorage.length <= 1) {
    window.sessionStorage.setItem('slide', 0);
}

const swiperText = new Swiper(".swiper", {
    speed: 1500,
    mousewheel: {},
    pagination: {
        el: '.swiper-pagination',
        clickable: true
    },
    navigation: {
        prevEl: '.swiper-button-prev',
        nextEl: '.swiper-button-next'
    },
    initialSlide: window.sessionStorage.getItem('slide')
});

const video = document.querySelector('.video-background');

video.currentTime = window.sessionStorage.getItem('slide');

window.sessionStorage.setItem('slide', 0);

swiperText.on('slideChange', function() {
    gsap.to(video, 0.7, {
        currentTime: (video.duration / (this.slides.length - 1)) * this.realIndex,
        ease: Power0.easeOut
    })
});

swiperText.on('slideChangeTransitionStart', function() {
    video.classList.add('change');
}).on('slideChangeTransitionEnd', function() {
    video.classList.remove('change');
});


document.getElementById("AStarButton").onclick = function() {
    window.location.href = "../A-star";
}

document.getElementById("clasterButton").onclick = function() {
    window.location.href = "../cluster";
}

document.getElementById("geneticButton").onclick = function() {
    window.location.href = "../geneticAlgorithm";
}

document.getElementById("antButton").onclick = function() {
    window.location.href = "../antAlgorithm";
}

document.getElementById("treeButton").onclick = function() {
    window.location.href = "../solutionTree";
}

document.getElementById("neuronButton").onclick = function() {
    window.location.href = "../neuron";
}

document.getElementById("backButton").onclick = function() {
    window.location.href = "../mainPage";
}