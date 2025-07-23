// Game state variables
let gameState = {
    lives: 3,
    coins: 0,
    currentRound: 1,
    bestStreak: 0,
    currentStreak: 0,
    totalGuesses: 0,
    totalError: 0,
    trueVolatility: 0,
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
    const guessInput = document.getElementById('volatilityGuess');
    
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
    // Generate price data using GBM with Sharpe and volatility constraints
    const { priceData, returns, annualReturn, annualVol } = generateGBMPriceData(252); // 252 trading days
    
    gameState.priceData = priceData;
    gameState.returns = returns;
    gameState.annualReturn = annualReturn;
    gameState.trueVolatility = annualVol;
    
    // Create or update the chart
    createPriceChart();
}

function generateGBMPriceData(numDays) {
    // GBM parameters
    const dt = 1/252; // Daily time step
    const initialPrice = 100;
    
    // Generate a random Sharpe ratio between -3 and 3
    const sharpeRatio = -3 + Math.random() * 6;
    
    // Generate a random volatility between 0.1 (10%) and 1.2 (120%)
    const targetVolDecimal = 0.1 + Math.random() * 1.1;
    
    // Set mean return to 0 for all cases
    const requiredAnnualReturn = 0;
    
    // Convert to daily parameters
    const dailyVolatility = targetVolDecimal / Math.sqrt(252);
    const dailyReturn = requiredAnnualReturn / 252;
    
    const prices = [initialPrice];
    const returns = [];
    
    // Generate GBM with exact parameters
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
    const actualAnnualVol = stdDev * Math.sqrt(252) * 100; // Convert to percentage
    
    return {
        priceData: prices,
        returns: returns,
        annualReturn: actualAnnualReturn,
        annualVol: actualAnnualVol
    };
}

function createPriceChart() {
    const ctx = document.getElementById('priceChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (gameState.chart) {
        gameState.chart.destroy();
    }
    
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
    const guessInput = document.getElementById('volatilityGuess');
    const userGuess = parseFloat(guessInput.value);
    
    // Validate input
    if (isNaN(userGuess)) {
        alert('Please enter a valid number');
        return;
    }
    
    const difference = Math.abs(userGuess - gameState.trueVolatility);
    
    // Calculate score
    let scoreChange = 0;
    let lifeChange = 0;
    let message = '';
    let isPositive = false;
    
    if (difference <= 5) {
        // Excellent guess
        scoreChange = 8;
        lifeChange = 1;
        gameState.currentStreak++;
        const excellentMessages = [
            "🎯 Perfect! Your volatility intuition is spot on! +8 coins, +1 life!",
            "🌟 Brilliant! You understand price movements perfectly! +8 coins, +1 life!",
            "💎 Exceptional! Your risk assessment is golden! +8 coins, +1 life!",
            "🚀 Amazing! You're a volatility prediction master! +8 coins, +1 life!",
            "🏆 Outstanding! Your market analysis is top-tier! +8 coins, +1 life!"
        ];
        message = excellentMessages[Math.floor(Math.random() * excellentMessages.length)];
        isPositive = true;
    } else if (difference <= 10) {
        // Good guess
        scoreChange = 3;
        gameState.currentStreak++;
        const goodMessages = [
            "👍 Well done! Solid volatility estimation! +3 coins!",
            "✅ Nice work! You're getting the price movement concept! +3 coins!",
            "📈 Good call! Your market thinking is sharp! +3 coins!",
            "🎉 Nice guess! You're building great volatility intuition! +3 coins!",
            "💪 Strong performance! Keep analyzing the swings! +3 coins!"
        ];
        message = goodMessages[Math.floor(Math.random() * goodMessages.length)];
        isPositive = true;
    } else if (difference <= 20) {
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
            "😅 Not quite right. Volatility can be tricky! -1 life",
            "🤔 Close, but price movements are more complex than they look! -1 life",
            "📉 Missed the mark. Remember: volatility measures price swings! -1 life",
            "💭 That's not quite it. Keep studying the market movements! -1 life",
            "🎯 Off target. Volatility interpretation takes practice! -1 life"
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
    showResult(userGuess, gameState.trueVolatility, difference, message, isPositive);
    
    // Disable submit button
    document.getElementById('submitGuess').disabled = true;
}

function showResult(userGuess, trueVolatility, difference, message, isPositive) {
    const resultSection = document.getElementById('resultSection');
    const resultTitle = document.getElementById('resultTitle');
    const userGuessSpan = document.getElementById('userGuess');
    const trueVolatilitySpan = document.getElementById('trueVolatility');
    const differenceSpan = document.getElementById('difference');
    const annualReturnSpan = document.getElementById('annualReturn');
    const sharpeRatioSpan = document.getElementById('sharpeRatio');
    const scoreMessage = document.getElementById('scoreMessage');
    const scoreChange = document.getElementById('scoreChange');
    
    // Update result content
    userGuessSpan.textContent = userGuess.toFixed(1) + '%';
    trueVolatilitySpan.textContent = trueVolatility.toFixed(1) + '%';
    differenceSpan.textContent = difference.toFixed(1) + '%';
    annualReturnSpan.textContent = (gameState.annualReturn * 100).toFixed(1) + '%';
    sharpeRatioSpan.textContent = (gameState.annualReturn / (trueVolatility / 100)).toFixed(2);
    scoreMessage.textContent = message;
    
    // Update score change styling
    scoreChange.className = 'score-change ' + (isPositive ? 'positive' : 'negative');
    
    // Show result section
    resultSection.style.display = 'block';
    
    // Update display
    updateDisplay();
    
    // Check for game over
    if (gameState.lives <= 0) {
        setTimeout(showGameOver, 2000);
    }
}

function nextRound() {
    // Hide result section
    document.getElementById('resultSection').style.display = 'none';
    
    // Reset guess input
    const guessInput = document.getElementById('volatilityGuess');
    guessInput.value = 0;
    
    // Enable submit button
    document.getElementById('submitGuess').disabled = false;
    
    // Generate new chart
    generateNewPriceChart();
    
    // Update round counter
    gameState.currentRound++;
    updateDisplay();
}

function updateDisplay() {
    document.getElementById('lives').textContent = gameState.lives;
    document.getElementById('coins').textContent = gameState.coins;
    document.getElementById('currentRound').textContent = gameState.currentRound;
    document.getElementById('bestStreak').textContent = gameState.bestStreak;
    
    if (gameState.totalGuesses > 0) {
        const avgError = gameState.totalError / gameState.totalGuesses;
        document.getElementById('avgError').textContent = avgError.toFixed(1) + '%';
    }
}

function showGameOver() {
    document.getElementById('finalCoins').textContent = gameState.coins;
    document.getElementById('finalRounds').textContent = gameState.currentRound - 1;
    document.getElementById('finalStreak').textContent = gameState.bestStreak;
    document.getElementById('gameOverModal').style.display = 'flex';
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
        trueVolatility: 0,
        priceData: [],
        returns: [],
        chart: null
    };
    
    // Hide modal
    document.getElementById('gameOverModal').style.display = 'none';
    
    // Reset UI
    document.getElementById('resultSection').style.display = 'none';
    const guessInput = document.getElementById('volatilityGuess');
    guessInput.value = 0;
    document.getElementById('submitGuess').disabled = false;
    
    // Initialize new game
    initializeGame();
}

function goToMainMenu() {
    window.location.href = 'index.html';
} 