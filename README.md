# Guess the Statistic

A modern, interactive web platform for testing and improving your statistical intuition through various guessing games. The platform is designed to be both educational and entertaining, helping users develop better understanding of data patterns and relationships.

## 🎯 About the Project

This platform was inspired by the original "Guess the Correlation" game and expands on the concept to include multiple types of statistical guessing challenges. Each game focuses on different aspects of data interpretation, making learning statistics fun and engaging.

### Research Purpose

While the games are designed to be entertaining, they also serve a research purpose. Data on user guesses is collected to analyze how humans perceive correlations and other statistical relationships in data visualizations. The more people play, the more valuable data is generated for research on human statistical intuition.

## 🎮 Available Games

### 1. Guess the Correlation ✅ (Available Now)
- **Description**: Look at scatter plots and guess the correlation coefficient between variables
- **Range**: 0 (no correlation) to 1 (perfect correlation)
- **Scoring**:
  - Within 0.05 of true correlation: +1 life, +5 coins
  - Within 0.10 of true correlation: +1 coin
  - More than 0.10 off: -1 life



## 🚀 Features

- **Modern, Responsive Design**: Beautiful UI that works on all devices
- **Interactive Visualizations**: Real-time scatter plots using Chart.js
- **Progressive Scoring System**: Earn coins and lives based on accuracy
- **Streak Tracking**: Track your best consecutive correct guesses
- **Statistics Dashboard**: Monitor your performance over time
- **Keyboard Navigation**: Full keyboard support for accessibility
- **Smooth Animations**: Engaging visual feedback and transitions

## 🛠️ Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js for data visualization
- **Styling**: Custom CSS with modern design principles
- **Icons**: Font Awesome for consistent iconography
- **Fonts**: Inter font family for optimal readability

## 📦 Installation & Setup

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No additional software required - runs entirely in the browser

### Quick Start
1. Clone or download this repository
2. Open `index.html` in your web browser
3. Start playing!

### Local Development
If you want to run this locally for development:

```bash
# Clone the repository
git clone <repository-url>
cd guessthestatistic

# Open in your preferred code editor
code .

# Start a local server (optional, for development)
# Using Python 3:
python -m http.server 8000

# Using Node.js (if you have http-server installed):
npx http-server

# Then open http://localhost:8000 in your browser
```

## 🎯 How to Play

### Getting Started
1. Visit the main page and choose a game
2. Read the instructions carefully
3. Make your guess using the provided interface
4. Submit your answer and see how close you were
5. Continue playing to improve your skills!

### Tips for Success
- **Start with Correlation**: This is the most intuitive game to begin with
- **Look for Patterns**: Pay attention to the overall shape and direction of data
- **Practice Regularly**: Statistical intuition improves with practice
- **Don't Rush**: Take your time to analyze the visualizations

## 🔧 Customization

### Adding New Games
To add a new guessing game:

1. Create a new HTML file (e.g., `percentage-game.html`)
2. Add corresponding CSS and JavaScript files
3. Update the main `index.html` to include the new game card
4. Implement the game logic following the existing pattern

### Styling Customization
The design uses CSS custom properties for easy theming. Key colors can be modified in `styles.css`:

```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --accent-color: #ffd700;
  --text-color: #333;
  --background-color: #f8f9fa;
}
```

## 📊 Data Collection

### What We Collect
- Game type and round number
- User guesses and true values
- Accuracy metrics
- Session duration
- Performance statistics

### Privacy & Ethics
- No personal information is collected
- Data is anonymized and aggregated
- Used solely for research purposes
- Users can opt out of data collection

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Reporting Issues
- Use the GitHub issue tracker
- Provide detailed descriptions of bugs
- Include steps to reproduce issues

### Feature Requests
- Suggest new game types
- Propose UI/UX improvements
- Recommend educational features

### Code Contributions
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📈 Future Development

### Planned Features
- [ ] User accounts and progress tracking
- [ ] Leaderboards and achievements
- [ ] More game types (regression, confidence intervals)
- [ ] Educational content and tutorials
- [ ] Mobile app versions
- [ ] Multiplayer challenges

### Research Goals
- [ ] Publish findings on human statistical intuition
- [ ] Develop educational tools based on insights
- [ ] Create adaptive difficulty systems
- [ ] Study learning progression patterns

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Inspired by the original "Guess the Correlation" game
- Built with modern web technologies
- Designed for educational and research purposes
- Community-driven development

## 📞 Contact

Have questions, suggestions, or found a bug? We'd love to hear from you!

- **Email**: [your-email@example.com]
- **Twitter**: [@your-handle]
- **GitHub**: [your-github-profile]

---

**Note**: This platform is designed for educational and research purposes. Please play fairly and don't use automated tools or bots, as this affects the quality of research data and the experience for other users. 