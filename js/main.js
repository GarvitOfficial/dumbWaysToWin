import { LevelManager } from './levelManager.js';
import { ScoreManager } from './scoreManager.js';
import level0 from './levels/level0.js';
import level1 from './levels/level1.js';
import level2 from './levels/level2.js';
import level3 from './levels/level3.js';
import level4 from './levels/level4.js';
import level5 from './levels/level5.js';
import level6 from './levels/level6.js';
import level7 from './levels/level7.js';
import level8 from './levels/level8.js';
import level9 from './levels/level9.js';
import level10 from './levels/level10.js';
import level11 from './levels/level11.js';
import level12 from './levels/level12.js';
import level13 from './levels/level13.js';
import level14 from './levels/level14.js';
import level15 from './levels/level15.js';

// Loading Tips
const LOADING_TIPS = [
    "TIP: FLIRT WITH THE AI TO WIN!",
    "TIP: SOMETIMES DOING NOTHING IS THE ANSWER...",
    "TIP: SCREAM LOUDER FOR MORE POINTS!",
    "TIP: ROBOTS CAN'T FEEL EMOTIONS... OR CAN THEY?",
    "TIP: THE BUTTON LIES. DON'T TRUST IT.",
    "TIP: SHAKE YOUR PHONE LIKE YOU MEAN IT!",
    "TIP: REVERSE PSYCHOLOGY IS REAL.",
    "TIP: YOUR WEBCAM IS JUDGING YOU.",
    "LOADING SILLY ALGORITHMS...",
    "CALIBRATING DUMBNESS LEVELS...",
    "PREPARING UNCONVENTIONAL WINS..."
];

// ARCADE LOAD
window.addEventListener('DOMContentLoaded', () => {
    console.log("Main.js: DOMContentLoaded");

    const app = document.getElementById('app');
    const loadingScreen = document.getElementById('loading-screen');
    const progressFill = document.getElementById('loading-progress-fill');
    const percentText = document.getElementById('loading-percent');
    const tipText = document.getElementById('loading-tip');
    const startBtn = document.getElementById('start-btn');

    // Initialize Score Manager
    const scoreManager = new ScoreManager();
    window.scoreManager = scoreManager; // Expose for debugging

    // Initialize Level Manager
    const levelManager = new LevelManager('app', scoreManager);

    // Register Levels
    const levels = [
        level0, // Level 1: Emotional Captcha
        level1, level2, level3, level4, level5,
        level6, level7, level8, level9, level10,
        level11, level12, level13, level14, level15
    ];
    levelManager.registerLevels(levels);

    // Expose for testing
    window.levelManager = levelManager;

    // Animated Loading
    let progress = 0;
    let tipIndex = 0;

    const loadingInterval = setInterval(() => {
        progress += Math.random() * 8 + 2; // Random increment
        if (progress > 100) progress = 100;

        progressFill.style.width = `${progress}%`;
        percentText.textContent = `${Math.floor(progress)}%`;

        // Rotate tips every 500ms
        if (Math.random() > 0.7) {
            tipIndex = (tipIndex + 1) % LOADING_TIPS.length;
            tipText.textContent = LOADING_TIPS[tipIndex];
            tipText.style.animation = 'none';
            tipText.offsetHeight; // Trigger reflow
            tipText.style.animation = 'tipFade 0.3s ease';
        }

        if (progress >= 100) {
            clearInterval(loadingInterval);
            showStartButton();
        }
    }, 100);

    function showStartButton() {
        tipText.textContent = "READY PLAYER ONE!";
        tipText.style.color = "var(--neon-green)";
        startBtn.classList.remove('hidden');
        startBtn.style.animation = 'pulse 1s ease infinite';

        startBtn.onclick = () => {
            // Fade out loading screen
            loadingScreen.style.opacity = '0';
            loadingScreen.style.transition = 'opacity 0.5s ease';

            setTimeout(() => {
                loadingScreen.style.display = 'none';
                app.classList.remove('hidden');
                app.style.animation = 'fadeIn 0.5s ease';

                // Go to Menu
                levelManager.loadMenu();
            }, 500);
        };
    }
});
