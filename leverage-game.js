// Game state variables
let gameState = {
    lives: 3,
    coins: 0,
    currentRound: 1,
    bestStreak: 0,
    currentStreak: 0,
    totalGuesses: 0,
    totalError: 0,
    trueLeverage: 0,
    priceData: [],
    returns: [],
    chart: null
};

// Initialize the game
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
    setupEventListeners();
});

function initializeGame() {
    updateDisplay();
    generateNewPriceChart();
}

function setupEventListeners() {
    // Handle number input for guess
    const guessInput = document.getElementById('leverageGuess');
    
    // Enter key to submit guess
    guessInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            submitGuess();
        }
    });
    
    // Round to 2 decimal places on blur
    guessInput.addEventListener('blur', function() {
        const value = parseFloat(this.value);
        if (!isNaN(value)) {
            this.value = value.toFixed(2);
        }
    });
}

function generateNewPriceChart() {
    // Generate a random optimal leverage between 0.5 and 3
    const targetLeverage = 0.5 + Math.random() * 2.5;
    
    // Generate price data using GBM with the target leverage
    const { priceData, returns, annualReturn, annualVol } = generateGBMPriceData(targetLeverage, 252); // 252 trading days
    
    gameState.priceData = priceData;
    gameState.returns = returns;
    gameState.annualReturn = annualReturn;
    gameState.annualVol = annualVol;
    
    // Create or update the chart
    createPriceChart();
}

function generateGBMPriceData(targetLeverage, numDays) {
    // GBM parameters
    const dt = 1/252; // Daily time step
    const initialPrice = 100;
    
    // Step 1: Choose a reasonable annual volatility (10% to 50%)
    const annualVolatility = 0.10 + Math.random() * 0.40;
    
    // Step 2: Calculate required annual return to achieve target leverage
    // Leverage* = (μ - r) / (γσ²) = Sharpe / σ
    // Since r = 0 and γ = 1, we have: Leverage* = μ / σ²
    // Therefore: μ = Leverage* * σ²
    const requiredAnnualReturn = targetLeverage * Math.pow(annualVolatility, 2);
    
    // Ensure positive Sharpe ratio (positive return)
    if (requiredAnnualReturn <= 0) {
        // If leverage would result in negative return, adjust to ensure positive Sharpe
        const minSharpe = 0.1; // Minimum Sharpe ratio of 0.1
        const adjustedReturn = minSharpe * annualVolatility;
        const adjustedLeverage = adjustedReturn / Math.pow(annualVolatility, 2);
        gameState.trueLeverage = adjustedLeverage;
    } else {
        gameState.trueLeverage = targetLeverage;
    }
    
    // Step 3: Convert to daily parameters
    const dailyVolatility = annualVolatility / Math.sqrt(252);
    const dailyReturn = Math.max(requiredAnnualReturn, 0.1 * annualVolatility) / 252;
    
    const prices = [initialPrice];
    const returns = [];
    
    // Step 4: Generate GBM with exact parameters
    for (let i = 1; i < numDays; i++) {
        // GBM formula: dS = S(μdt + σ√dt * Z)
        const randomShock = (Math.random() - 0.5) * 2; // Standard normal approximation
        const dailyReturnWithNoise = dailyReturn + dailyVolatility * randomShock;
        
        const newPrice = prices[i-1] * (1 + dailyReturnWithNoise);
        prices.push(newPrice);
        returns.push(dailyReturnWithNoise);
    }
    
    // Calculate actual statistics from generated data
    const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    const actualAnnualReturn = meanReturn * 252;
    const actualAnnualVol = stdDev * Math.sqrt(252);
    const actualLeverage = actualAnnualReturn / Math.pow(actualAnnualVol, 2);
    
    // Use the target leverage as the true value (more predictable)
    gameState.trueLeverage = targetLeverage;
    
    return {
        priceData: prices,
        returns: returns,
        annualReturn: actualAnnualReturn,
        annualVol: actualAnnualVol
    };
}

