// Game state
let gameState = {
    lives: 3,
    coins: 0,
    currentRound: 1,
    bestStreak: 0,
    currentStreak: 0,
    totalError: 0,
    totalRounds: 0,
    trueCorrelation: 0,
    chart: null
};

// Initialize the game
function initializeGame() {
    gameState = {
        lives: 3,
        coins: 0,
        currentRound: 1,
        bestStreak: 0,
        currentStreak: 0,
        totalError: 0,
        totalRounds: 0,
        trueCorrelation: 0,
        chart: null
    };
    
    setupEventListeners();
    generateNewScatterPlot();
    updateDisplay();
}

// Set up event listeners
function setupEventListeners() {
    const guessSlider = document.getElementById('correlationGuess');
    const guessValue = document.getElementById('guessValue');
    
    // Update guess value display when slider changes
    guessSlider.addEventListener('input', function() {
        guessValue.textContent = parseFloat(this.value).toFixed(2);
        updateSliderBackground(this);
    });
    
    // Initialize slider background
    updateSliderBackground(guessSlider);
}

// Update slider background based on value
function updateSliderBackground(slider) {
    const value = (slider.value - slider.min) / (slider.max - slider.min) * 100;
    slider.style.background = `linear-gradient(to right, #2563eb 0%, #2563eb ${value}%, #e0e0e0 ${value}%, #e0e0e0 100%)`;
}

// Generate new scatter plot data
function generateNewScatterPlot() {
    const data = generateCorrelationData();
    gameState.trueCorrelation = data.trueCorrelation;
    createScatterPlot(data.x, data.y);
}

function generateCorrelationData() {
    // Generate a random correlation coefficient between 0 and 1
    const trueCorrelation = Math.random();
    
    // Generate 50 data points
    const n = 50;
    const x = [];
    const y = [];
    
    // Generate x values with some randomness
    for (let i = 0; i < n; i++) {
        x.push(Math.random() * 100);
    }
    
    // Generate y values based on correlation
    for (let i = 0; i < n; i++) {
        // Add correlation component
        const correlatedComponent = trueCorrelation * x[i];
        
        // Add noise component (uncorrelated)
        const noise = (1 - trueCorrelation) * Math.random() * 100;
        
        y.push(correlatedComponent + noise);
    }
    
    // Calculate the actual correlation from the generated data
    const actualCorrelation = calculateCorrelation(x, y);
    
    // Calculate R² (squared correlation)
    const trueR2 = actualCorrelation * actualCorrelation;
    
    return {
        x: x,
        y: y,
        trueCorrelation: trueR2
    };
}

function calculateCorrelation(x, y) {
    const n = x.length;
    
    // Calculate means
    const meanX = x.reduce((sum, val) => sum + val, 0) / n;
    const meanY = y.reduce((sum, val) => sum + val, 0) / n;
    
    // Calculate covariance and standard deviations
    let covariance = 0;
    let sumSqX = 0;
    let sumSqY = 0;
    
    for (let i = 0; i < n; i++) {
        const dx = x[i] - meanX;
        const dy = y[i] - meanY;
        covariance += dx * dy;
        sumSqX += dx * dx;
        sumSqY += dy * dy;
    }
    
    // Calculate correlation coefficient
    const correlation = covariance / Math.sqrt(sumSqX * sumSqY);
    return correlation;
}

function createScatterPlot(x, y) {
    const ctx = document.getElementById('scatterPlot').getContext('2d');
    
    // Destroy existing chart if it exists
    if (gameState.chart) {
        gameState.chart.destroy();
    }
    
    // Prepare data for Chart.js
    const data = x.map((xVal, index) => ({
        x: xVal,
        y: y[index]
    }));
    
    const config = {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Data Points',
                data: data,
                backgroundColor: 'rgba(37, 99, 235, 0.6)',
                borderColor: 'rgba(37, 99, 235, 1)',
                borderWidth: 1,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `(${context.parsed.x.toFixed(1)}, ${context.parsed.y.toFixed(1)})`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'X Variable',
                        color: '#6b7280'
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    },
                    ticks: {
                        color: '#6b7280'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Y Variable',
                        color: '#6b7280'
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    },
                    ticks: {
                        color: '#6b7280'
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'point'
            }
        }
    };
    
    gameState.chart = new Chart(ctx, config);
}

