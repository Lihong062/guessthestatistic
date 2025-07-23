// Game state
let gameState = {
    lives: 3,
    coins: 0,
    currentRound: 1,
    bestStreak: 0,
    currentStreak: 0,
    totalError: 0,
    totalRounds: 0,
    trueKurtosis: 3,
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
        trueKurtosis: 3,
        chart: null
    };
    
    setupEventListeners();
    generateNewHistogram();
    updateDisplay();
}

// Set up event listeners
function setupEventListeners() {
    const guessInput = document.getElementById('kurtosisGuess');
    
    // Handle Enter key press
    guessInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            submitGuess();
        }
    });
}

// Generate new histogram data
function generateNewHistogram() {
    const data = generateKurtosisData();
    gameState.trueKurtosis = data.trueKurtosis;
    createHistogram(data.values);
}

function generateKurtosisData() {
    // Generate a random target kurtosis between 1 and 6 (more interpretable range)
    const targetKurtosis = 1 + Math.random() * 5;
    
    // Generate 1000 data points with the target kurtosis
    const n = 1000;
    const values = [];
    
    // Use interpretable distribution types that players can visually distinguish
    const distributionType = Math.floor(Math.random() * 6);
    
    switch(distributionType) {
        case 0:
            // Normal distribution (kurtosis ≈ 3)
            for (let i = 0; i < n; i++) {
                values.push(generateNormal(0, 1));
            }
            break;
        case 1:
            // Uniform distribution (low kurtosis ≈ 1.8)
            for (let i = 0; i < n; i++) {
                values.push(generateUniform(-1, 1));
            }
            break;
        case 2:
            // Laplace distribution (high kurtosis ≈ 6)
            for (let i = 0; i < n; i++) {
                values.push(generateLaplace(0, 1));
            }
            break;
        case 3:
            // Student's t with low df (high kurtosis, heavy tails)
            const tDf = 2 + Math.random() * 3; // df between 2-5 for interpretable kurtosis
            for (let i = 0; i < n; i++) {
                values.push(generateT(tDf));
            }
            break;
        case 4:
            // Mixed distribution (normal + outliers for high kurtosis)
            const outlierProb = 0.05 + Math.random() * 0.1; // 5-15% outliers
            for (let i = 0; i < n; i++) {
                if (Math.random() < outlierProb) {
                    values.push(generateNormal(0, 3)); // Outliers
                } else {
                    values.push(generateNormal(0, 1)); // Main distribution
                }
            }
            break;
        case 5:
            // Beta distribution (low kurtosis, bounded)
            const alpha = 1 + Math.random() * 2;
            const beta = 1 + Math.random() * 2;
            for (let i = 0; i < n; i++) {
                values.push(generateBeta(alpha, beta));
            }
            break;
    }
    
    // Calculate actual kurtosis from generated data
    const actualKurtosis = calculateKurtosis(values);
    
    return {
        values: values,
        trueKurtosis: actualKurtosis
    };
}

function generateNormal(mean, std) {
    // Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + std * z0;
}

function generateUniform(a, b) {
    // Generate uniform distribution
    return a + (b - a) * Math.random();
}

function generateLaplace(loc, scale) {
    // Generate Laplace distribution
    const u = Math.random() - 0.5;
    return loc - scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
}

function generateT(df) {
    // Generate Student's t distribution
    const normal = generateNormal(0, 1);
    const chi2 = generateChiSquared(df);
    const result = normal / Math.sqrt(chi2 / df);
    return isFinite(result) ? result : generateNormal(0, 1);
}

function generateBeta(alpha, beta) {
    // Generate beta distribution using gamma distributions
    const x = generateGamma(alpha, 1);
    const y = generateGamma(beta, 1);
    return x / (x + y);
}

function generateGamma(shape, scale) {
    // Generate gamma distribution using simpler method for stability
    if (shape < 1) {
        return generateGamma(1 + shape, scale) * Math.pow(Math.random(), 1 / shape);
    }
    
    const d = shape - 1/3;
    const c = 1 / Math.sqrt(9 * d);
    
    while (true) {
        const x = generateNormal(0, 1);
        const v = 1 + c * x;
        
        if (v <= 0) continue;
        
        const v3 = v * v * v;
        const u = Math.random();
        
        if (u < 1 - 0.0331 * x * x * x * x) {
            const result = d * v3 * scale;
            if (isFinite(result) && result > 0) {
                return result;
            }
        }
        
        if (Math.log(u) < 0.5 * x * x + d * (1 - v3 + Math.log(v3))) {
            const result = d * v3 * scale;
            if (isFinite(result) && result > 0) {
                return result;
            }
        }
    }
}

function calculateKurtosis(values) {
    const n = values.length;
    
    // Calculate mean
    const mean = values.reduce((sum, val) => sum + val, 0) / n;
    
    // Calculate variance and fourth moment
    let variance = 0;
    let fourthMoment = 0;
    
    for (let i = 0; i < n; i++) {
        const diff = values[i] - mean;
        variance += diff * diff;
        fourthMoment += diff * diff * diff * diff;
    }
    
    variance /= n;
    fourthMoment /= n;
    
    // Calculate kurtosis
    const stdDev = Math.sqrt(variance);
    const kurtosis = fourthMoment / (stdDev * stdDev * stdDev * stdDev);
    
    return kurtosis;
}

