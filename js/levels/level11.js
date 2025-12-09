export default {
    id: 'level-11',
    title: 'Cookie Clicker',
    description: 'Click it. Just click it.',
    html: `
        <div class="game-container beveled-panel">
            <h3>Level 11: The Cookie</h3>
            <p>You know what to do.</p>
            <div id="l11-cookie" style="font-size: 5rem; cursor: pointer; user-select: none; transition: transform 0.1s;">🍪</div>
            <p id="l11-score" class="feedback-text">0 / 20</p>
            <button class="beveled-btn small" id="l11-back-btn">Back</button>
        </div>
    `,
    init: (levelManager) => {
        const cookie = document.getElementById('l11-cookie');
        const scoreEl = document.getElementById('l11-score');
        const backBtn = document.getElementById('l11-back-btn');
        let count = 0;

        backBtn.onclick = () => levelManager.loadMenu();

        cookie.onclick = () => {
            if (count >= 20) return;
            count++;
            scoreEl.innerText = `${count} / 20`;
            cookie.style.transform = 'scale(0.9)';
            setTimeout(() => cookie.style.transform = 'scale(1)', 100);

            if (count >= 20) {
                scoreEl.innerText = "🍪 DELICIOUS VICTORY! 🍪";
                scoreEl.style.color = "#39ff14";
                setTimeout(() => levelManager.completeLevel('level-11'), 1500);
            }
        };
    },
    cleanup: () => { }
};
