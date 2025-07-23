// Game state variables
let gameState = {
    lives: 3,
    coins: 0,
    currentRound: 1,
    bestStreak: 0,
    currentStreak: 0,
    totalGuesses: 0,
    totalError: 0,
    trueCorrelation: 0,
    scatterData: [],
    chart: null
};

// Initialize the game
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
    setupEventListeners();
});

function initializeGame() {
    updateDisplay();
    generateNewScatterPlot();
}

function setupEventListeners() {
    // Update guess value display when slider changes
    const guessSlider = document.getElementById('correlationGuess');
    const guessValue = document.getElementById('guessValue');
    
    // Initialize the display value and progress bar
    guessValue.textContent = parseFloat(guessSlider.value).toFixed(2);
    
    // Ensure proper initialization with a small delay
    setTimeout(() => {
        updateSliderBackground(guessSlider);
    }, 10);
    
    guessSlider.addEventListener('input', function() {
        guessValue.textContent = parseFloat(this.value).toFixed(2);
        updateSliderBackground(this);
    });

    // Enter key to submit guess
    guessSlider.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            submitGuess();
        }
    });
}

function updateSliderBackground(slider) {
    const value = (slider.value - slider.min) / (slider.max - slider.min) * 100;
    slider.style.background = `linear-gradient(to right, #2563eb 0%, #2563eb ${value}%, #e0e0e0 ${value}%, #e0e0e0 100%)`;
}

function generateNewScatterPlot() {
    // Generate a random correlation between 0 and 1
    gameState.trueCorrelation = Math.random();
    
    // Generate scatter plot data based on the correlation
    gameState.scatterData = generateScatterData(gameState.trueCorrelation, 50);
    
    // Create or update the chart
    createScatterChart();
}

function generateScatterData(correlation, numPoints) {
    const data = [];
    
    // Generate data with proper statistical correlation
    for (let i = 0; i < numPoints; i++) {
        // Generate x values in range -50 to 50
        const x = (Math.random() - 0.5) * 100;
        
        let y;
        if (correlation === 0) {
            // No correlation - random y values
            y = (Math.random() - 0.5) * 100;
        } else {
            // Generate correlated y values using proper statistical method
            // Standardize x to mean 0, std dev 1
            const xStd = x / 50; // Approximate standardization
            
            // Generate correlated y using the formula: Y = ρX + √(1-ρ²)Z
            // where ρ is correlation, X is standardized x, Z is random noise
            const z = (Math.random() - 0.5) * 2; // Random noise with mean 0, std dev ~1
            const yStd = correlation * xStd + Math.sqrt(1 - correlation * correlation) * z;
            
            // Scale back to our range
            y = yStd * 50;
        }
        
        data.push({ x: x, y: y });
    }
    
    return data;
}

