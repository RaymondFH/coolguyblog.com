var block = document.getElementById("block");
var hole = document.getElementById("hole");
var character = document.getElementById("character");
var scoreDisplay = document.getElementById("score");
var jumping = false;
var counter = 0;
var gameActive = true;
var gameWidth = window.innerWidth;
var gameHeight = window.innerHeight;

// Initialize character position
character.style.top = "20vh";

// Update score display
function updateScore() {
  scoreDisplay.textContent = counter;
}

// Adjust hole position on every animation cycle
hole.addEventListener("animationiteration", () => {
  if (!gameActive) return;
  const maxHoleTop = gameHeight * 0.6;
  const randomHoleTop = Math.random() * maxHoleTop;
  hole.style.top = randomHoleTop + "px";
  counter++;
  updateScore();
});

const gameLoop = setInterval(() => {
  if (!gameActive) return;
  
  const characterTop = parseFloat(
    window.getComputedStyle(character).getPropertyValue("top")
  );
  
  // Get block position - it moves via 'right' property
  const blockRight = parseFloat(
    window.getComputedStyle(block).getPropertyValue("right")
  );
  
  // Calculate block's actual position on screen
  // Block width is 10vw
  const blockWidth = gameWidth * 0.1;
  const blockLeftEdge = gameWidth - blockRight - blockWidth;
  const blockRightEdge = gameWidth - blockRight;
  
  const holeTop = parseFloat(
    window.getComputedStyle(hole).getPropertyValue("top")
  );
  
  // Character dimensions (3vw x 3vw)
  const characterWidth = gameWidth * 0.03;
  const characterHeight = gameWidth * 0.03; // Using width for square aspect
  const characterLeft = gameWidth * 0.2; // 20vw from CSS
  const characterBottom = characterTop + characterHeight;
  
  // Hole height is 30vh
  const holeHeight = gameHeight * 0.3;
  
  // Handle gravity when the character isn't jumping
  if (!jumping) {
    character.style.top = characterTop + gameHeight * 0.006 + "px";
  }
  
  // Check if character is in the horizontal range of the block
  const isInBlockRange = 
    characterLeft + characterWidth > blockLeftEdge && 
    characterLeft < blockRightEdge;
  
  // Check if character is outside the hole vertically
  const isOutsideHoleRange = 
    characterTop < holeTop || 
    characterBottom > holeTop + holeHeight;
  
  // Check collision with ground (bottom of viewport)
  if (characterTop >= gameHeight * 0.97) {
    gameOver();
  }
  
  // Check collision with pipe
  if (isInBlockRange && isOutsideHoleRange) {
    gameOver();
  }
}, 10);

function jump() {
  if (!gameActive || jumping) return;
  jumping = true;
  let jumpCount = 0;
  
  const jumpInterval = setInterval(() => {
    const characterTop = parseFloat(
      window.getComputedStyle(character).getPropertyValue("top")
    );
    
    if (jumpCount < 15 && characterTop > gameHeight * 0.01) {
      character.style.top = characterTop - gameHeight * 0.008 + "px";
    }
    
    jumpCount++;
    
    if (jumpCount > 20) {
      clearInterval(jumpInterval);
      jumping = false;
    }
  }, 10);
}

function gameOver() {
  if (!gameActive) return; // Prevent multiple game over calls
  gameActive = false;
  document.getElementById("finalScore").textContent = Math.max(0, counter);
  document.getElementById("scoreModal").style.display = "block";
  block.style.animationPlayState = "paused";
  hole.style.animationPlayState = "paused";
}

function restartGame() {
  gameActive = true;
  counter = 0;
  updateScore();
  jumping = false;
  
  // Reset character position
  character.style.top = "20vh";
  
  // Reset animations
  block.style.animation = "none";
  hole.style.animation = "none";
  
  // Force reflow
  void block.offsetWidth;
  void hole.offsetWidth;
  
  // Restart animations
  block.style.animation = "block 2s infinite linear";
  hole.style.animation = "block 2s infinite linear";
  block.style.animationPlayState = "running";
  hole.style.animationPlayState = "running";
  
  // Hide modal
  document.getElementById("scoreModal").style.display = "none";
}

// Prevent jump when clicking modal/restart button
document.addEventListener("click", (event) => {
  if (event.target.id === "restartButton" || 
      event.target.closest(".modal-content")) {
    event.stopPropagation();
  }
});

// Touch event handling
document.addEventListener("touchstart", (event) => {
  if (event.target.id === "restartButton" || 
      event.target.closest(".modal-content")) {
    event.stopPropagation();
  }
});

// Spacebar for jumping (desktop)
document.addEventListener("keydown", (event) => {
  if (event.code === "Space" && gameActive) {
    event.preventDefault();
    jump();
  }
});

// Restart button
document.getElementById("restartButton").addEventListener("click", restartGame);

// Handle window resize
window.addEventListener("resize", () => {
  gameWidth = window.innerWidth;
  gameHeight = window.innerHeight;
});
