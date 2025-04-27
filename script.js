let cardCount = 8;
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let totalPairs = 0;
let moveCount = 0;
let timerInterval = null;
let gameTime = 0;
let canFlip = true;
let isDarkTheme = false;

// DOM Elements
const setupSection = document.getElementById('setupSection');
const gameSection = document.getElementById('gameSection');
const cardContainer = document.getElementById('cardContainer');
const cardCountInput = document.getElementById('cardCount');
const errorMessage = document.getElementById('errorMessage');
const startGameBtn = document.getElementById('startGame');
const restartGameBtn = document.getElementById('restartGame');
const movesDisplay = document.getElementById('moves');
const timerDisplay = document.getElementById('timer');
const pairsDisplay = document.getElementById('pairs');
const themeToggleBtn = document.getElementById('themeToggle');

// Event Listeners
startGameBtn.addEventListener('click', validateAndStart);
restartGameBtn.addEventListener('click', resetGame);
themeToggleBtn.addEventListener('click', toggleTheme);

// Validation and Game Start
function validateAndStart() {
    const count = parseInt(cardCountInput.value);
    
    // Validate input
    if (isNaN(count) || count < 4 || count > 100) {
        showError('Please enter a number between 4 and 100');
        return;
    }
    
    if (count % 2 !== 0) {
        showError('Please enter an even number');
        return;
    }
    
    // Clear any previous errors
    showError('');
    
    // Set card count and start game
    cardCount = count;
    startGame();
}

function showError(message) {
    errorMessage.textContent = message;
}

// Game Setup
function startGame() {
    // Hide setup, show game
    setupSection.style.display = 'none';
    gameSection.style.display = 'block';
    
    // Reset game state
    flippedCards = [];
    matchedPairs = 0;
    moveCount = 0;
    gameTime = 0;
    totalPairs = cardCount / 2;
    canFlip = true;
    
    // Update displays
    movesDisplay.textContent = `Moves: ${moveCount}`;
    timerDisplay.textContent = `Time: ${gameTime}s`;
    pairsDisplay.textContent = `Pairs: ${matchedPairs}/${totalPairs}`;
    
    // Generate cards
    generateCards();
    
    // Start timer
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        gameTime++;
        timerDisplay.textContent = `Time: ${gameTime}s`;
    }, 1000);
}

function generateCards() {
    // Clear container
    cardContainer.innerHTML = '';
    
    // Generate card values (pairs)
    cards = [];
    for (let i = 0; i < cardCount / 2; i++) {
        const value = Math.floor(Math.random() * 100) + 1;
        cards.push(value, value);
    }
    
    // Shuffle cards
    shuffleArray(cards);
    
    // Create card elements
    cards.forEach((value, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = index;
        card.dataset.value = value;
        card.innerHTML = `
            <div class="card-face card-front">${value}</div>
            <div class="card-face card-back">?</div>
        `;
        card.addEventListener('click', () => flipCard(card));
        cardContainer.appendChild(card);
    });
    
    // Adjust grid for better appearance based on card count
    const columns = Math.min(Math.ceil(Math.sqrt(cardCount)), 8);
    cardContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Game Logic
function flipCard(card) {
    const index = parseInt(card.dataset.index);
    
    // Don't allow flipping if:
    // - Game is temporarily locked
    // - Card is already flipped
    // - Card is already matched
    // - Same card is clicked twice
    if (!canFlip || 
        card.classList.contains('flipped') || 
        card.classList.contains('matched') ||
        (flippedCards.length === 1 && parseInt(flippedCards[0].dataset.index) === index)) {
        return;
    }
    
    // Flip the card
    card.classList.add('flipped');
    flippedCards.push(card);
    
    // If two cards are flipped, check for match
    if (flippedCards.length === 2) {
        moveCount++;
        movesDisplay.textContent = `Moves: ${moveCount}`;
        
        // Check for match
        if (flippedCards[0].dataset.value === flippedCards[1].dataset.value) {
            // Mark as matched
            flippedCards.forEach(c => {
                c.classList.add('matched');
                c.style.cursor = 'default';
            });
            matchedPairs++;
            pairsDisplay.textContent = `Pairs: ${matchedPairs}/${totalPairs}`;
            
            // Check for game completion
            if (matchedPairs === totalPairs) {
                gameOver();
            }
            
            flippedCards = [];
        } else {
            // Not a match, flip back after delay
            canFlip = false;
            setTimeout(() => {
                flippedCards.forEach(c => c.classList.remove('flipped'));
                flippedCards = [];
                canFlip = true;
            }, 1000);
        }
    }
}

function gameOver() {
    clearInterval(timerInterval);
    
    // Create game over message
    const gameOverMessage = document.createElement('div');
    gameOverMessage.className = 'game-over';
    gameOverMessage.textContent = `Congratulations! You won in ${moveCount} moves and ${gameTime} seconds!`;
    gameSection.insertBefore(gameOverMessage, cardContainer.nextSibling);
    
    // Create confetti effect
    createConfetti();
}

function createConfetti() {
    const colors = ['#f00', '#0f0', '#00f', '#ff0', '#0ff', '#f0f', '#ff8800', '#8800ff'];
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = `${Math.random() * 10 + 5}px`;
        confetti.style.height = `${Math.random() * 10 + 5}px`;
        confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
        confetti.style.animationDelay = `${Math.random() * 2}s`;
        
        document.body.appendChild(confetti);
        
        // Remove confetti after animation
        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
}

function resetGame() {
    // Remove game over message if exists
    const gameOverMessage = document.querySelector('.game-over');
    if (gameOverMessage) {
        gameOverMessage.remove();
    }
    
    // Go back to setup
    setupSection.style.display = 'block';
    gameSection.style.display = 'none';
    
    // Stop timer
    clearInterval(timerInterval);
}

function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    document.body.classList.toggle('dark-theme', isDarkTheme);
    themeToggleBtn.textContent = isDarkTheme ? 'Light Theme' : 'Switch Theme';
}  