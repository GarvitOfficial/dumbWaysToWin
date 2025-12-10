export default {
    id: 'level-19',
    title: 'Color Memory',
    description: 'Remember the pattern! 🧠',
    html: `
        <div class="game-container beveled-panel" style="gap: 0.5rem; padding: 15px;">
            <h3 style="margin: 0; color: #ff00ff;">🧠 COLOR MEMORY 🎨</h3>
            <p style="font-size: 0.5rem; margin: 0; color: #aaa;">Watch the pattern, then repeat it!</p>
            
            <div id="l19-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; max-width: 220px; margin: 0 auto;">
                <button class="memory-btn" data-color="0" style="width: 100px; height: 100px; background: #ff3333; border: 4px solid #aa0000; border-radius: 15px; opacity: 0.6;"></button>
                <button class="memory-btn" data-color="1" style="width: 100px; height: 100px; background: #33ff33; border: 4px solid #00aa00; border-radius: 15px; opacity: 0.6;"></button>
                <button class="memory-btn" data-color="2" style="width: 100px; height: 100px; background: #3333ff; border: 4px solid #0000aa; border-radius: 15px; opacity: 0.6;"></button>
                <button class="memory-btn" data-color="3" style="width: 100px; height: 100px; background: #ffff33; border: 4px solid #aaaa00; border-radius: 15px; opacity: 0.6;"></button>
            </div>
            
            <div style="display: flex; gap: 20px; align-items: center; justify-content: center;">
                <p id="l19-round" style="color: #39ff14; margin: 0;">ROUND: 1</p>
                <p id="l19-score" style="color: #00ffff; margin: 0;">SCORE: 0</p>
            </div>
            
            <p id="l19-msg" style="color: #ffff00; margin: 0; font-size: 0.7rem; min-height: 20px;">WATCH THE PATTERN...</p>
            
            <button class="beveled-btn small" id="l19-back-btn">← BACK</button>
        </div>
    `,
    init: (levelManager) => {
        const roundEl = document.getElementById('l19-round');
        const scoreEl = document.getElementById('l19-score');
        const msgEl = document.getElementById('l19-msg');
        const backBtn = document.getElementById('l19-back-btn');
        const buttons = document.querySelectorAll('.memory-btn');

        const COLORS = ['#ff3333', '#33ff33', '#3333ff', '#ffff33'];
        const SOUNDS = [261.63, 329.63, 392.00, 523.25]; // C, E, G, C5
        const WIN_ROUNDS = 5;

        let pattern = [];
        let playerIndex = 0;
        let round = 1;
        let score = 0;
        let isShowingPattern = false;
        let gameOver = false;

        // Audio context for sounds
        let audioCtx = null;
        try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { }

        backBtn.onclick = () => levelManager.loadMenu();

        // Button click handlers
        buttons.forEach(btn => {
            btn.onclick = () => {
                if (isShowingPattern || gameOver) return;

                const colorIndex = parseInt(btn.dataset.color);
                flashButton(colorIndex);
                playTone(colorIndex);

                if (colorIndex === pattern[playerIndex]) {
                    playerIndex++;
                    score += 10;
                    scoreEl.innerText = `SCORE: ${score}`;

                    if (playerIndex === pattern.length) {
                        // Completed round
                        round++;
                        roundEl.innerText = `ROUND: ${round}`;

                        if (round > WIN_ROUNDS) {
                            winGame();
                        } else {
                            msgEl.innerText = "✓ CORRECT! NEXT ROUND...";
                            msgEl.style.color = "#39ff14";
                            setTimeout(() => nextRound(), 1000);
                        }
                    }
                } else {
                    // Wrong!
                    loseGame();
                }
            };
        });

        function flashButton(index, duration = 300) {
            const btn = buttons[index];
            btn.style.opacity = '1';
            btn.style.boxShadow = `0 0 30px ${COLORS[index]}`;
            btn.style.transform = 'scale(1.05)';

            setTimeout(() => {
                btn.style.opacity = '0.6';
                btn.style.boxShadow = 'none';
                btn.style.transform = 'scale(1)';
            }, duration);
        }

        function playTone(index) {
            if (!audioCtx) return;
            try {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.frequency.value = SOUNDS[index];
                osc.type = 'sine';
                gain.gain.value = 0.3;
                osc.start();
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
                osc.stop(audioCtx.currentTime + 0.3);
            } catch (e) { }
        }

        function nextRound() {
            playerIndex = 0;
            // Add new color to pattern
            pattern.push(Math.floor(Math.random() * 4));
            showPattern();
        }

        function showPattern() {
            isShowingPattern = true;
            msgEl.innerText = "WATCH...";
            msgEl.style.color = "#ffff00";

            // Disable buttons visually
            buttons.forEach(b => b.style.cursor = 'not-allowed');

            let i = 0;
            const interval = setInterval(() => {
                if (i >= pattern.length) {
                    clearInterval(interval);
                    isShowingPattern = false;
                    msgEl.innerText = "YOUR TURN!";
                    msgEl.style.color = "#00ffff";
                    buttons.forEach(b => b.style.cursor = 'pointer');
                    return;
                }

                flashButton(pattern[i], 400);
                playTone(pattern[i]);
                i++;
            }, 600);
        }

        function winGame() {
            gameOver = true;
            msgEl.innerText = "🧠 GENIUS! YOU WIN!";
            msgEl.style.color = "#39ff14";
            msgEl.style.fontSize = "0.9rem";

            // Flash all buttons
            let flashes = 0;
            const flashInterval = setInterval(() => {
                buttons.forEach((btn, i) => {
                    btn.style.opacity = flashes % 2 === 0 ? '1' : '0.6';
                    btn.style.boxShadow = flashes % 2 === 0 ? `0 0 20px ${COLORS[i]}` : 'none';
                });
                flashes++;
                if (flashes > 6) {
                    clearInterval(flashInterval);
                    setTimeout(() => levelManager.completeLevel('level-19'), 500);
                }
            }, 200);
        }

        function loseGame() {
            gameOver = true;
            msgEl.innerText = "❌ WRONG! TAP TO RETRY";
            msgEl.style.color = "#ff0000";

            // Flash red
            buttons.forEach(btn => {
                btn.style.background = '#ff0000';
                btn.style.opacity = '1';
            });

            setTimeout(() => {
                buttons.forEach((btn, i) => {
                    btn.style.background = COLORS[i];
                    btn.style.opacity = '0.6';
                });
            }, 500);

            // Retry on click
            document.getElementById('l19-grid').onclick = () => {
                document.getElementById('l19-grid').onclick = null;
                resetGame();
            };
        }

        function resetGame() {
            pattern = [];
            playerIndex = 0;
            round = 1;
            score = 0;
            gameOver = false;
            roundEl.innerText = 'ROUND: 1';
            scoreEl.innerText = 'SCORE: 0';
            msgEl.style.fontSize = '0.7rem';
            nextRound();
        }

        // Start game
        setTimeout(() => nextRound(), 1000);
    },
    cleanup: () => { }
};