function submitGuess() {
    const guessSlider = document.getElementById('correlationGuess');
    const userGuess = parseFloat(guessSlider.value);
    
    // Calculate difference
    const difference = Math.abs(userGuess - gameState.trueCorrelation);
    
    // Determine score based on difference
    let score = 0;
    
    if (difference <= 0.05) {
        score = 3;
    } else if (difference <= 0.10) {
        score = 2;
    } else {
        score = 0;
    }
    
    // Update game state
    if (score > 0) {
        gameState.currentStreak++;
        if (gameState.currentStreak > gameState.bestStreak) {
            gameState.bestStreak = gameState.currentStreak;
        }
    } else {
        gameState.currentStreak = 0;
    }
    
    // Update lives and coins
    if (score === 3) {
        gameState.lives = Math.min(gameState.lives + 1, 5);
        gameState.coins += 5;
    } else if (score === 2) {
        gameState.coins += 1;
    } else {
        gameState.lives--;
    }
    
    // Update statistics
    gameState.totalError += difference;
    gameState.totalRounds++;
    
    // Show result
    showResult(userGuess, gameState.trueCorrelation, difference);
    
    // Check if game over
    if (gameState.lives <= 0) {
        setTimeout(showGameOver, 2000);
    }
}

function showResult(userGuess, trueCorrelation, difference) {
    const resultSection = document.getElementById('resultSection');
    const userGuessElement = document.getElementById('userGuess');
    const trueCorrelationElement = document.getElementById('trueCorrelation');
    const differenceElement = document.getElementById('difference');
    const scoreChangeElement = document.getElementById('scoreChange');
    const scoreMessageElement = document.getElementById('scoreMessage');
    
    userGuessElement.textContent = userGuess.toFixed(3);
    trueCorrelationElement.textContent = trueCorrelation.toFixed(3);
    differenceElement.textContent = difference.toFixed(3);
    
    // Determine score and message
    let score = 0;
    let message = '';
    let isPositive = false;
    
    if (difference <= 0.05) {
        score = 3;
        const excellentMessages = [
            "🎯 Perfect! Your R² intuition is spot on! +1 life, +5 coins!",
            "🌟 Brilliant! You understand variance like a pro! +1 life, +5 coins!",
            "💎 Exceptional! Your statistical insight is golden! +1 life, +5 coins!",
            "🚀 Amazing! You're an R² prediction master! +1 life, +5 coins!",
            "🏆 Outstanding! Your data interpretation skills are top-tier! +1 life, +5 coins!"
        ];
        message = excellentMessages[Math.floor(Math.random() * excellentMessages.length)];
        isPositive = true;
    } else if (difference <= 0.10) {
        score = 2;
        const goodMessages = [
            "👍 Well done! Solid R² estimation! +1 coin!",
            "✅ Nice work! You're getting the variance concept! +1 coin!",
            "📈 Good call! Your statistical thinking is sharp! +1 coin!",
            "🎉 Nice guess! You're building great R² intuition! +1 coin!",
            "💪 Strong performance! Keep analyzing! +1 coin!"
        ];
        message = goodMessages[Math.floor(Math.random() * goodMessages.length)];
        isPositive = true;
    } else {
        score = 0;
        const poorMessages = [
            "😅 Not quite right. R² can be tricky! -1 life",
            "🤔 Close, but variance is more complex than it looks! -1 life",
            "📉 Missed the mark. Remember: R² measures explained variance! -1 life",
            "💭 That's not quite it. Keep studying the patterns! -1 life",
            "🎯 Off target. Variance interpretation takes practice! -1 life"
        ];
        message = poorMessages[Math.floor(Math.random() * poorMessages.length)];
        isPositive = false;
    }
    
    scoreMessageElement.textContent = message;
    scoreChangeElement.className = `score-change ${isPositive ? 'positive' : 'negative'}`;
    
    resultSection.style.display = 'block';
    
    // Hide submit button
    document.getElementById('submitGuess').style.display = 'none';
}

function nextRound() {
    gameState.currentRound++;
    
    // Hide result section
    document.getElementById('resultSection').style.display = 'none';
    
    // Show submit button
    document.getElementById('submitGuess').style.display = 'flex';
    
    // Generate new scatter plot
    generateNewScatterPlot();
    
    // Reset slider
    const guessSlider = document.getElementById('correlationGuess');
    guessSlider.value = 0.5;
    document.getElementById('guessValue').textContent = '0.50';
    updateSliderBackground(guessSlider);
    
    // Update display
    updateDisplay();
}

function updateDisplay() {
    document.getElementById('lives').textContent = gameState.lives;
    document.getElementById('coins').textContent = gameState.coins;
    document.getElementById('currentRound').textContent = gameState.currentRound;
    document.getElementById('bestStreak').textContent = gameState.bestStreak;
    
    const avgError = gameState.totalRounds > 0 ? gameState.totalError / gameState.totalRounds : 0;
    document.getElementById('avgError').textContent = avgError.toFixed(3);
}

function showGameOver() {
    document.getElementById('finalCoins').textContent = gameState.coins;
    document.getElementById('finalRounds').textContent = gameState.totalRounds;
    document.getElementById('finalStreak').textContent = gameState.bestStreak;
    
    document.getElementById('gameOverModal').style.display = 'flex';
}

function restartGame() {
    document.getElementById('gameOverModal').style.display = 'none';
    initializeGame();
}

function goToMainMenu() {
    window.location.href = 'index.html';
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', initializeGame); 