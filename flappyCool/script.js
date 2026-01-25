var block = document.getElementById("block");
var hole = document.getElementById("hole");
var character = document.getElementById("character");
var jumping = false;
var counter = 0;
var gameActive = true;

const game = {
    width: window.innerWidth,
    height: window.innerHeight,
    blockSpeed: 2000, // Speed at which blocks move
    character: {
        width: 3,
        height: 3,
        topPosition: 20
    }
};

hole.addEventListener("animationiteration", () => {
    const randomHole = Math.random() * game.height * 0.6;
    hole.style.top = randomHole + "px";
});