# 🎮 Silly Games: Dumb Ways to Win

> **An arcade collection of unconventional browser games where you win by doing silly things!**



## 🕹️ Play Now

Open `index.html` in any modern browser, or deploy to any static hosting:
- GitHub Pages
- Netlify
- Vercel
- Any web server

## 🎯 Game Levels

| # | Title | How to Win |
|---|-------|------------|
| 1 | Emotional Captcha | Show emotions via webcam movement |
| 2 | Sentiment Flirt | Write positive messages to the AI |
| 3 | Rage Quit | Express anger through text |
| 4 | Scream to Fly | Use your microphone volume |
| 5 | Bowling Swipe | Swipe to knock down pins |
| 6 | Don't Click | Resist clicking the button |
| 7+ | More Silliness... | Discover them yourself! |

## ⭐ Features

- **16 Silly Levels** - Each with unique unconventional mechanics
- **Star Ratings** - Earn 1-3 stars based on speed
- **Score Tracking** - Persistent high scores via localStorage
- **Retro Arcade UI** - Pixel art styling with CRT effects
- **Mobile Friendly** - Responsive design for all devices

## 🚀 Deployment

### GitHub Pages
1. Push to a GitHub repository
2. Go to Settings → Pages
3. Select "Deploy from branch" → main
4. Your game is live at `https://username.github.io/repo-name`

### Local Development
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Or just open index.html directly
```

## 🛠️ Tech Stack

- **Pure HTML/CSS/JS** - No frameworks needed
- **ES6 Modules** - Modern JavaScript
- **localStorage** - Save progress
- **WebRTC** - Camera/microphone access for certain levels

## 📁 Project Structure

```
├── index.html          # Main entry point
├── style.css           # Arcade styling
├── favicon.svg         # Custom favicon
├── js/
│   ├── main.js         # App initialization
│   ├── levelManager.js # Level progression
│   ├── scoreManager.js # Scoring system
│   └── levels/         # Individual game levels
│       ├── level0.js   # Emotional Captcha
│       ├── level1.js   # Sentiment Flirt
│       └── ...
```

## 🎨 Credits

Built for the **TRAE Mini-Hackathon** with the theme: *"Game Building - Dumb Ways to Win"*

---

**🏆 Win by being silly!**