function createScatterChart() {
    const ctx = document.getElementById('scatterPlot').getContext('2d');
    
    // Destroy existing chart if it exists
    if (gameState.chart) {
        gameState.chart.destroy();
    }
    
    // Prepare data for Chart.js
    const chartData = {
        datasets: [
            {
                label: 'Data Points',
                data: gameState.scatterData,
                backgroundColor: 'rgba(37, 99, 235, 0.6)',
                borderColor: 'rgba(37, 99, 235, 1)',
                borderWidth: 1,
                pointRadius: 4,
                pointHoverRadius: 6
            },
            // Add reference lines for quadrants
            {
                label: 'X-axis',
                data: [{x: -60, y: 0}, {x: 60, y: 0}],
                type: 'line',
                borderColor: 'rgba(107, 114, 128, 0.3)',
                borderWidth: 1,
                pointRadius: 0,
                fill: false
            },
            {
                label: 'Y-axis',
                data: [{x: 0, y: -60}, {x: 0, y: 60}],
                type: 'line',
                borderColor: 'rgba(107, 114, 128, 0.3)',
                borderWidth: 1,
                pointRadius: 0,
                fill: false
            }
        ]
    };
    
    const config = {
        type: 'scatter',
        data: chartData,
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
                            if (context.dataset.label === 'Data Points') {
                                return `(${context.parsed.x.toFixed(1)}, ${context.parsed.y.toFixed(1)})`;
                            }
                            return null;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    min: -60,
                    max: 60,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    },
                    ticks: {
                        color: '#6b7280',
                        stepSize: 20
                    }
                },
                y: {
                    type: 'linear',
                    min: -60,
                    max: 60,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    },
                    ticks: {
                        color: '#6b7280',
                        stepSize: 20
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
    const difference = Math.abs(userGuess - gameState.trueCorrelation);
    
    // Calculate score
    let scoreChange = 0;
    let lifeChange = 0;
    let message = '';
    let isPositive = false;
    
    if (difference <= 0.05) {
        // Excellent guess
        scoreChange = 5;
        lifeChange = 1;
        gameState.currentStreak++;
        const excellentMessages = [
            "🎯 Bullseye! Perfect correlation intuition! +5 coins, +1 life!",
            "🌟 Outstanding! Your statistical sense is spot on! +5 coins, +1 life!",
            "💎 Diamond hands! You nailed that correlation! +5 coins, +1 life!",
            "🚀 Phenomenal! You're a correlation master! +5 coins, +1 life!",
            "🏆 Champion! Your data intuition is legendary! +5 coins, +1 life!"
        ];
        message = excellentMessages[Math.floor(Math.random() * excellentMessages.length)];
        isPositive = true;
    } else if (difference <= 0.10) {
        // Good guess
        scoreChange = 1;
        gameState.currentStreak++;
        const goodMessages = [
            "👍 Nice work! Solid correlation reading! +1 coin!",
            "✅ Good call! You're getting the hang of this! +1 coin!",
            "📈 Well done! Your statistical eye is sharp! +1 coin!",
            "🎉 Nice guess! You're building great intuition! +1 coin!",
            "💪 Strong performance! Keep it up! +1 coin!"
        ];
        message = goodMessages[Math.floor(Math.random() * goodMessages.length)];
        isPositive = true;
    } else {
        // Poor guess
        lifeChange = -1;
        gameState.currentStreak = 0;
        const poorMessages = [
            "😅 Not quite there yet. Keep practicing! -1 life",
            "🤔 Close, but no cigar. Don't give up! -1 life",
            "📉 Missed the mark this time. You'll get it next time! -1 life",
            "💭 That's not quite right. Learn from this one! -1 life",
            "🎯 Off target, but every miss is a learning opportunity! -1 life"
        ];
        message = poorMessages[Math.floor(Math.random() * poorMessages.length)];
        isPositive = false;
    }
    
    // Update game state
    gameState.coins += scoreChange;
    gameState.lives += lifeChange;
    gameState.totalGuesses++;
    gameState.totalError += difference;
    
    // Update best streak
    if (gameState.currentStreak > gameState.bestStreak) {
        gameState.bestStreak = gameState.currentStreak;
    }
    
    // Show result
    showResult(userGuess, gameState.trueCorrelation, difference, message, isPositive);
    
    // Disable submit button
    document.getElementById('submitGuess').disabled = true;
}

function showResult(userGuess, trueCorrelation, difference, message, isPositive) {
    const resultSection = document.getElementById('resultSection');
    const resultTitle = document.getElementById('resultTitle');
    const userGuessSpan = document.getElementById('userGuess');
    const trueCorrelationSpan = document.getElementById('trueCorrelation');
    const differenceSpan = document.getElementById('difference');
    const scoreMessage = document.getElementById('scoreMessage');
    const scoreChange = document.getElementById('scoreChange');
    
    // Update result content
    resultTitle.textContent = isPositive ? 'Great Job!' : 'Try Again!';
    userGuessSpan.textContent = userGuess.toFixed(2);
    trueCorrelationSpan.textContent = trueCorrelation.toFixed(2);
    differenceSpan.textContent = difference.toFixed(2);
    scoreMessage.textContent = message;
    
    // Update score change styling
    scoreChange.className = `score-change ${isPositive ? 'positive' : 'negative'}`;
    
    // Show result section
    resultSection.style.display = 'block';
    
    // Update display
    updateDisplay();
    
    // Check if game over
    if (gameState.lives <= 0) {
        setTimeout(() => {
            showGameOver();
        }, 2000);
    }
}

