export default {
    id: 'level-6',
    title: 'The Void',
    description: 'Stare into the abyss.',
    html: `
        <div class="game-container beveled-panel">
            <h3>Level 6: The Void</h3>
            <p>Don't move. embrace the darkness.</p>
            <div id="l6-void" class="beveled-inset" style="height: 300px; background: #000; display: flex; align-items: center; justify-content: center; cursor: none;">
                <span id="l6-eye" style="font-size: 5rem; opacity: 0;">👁️</span>
            </div>
            <p id="l6-msg" class="feedback-text">Shhh...</p>
            <button class="beveled-btn small" id="l6-back-btn">Back</button>
        </div>
    `,
    init: (levelManager) => {
        const voidArea = document.getElementById('l6-void');
        const eye = document.getElementById('l6-eye');
        const msg = document.getElementById('l6-msg');
        const backBtn = document.getElementById('l6-back-btn');

        let moveCount = 0;
        let won = false;
        let timeout;

        backBtn.onclick = () => {
            clearTimeout(timeout);
            levelManager.loadMenu();
        };

        voidArea.onmousemove = () => {
            if (won) return;
            moveCount++;
            eye.style.opacity = Math.min(moveCount / 50, 1);

            if (moveCount > 10) {
                msg.innerText = "THE ABYSS REJECTS YOU!";
                msg.style.color = "red";
                clearTimeout(timeout);
                // Reset after fail
                setTimeout(() => {
                    moveCount = 0;
                    msg.innerText = "Try again. Be still.";
                    msg.style.color = "var(--neon-yellow)";
                    startVoid();
                }, 1500);
            }
        };

        function startVoid() {
            moveCount = 0;
            eye.style.opacity = 0;
            timeout = setTimeout(() => {
                won = true;
                msg.innerText = "🖤 THE VOID ACCEPTS YOU. 🖤";
                msg.style.color = "#39ff14";
                eye.innerText = "❤️";
                eye.style.opacity = 1;
                setTimeout(() => levelManager.completeLevel('level-6'), 1500);
            }, 5000); // 5 seconds of stillness
        }

        startVoid();
    },
    cleanup: () => { }
};
