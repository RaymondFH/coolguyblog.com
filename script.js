var block = document.getElementById("block");
var hole = document.getElementById("hole");
var character = document.getElementById("character");
var jumping = false;
var counter = 0;
var gameActive = true;
var gameWidth = window.innerWidth;
var gameHeight = window.innerHeight;

// Adjust hole position on every animation cycle
hole.addEventListener('animationiteration', () => {
    const maxHoleTop = gameHeight * 0.6; // Safe range for the hole
    const randomHoleTop = Math.random() * maxHoleTop;
    hole.style.top = randomHoleTop + "px";
    counter++;
});

const gameLoop = setInterval(() => {
    if (!gameActive) return;

    const characterTop = parseFloat(window.getComputedStyle(character).getPropertyValue("top"));
    const blockRight = gameWidth - parseFloat(window.getComputedStyle(block).getPropertyValue("right"));
    const blockWidth = parseFloat(window.getComputedStyle(block).getPropertyValue("width"));
    const holeTop = parseFloat(window.getComputedStyle(hole).getPropertyValue("top"));
    const characterBottom = characterTop + (gameHeight * 0.03);

    // Handle gravity when the character isn’t jumping
    if (!jumping) {
        character.style.top = (characterTop + gameHeight * 0.006) + "px";
    }

    // Improved collision detection logic
    const isInBlockRange = blockRight <= (gameWidth * 0.2) && blockRight + blockWidth >= (gameWidth * 0.2);
    const isOutsideHoleRange = characterTop < holeTop || characterBottom > holeTop + gameHeight * 0.3;
    if ((characterTop >= gameHeight * 0.97) || (isInBlockRange && isOutsideHoleRange)) {
        gameOver();
    }
}, 10);

function jump() {
    if (!gameActive || jumping) return;

    jumping = true;
    let jumpCount = 0;
    const jumpInterval = setInterval(() => {
        const characterTop = parseFloat(window.getComputedStyle(character).getPropertyValue("top"));
        if (jumpCount < 15 && characterTop > gameHeight * 0.01) {
            character.style.top = (characterTop - gameHeight * 0.008) + "px";
        }
        jumpCount++;

        if (jumpCount > 20) {
            clearInterval(jumpInterval);
            jumping = false;
        }
    }, 10);
}

function gameOver() {
    gameActive = false;
    document.getElementById("finalScore").textContent = Math.max(0, counter - 1);
    document.getElementById("scoreModal").style.display = "block";
    block.style.animationPlayState = "paused";
    hole.style.animationPlayState = "paused";
}

function restartGame() {
    gameActive = true;
    counter = 0;
    character.style.top = gameHeight * 0.3 + "px"; // Reset character position
    block.style.animation = 'none';
    hole.style.animation = 'none';
    void block.offsetWidth; // Trigger reflow
    void hole.offsetWidth;
    block.style.animation = 'block 2s infinite linear';
    hole.style.animation = 'block 2s infinite linear';
    document.getElementById("scoreModal").style.display = "none";
}

// Click and touch listeners for jump interaction
["click", "touchstart"].forEach(eventType => {
    document.addEventListener(eventType, event => {
        if (gameActive && event.target.id !== "restartButton") {
            if (eventType === "touchstart") event.preventDefault(); // Prevent scroll
            jump();
        }
    });
});

document.getElementById("restartButton").addEventListener("click", restartGame);

window.addEventListener("resize", () => {
    gameWidth = window.innerWidth;
    gameHeight = window.innerHeight;
});
