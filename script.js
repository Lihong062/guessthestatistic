// Navigation functionality
function navigateToGame(gameType) {
    if (gameType === 'correlation') {
        window.location.href = 'correlation-game.html';
    } else if (gameType === 'sharpe') {
        window.location.href = 'sharpe-game.html';
    } else if (gameType === 'volatility') {
        window.location.href = 'volatility-game.html';
    } else if (gameType === 'digital') {
        window.location.href = 'digital-game.html';
    } else if (gameType === 'one-touch') {
        window.location.href = 'one-touch-game.html';
    } else if (gameType === 'r-squared') {
        window.location.href = 'r-squared-game.html';
    } else if (gameType === 'skewness') {
        window.location.href = 'skewness-game.html';
    } else if (gameType === 'kurtosis') {
        window.location.href = 'kurtosis-game.html';
    } else if (gameType === 'leverage') {
        window.location.href = 'leverage-game.html';
    }
    // Add more game types as they become available
}

// Add click handlers for game cards
document.addEventListener('DOMContentLoaded', function() {
    const gameCards = document.querySelectorAll('.game-card:not(.coming-soon)');
    gameCards.forEach((card, index) => {
        card.addEventListener('click', function(e) {
            // Don't navigate if clicking on the button
            if (!e.target.closest('.play-button')) {
                const gameTypes = ['correlation', 'sharpe', 'volatility', 'digital', 'one-touch', 'r-squared', 'skewness', 'kurtosis', 'leverage'];
                navigateToGame(gameTypes[index]);
            }
        });
    });
    
    // Add specific click handlers for Play Now buttons
    const playButtons = document.querySelectorAll('.play-button:not(.disabled)');
    playButtons.forEach((button, index) => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent card click
            const gameTypes = ['correlation', 'sharpe', 'volatility', 'digital', 'one-touch', 'r-squared', 'skewness', 'kurtosis', 'leverage'];
            navigateToGame(gameTypes[index]);
        });
    });
});

// Add smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add hover effects for game cards
    const gameCards = document.querySelectorAll('.game-card:not(.coming-soon)');
    gameCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Add click sound effect for play buttons
    const playButtons = document.querySelectorAll('.play-button:not(.disabled)');
    playButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            // Add a subtle click effect
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });

    // Animate stats on scroll
    const stats = document.querySelectorAll('.stat-number');
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumber(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    stats.forEach(stat => observer.observe(stat));
});

// Animate number counting
function animateNumber(element) {
    const finalNumber = parseInt(element.textContent.replace(/\D/g, ''));
    const suffix = element.textContent.replace(/\d/g, '');
    let currentNumber = 0;
    const increment = finalNumber / 50;
    const timer = setInterval(() => {
        currentNumber += increment;
        if (currentNumber >= finalNumber) {
            currentNumber = finalNumber;
            clearInterval(timer);
        }
        element.textContent = Math.floor(currentNumber) + suffix;
    }, 30);
}

// Add loading animation for game cards
window.addEventListener('load', function() {
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
});

// Add keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        // Return to main menu if on a game page
        if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
            window.location.href = 'index.html';
        }
    }
});

// Add mobile touch feedback
if ('ontouchstart' in window) {
    const touchElements = document.querySelectorAll('.game-card, .play-button');
    touchElements.forEach(element => {
        element.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        });
        
        element.addEventListener('touchend', function() {
            this.style.transform = '';
        });
    });
}

// Add a simple analytics tracker (you can replace with your preferred analytics)
function trackEvent(eventName, eventData = {}) {
    console.log('Event tracked:', eventName, eventData);
    // Add your analytics code here (Google Analytics, etc.)
}

// Track game starts
document.addEventListener('click', function(e) {
    if (e.target.closest('.game-card') && !e.target.closest('.coming-soon')) {
        const gameName = e.target.closest('.game-card').querySelector('h3').textContent;
        trackEvent('game_started', { game: gameName });
    }
});

// Add a back to top button functionality
function createBackToTopButton() {
    const backToTop = document.createElement('button');
    backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTop.className = 'back-to-top';
    backToTop.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(backToTop);
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTop.style.opacity = '1';
            backToTop.style.visibility = 'visible';
        } else {
            backToTop.style.opacity = '0';
            backToTop.style.visibility = 'hidden';
        }
    });
    
    backToTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Initialize back to top button
createBackToTopButton(); 