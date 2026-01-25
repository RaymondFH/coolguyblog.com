var block = document.getElementById("block");
var hole = document.getElementById("hole");
var character = document.getElementById("character");
var jumping = 0;
var counter = 0;
var gameActive = true;

var gameWidth = window.innerWidth;
var gameHeight = window.innerHeight;

hole.addEventListener('animationiteration', () => {
    var random = Math.floor(Math.random() * (gameHeight * 0.6)); // Generate safe random vertical hole position
    hole.style.top = random + "px";
    counter++;
});

var gameLoop = setInterval(function(){
    if (!gameActive) return;

    var characterTop = parseInt(window.getComputedStyle(character).getPropertyValue("top"));
    var blockRight = gameWidth - parseInt(window.getComputedStyle(block).getPropertyValue("right"));
    var blockWidth = parseInt(window.getComputedStyle(block).getPropertyValue("width"));
    var holeTop = parseInt(window.getComputedStyle(hole).getPropertyValue("top"));
    var characterBottom = characterTop + (3 * gameHeight / 100);

    // Gravity effect increases character downward movement while not in the jump state
    if (jumping === 0) {
        character.style.top = (characterTop + gameHeight / 150) + "px";
    }

    // Fix collision detection logic for all columns consistently
    var blockCollision = blockRight <= (20 + blockWidth) && blockRight >= 20; // Horizontal overlap
    var outsideHoleRange = characterTop < holeTop || characterBottom > holeTop + gameHeight * 0.3; // Character not within hole

    if ((characterTop > gameHeight * 0.97) || (blockCollision && outsideHoleRange)) {
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

    // Restart column animations properly
    block.style.animation = ''; // Reset animation styles to avoid lingering issues
    hole.style.animation = '';
    void block.offsetWidth;      // Trigger reflow to restart animations
    void hole.offsetWidth;       
    block.style.animation = 'block 2s infinite linear';
    hole.style.animation = 'block 2s infinite linear';
}

document.getElementById('restartButton').addEventListener('click', function(e) {
    e.stopPropagation();  // Prevent event propagation to ensure proper restart
    restartGame();
});

// Touch and click listeners to handle jumps
['click', 'touchstart'].forEach(evt => {
    document.addEventListener(evt, function(e) {
        if (gameActive && e.target.id !== 'restartButton') {
            if (evt === 'touchstart') e.preventDefault(); // Prevent touch gesture interferences
            jump();
        }
    });
});

window.addEventListener('resize', function() {
    gameWidth = window.innerWidth;
    gameHeight = window.innerHeight;
});