function createPriceChart() {
    const canvas = document.getElementById('priceChart');
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (gameState.chart) {
        gameState.chart.destroy();
    }
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Prepare data for Chart.js
    const labels = Array.from({length: gameState.priceData.length}, (_, i) => i);
    
    const chartData = {
        labels: labels,
        datasets: [{
            label: 'Stock Price',
            data: gameState.priceData,
            borderColor: 'rgba(37, 99, 235, 1)',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.1,
            pointRadius: 0,
            pointHoverRadius: 0
        }]
    };
    
    const config = {
        type: 'line',
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
                            return `Price: $${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Trading Days',
                        color: '#6b7280'
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    },
                    ticks: {
                        color: '#6b7280',
                        maxTicksLimit: 10
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Price ($)',
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
                mode: 'index'
            }
        }
    };
    
    gameState.chart = new Chart(ctx, config);
}

function submitGuess() {
    const guessInput = document.getElementById('leverageGuess');
    const userGuess = parseFloat(guessInput.value);
    
    // Validate input
    if (isNaN(userGuess)) {
        alert('Please enter a valid number');
        return;
    }
    
    const realizedLeverage = gameState.annualReturn / Math.pow(gameState.annualVol, 2);
    const difference = Math.abs(userGuess - realizedLeverage);
    
    // Calculate score
    let scoreChange = 0;
    let lifeChange = 0;
    let message = '';
    let isPositive = false;
    
    if (difference <= 0.75) {
        // Excellent guess
        scoreChange = 8;
        lifeChange = 1;
        gameState.currentStreak++;
        const excellentMessages = [
            "🎯 Perfect! Your leverage intuition is spot on! +8 coins, +1 life!",
            "🌟 Brilliant! You understand optimal leverage perfectly! +8 coins, +1 life!",
            "💎 Exceptional! Your risk management analysis is golden! +8 coins, +1 life!",
            "🚀 Amazing! You're a leverage optimization master! +8 coins, +1 life!",
            "🏆 Outstanding! Your portfolio theory is top-tier! +8 coins, +1 life!"
        ];
        message = excellentMessages[Math.floor(Math.random() * excellentMessages.length)];
        isPositive = true;
    } else if (difference <= 1.5) {
        // Good guess
        scoreChange = 3;
        gameState.currentStreak++;
        const goodMessages = [
            "👍 Well done! Solid leverage estimation! +3 coins!",
            "✅ Nice work! You're getting the optimal leverage concept! +3 coins!",
            "📈 Good call! Your risk-return thinking is sharp! +3 coins!",
            "🎉 Nice guess! You're building great leverage intuition! +3 coins!",
            "💪 Strong performance! Keep analyzing the risk-return tradeoff! +3 coins!"
        ];
        message = goodMessages[Math.floor(Math.random() * goodMessages.length)];
        isPositive = true;
    } else if (difference <= 2.25) {
        // Acceptable guess
        scoreChange = 1;
        gameState.currentStreak++;
        const okMessages = [
            "👌 Not bad! You're on the right track! +1 coin!",
            "📊 Decent guess! Keep practicing! +1 coin!",
            "🎯 Close enough! You're learning! +1 coin!",
            "💡 Good effort! Every guess helps! +1 coin!",
            "🔍 Nice try! You're improving! +1 coin!"
        ];
        message = okMessages[Math.floor(Math.random() * okMessages.length)];
        isPositive = true;
    } else {
        // Poor guess
        lifeChange = -1;
        gameState.currentStreak = 0;
        const poorMessages = [
            "😅 Not quite right. Optimal leverage can be tricky! -1 life",
            "🤔 Close, but leverage optimization is more complex than it looks! -1 life",
            "📉 Missed the mark. Remember: Leverage* = (μ - r) / (γσ²)! -1 life",
            "💭 That's not quite it. Keep studying the risk-return patterns! -1 life",
            "🎯 Off target. Leverage interpretation takes practice! -1 life"
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
    showResult(userGuess, realizedLeverage, difference, message, isPositive);
    
    // Disable submit button
    document.getElementById('submitGuess').disabled = true;
}

function showResult(userGuess, trueLeverage, difference, message, isPositive) {
    const resultSection = document.getElementById('resultSection');
    const resultTitle = document.getElementById('resultTitle');
    const userGuessSpan = document.getElementById('userGuess');
    const trueLeverageSpan = document.getElementById('trueLeverage');
    const differenceSpan = document.getElementById('difference');
    const annualReturnSpan = document.getElementById('annualReturn');
    const annualVolSpan = document.getElementById('annualVol');
    const scoreMessage = document.getElementById('scoreMessage');
    const scoreChange = document.getElementById('scoreChange');
    
    // Calculate the actual realized leverage using the correct formula: Leverage* = μ / σ²
    const realizedLeverage = gameState.annualReturn / Math.pow(gameState.annualVol, 2);
    
    // Update result content
    resultTitle.textContent = isPositive ? 'Great Job!' : 'Try Again!';
    userGuessSpan.textContent = userGuess.toFixed(2);
    trueLeverageSpan.textContent = realizedLeverage.toFixed(2);
    differenceSpan.textContent = Math.abs(userGuess - realizedLeverage).toFixed(2);
    annualReturnSpan.textContent = (gameState.annualReturn * 100).toFixed(1) + '%';
    annualVolSpan.textContent = (gameState.annualVol * 100).toFixed(1) + '%';
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
    
    // Reset guess input
    const guessInput = document.getElementById('leverageGuess');
    guessInput.value = 1.00;
    
    // Enable submit button
    document.getElementById('submitGuess').disabled = false;
    
    // Generate new price chart
    gameState.currentRound++;
    
    // Small delay to ensure chart updates properly
    setTimeout(() => {
        generateNewPriceChart();
        updateDisplay();
    }, 100);
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
        trueLeverage: 0,
        priceData: [],
        returns: [],
        chart: null
    };
    
    // Hide modal
    document.getElementById('gameOverModal').style.display = 'none';
    
    // Hide result section
    document.getElementById('resultSection').style.display = 'none';
    
    // Reset guess input
    const guessInput = document.getElementById('leverageGuess');
    guessInput.value = 1.00;
    
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