function createHistogram(values) {
    const ctx = document.getElementById('histogram').getContext('2d');
    
    // Destroy existing chart if it exists
    if (gameState.chart) {
        gameState.chart.destroy();
    }
    
    // Create histogram bins
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binCount = 40; // More bins for better detail
    const binWidth = (max - min) / binCount;
    
    const bins = new Array(binCount).fill(0);
    const binLabels = [];
    
    for (let i = 0; i < binCount; i++) {
        binLabels.push((min + i * binWidth + binWidth / 2).toFixed(1));
    }
    
    // Count values in each bin
    for (const value of values) {
        const binIndex = Math.min(Math.floor((value - min) / binWidth), binCount - 1);
        bins[binIndex]++;
    }
    
    const config = {
        type: 'bar',
        data: {
            labels: binLabels,
            datasets: [{
                label: 'Frequency',
                data: bins,
                backgroundColor: 'rgba(37, 99, 235, 0.6)',
                borderColor: 'rgba(37, 99, 235, 1)',
                borderWidth: 1
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
                            return `Frequency: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Value',
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
                        text: 'Frequency',
                        color: '#6b7280'
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    },
                    ticks: {
                        color: '#6b7280'
                    }
                }
            }
        }
    };
    
    gameState.chart = new Chart(ctx, config);
}

function submitGuess() {
    const guessInput = document.getElementById('kurtosisGuess');
    const userGuess = parseFloat(guessInput.value);
    
    // Validate input
    if (isNaN(userGuess)) {
        alert('Please enter a valid number for your guess.');
        return;
    }
    
    // Calculate difference
    const difference = Math.abs(userGuess - gameState.trueKurtosis);
    
    // Determine score based on difference
    let score = 0;
    
    if (difference <= 0.5) {
        score = 3;
    } else if (difference <= 1.0) {
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
    showResult(userGuess, gameState.trueKurtosis, difference);
    
    // Check if game over
    if (gameState.lives <= 0) {
        setTimeout(showGameOver, 2000);
    }
}

function showResult(userGuess, trueKurtosis, difference) {
    const resultSection = document.getElementById('resultSection');
    const userGuessElement = document.getElementById('userGuess');
    const trueKurtosisElement = document.getElementById('trueKurtosis');
    const differenceElement = document.getElementById('difference');
    const scoreChangeElement = document.getElementById('scoreChange');
    const scoreMessageElement = document.getElementById('scoreMessage');
    
    userGuessElement.textContent = userGuess.toFixed(2);
    trueKurtosisElement.textContent = trueKurtosis.toFixed(2);
    differenceElement.textContent = difference.toFixed(2);
    
    // Determine score and message
    let score = 0;
    let message = '';
    let isPositive = false;
    
    if (difference <= 0.5) {
        score = 3;
        const excellentMessages = [
            "🎯 Perfect! Your kurtosis intuition is spot on! +1 life, +5 coins!",
            "🌟 Brilliant! You understand tail heaviness perfectly! +1 life, +5 coins!",
            "💎 Exceptional! Your distribution analysis is golden! +1 life, +5 coins!",
            "🚀 Amazing! You're a kurtosis prediction master! +1 life, +5 coins!",
            "🏆 Outstanding! Your tail-reading skills are top-tier! +1 life, +5 coins!"
        ];
        message = excellentMessages[Math.floor(Math.random() * excellentMessages.length)];
        isPositive = true;
    } else if (difference <= 1.0) {
        score = 2;
        const goodMessages = [
            "👍 Well done! Solid kurtosis estimation! +1 coin!",
            "✅ Nice work! You're getting the tail heaviness concept! +1 coin!",
            "📈 Good call! Your distribution thinking is sharp! +1 coin!",
            "🎉 Nice guess! You're building great kurtosis intuition! +1 coin!",
            "💪 Strong performance! Keep analyzing the extremes! +1 coin!"
        ];
        message = goodMessages[Math.floor(Math.random() * goodMessages.length)];
        isPositive = true;
    } else {
        score = 0;
        const poorMessages = [
            "😅 Not quite right. Kurtosis can be tricky! -1 life",
            "🤔 Close, but tail heaviness is more complex than it looks! -1 life",
            "📉 Missed the mark. Remember: kurtosis measures extreme values! -1 life",
            "💭 That's not quite it. Keep studying the distribution tails! -1 life",
            "🎯 Off target. Kurtosis interpretation takes practice! -1 life"
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
    
    // Generate new histogram
    generateNewHistogram();
    
    // Reset input
    const guessInput = document.getElementById('kurtosisGuess');
    guessInput.value = '';
    guessInput.placeholder = 'Enter your guess';
    
    // Update display
    updateDisplay();
}

function updateDisplay() {
    document.getElementById('lives').textContent = gameState.lives;
    document.getElementById('coins').textContent = gameState.coins;
    document.getElementById('currentRound').textContent = gameState.currentRound;
    document.getElementById('bestStreak').textContent = gameState.bestStreak;
    
    const avgError = gameState.totalRounds > 0 ? gameState.totalError / gameState.totalRounds : 0;
    document.getElementById('avgError').textContent = avgError.toFixed(2);
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
document.addEventListener('DOMContentLoaded', initializeGame); 