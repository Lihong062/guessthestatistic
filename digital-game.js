// Game state variables
let gameState = {
    lives: 3,
    coins: 0,
    currentRound: 1,
    bestStreak: 0,
    currentStreak: 0,
    totalGuesses: 0,
    totalError: 0,
    trueProbability: 0,
    priceData: [],
    returns: [],
    currentPrice: 0,
    barrierPrice: 0,
    barrierDirection: 'above',
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
    // Update guess value display when slider changes
    const guessSlider = document.getElementById('probabilityGuess');
    const guessValue = document.getElementById('guessValue');
    
    // Initialize the display value and progress bar
    guessValue.textContent = parseFloat(guessSlider.value).toFixed(0) + '%';
    
    // Ensure proper initialization with a small delay
    setTimeout(() => {
        updateSliderBackground(guessSlider);
    }, 10);
    
    guessSlider.addEventListener('input', function() {
        guessValue.textContent = parseFloat(this.value).toFixed(0) + '%';
        updateSliderBackground(this);
    });

    // Enter key to submit guess
    guessSlider.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            submitGuess();
        }
    });
    
    // Submit button
    document.getElementById('submitGuess').addEventListener('click', submitGuess);
    
    // Next round button
    document.getElementById('nextRound').addEventListener('click', nextRound);
}

function updateSliderBackground(slider) {
    const value = (slider.value - slider.min) / (slider.max - slider.min) * 100;
    slider.style.background = `linear-gradient(to right, #2563eb 0%, #2563eb ${value}%, #e0e0e0 ${value}%, #e0e0e0 100%)`;
}

function generateNewPriceChart() {
    // Generate price data using GBM with Sharpe and volatility constraints
    const { priceData, returns, currentPrice, barrierPrice, barrierDirection, trueProbability } = generateDigitalOptionData(231); // 11 months (231 trading days)
    
    gameState.priceData = priceData;
    gameState.returns = returns;
    gameState.currentPrice = currentPrice;
    gameState.barrierPrice = barrierPrice;
    gameState.barrierDirection = barrierDirection;
    gameState.trueProbability = trueProbability;
    
    // Update UI
    updateBarrierInfo();
    
    // Create chart
    createPriceChart();
}

function generateDigitalOptionData(numDays) {
    // GBM parameters
    const initialPrice = 100;
    
    // Generate a random Sharpe ratio between -2 and 2
    const sharpeRatio = -2 + Math.random() * 4;
    
    // Generate a random volatility between 0.1 (10%) and 1.2 (120%)
    const targetVolDecimal = 0.1 + Math.random() * 1.1;
    
    // Set mean return to 0 for all cases
    const requiredAnnualReturn = 0;
    
    // Convert to daily parameters
    const dailyVolatility = targetVolDecimal / Math.sqrt(252);
    const dailyReturn = requiredAnnualReturn / 252;
    
    const prices = [initialPrice];
    const returns = [];
    
    // Generate GBM for 11 months
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
    
    // Current price (end of 11 months)
    const currentPrice = prices[prices.length - 1];
    
    // Generate barrier (above or below current price)
    const barrierDirection = Math.random() > 0.5 ? 'above' : 'below';
    const barrierDistance = (0.01 + Math.random() * 0.19) * currentPrice; // 1% to 20% from current price
    
    let barrierPrice;
    if (barrierDirection === 'above') {
        barrierPrice = currentPrice + barrierDistance;
    } else {
        barrierPrice = currentPrice - barrierDistance;
    }
    
    // Calculate digital option probability using Black-Scholes with 0 drift
    // For digital option: P(S_T > K) = N(d2) where d2 = (ln(S/K) - (r-σ²/2)T) / (σ√T)
    // Since we assume 0 drift (r = 0), d2 = (ln(S/K) + σ²T/2) / (σ√T)
    const S = currentPrice;
    const K = barrierPrice;
    const T = 1/12; // 1 month = 1/12 year
    const sigma = actualAnnualVol;
    
    let d2;
    if (barrierDirection === 'above') {
        d2 = (Math.log(S/K) + sigma * sigma * T / 2) / (sigma * Math.sqrt(T));
    } else {
        d2 = (Math.log(K/S) + sigma * sigma * T / 2) / (sigma * Math.sqrt(T));
    }
    
    // Calculate probability using normal CDF approximation
    const trueProbability = calculateNormalCDF(d2) * 100;
    
    return {
        priceData: prices,
        returns: returns,
        currentPrice: currentPrice,
        barrierPrice: barrierPrice,
        barrierDirection: barrierDirection,
        trueProbability: trueProbability
    };
}

