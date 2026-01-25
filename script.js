var block = document.getElementById("block");
var hole = document.getElementById("hole");
var character = document.getElementById("character");
var jumping = 0;
var counter = 0;
var gameActive = true;

var gameWidth = window.innerWidth;
var gameHeight = window.innerHeight;

hole.addEventListener('animationiteration', () => {
    var random = Math.floor(Math.random() * (gameHeight * 0.6)); // Adjusted random positioning within a safer range
    hole.style.top = random + "px";
    counter++;
});

var gameLoop = setInterval(function(){
    if (!gameActive) return;

    var characterTop = parseInt(window.getComputedStyle(character).getPropertyValue("top"));
    var blockRight = gameWidth - parseInt(window.getComputedStyle(block).getPropertyValue("right")); // Fixed detection logic
    var blockWidth = parseInt(window.getComputedStyle(block).getPropertyValue("width"));
    var holeTop = parseInt(window.getComputedStyle(hole).getPropertyValue("top"));
    var characterBottom = characterTop + (3 * gameHeight / 100);

    // Automatically make character fall unless jumping is active
    if (jumping === 0) {
        character.style.top = (characterTop + gameHeight / 150) + "px";
    }

    // Hit detection improvement
    var withinBlockRange = blockRight <= 20 && blockRight + blockWidth >= 0; // Character collides horizontally
    var outsideHoleRange = characterTop < holeTop || characterBottom > holeTop + gameHeight * 0.3; // Character collides vertically

    if ((characterTop > gameHeight * 0.97) || (withinBlockRange && outsideHoleRange)) {
        gameOver();
    }
}, 10);

function jump(){
    if (!gameActive || jumping) return;
    jumping = 1;
    let jumpCount = 0;
    var jumpInterval = setInterval(function(){
        var characterTop = parseInt(window.getComputedStyle(character).getPropertyValue("top"));
        if((characterTop > gameHeight * 0.01) && (jumpCount < 15)){ 
            character.style.top = (characterTop - gameHeight / 150) + "px";
        }
        if(jumpCount > 20){
            clearInterval(jumpInterval);
            jumping = 0;
            jumpCount = 0;
        }
        jumpCount++;
    },10);
}

function gameOver() {
    gameActive = false;
    document.getElementById('finalScore').textContent = counter - 1;
    document.getElementById('scoreModal').style.display = 'block';
    block.style.animationPlayState = 'paused';
    hole.style.animationPlayState = 'paused';
}

function restartGame() {
    gameActive = true;
    counter = 0;
    character.style.top = (gameHeight * 0.2) + "px";
    document.getElementById('scoreModal').style.display = 'none';
    block.style.animation = ''; // Reset the animation styles
    void block.offsetWidth;      // Trigger reflow to restart animation
    block.style.animation = 'block 2s infinite linear';
    hole.style.animationPlayState = 'running';
}

document.getElementById('restartButton').addEventListener('click', function(e) {
    e.stopPropagation();  // Prevent event from bubbling up
    restartGame();
});

// Event listener for jump (can be triggered by click or touch)
document.addEventListener('click', function(e) {
    if (gameActive && e.target.id !== 'restartButton') {
        jump();
    }
});

document.addEventListener('touchstart', function(e) {
    if (gameActive && e.target.id !== 'restartButton') {
        e.preventDefault();  // Prevent default touch behavior
        jump();
    }
});

window.addEventListener('resize', function() {
    gameWidth = window.innerWidth;
    gameHeight = window.innerHeight;
});