import { LevelManager } from './levelManager.js';
import { ScoreManager } from './scoreManager.js';
import { leaderboard } from './leaderboard.js';
import { sound } from './sound.js';
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
import level15 from './levels/level15.js'; // Grand Finale - always LAST
import level16 from './levels/level16.js';
import level17 from './levels/level17.js';
import level18 from './levels/level18.js';
import level19 from './levels/level19.js';

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

// Expose leaderboard globally
window.leaderboard = leaderboard;

// Expose sound manager globally
window.sound = sound;

// MAIN APP
window.addEventListener('DOMContentLoaded', async () => {
    console.log("Main.js: DOMContentLoaded");

    const usernameScreen = document.getElementById('username-screen');
    const usernameInput = document.getElementById('username-input');
    const enterGameBtn = document.getElementById('enter-game-btn');
    const usernameError = document.getElementById('username-error');
    const miniLeaderboardList = document.getElementById('mini-leaderboard-list');

    const loadingScreen = document.getElementById('loading-screen');
    const progressFill = document.getElementById('loading-progress-fill');
    const percentText = document.getElementById('loading-percent');
    const tipText = document.getElementById('loading-tip');
    const startBtn = document.getElementById('start-btn');

    const app = document.getElementById('app');
    const leaderboardModal = document.getElementById('leaderboard-modal');
    const leaderboardList = document.getElementById('leaderboard-list');
    const closeLeaderboardBtn = document.getElementById('close-leaderboard-btn');

    // Initialize Score Manager
    const scoreManager = new ScoreManager();
    window.scoreManager = scoreManager;

    // Initialize Level Manager
    const levelManager = new LevelManager('app', scoreManager);

    // Register Levels (20 total! Grand Finale is LAST)
    const levels = [
        level0, level1, level2, level3, level4, level5,
        level6, level7, level8, level9, level10,
        level11, level12, level13, level14,
        level16, level17, level18, level19,
        level15 // GRAND FINALE (always last!)
    ];
    levelManager.registerLevels(levels);
    window.levelManager = levelManager;

    // ===== LEADERBOARD FUNCTIONS =====
    async function loadMiniLeaderboard() {
        try {
            const topPlayers = await leaderboard.getLeaderboard(5);
            if (topPlayers.length === 0) {
                miniLeaderboardList.innerHTML = '<p style="color: #666;">No players yet. Be the first!</p>';
                return;
            }

            miniLeaderboardList.innerHTML = topPlayers.map((p, i) => `
                <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px solid #333;">
                    <span>${['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i]} ${p.player_name}</span>
                    <span style="color: var(--neon-green);">${p.total_score}</span>
                </div>
            `).join('');
        } catch (e) {
            console.error('Leaderboard error:', e);
            miniLeaderboardList.innerHTML = '<p style="color: #666;">Offline mode</p>';
        }
    }

    async function loadFullLeaderboard() {
        try {
            const topPlayers = await leaderboard.getLeaderboard(10);
            if (topPlayers.length === 0) {
                leaderboardList.innerHTML = '<p style="color: #aaa; text-align: center;">No players yet!</p>';
                return;
            }

            leaderboardList.innerHTML = `
                <div style="display: grid; grid-template-columns: 30px 1fr 60px 50px 50px; gap: 5px; font-size: 0.5rem; padding: 5px; background: #222; margin-bottom: 5px;">
                    <span>#</span>
                    <span>NAME</span>
                    <span>SCORE</span>
                    <span>⭐</span>
                    <span>LVL</span>
                </div>
            ` + topPlayers.map((p, i) => `
                <div style="display: grid; grid-template-columns: 30px 1fr 60px 50px 50px; gap: 5px; font-size: 0.5rem; padding: 8px 5px; background: ${p.id === leaderboard.playerId ? 'rgba(57,255,20,0.2)' : 'transparent'}; border-bottom: 1px solid #333;">
                    <span>${['🥇', '🥈', '🥉'][i] || (i + 1)}</span>
                    <span style="color: ${p.id === leaderboard.playerId ? 'var(--neon-green)' : '#fff'}; overflow: hidden; text-overflow: ellipsis;">${p.player_name}</span>
                    <span style="color: var(--neon-yellow);">${p.total_score}</span>
                    <span>${p.total_stars}</span>
                    <span>${p.levels_completed}</span>
                </div>
            `).join('');
        } catch (e) {
            leaderboardList.innerHTML = '<p style="color: #ff6b6b;">Failed to load</p>';
        }
    }

    // Show leaderboard modal
    window.showLeaderboard = async () => {
        await loadFullLeaderboard();
        leaderboardModal.classList.remove('hidden');
    };

    closeLeaderboardBtn.onclick = () => {
        leaderboardModal.classList.add('hidden');
    };

    // Sync score to Supabase
    window.syncScore = async () => {
        if (!leaderboard.currentPlayer) return;
        const stats = scoreManager.getOverallStats();
        await leaderboard.updateScore(stats.totalPoints, stats.levelsCompleted, stats.totalStars);
    };

    // ===== USERNAME ENTRY =====
    loadMiniLeaderboard();

    // Check for saved username
    const savedUsername = localStorage.getItem('silly_username');
    if (savedUsername) {
        usernameInput.value = savedUsername;
    }

    enterGameBtn.onclick = async () => {
        const username = usernameInput.value.trim().toUpperCase();

        if (username.length < 2) {
            usernameError.innerText = 'Name must be at least 2 characters!';
            return;
        }

        if (username.length > 15) {
            usernameError.innerText = 'Name too long! Max 15 characters.';
            return;
        }

        enterGameBtn.innerText = '⏳ LOADING...';
        enterGameBtn.disabled = true;

        try {
            // Login/create player
            const player = await leaderboard.loginPlayer(username);

            if (player) {
                localStorage.setItem('silly_username', username);

                // Transition to loading screen
                usernameScreen.style.opacity = '0';
                usernameScreen.style.transition = 'opacity 0.5s ease';

                setTimeout(() => {
                    usernameScreen.style.display = 'none';
                    loadingScreen.classList.remove('hidden');
                    startLoading();
                }, 500);
            } else {
                usernameError.innerText = 'Connection error. Try again!';
                enterGameBtn.innerText = '🚀 ENTER GAME';
                enterGameBtn.disabled = false;
            }
        } catch (e) {
            console.error('Login error:', e);
            // Offline mode - continue anyway
            localStorage.setItem('silly_username', username);
            usernameScreen.style.display = 'none';
            loadingScreen.classList.remove('hidden');
            startLoading();
        }
    };

    // Also allow Enter key
    usernameInput.onkeypress = (e) => {
        if (e.key === 'Enter') enterGameBtn.click();
    };

    // ===== LOADING ANIMATION =====
    function startLoading() {
        let progress = 0;
        let tipIndex = 0;

        const loadingInterval = setInterval(() => {
            progress += Math.random() * 10 + 3;
            if (progress > 100) progress = 100;

            progressFill.style.width = `${progress}%`;
            percentText.textContent = `${Math.floor(progress)}%`;

            if (Math.random() > 0.7) {
                tipIndex = (tipIndex + 1) % LOADING_TIPS.length;
                tipText.textContent = LOADING_TIPS[tipIndex];
            }

            if (progress >= 100) {
                clearInterval(loadingInterval);
                showStartButton();
            }
        }, 80);
    }

    function showStartButton() {
        tipText.textContent = `WELCOME, ${localStorage.getItem('silly_username') || 'PLAYER'}!`;
        tipText.style.color = "var(--neon-green)";
        startBtn.classList.remove('hidden');
        startBtn.style.animation = 'pulse 1s ease infinite';

        startBtn.onclick = () => {
            loadingScreen.style.opacity = '0';
            loadingScreen.style.transition = 'opacity 0.5s ease';

            setTimeout(() => {
                loadingScreen.style.display = 'none';
                app.classList.remove('hidden');
                app.style.animation = 'fadeIn 0.5s ease';
                levelManager.loadMenu();
            }, 500);
        };
    }
});
