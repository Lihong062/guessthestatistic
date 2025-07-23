// Game state
let gameState = {
    lives: 3,
    coins: 0,
    currentRound: 1,
    bestStreak: 0,
    currentStreak: 0,
    totalError: 0,
    totalRounds: 0,
    trueSkewness: 0,
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
        trueSkewness: 0,
        chart: null
    };
    
    setupEventListeners();
    generateNewHistogram();
    updateDisplay();
}

// Set up event listeners
function setupEventListeners() {
    const guessInput = document.getElementById('skewnessGuess');
    
    // Handle Enter key press
    guessInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            submitGuess();
        }
    });
}

// Generate new histogram data
function generateNewHistogram() {
    const data = generateSkewedData();
    gameState.trueSkewness = data.trueSkewness;
    createHistogram(data.values);
}

function generateSkewedData() {
    // Generate a random target skewness between -1.5 and 1.5
    const targetSkewness = -1.5 + Math.random() * 3;
    
    // Generate 1000 data points with the target skewness
    const n = 1000;
    const values = [];
    
    // Use different distribution types for variety
    const distributionType = Math.floor(Math.random() * 15);
    
    switch(distributionType) {
        case 0:
            // Normal distribution (near symmetric)
            for (let i = 0; i < n; i++) {
                values.push(generateNormal(0, 1));
            }
            break;
        case 1:
            // Log-normal distribution (right-skewed)
            const logShape = Math.abs(targetSkewness) * 0.8;
            for (let i = 0; i < n; i++) {
                values.push(generateLogNormal(0, logShape));
            }
            break;
        case 2:
            // Exponential distribution (right-skewed)
            const lambda = 1 + Math.abs(targetSkewness) * 0.5;
            for (let i = 0; i < n; i++) {
                values.push(generateExponential(lambda));
            }
            break;
        case 3:
            // Gamma distribution (right-skewed)
            const gammaShape = 1 + Math.abs(targetSkewness) * 0.5;
            for (let i = 0; i < n; i++) {
                values.push(generateGamma(gammaShape, 1));
            }
            break;
        case 4:
            // Beta distribution (can be left or right skewed)
            const alpha = 1 + Math.abs(targetSkewness) * 2;
            const beta = targetSkewness > 0 ? 1 : 1 + Math.abs(targetSkewness) * 2;
            for (let i = 0; i < n; i++) {
                values.push(generateBeta(alpha, beta));
            }
            break;
        case 5:
            // Weibull distribution (right-skewed)
            const weibullShape = 1 + Math.abs(targetSkewness) * 0.5;
            for (let i = 0; i < n; i++) {
                values.push(generateWeibull(weibullShape, 1));
            }
            break;
        case 6:
            // Chi-squared distribution (right-skewed)
            const chiDf = 1 + Math.abs(targetSkewness) * 3;
            for (let i = 0; i < n; i++) {
                values.push(generateChiSquared(chiDf));
            }
            break;
        case 7:
            // Pareto distribution (right-skewed with heavy tail)
            const paretoAlpha = 1 + Math.abs(targetSkewness) * 2;
            for (let i = 0; i < n; i++) {
                values.push(generatePareto(paretoAlpha, 1));
            }
            break;
        case 8:
            // Rayleigh distribution (right-skewed)
            const rayleighSigma = 1 + Math.abs(targetSkewness) * 0.5;
            for (let i = 0; i < n; i++) {
                values.push(generateRayleigh(rayleighSigma));
            }
            break;
        case 9:
            // Lognormal with reflection for left-skewed
            const logShape2 = Math.abs(targetSkewness) * 0.8;
            for (let i = 0; i < n; i++) {
                values.push(-generateLogNormal(0, logShape2));
            }
            break;
        case 10:
            // Triangular distribution (can be skewed)
            const triMode = targetSkewness > 0 ? 0.7 : 0.3;
            for (let i = 0; i < n; i++) {
                values.push(generateTriangular(0, 1, triMode));
            }
            break;
        case 11:
            // Student's t distribution (symmetric but can be heavy-tailed)
            const tDf = 1 + Math.abs(targetSkewness) * 5;
            for (let i = 0; i < n; i++) {
                values.push(generateT(tDf));
            }
            break;
        case 12:
            // F distribution (right-skewed)
            const fDf1 = 1 + Math.abs(targetSkewness) * 3;
            const fDf2 = 5;
            for (let i = 0; i < n; i++) {
                values.push(generateF(fDf1, fDf2));
            }
            break;
        case 13:
            // Inverse Gaussian distribution (right-skewed)
            const invGaussMu = 1;
            const invGaussLambda = 1 + Math.abs(targetSkewness) * 2;
            for (let i = 0; i < n; i++) {
                values.push(generateInverseGaussian(invGaussMu, invGaussLambda));
            }
            break;
        case 14:
            // Mixed distribution (combination for interesting shapes)
            for (let i = 0; i < n; i++) {
                if (Math.random() < 0.7) {
                    values.push(generateNormal(0, 1));
                } else {
                    values.push(generateExponential(1 + Math.abs(targetSkewness)));
                }
            }
            break;
    }
    
    // Calculate actual skewness from generated data
    const actualSkewness = calculateSkewness(values);
    
    return {
        values: values,
        trueSkewness: actualSkewness
    };
}

