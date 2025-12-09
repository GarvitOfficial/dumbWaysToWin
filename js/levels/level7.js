export default {
    id: 'level-7',
    title: 'Silly Math',
    description: '1 + 1 = ?',
    html: `
        <div class="game-container beveled-panel">
            <h3>Level 7: Calculator</h3>
            <p>Solve: 1 + 1 = ?</p>
            <input type="text" id="l7-input" class="beveled-input" style="height: 60px; text-align: center; font-size: 1.5rem;" placeholder="Answer...">
            <div style="margin-top: 20px; display: flex; gap: 10px;">
                <button class="beveled-btn" id="l7-submit">SOLVE</button>
            </div>
            <p id="l7-msg" class="feedback-text"></p>
            <button class="beveled-btn small" id="l7-back-btn">Back</button>
        </div>
    `,
    init: (levelManager) => {
        const input = document.getElementById('l7-input');
        const submit = document.getElementById('l7-submit');
        const msg = document.getElementById('l7-msg');
        const backBtn = document.getElementById('l7-back-btn');

        backBtn.onclick = () => levelManager.loadMenu();

        submit.onclick = () => {
            const val = input.value.toLowerCase().trim();

            if (val === '2') {
                msg.innerText = "🤓 TOO CONVENTIONAL! FAIL!";
                msg.style.color = "red";
            } else if (val === 'window' || val === '11' || val === '田') {
                msg.innerText = "🧠 GENIUS! YOU WIN!";
                msg.style.color = "#39ff14";
                input.disabled = true;
                submit.disabled = true;
                setTimeout(() => levelManager.completeLevel('level-7'), 1500);
            } else if (val === 'magellan' || val === '3') {
                msg.innerText = "🤔 Close enough... but try sillier!";
                msg.style.color = "#00ffff";
            } else {
                msg.innerText = "💭 Try thinking... sillier.";
                msg.style.color = "#aaa";
            }
        };
    },
    cleanup: () => { }
};