function calculateNormalCDF(x) {
    // Approximation of standard normal CDF
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;
    
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x) / Math.sqrt(2.0);
    
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    
    return 0.5 * (1.0 + sign * y);
}

function updateBarrierInfo() {
    // Remove existing barrier info if it exists
    const existingBarrierInfo = document.querySelector('.barrier-info');
    if (existingBarrierInfo) {
        existingBarrierInfo.remove();
    }
    
    // Create barrier info display
    const barrierInfo = document.createElement('div');
    barrierInfo.className = 'barrier-info';
    barrierInfo.style.cssText = `
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 30px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 20px;
    `;
    
    barrierInfo.innerHTML = `
        <div class="barrier-details" style="display: flex; align-items: center; gap: 10px;">
            <span class="barrier-label" style="font-weight: 600; color: #6b7280; font-size: 1rem;">Barrier:</span>
            <span class="barrier-value" style="font-weight: 700; color: #1a1a1a; font-size: 1.2rem;">$${gameState.barrierPrice.toFixed(2)}</span>
            <span class="barrier-direction ${gameState.barrierDirection}" style="padding: 5px 12px; border-radius: 20px; font-size: 0.9rem; font-weight: 600; text-transform: uppercase; background: ${gameState.barrierDirection === 'above' ? '#dcfce7' : '#fef2f2'}; color: ${gameState.barrierDirection === 'above' ? '#166534' : '#dc2626'};">${gameState.barrierDirection === 'above' ? 'Above' : 'Below'}</span>
        </div>
        <div class="current-price" style="display: flex; align-items: center; gap: 10px;">
            <span class="price-label" style="font-weight: 600; color: #6b7280; font-size: 1rem;">Current Price:</span>
            <span class="price-value" style="font-weight: 700; color: #1a1a1a; font-size: 1.2rem;">$${gameState.currentPrice.toFixed(2)}</span>
        </div>
    `;
    
    // Insert barrier info after the chart
    const plotContainer = document.querySelector('.plot-container');
    plotContainer.parentNode.insertBefore(barrierInfo, plotContainer.nextSibling);
}

function createPriceChart() {
    const ctx = document.getElementById('priceChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (gameState.chart) {
        gameState.chart.destroy();
    }
    
    // Prepare data for Chart.js
    const labels = Array.from({length: gameState.priceData.length}, (_, i) => i);
    
    // Create barrier line data
    const barrierData = Array(gameState.priceData.length).fill(gameState.barrierPrice);
    
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
        }, {
            label: 'Barrier',
            data: barrierData,
            borderColor: gameState.barrierDirection === 'above' ? 'rgba(220, 38, 38, 1)' : 'rgba(34, 197, 94, 1)',
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
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
                        text: 'Trading Days (11 Months)',
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
    
    // Display barrier info
    updateBarrierInfo();
}

