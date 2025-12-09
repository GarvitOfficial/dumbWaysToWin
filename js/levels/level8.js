export default {
    id: 'level-8',
    title: 'Color Blind',
    description: 'Click the word RED. Ignore the color.',
    html: `
        <div class="game-container beveled-panel">
            <h3>Level 8: Stroop Test</h3>
            <p>Click the word that SAYS "RED".</p>
            <div id="l8-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; width: 100%; margin-top: 20px;">
                <!-- Buttons injected by JS -->
            </div>
            <p id="l8-msg" class="feedback-text"></p>
            <button class="beveled-btn small" id="l8-back-btn">Back</button>
        </div>
    `,
    init: (levelManager) => {
        const grid = document.getElementById('l8-grid');
        const msg = document.getElementById('l8-msg');
        const backBtn = document.getElementById('l8-back-btn');

        backBtn.onclick = () => levelManager.loadMenu();

        const words = ['BLUE', 'GREEN', 'YELLOW', 'RED'];
        const colors = ['#00ffff', '#39ff14', '#ffff00', '#ff0000'];

        function shuffle(array) {
            return array.sort(() => Math.random() - 0.5);
        }

        // Generate Buttons
        const shuffledWords = shuffle([...words]);

        shuffledWords.forEach(word => {
            const btn = document.createElement('button');
            btn.className = 'beveled-btn';
            btn.innerText = word;

            // Assign random misleading color
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            btn.style.color = randomColor;
            btn.style.fontSize = "1.2rem";

            btn.onclick = () => {
                if (word === 'RED') {
                    msg.innerText = "🧠 CORRECT! BRAIN POWER!";
                    msg.style.color = "#39ff14";
                    // Disable all
                    Array.from(grid.children).forEach(b => b.disabled = true);
                    setTimeout(() => levelManager.completeLevel('level-8'), 1500);
                } else {
                    msg.innerText = "❌ WRONG! That says " + word;
                    msg.style.color = "red";
                }
            };
            grid.appendChild(btn);
        });
    },
    cleanup: () => { }
};