function nextRound() {
    // Hide result section
    document.getElementById('resultSection').style.display = 'none';
    
    // Reset guess slider
    const guessSlider = document.getElementById('correlationGuess');
    guessSlider.value = 0.5;
    document.getElementById('guessValue').textContent = '0.50';
    
    // Enable submit button
    document.getElementById('submitGuess').disabled = false;
    
    // Generate new scatter plot
    gameState.currentRound++;
    generateNewScatterPlot();
    
    // Update display
    updateDisplay();
}

function updateDisplay() {
    // Update lives and coins
    document.getElementById('lives').textContent = gameState.lives;
    document.getElementById('coins').textContent = gameState.coins;
    
    // Update round
    document.getElementById('currentRound').textContent = gameState.currentRound;
    
    // Update best streak
    document.getElementById('bestStreak').textContent = gameState.bestStreak;
    
    // Update average error
    const avgError = gameState.totalGuesses > 0 ? gameState.totalError / gameState.totalGuesses : 0;
    document.getElementById('avgError').textContent = avgError.toFixed(2);
}

function showGameOver() {
    const modal = document.getElementById('gameOverModal');
    const finalCoins = document.getElementById('finalCoins');
    const finalRounds = document.getElementById('finalRounds');
    const finalStreak = document.getElementById('finalStreak');
    
    // Update final stats
    finalCoins.textContent = gameState.coins;
    finalRounds.textContent = gameState.currentRound;
    finalStreak.textContent = gameState.bestStreak;
    
    // Show modal
    modal.style.display = 'flex';
}

function restartGame() {
    // Reset game state
    gameState = {
        lives: 3,
        coins: 0,
        currentRound: 1,
        bestStreak: 0,
        currentStreak: 0,
        totalGuesses: 0,
        totalError: 0,
        trueCorrelation: 0,
        scatterData: [],
        chart: null
    };
    
    // Hide modal
    document.getElementById('gameOverModal').style.display = 'none';
    
    // Hide result section
    document.getElementById('resultSection').style.display = 'none';
    
    // Reset guess slider
    const guessSlider = document.getElementById('correlationGuess');
    guessSlider.value = 0.5;
    document.getElementById('guessValue').textContent = '0.50';
    
    // Enable submit button
    document.getElementById('submitGuess').disabled = false;
    
    // Initialize new game
    initializeGame();
}

function goToMainMenu() {
    window.location.href = 'index.html';
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !document.getElementById('submitGuess').disabled) {
        submitGuess();
    } else if (e.key === 'Escape') {
        goToMainMenu();
    }
});

// Add some visual feedback for the slider
document.getElementById('correlationGuess').addEventListener('input', function() {
    const value = this.value;
    const percentage = (value * 100).toFixed(0);
    
    // Update the slider background to show progress
    this.style.background = `linear-gradient(to right, #2563eb 0%, #2563eb ${percentage}%, #e0e0e0 ${percentage}%, #e0e0e0 100%)`;
});

// Initialize slider background
document.addEventListener('DOMContentLoaded', function() {
    const slider = document.getElementById('correlationGuess');
    const value = slider.value;
    const percentage = (value * 100).toFixed(0);
    slider.style.background = `linear-gradient(to right, #2563eb 0%, #2563eb ${percentage}%, #e0e0e0 ${percentage}%, #e0e0e0 100%)`;
}); 