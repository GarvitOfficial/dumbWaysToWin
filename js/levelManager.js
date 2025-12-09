export class LevelManager {
    constructor(containerId, scoreManager = null) {
        this.app = document.getElementById(containerId);
        this.levels = [];
        this.currentCleanup = null;
        this.scoreManager = scoreManager;
        this.levelStartTime = null;

        // Progression State - MAX INDEX unlocked
        const stored = localStorage.getItem('silly_max_level');
        this.maxUnlock = stored ? parseInt(stored) : 0;
    }

    registerLevels(levels) {
        this.levels = levels;
    }

    completeLevel(levelId) {
        const index = this.levels.findIndex(l => l.id === levelId);

        if (index >= 0) {
            const nextIndex = index + 1;

            // Calculate time taken
            const timeTaken = this.levelStartTime ? Date.now() - this.levelStartTime : 0;

            // Get score from ScoreManager
            let scoreResult = null;
            if (this.scoreManager) {
                scoreResult = this.scoreManager.completeLevel(levelId, timeTaken, 100);
            }

            // Unlock next level
            if (nextIndex > this.maxUnlock && nextIndex < this.levels.length) {
                this.maxUnlock = nextIndex;
                localStorage.setItem('silly_max_level', this.maxUnlock);
            }

            // Show enhanced win screen
            this.showWinScreen(index, nextIndex, scoreResult);
        }
    }

    showWinScreen(currentIndex, nextIndex, scoreResult) {
        if (this.currentCleanup) this.currentCleanup();
        this.app.innerHTML = '';

        const winScreen = document.createElement('div');
        winScreen.className = 'beveled-panel win-screen';

        // Star display
        let starsHtml = '';
        if (scoreResult) {
            const filled = scoreResult.stars;
            const empty = 3 - filled;
            starsHtml = `
                <div class="star-display">
                    ${'<span class="star filled">★</span>'.repeat(filled)}
                    ${'<span class="star empty">☆</span>'.repeat(empty)}
                </div>
            `;
        }

        winScreen.innerHTML = `
            <div class="win-header">
                <h1 class="win-title">LEVEL COMPLETE!</h1>
                ${starsHtml}
            </div>
            
            ${scoreResult ? `
                <div class="score-display">
                    <div class="score-item">
                        <span class="score-label">POINTS</span>
                        <span class="score-value">${scoreResult.points}</span>
                    </div>
                    <div class="score-item">
                        <span class="score-label">TOTAL</span>
                        <span class="score-value">${scoreResult.totalPoints}</span>
                    </div>
                    ${scoreResult.isNewHighScore ? '<p class="new-high-score">★ NEW HIGH SCORE! ★</p>' : ''}
                </div>
            ` : '<p class="unlock-msg">NEW LEVEL UNLOCKED!</p>'}
            
            <div class="win-buttons">
                <button id="retry-btn" class="beveled-btn secondary">RETRY</button>
                <button id="next-level-btn" class="beveled-btn primary">NEXT >></button>
                <button id="menu-btn" class="beveled-btn">MENU</button>
            </div>
        `;

        this.app.appendChild(winScreen);

        // Animate entry
        winScreen.style.animation = 'scaleIn 0.3s ease';

        // Retry button
        document.getElementById('retry-btn').onclick = () => {
            this.loadLevel(this.levels[currentIndex].id);
        };

        // Next level button
        document.getElementById('next-level-btn').onclick = () => {
            if (nextIndex >= this.levels.length) {
                this.showGameComplete();
            } else {
                this.loadLevel(this.levels[nextIndex].id);
            }
        };

        // Menu button
        document.getElementById('menu-btn').onclick = () => this.loadMenu();
    }

    showGameComplete() {
        if (this.currentCleanup) this.currentCleanup();
        this.app.innerHTML = '';

        const stats = this.scoreManager ? this.scoreManager.getOverallStats() : null;

        const completeScreen = document.createElement('div');
        completeScreen.className = 'beveled-panel win-screen game-complete';
        completeScreen.innerHTML = `
            <h1 class="win-title rainbow-text">🎮 YOU BEAT SILLY GAMES! 🎮</h1>
            <p class="complete-message">CONGRATULATIONS, SILLY CHAMPION!</p>
            
            ${stats ? `
                <div class="final-stats">
                    <div class="stat-item">
                        <span class="stat-icon">⭐</span>
                        <span class="stat-value">${stats.totalStars} / ${stats.maxPossibleStars}</span>
                        <span class="stat-label">STARS</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">🏆</span>
                        <span class="stat-value">${stats.totalPoints}</span>
                        <span class="stat-label">POINTS</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">🎯</span>
                        <span class="stat-value">${stats.levelsCompleted}</span>
                        <span class="stat-label">LEVELS</span>
                    </div>
                </div>
            ` : ''}
            
            <div class="win-buttons">
                <button id="menu-btn" class="beveled-btn primary">PLAY AGAIN</button>
            </div>
        `;

        this.app.appendChild(completeScreen);
        document.getElementById('menu-btn').onclick = () => this.loadMenu();
    }

    loadLevel(id) {
        const level = this.levels.find(l => l.id === id);
        if (!level) return;

        const index = this.levels.indexOf(level);

        // Check lock
        if (index > this.maxUnlock) {
            alert("LOCKED! Beat the previous level first.");
            return;
        }

        if (this.currentCleanup) this.currentCleanup();

        // Start timer for scoring
        this.levelStartTime = Date.now();

        // Transition animation
        this.app.style.animation = 'fadeOut 0.2s ease';

        setTimeout(() => {
            this.app.innerHTML = level.html;
            this.app.style.animation = 'fadeIn 0.3s ease';

            // Init level
            level.init(this);
            this.currentCleanup = level.cleanup;
        }, 200);
    }

    loadMenu() {
        if (this.currentCleanup) this.currentCleanup();

        // Transition
        this.app.style.animation = 'fadeOut 0.2s ease';

        setTimeout(() => {
            this.app.innerHTML = '';
            this.app.style.animation = 'fadeIn 0.3s ease';

            // Get stats
            const stats = this.scoreManager ? this.scoreManager.getOverallStats() : null;

            // Create Arcade Header
            const header = document.createElement('header');
            header.innerHTML = `
                <div class="header-left">
                    <span class="beveled-text-small">SILLY ARCADE</span>
                </div>
                <div class="header-right">
                    ${stats ? `
                        <span class="header-stat">⭐ ${stats.totalStars}</span>
                        <span class="header-stat">🏆 ${stats.totalPoints}</span>
                    ` : ''}
                    <span class="unlock-count">${this.maxUnlock + 1}/${this.levels.length}</span>
                </div>
            `;
            this.app.appendChild(header);

            // Menu Section
            const menuSection = document.createElement('section');
            menuSection.className = 'screen active';
            menuSection.id = 'main-menu';

            const container = document.createElement('div');
            container.className = 'menu-container beveled-panel';

            container.innerHTML = `
                <h2 class="menu-title">SELECT LEVEL</h2>
                <p class="menu-subtitle">Win by doing silly things!</p>
            `;

            const grid = document.createElement('div');
            grid.className = 'level-grid';

            this.levels.forEach((level, index) => {
                const isLocked = index > this.maxUnlock;
                const levelStats = this.scoreManager ? this.scoreManager.getLevelStats(level.id) : null;

                const btn = document.createElement('button');
                btn.className = `beveled-btn level-btn ${isLocked ? 'locked' : ''}`;

                if (isLocked) {
                    btn.innerHTML = `
                        <span class="level-num">🔒</span>
                        <span class="level-name">LOCKED</span>
                    `;
                    btn.onclick = () => alert("Beat the previous level to unlock!");
                } else {
                    // Show stars if completed
                    let starsHtml = '';
                    if (levelStats) {
                        const filled = levelStats.stars;
                        const empty = 3 - filled;
                        starsHtml = `<span class="level-stars">${'★'.repeat(filled)}${'☆'.repeat(empty)}</span>`;
                    }

                    btn.innerHTML = `
                        <span class="level-num">${index + 1}</span>
                        <span class="level-name">${level.title}</span>
                        ${starsHtml}
                    `;
                    btn.onclick = () => this.loadLevel(level.id);
                }
                grid.appendChild(btn);
            });

            container.appendChild(grid);
            menuSection.appendChild(container);
            this.app.appendChild(menuSection);
        }, 200);
    }
}