function submitGuess() {
    const guessSlider = document.getElementById('probabilityGuess');
    const userGuess = parseFloat(guessSlider.value);
    
    // Validate input
    if (isNaN(userGuess)) {
        alert('Please enter a valid number');
        return;
    }
    
    const difference = Math.abs(userGuess - gameState.trueProbability);
    
    // Determine score based on difference
    let score = 0;
    
    if (difference <= 2) {
        score = 3;
    } else if (difference <= 4) {
        score = 2;
    } else if (difference <= 6) {
        score = 1;
    } else {
        score = 0;
    }
    
    // Update game state
    gameState.coins += score;
    gameState.totalGuesses++;
    gameState.totalError += difference;
    
    if (score > 0) {
        gameState.currentStreak++;
        if (gameState.currentStreak > gameState.bestStreak) {
            gameState.bestStreak = gameState.currentStreak;
        }
    } else {
        gameState.lives--;
        gameState.currentStreak = 0;
    }
    
    // Determine message based on score
    let message = '';
    let isPositive = false;
    
    if (score === 3) {
        const excellentMessages = [
            "🎯 Perfect! Your barrier intuition is spot on! +1 life, +8 coins!",
            "🌟 Brilliant! You understand option probabilities perfectly! +1 life, +8 coins!",
            "💎 Exceptional! Your risk assessment is golden! +1 life, +8 coins!",
            "🚀 Amazing! You're a digital option master! +1 life, +8 coins!",
            "🏆 Outstanding! Your probability skills are top-tier! +1 life, +8 coins!"
        ];
        message = excellentMessages[Math.floor(Math.random() * excellentMessages.length)];
        isPositive = true;
    } else if (score === 2) {
        const goodMessages = [
            "👍 Well done! Solid probability estimation! +3 coins!",
            "✅ Nice work! You're getting the barrier concept! +3 coins!",
            "📈 Good call! Your option thinking is sharp! +3 coins!",
            "🎉 Nice guess! You're building great probability intuition! +3 coins!",
            "💪 Strong performance! Keep analyzing the risks! +3 coins!"
        ];
        message = goodMessages[Math.floor(Math.random() * goodMessages.length)];
        isPositive = true;
    } else if (score === 1) {
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
        const poorMessages = [
            "😅 Not quite right. Barrier probabilities can be tricky! -1 life",
            "🤔 Close, but option pricing is more complex than it looks! -1 life",
            "📉 Missed the mark. Remember: volatility affects barrier hits! -1 life",
            "💭 That's not quite it. Keep studying the price movements! -1 life",
            "🎯 Off target. Probability estimation takes practice! -1 life"
        ];
        message = poorMessages[Math.floor(Math.random() * poorMessages.length)];
        isPositive = false;
    }
    
    // Show result
    showResult(userGuess, gameState.trueProbability, difference, message, isPositive);
    
    // Disable submit button
    document.getElementById('submitGuess').disabled = true;
    
    // Check if game over
    if (gameState.lives <= 0) {
        setTimeout(showGameOver, 2000);
    }
}

function showResult(userGuess, trueProbability, difference, message, isPositive) {
    const resultSection = document.getElementById('resultSection');
    const resultTitle = document.getElementById('resultTitle');
    const scoreMessage = document.getElementById('scoreMessage');
    const scoreChange = document.getElementById('scoreChange');
    
    document.getElementById('userGuess').textContent = `${userGuess.toFixed(2)}%`;
    document.getElementById('trueProbability').textContent = `${trueProbability.toFixed(2)}%`;
    document.getElementById('difference').textContent = `${difference.toFixed(2)}%`;
    
    // Update result content
    resultTitle.textContent = isPositive ? 'Great Job!' : 'Try Again!';
    scoreMessage.textContent = message;
    
    // Update score change styling
    scoreChange.className = `score-change ${isPositive ? 'positive' : 'negative'}`;
    
    resultSection.style.display = 'block';
}

function nextRound() {
    // Hide result section
    document.getElementById('resultSection').style.display = 'none';
    
    // Reset slider to default
    const guessSlider = document.getElementById('probabilityGuess');
    guessSlider.value = 25;
    document.getElementById('guessValue').textContent = '25%';
    updateSliderBackground(guessSlider);
    
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
    
    const avgError = gameState.totalGuesses > 0 ? (gameState.totalError / gameState.totalGuesses).toFixed(2) : '0.00';
    document.getElementById('avgError').textContent = avgError;
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
        trueProbability: 0,
        priceData: [],
        returns: [],
        currentPrice: 0,
        barrierPrice: 0,
        barrierDirection: 'above',
        chart: null
    };
    
    // Reset UI
    document.getElementById('resultSection').style.display = 'none';
    document.getElementById('gameOverModal').style.display = 'none';
    const guessSlider = document.getElementById('probabilityGuess');
    guessSlider.value = 25;
    document.getElementById('guessValue').textContent = '25%';
    updateSliderBackground(guessSlider);
    document.getElementById('submitGuess').disabled = false;
    
    // Generate new chart
    generateNewPriceChart();
    
    // Update display
    updateDisplay();
}

function goToMainMenu() {
    window.location.href = 'index.html';
} 