function generateNormal(mean, std) {
    // Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + std * z0;
}

function generateLogNormal(mean, shape) {
    // Generate log-normal distribution
    const normal = generateNormal(0, 1);
    return Math.exp(mean + shape * normal);
}

function generateExponential(lambda) {
    // Generate exponential distribution
    return -Math.log(1 - Math.random()) / lambda;
}

function generateGamma(shape, scale) {
    // Generate gamma distribution using simpler method for stability
    if (shape < 1) {
        // Use rejection method for shape < 1
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

function generateBeta(alpha, beta) {
    // Generate beta distribution using gamma distributions
    const x = generateGamma(alpha, 1);
    const y = generateGamma(beta, 1);
    return x / (x + y);
}

function generateWeibull(shape, scale) {
    // Generate Weibull distribution
    const u = Math.random();
    if (u === 0) u = 0.0001; // Avoid log(0)
    if (u === 1) u = 0.9999; // Avoid log(0)
    const result = scale * Math.pow(-Math.log(1 - u), 1 / shape);
    return isFinite(result) && result > 0 ? result : scale; // Fallback to scale if NaN
}

function generateChiSquared(df) {
    // Generate Chi-squared distribution using gamma
    return generateGamma(df / 2, 2);
}

function generatePareto(alpha, xm) {
    // Generate Pareto distribution
    const result = xm / Math.pow(Math.random(), 1 / alpha);
    return isFinite(result) && result > 0 ? result : xm; // Fallback to xm if NaN
}

function generateRayleigh(sigma) {
    // Generate Rayleigh distribution
    return sigma * Math.sqrt(-2 * Math.log(1 - Math.random()));
}

function generateTriangular(a, b, c) {
    // Generate triangular distribution
    const u = Math.random();
    const fc = (c - a) / (b - a);
    
    if (u < fc) {
        return a + Math.sqrt(u * (b - a) * (c - a));
    } else {
        return b - Math.sqrt((1 - u) * (b - a) * (b - c));
    }
}

function generateT(df) {
    // Generate Student's t distribution
    const normal = generateNormal(0, 1);
    const chi2 = generateChiSquared(df);
    const result = normal / Math.sqrt(chi2 / df);
    return isFinite(result) ? result : generateNormal(0, 1); // Fallback to normal if NaN
}

function generateF(df1, df2) {
    // Generate F distribution
    const chi1 = generateChiSquared(df1);
    const chi2 = generateChiSquared(df2);
    const result = (chi1 / df1) / (chi2 / df2);
    return isFinite(result) && result > 0 ? result : 1; // Fallback to 1 if NaN or negative
}

function generateInverseGaussian(mu, lambda) {
    // Generate Inverse Gaussian distribution using simpler method
    const v = generateNormal(0, 1);
    const y = v * v;
    const x = mu + (mu * mu * y) / (2 * lambda) - (mu / (2 * lambda)) * Math.sqrt(4 * mu * lambda * y + mu * mu * y * y);
    
    if (Math.random() <= mu / (mu + x)) {
        return x;
    } else {
        return mu * mu / x;
    }
}

function calculateSkewness(values) {
    const n = values.length;
    
    // Calculate mean
    const mean = values.reduce((sum, val) => sum + val, 0) / n;
    
    // Calculate variance and third moment
    let variance = 0;
    let thirdMoment = 0;
    
    for (let i = 0; i < n; i++) {
        const diff = values[i] - mean;
        variance += diff * diff;
        thirdMoment += diff * diff * diff;
    }
    
    variance /= n;
    thirdMoment /= n;
    
    // Calculate skewness
    const stdDev = Math.sqrt(variance);
    const skewness = thirdMoment / (stdDev * stdDev * stdDev);
    
    return skewness;
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
    const guessInput = document.getElementById('skewnessGuess');
    const userGuess = parseFloat(guessInput.value);
    
    // Validate input
    if (isNaN(userGuess)) {
        alert('Please enter a valid number for your guess.');
        return;
    }
    
    // Calculate difference
    const difference = Math.abs(userGuess - gameState.trueSkewness);
    
    // Determine score based on difference
    let score = 0;
    
    if (difference <= 0.3) {
        score = 3;
    } else if (difference <= 0.5) {
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
    showResult(userGuess, gameState.trueSkewness, difference);
    
    // Check if game over
    if (gameState.lives <= 0) {
        setTimeout(showGameOver, 2000);
    }
}

function showResult(userGuess, trueSkewness, difference) {
    const resultSection = document.getElementById('resultSection');
    const userGuessElement = document.getElementById('userGuess');
    const trueSkewnessElement = document.getElementById('trueSkewness');
    const differenceElement = document.getElementById('difference');
    const scoreChangeElement = document.getElementById('scoreChange');
    const scoreMessageElement = document.getElementById('scoreMessage');
    
    userGuessElement.textContent = userGuess.toFixed(2);
    trueSkewnessElement.textContent = trueSkewness.toFixed(2);
    differenceElement.textContent = difference.toFixed(2);
    
    // Determine score and message
    let score = 0;
    let message = '';
    let isPositive = false;
    
    if (difference <= 0.3) {
        score = 3;
        const excellentMessages = [
            "🎯 Perfect! Your skewness intuition is spot on! +1 life, +5 coins!",
            "🌟 Brilliant! You understand distribution asymmetry! +1 life, +5 coins!",
            "💎 Exceptional! Your tail-reading skills are golden! +1 life, +5 coins!",
            "🚀 Amazing! You're a skewness prediction master! +1 life, +5 coins!",
            "🏆 Outstanding! Your distribution analysis is top-tier! +1 life, +5 coins!"
        ];
        message = excellentMessages[Math.floor(Math.random() * excellentMessages.length)];
        isPositive = true;
    } else if (difference <= 0.5) {
        score = 2;
        const goodMessages = [
            "👍 Well done! Solid skewness estimation! +1 coin!",
            "✅ Nice work! You're getting the asymmetry concept! +1 coin!",
            "📈 Good call! Your distribution thinking is sharp! +1 coin!",
            "🎉 Nice guess! You're building great skewness intuition! +1 coin!",
            "💪 Strong performance! Keep analyzing the tails! +1 coin!"
        ];
        message = goodMessages[Math.floor(Math.random() * goodMessages.length)];
        isPositive = true;
    } else {
        score = 0;
        const poorMessages = [
            "😅 Not quite right. Skewness can be tricky! -1 life",
            "🤔 Close, but asymmetry is more complex than it looks! -1 life",
            "📉 Missed the mark. Remember: skewness measures tail heaviness! -1 life",
            "💭 That's not quite it. Keep studying the distribution shape! -1 life",
            "🎯 Off target. Skewness interpretation takes practice! -1 life"
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
    const guessInput = document.getElementById('skewnessGuess');
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